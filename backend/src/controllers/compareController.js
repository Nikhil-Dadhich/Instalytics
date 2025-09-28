const cacheService = require('../services/cacheService');
const apifyService = require('../services/apifyService');
const dataExtractor = require('../services/dataExtractor');
const { formatNumber } = require('../utils/formatters');

async function getProfileForComparison(username) {
    try {
        console.log(`📊 Loading profile: ${username}`);
        
        const cached = await cacheService.getCachedProfile(username);
        if (cached) {
            // console.log(`✅ ${username}: Using cached data`);
            return cached;
        }

        // console.log(`🌐 ${username}: Fetching from API (not cached)`);
        
        const [profileItems, postsItems] = await Promise.all([
            apifyService.fetchProfileDetails(username),
            apifyService.fetchProfilePosts(username)
        ]);

        if (!profileItems || profileItems.length === 0) {
            console.log(`❌ ${username}: Profile not found`);
            return null;
        }

        const profileData = dataExtractor.extractProfileData(profileItems, username);
        const posts = dataExtractor.extractPosts(profileItems, postsItems);
        const analytics = dataExtractor.calculateAnalytics(posts, profileData.followersCount);
        const hashtags = dataExtractor.extractAllHashtags(posts);

        const completeProfile = {
            ...profileData,
            posts,
            hashtags,
            ...analytics
        };

        await cacheService.saveProfile(completeProfile);
        // console.log(`💾 ${username}: Saved to cache`);
        
        return completeProfile;

    } catch (error) {
        console.error(`❌ Error fetching ${username}:`, error.message);
        return null;
    }
}

function rankByMetric(metrics, field, order = 'desc') {
    return metrics
        .sort((a, b) => order === 'desc' ? b[field] - a[field] : a[field] - b[field])
        .map((item, index) => ({
            rank: index + 1,
            username: item.username,
            value: item.formatted,
            rawValue: item.value
        }));
}

function generateInsights(profiles) {
    const totalFollowers = profiles.reduce((sum, p) => sum + (p.followersCount || 0), 0);
    const avgEngagement = profiles.reduce((sum, p) => sum + (p.engagementRate || 0), 0) / profiles.length;
    
    const topPerformer = profiles.reduce((top, current) => 
        (current.engagementRate || 0) > (top.engagementRate || 0) ? current : top
    );

    const mostFollowed = profiles.reduce((top, current) => 
        (current.followersCount || 0) > (top.followersCount || 0) ? current : top
    );

    const contentCreator = profiles.reduce((top, current) => 
        (current.posts.length || 0) > (top.posts.length || 0) ? current : top
    );

    return {
        totalCombinedFollowers: formatNumber(totalFollowers),
        averageEngagementRate: `${avgEngagement.toFixed(2)}%`,
        
        topPerformer: {
            username: topPerformer.username,
            name: topPerformer.fullName,
            engagementRate: `${(topPerformer.engagementRate || 0).toFixed(2)}%`,
            reason: 'Highest engagement rate'
        },
        
        mostFollowed: {
            username: mostFollowed.username,
            name: mostFollowed.fullName,
            followers: formatNumber(mostFollowed.followersCount),
            reason: 'Most followers'
        },
        
        mostActive: {
            username: contentCreator.username,
            name: contentCreator.fullName,
            postsAnalyzed: contentCreator.posts.length,
            reason: 'Most content analyzed'
        },
        
        profilesCompared: profiles.length,
        comparedAt: new Date().toISOString()
    };
}

