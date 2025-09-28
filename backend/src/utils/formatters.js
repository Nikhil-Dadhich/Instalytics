function formatNumber(num) {
    if (!num || num === 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

function formatProfileResponse(profile, source) {
    return {
        profile: {
            name: profile.fullName,
            username: profile.username,
            accountUrl: `https://www.instagram.com/${profile.username}/`,
            bio: profile.biography,
            profilePic: profile.profilePicUrlHD,
            verified: profile.verified,
            businessAccount: profile.businessAccount,
            private: profile.private,
            externalUrls: profile.externalUrls,
            followers: formatNumber(profile.followersCount),
            following: formatNumber(profile.followsCount),
            posts: formatNumber(profile.postsCount),
            followersRaw: profile.followersCount,
            followingRaw: profile.followsCount,
            postsRaw: profile.postsCount
        },
        analytics: {
            avgLikes: formatNumber(profile.avgLikes),
            avgComments: formatNumber(profile.avgComments),
            avgViews: profile.avgViews ? formatNumber(profile.avgViews) : null,
            engagementRate: `${(profile.engagementRate || 0).toFixed(2)}%`,
            totalEngagement: formatNumber(profile.totalEngagement),
            postsAnalyzed: profile.posts.length
        },
        recentPosts: profile.posts.map(post => ({
            id: post.shortCode,
            image: post.displayUrl,
            videoUrl: post.videoUrl,
            postUrl: post.postUrl,
            caption: post.caption,
            captionPreview: post.caption.substring(0, 100) + (post.caption.length > 100 ? '...' : ''),
            likes: formatNumber(post.likesCount),
            comments: formatNumber(post.commentsCount),
            views: post.videoViewCount ? formatNumber(post.videoViewCount) : null,
            likesRaw: post.likesCount,
            commentsRaw: post.commentsCount,
            viewsRaw: post.videoViewCount,
            hashtags: post.hashtags,
            mentions: post.mentions,
            timestamp: post.timestamp,
            type: post.type,
            isCarousel: post.isCarousel,
            carouselCount: post.carouselCount
        })),
        hashtags: profile.hashtags,
        meta: {
            lastUpdated: profile.lastScraped,
            cacheExpiry: profile.cacheExpiry,
            dataSource: source,
            scrapedAt: new Date().toISOString()
        }
    };
}

function formatPostsResponse(posts) {
    return {
        posts: posts.map(post => ({
            id: post.shortCode,
            image: post.displayUrl,
            videoUrl: post.videoUrl,
            postUrl: post.postUrl,
            caption: post.caption,
            likes: formatNumber(post.likesCount),
            comments: formatNumber(post.commentsCount),
            views: post.videoViewCount ? formatNumber(post.videoViewCount) : null,
            likesRaw: post.likesCount,
            commentsRaw: post.commentsCount,
            viewsRaw: post.videoViewCount,
            hashtags: post.hashtags,
            mentions: post.mentions,
            timestamp: post.timestamp,
            type: post.type,
            isCarousel: post.isCarousel,
            carouselCount: post.carouselCount
        })),
        total: posts.length
    };
}

module.exports = {
    formatNumber,
    formatProfileResponse,
    formatPostsResponse
};
