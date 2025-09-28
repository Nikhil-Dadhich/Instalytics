const { ApifyClient } = require('apify-client');

class ApifyService {
    constructor() {
        this.client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN
        });
        this.actorId = 'shu8hvrXbJbY3Eb9W';
    }

    async fetchProfileDetails(username) {
        const input = {
            addParentData: false,
            directUrls: [`https://www.instagram.com/${username}/`],
            enhanceUserSearchWithFacebookPage: false,
            isUserReelFeedURL: false,
            isUserTaggedFeedURL: false,
            resultsLimit: 1,
            resultsType: 'details',
            searchLimit: 1,
            searchType: 'hashtag'
        };

        const run = await this.client.actor(this.actorId).call(input);
        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
        return items;
    }

    async fetchProfilePosts(username) {
        const input = {
            directUrls: [`https://www.instagram.com/${username}/`],
            resultsType: 'posts',
            resultsLimit: 5,
            searchType: 'hashtag',
            searchLimit: 1,
            addParentData: true
        };

        const run = await this.client.actor(this.actorId).call(input);
        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
        return items;
    }
}

module.exports = new ApifyService();
