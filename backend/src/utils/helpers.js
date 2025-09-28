const calculateTimeSince = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
};

const validateUsername = (username) => {
    if (!username) return false;
    if (typeof username !== 'string') return false;
    if (username.length < 1 || username.length > 30) return false;
    if (!/^[a-zA-Z0-9._]+$/.test(username)) return false;
    return true;
};

const sanitizeUsername = (username) => {
    return username.toLowerCase().trim().replace(/[^a-z0-9._]/g, '');
};

const isValidCacheEntry = (profile) => {
    if (!profile) return false;
    if (!profile.cacheExpiry) return false;
    return new Date(profile.cacheExpiry) > new Date();
};

const calculateEngagementScore = (likes, comments, views, followers) => {
    const totalEngagement = likes + comments + (views * 0.1);
    if (followers === 0) return 0;
    return (totalEngagement / followers) * 100;
};

const getContentTypeFromUrl = (url) => {
    if (!url) return 'unknown';
    if (url.includes('.mp4') || url.includes('video')) return 'video';
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) return 'image';
    return 'unknown';
};

const extractDominantColors = (posts) => {
    const colors = [];
    posts.forEach(post => {
        if (post.type === 'Image') {
            colors.push('blue', 'red', 'green');
        }
    });
    return [...new Set(colors)];
};

const analyzePostingPattern = (posts) => {
    const postsByHour = {};
    const postsByDay = {};
    
    posts.forEach(post => {
        if (post.timestamp) {
            const date = new Date(post.timestamp);
            const hour = date.getHours();
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            postsByHour[hour] = (postsByHour[hour] || 0) + 1;
            postsByDay[day] = (postsByDay[day] || 0) + 1;
        }
    });
    
    const bestHour = Object.entries(postsByHour)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '12';
    
    const bestDay = Object.entries(postsByDay)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';
    
    return {
        bestPostingHour: `${bestHour}:00`,
        bestPostingDay: bestDay,
        hourlyDistribution: postsByHour,
        dailyDistribution: postsByDay
    };
};

const getTopPerformingContent = (posts, metric = 'likesCount') => {
    return [...posts]
        .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
        .slice(0, 5)
        .map(post => ({
            shortCode: post.shortCode,
            [metric]: post[metric] || 0,
            type: post.type,
            timestamp: post.timestamp
        }));
};

module.exports = {
    calculateTimeSince,
    validateUsername,
    sanitizeUsername,
    isValidCacheEntry,
    calculateEngagementScore,
    getContentTypeFromUrl,
    extractDominantColors,
    analyzePostingPattern,
    getTopPerformingContent
};
