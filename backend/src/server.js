require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const profileRoutes = require('./routes/profileRoutes');
const compareRoutes = require('./routes/compareRoutes');
const cacheMiddleware = require('./middleware/cacheMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const InstagramProfile = require('./models/InstagramProfile');
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser tools like Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  }
}));
app.use(express.json());

app.use(rateLimitMiddleware(900000, 100));
app.use(cacheMiddleware);

app.use('/api/profile', profileRoutes);
app.use('/api/compare', compareRoutes);

// Add this test endpoint to check cache manually
app.get('/api/cache-test/:username', async (req, res) => {
    const profile = await InstagramProfile.findOne({ 
        username: req.params.username.toLowerCase() 
    });
    
    if (!profile) {
        return res.json({ message: 'Not in cache' });
    }
    
    const now = new Date();
    const isValid = profile.cacheExpiry > now;
    
    res.json({
        username: profile.username,
        cacheExpiry: profile.cacheExpiry,
        currentTime: now,
        isValid: isValid,
        timeRemaining: isValid ? profile.cacheExpiry - now : 0
    });
});
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' })
    }

    const response = await fetch(url)
    if (!response.ok) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const buffer = await response.arrayBuffer()
    
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400' // 24 hours
    })
    
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to proxy image' })
  }
})

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
