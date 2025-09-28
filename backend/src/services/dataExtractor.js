const { formatNumber } = require('../utils/formatters');

class DataExtractor {
    extractProfileData(profileItems, username) {
        const profileData = profileItems[0] || {};
        
        return {
            username: profileData.username || username,
            fullName: profileData.fullName || '',
            biography: profileData.biography || '',
            followersCount: profileData.followersCount || 0,
            followsCount: profileData.followsCount || 0,
            postsCount: profileData.postsCount || 0,
            profilePicUrlHD: profileData.profilePicUrlHD || profileData.profilePicUrl || '',
            verified: profileData.verified || false,
            businessAccount: profileData.isBusinessAccount || false,
            private: profileData.private || false,
            externalUrls: profileData.externalUrls || []
        };
    }

    extractPosts(profileItems, postsItems) {
        let allPosts = [];
        
        if (profileItems[0]?.latestPosts && Array.isArray(profileItems[0].latestPosts)) {
            allPosts = [...profileItems[0].latestPosts];
        }
        
        if (postsItems && Array.isArray(postsItems)) {
            const existingShortCodes = new Set(allPosts.map(p => p.shortCode));
            const additionalPosts = postsItems.filter(p => 
                p.shortCode && !existingShortCodes.has(p.shortCode)
            );
            allPosts = [...allPosts, ...additionalPosts];
        }

        return allPosts
            .filter(item => item.shortCode && item.displayUrl)
            .slice(0, 12)
            .map(post => ({
                id: post.id,
                shortCode: post.shortCode,
                caption: post.caption || '',
                likesCount: post.likesCount || 0,
                commentsCount: post.commentsCount || 0,
                videoViewCount: post.videoViewCount || 0,
                displayUrl: post.displayUrl,
                videoUrl: post.videoUrl || null,
                postUrl: post.url || `https://www.instagram.com/p/${post.shortCode}/`,
                hashtags: this.extractHashtags(post),
                mentions: this.extractMentions(post),
                timestamp: new Date(post.timestamp),
                type: post.type || 'Image',
                isCarousel: !!(post.childPosts && post.childPosts.length > 0),
                carouselCount: (post.childPosts && post.childPosts.length) || 0
            }));
    }

    extractHashtags(post) {
        let hashtags = [];
        if (post.hashtags && Array.isArray(post.hashtags)) {
            hashtags = post.hashtags;
        } else if (post.caption) {
            const hashtagMatches = post.caption.match(/#[\w\u0590-\u05ff]+/g);
            hashtags = hashtagMatches ? hashtagMatches.map(tag => tag.substring(1)) : [];
        }
        return hashtags;
    }

    extractMentions(post) {
        let mentions = [];
        if (post.mentions && Array.isArray(post.mentions)) {
            mentions = post.mentions;
        } else if (post.caption) {
            const mentionMatches = post.caption.match(/@[\w.]+/g);
            mentions = mentionMatches ? mentionMatches.map(mention => mention.substring(1)) : [];
        }
        return mentions;
    }

    calculateAnalytics(posts, followersCount) {
        const validPosts = posts.filter(p => p.likesCount > 0 || p.videoViewCount > 0);
        
        if (validPosts.length === 0) {
            return {
                avgLikes: 0,
                avgComments: 0,
                avgViews: 0,
                engagementRate: 0,
                totalEngagement: 0
            };
        }

        const totalLikes = validPosts.reduce((sum, p) => sum + p.likesCount, 0);
        const totalComments = validPosts.reduce((sum, p) => sum + p.commentsCount, 0);
        const totalViews = validPosts.reduce((sum, p) => sum + p.videoViewCount, 0);
        
        const avgLikes = Math.round(totalLikes / validPosts.length);
        const avgComments = Math.round(totalComments / validPosts.length);
        const avgViews = Math.round(totalViews / validPosts.length);
        
        const totalEngagement = totalLikes + totalComments;
        const engagementRate = followersCount > 0 ? 
            ((totalEngagement / validPosts.length / followersCount) * 100) : 0;

        return {
            avgLikes,
            avgComments,
            avgViews,
            engagementRate: parseFloat(engagementRate.toFixed(4)),
            totalEngagement
        };
    }

    extractAllHashtags(posts) {
        const hashtagSet = new Set();
        posts.forEach(post => {
            post.hashtags.forEach(tag => {
                const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                hashtagSet.add(formattedTag);
            });
        });
        return Array.from(hashtagSet).slice(0, 20);
    }
}

module.exports = new DataExtractor();
