const rateLimitMiddleware = (windowMs = 900000, max = 100) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!requests.has(ip)) {
            requests.set(ip, []);
        }
        
        const userRequests = requests.get(ip).filter(time => time > windowStart);
        
        if (userRequests.length >= max) {
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        userRequests.push(now);
        requests.set(ip, userRequests);
        
        next();
    };
};

module.exports = rateLimitMiddleware;
