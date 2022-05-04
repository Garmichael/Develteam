module.exports = function (app, cache) {
    app.use('/api/bugsAndSuggestions', require('../api/api_bugsAndSuggestions'));
    app.use('/api/develteamData', require('../api/api_develteamData'));
    app.use('/api/privateChat', require('../api/api_privateChat'));
    app.use('/api/searchDeveloperByAlias', require('../api/api_searchDeveloperByAlias'));
    app.use('/api/searchDevelopersAndGamesByAlias', require('../api/api_searchDevelopersAndGamesByAlias'));
    app.use('/api/topContent', require('../api/api_topContent'));
    app.use('/api/voting', require('../api/api_voting'));
    app.use('/api/resources', require('../api/api_resources'));
    app.use('/api/donors', require('../api/api_donors'));
    app.use('/api/forums', require('../api/forums/api_forums'));
    app.use('/api/forumsActions', require('../api/forumsActions/api_forumsActions'));
    app.use('/api/login', require('../api/api_login'));
    app.use('/api/login/:id', require('../api/api_login'));
    app.use('/api/accountInformation', require('../api/api_accountInformation'));
    app.use('/api/registerAccount', require('../api/api_registerAccount'));
    app.use('/api/forgotPassword', require('../api/api_forgotPassword'));
    app.use('/api/forgotPassword/:action', require('../api/api_forgotPassword'));
    app.use('/api/userOptions', require('../api/api_userOptions'));
    app.use('/api/voting/:id', require('../api/api_voting'));
    app.use('/api/feedPosts', require('../api/feedPosts/api_feedPosts'));
    app.use('/api/media', require('../api/media/api_media'));
    app.use('/api/totals', require('../api/api_totals'));
    app.use('/api/browseResults', require('../api/api_browseResults'));
    app.use('/api/developer', require('../api/api_developer'));
    app.use('/api/developer/:id', require('../api/api_developer'));
    app.use('/api/game', require('../api/api_game'));
    app.use('/api/game/:id', require('../api/api_game'));
    app.use('/api/follows', require('../api/api_follows'));
    app.use('/api/follows/:id', require('../api/api_follows'));
    app.use('/api/members', require('../api/api_members'));
    app.use('/api/members/:id', require('../api/api_members'));
    app.use('/api/chatrooms', require('../api/api_chatrooms'));
    app.use('/api/chatroomHistory', require('../api/api_chatroomHistory'));
    app.use('/api/inbox', require('../api/api_inbox'));
    app.use('/api/inboxMessages', require('../api/api_inboxMessages'));
    app.use('/api/inboxAddParticipant', require('../api/api_inboxAddParticipant'));
    app.use('/api/inboxSetRead', require('../api/api_inboxSetRead'));
    app.use('/api/inboxLeaveConversation', require('../api/api_inboxLeaveConversation'));
    app.use('/api/invites', require('../api/api_invites'));
    app.use('/api/notifications', require('../api/notifications/api_notifications'));
    app.use('/api/classifieds', require('../api/api_classifieds'));
    app.use('/socialImage', require('../api/api_socialImage'));
    app.use('/ads.txt', require('../api/ads'));

    app.use('/sitemap', require('../api/sitemap'));

    app.get('*', function (req, res) {
        const userAgent = req.headers['user-agent'];

        let isSocialShare = userAgent &&
            userAgent.includes('facebookexternalhit/1.1') ||
            userAgent === 'Facebot' ||
            userAgent.includes('Twitterbot') ||
            userAgent.includes('discord') ||
            userAgent.includes('Discord');

        if (isSocialShare) {
            let socialShareModule = require('./module_socialShareData.js');

            let urlSegments = req.url.split('/');
            urlSegments.shift();
            socialShareModule.generateMetaData(urlSegments, function (data) {
                res.render('../views/socialBotPage', data);
            });
        } else {
            res.render('../views/index', {});
        }
    });
};