let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../../modules/module_loggedUserBuilder');
let socketHandler = require('../../modules/module_socketHandler');
let queries = require('./queries');

let debugTimeout = 0;

router.get('/categoriesAndForums', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getCategoriesAndForums({
            parentType: req.query.parentType,
            parentId: req.query.parentId,
            loggedUser: loggedUser
        }, function (response) {
            setTimeout(function () {
                res.json(response)
            }, debugTimeout)
        });
    });
});

router.get('/thread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getThread({
            forumId: req.query.forumId,
            threadStringUrl: req.query.threadStringUrl,
            loggedUser: loggedUser
        }, function (response) {
            setTimeout(function () {
                res.json(response)
            }, debugTimeout)
        });
    });
});

router.get('/forum', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getForum({
            loggedUser: loggedUser,
            forumId: req.query.forumId,
        }, function (response) {
            setTimeout(function () {
                res.json(response)
            }, debugTimeout)
        });
    });
});

router.get('/threads', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getThreads({
            forumId: req.query.forumId,
            page: req.query.page,
            perPage: req.query.perPage,
            loggedUser: loggedUser
        }, function (response) {
            setTimeout(function () {
                res.json(response)
            }, debugTimeout)
        });
    });
});

router.get('/posts', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getPosts({
            threadId: req.query.threadId,
            page: req.query.page,
            perPage: req.query.perPage,
            loggedUser: loggedUser
        }, function (response) {
            setTimeout(function () {
                res.json(response)
            }, debugTimeout)
        });
    });
});

router.get('/recentPosts', function (req, res) {

    queries.getRecentPosts(function (response) {
        setTimeout(function () {
            res.json(response)
        }, debugTimeout)
    });

});


module.exports = router;


