const InstagramProfile = require('../models/InstagramProfile');

class CacheService {
    async getCachedProfile(username) {
        try {
            const profile = await InstagramProfile.findOne({ 
                username: username.toLowerCase(),
                cacheExpiry: { $gt: new Date() }
            });
            
            console.log(`Cache check for ${username}:`, profile ? 'HIT' : 'MISS');
            return profile;
        } catch (error) {
            console.error('Cache retrieval error:', error);
            return null;
        }
    }

    async saveProfile(profileData) {
        try {
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const cacheExpiry = new Date(Date.now() + oneWeek);
            
            const dataToSave = {
                ...profileData,
                username: profileData.username.toLowerCase(),
                lastScraped: new Date(),
                cacheExpiry: cacheExpiry
            };
            
            const result = await InstagramProfile.findOneAndUpdate(
                { username: profileData.username.toLowerCase() },
                dataToSave,
                { upsert: true, new: true }
            );
            
            console.log(`Cache saved for ${profileData.username} until:`, cacheExpiry);
            return result;
        } catch (error) {
            console.error('Cache save error:', error);
            throw error;
        }
    }

    async getAllCachedProfiles() {
        try {
            const profiles = await InstagramProfile.find({})
                .select('username fullName followersCount verified lastScraped cacheExpiry profilePicUrlHD')
                .sort({ followersCount: -1 })
                .limit(50);
            return profiles;
        } catch (error) {
            console.error('Get all profiles error:', error);
            return [];
        }
    }

    async deleteCachedProfile(username) {
        try {
            const result = await InstagramProfile.deleteOne({ 
                username: username.toLowerCase() 
            });
            console.log(`Cache deleted for ${username}:`, result.deletedCount > 0);
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Delete cache error:', error);
            return false;
        }
    }
}

module.exports = new CacheService();