function buildComparison(profiles) {
    const comparison = {
        profiles: {},
        metrics: {
            followers: [],
            engagement: [],
            avgLikes: [],
            avgComments: [],
            postsAnalyzed: []
        },
        rankings: {},
        insights: {},
        meta: {
            profilesCompared: profiles.length,
            comparedAt: new Date().toISOString(),
            dataSources: profiles.map(p => ({
                username: p.username,
                lastScraped: p.lastScraped,
                cacheHit: !!p.cacheExpiry
            }))
        }
    };

    profiles.forEach(profile => {
        const username = profile.username;
        
        // NEW: Format recent posts for frontend charts (same format as Dashboard)
        const recentPosts = profile.posts.slice(0, 10).map(post => ({
            id: post.id || post.shortcode,
            shortcode: post.shortcode,
            likes: formatNumber(post.likesCount || 0),
            comments: formatNumber(post.commentsCount || 0),
            views: post.videoViewCount ? formatNumber(post.videoViewCount) : null,
            timestamp: post.timestamp,
            postUrl: `https://www.instagram.com/p/${post.shortcode}/`,
            type: post.videoUrl ? 'Video' : 'Photo',
            captionPreview: post.caption ? post.caption.substring(0, 100) : '',
            image: post.displayUrl,
            videoUrl: post.videoUrl || null,
            isCarousel: post.sidecarChildren && post.sidecarChildren.length > 1,
            carouselCount: post.sidecarChildren ? post.sidecarChildren.length : 1,
            hashtags: post.hashtags || []
        }));
        
        comparison.profiles[username] = {
            name: profile.fullName,
            username: profile.username,
            accountUrl: `https://www.instagram.com/${profile.username}/`,
            profilePic: profile.profilePicUrlHD,
            verified: profile.verified,
            businessAccount: profile.businessAccount,
            
            followers: formatNumber(profile.followersCount),
            following: formatNumber(profile.followsCount),
            posts: formatNumber(profile.postsCount),
            
            followersRaw: profile.followersCount,
            followingRaw: profile.followsCount,
            postsRaw: profile.postsCount,
            
            engagementRate: `${(profile.engagementRate || 0).toFixed(2)}%`,
            engagementRateRaw: profile.engagementRate || 0,
            
            avgLikes: formatNumber(profile.avgLikes || 0),
            avgComments: formatNumber(profile.avgComments || 0),
            avgViews: profile.avgViews ? formatNumber(profile.avgViews) : null,
            
            avgLikesRaw: profile.avgLikes || 0,
            avgCommentsRaw: profile.avgComments || 0,
            avgViewsRaw: profile.avgViews || 0,      
            totalPosts: profile.posts.length,
            lastUpdated: profile.lastScraped,
            recentPosts: recentPosts
        };

        comparison.metrics.followers.push({
            username,
            value: profile.followersCount,
            formatted: formatNumber(profile.followersCount)
        });

        comparison.metrics.engagement.push({
            username,
            value: profile.engagementRate || 0,
            formatted: `${(profile.engagementRate || 0).toFixed(2)}%`
        });

        comparison.metrics.avgLikes.push({
            username,
            value: profile.avgLikes || 0,
            formatted: formatNumber(profile.avgLikes || 0)
        });

        comparison.metrics.avgComments.push({
            username,
            value: profile.avgComments || 0,
            formatted: formatNumber(profile.avgComments || 0)
        });

        comparison.metrics.postsAnalyzed.push({
            username,
            value: profile.posts.length,
            formatted: profile.posts.length.toString()
        });
    });

    comparison.rankings = {
        mostFollowers: rankByMetric(comparison.metrics.followers, 'value', 'desc'),
        highestEngagement: rankByMetric(comparison.metrics.engagement, 'value', 'desc'),
        mostLikes: rankByMetric(comparison.metrics.avgLikes, 'value', 'desc'),
        mostComments: rankByMetric(comparison.metrics.avgComments, 'value', 'desc')
    };

    comparison.insights = generateInsights(profiles);

    return comparison;
}

async function compareProfiles(req, res) {
    try {
        const { users } = req.query;
        
        if (!users) {
            return res.status(400).json({ 
                error: 'Users parameter required',
                example: '/api/compare?users=cristiano,messi,neymar'
            });
        }

        const usernames = users.split(',').map(u => u.trim().toLowerCase()).slice(0, 5);
        
        if (usernames.length < 2) {
            return res.status(400).json({ 
                error: 'At least 2 users required for comparison' 
            });
        }

        console.log(`\n🔍 === COMPARING PROFILES: ${usernames.join(', ')} ===`);

        const profiles = await Promise.all(
            usernames.map(username => getProfileForComparison(username))
        );

        const validProfiles = profiles.filter(Boolean);
        
        if (validProfiles.length < 2) {
            const failedUsernames = usernames.filter((username, i) => !profiles[i]);
            return res.status(404).json({ 
                error: 'Some profiles could not be fetched',
                failedProfiles: failedUsernames,
                successfulProfiles: validProfiles.map(p => p.username),
                reason: 'Profile not found on Instagram or API error'
            });
        }

        console.log(`✅ Successfully loaded ${validProfiles.length} profiles for comparison`);
        const comparison = buildComparison(validProfiles);
        Object.keys(comparison.profiles).forEach(username => {
            const postsCount = comparison.profiles[username].recentPosts?.length || 0;
            // console.log(`📊 ${username}: ${postsCount} recent posts included`);
        });
        
        res.json(comparison);

    } catch (error) {
        console.error('Compare error:', error);
        res.status(500).json({ 
            error: 'Failed to compare profiles',
            message: error.message 
        });
    }
}

module.exports = {
    compareProfiles
};
