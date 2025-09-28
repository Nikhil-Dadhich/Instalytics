const apifyService = require('../services/apifyService');
const dataExtractor = require('../services/dataExtractor');
const cacheService = require('../services/cacheService');
const { formatProfileResponse, formatPostsResponse } = require('../utils/formatters');

class ProfileController {
    async getProfile(req, res) {
    try {
        const { username } = req.params;
        const lowercaseUsername = username.toLowerCase();

        console.log(`\n🔍 === PROFILE REQUEST: ${lowercaseUsername} ===`);
        
        const cached = await cacheService.getCachedProfile(lowercaseUsername);
        if (cached) {
            console.log(`✅ CACHE HIT - Using MongoDB data`);
            console.log(`⏰ Cache expires: ${cached.cacheExpiry}`);
            console.log(`🚀 Response time: ~50ms (from cache)`);
            return res.json(formatProfileResponse(cached, 'cache'));
        }

        console.log(`❌ CACHE MISS - Making Apify API calls`);
        console.log(`🌐 Fetching fresh data from Instagram...`);
        
        const startTime = Date.now();
        const [profileItems, postsItems] = await Promise.all([
            apifyService.fetchProfileDetails(lowercaseUsername),
            apifyService.fetchProfilePosts(lowercaseUsername)
        ]);
        const apiTime = Date.now() - startTime;

        if (!profileItems || profileItems.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileData = dataExtractor.extractProfileData(profileItems, lowercaseUsername);
        const posts = dataExtractor.extractPosts(profileItems, postsItems);
        const analytics = dataExtractor.calculateAnalytics(posts, profileData.followersCount);
        const hashtags = dataExtractor.extractAllHashtags(posts);

        const completeProfile = {
            ...profileData,
            posts,
            hashtags,
            ...analytics
        };

        console.log(`💾 Saving to MongoDB cache (expires in 1 week)`);
        await cacheService.saveProfile(completeProfile);
        console.log(`✅ FRESH DATA - API response time: ${apiTime}ms`);

        res.json(formatProfileResponse(completeProfile, 'fresh'));

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch profile data',
            message: error.message 
        });
    }
}


    async getPosts(req, res) {
        try {
            const { username } = req.params;
            const lowercaseUsername = username.toLowerCase();

            const cached = await cacheService.getCachedProfile(lowercaseUsername);
            if (cached) {
                return res.json(formatPostsResponse(cached.posts));
            }

            return res.status(404).json({ 
                error: 'Profile not cached. Please fetch profile first.',
                suggestion: `GET /api/profile/${username}` 
            });

        } catch (error) {
            console.error('Posts fetch error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch posts data',
                message: error.message 
            });
        }
    }

    async getAllProfiles(req, res) {
        try {
            const profiles = await cacheService.getAllCachedProfiles();
            res.json({
                profiles: profiles.map(p => ({
                    username: p.username,
                    name: p.fullName,
                    followers: p.followersCount,
                    profilePic: p.profilePicUrlHD || p.profilePicUrl || null,
                    verified: p.verified,
                    lastScraped: p.lastScraped
                })),
                count: profiles.length
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch profiles' });
        }
    }

    async refreshProfile(req, res) {
        try {
            const { username } = req.params;
            await cacheService.deleteCachedProfile(username.toLowerCase());
            req.params.username = username;
            await this.getProfile(req, res);
        } catch (error) {
            res.status(500).json({ error: 'Failed to refresh profile' });
        }
    }
}

module.exports = new ProfileController();
