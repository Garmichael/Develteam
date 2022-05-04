let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../../modules/module_loggedUserBuilder');
let socketHandler = require('../../modules/module_socketHandler');
let queries = require('./queries');

let debugTimeout = 0;

router.post('/addCategory', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.addCategory(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/editCategory', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.editCategory(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/addForum', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.addForum(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/editForum', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.editForum(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/addThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.addThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/editThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.editThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/pinThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.pinThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/lockThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.lockThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/deleteThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.deleteThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/moveThread', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.moveThread(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/addPost', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.addPost(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/editPost', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.editPost(req.body, function (response) {
            res.json(response);
        })
    });
});

router.post('/deletePost', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        req.body.loggedUser = loggedUser;

        queries.deletePost(req.body, function (response) {
            res.json(response);
        })
    });
});

module.exports = router;