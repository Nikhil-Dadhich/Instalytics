const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    id: String,
    shortCode: String,
    caption: String,
    likesCount: Number,
    commentsCount: Number,
    videoViewCount: Number,
    displayUrl: String,
    videoUrl: String,
    postUrl: String,
    hashtags: [String],
    mentions: [String],
    timestamp: Date,
    type: String,
    isCarousel: Boolean,
    carouselCount: Number
});

const InstagramProfileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    fullName: String,
    biography: String,
    followersCount: Number,
    followsCount: Number,
    postsCount: Number,
    profilePicUrlHD: String,
    verified: Boolean,
    businessAccount: Boolean,
    private: Boolean,
    externalUrls: [{
        title: String,
        url: String
    }],
    posts: [PostSchema],
    hashtags: [String],
    avgLikes: Number,
    avgComments: Number,
    avgViews: Number,
    engagementRate: Number,
    totalEngagement: Number,
    lastScraped: { type: Date, default: Date.now },
    cacheExpiry: { type: Date, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('InstagramProfile', InstagramProfileSchema);
