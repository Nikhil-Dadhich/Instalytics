const cacheService = require('../services/cacheService');

const cacheMiddleware = (req, res, next) => {
    res.locals.setCacheHeaders = () => {
        res.set({
            'Cache-Control': 'public, max-age=604800',
            'X-Cache-Duration': '1 week'
        });
    };
    next();
};

module.exports = cacheMiddleware;
