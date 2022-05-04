let express = require('express'),
    router = express.Router(),
    url = require('url'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    squel = require('squel'),
    errorLogger = require('../modules/module_errorLogger');

router.post('/updateFeedLayoutStyle', function (req, res, next) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }
        let newStyle = req.body.style;

        if (['masonry', 'single', 'double'].indexOf(newStyle) === -1) {
            newStyle = 'masonry';
        }

        let query = squel.update()
            .table('users')
            .set('feed_layout_style', newStyle)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, response) {
            if (error) {
                errorLogger(error, 'DTE_0134', query, req);
            }

            res.json({response: 'ok'});
        });
    });
});

router.post('/updateChatroomNotificationSound', function (req, res, next) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }
        let state = req.body.state;

        if (['on', 'off'].indexOf(state) === -1) {
            state = 'on';
        }

        let query = squel.update()
            .table('users')
            .set('chatroom_notification_sound', state)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, response) {
            if (error) {
                errorLogger(error, 'DTE_0135', query, req);
            }

            res.json({response: 'ok'});
        });
    });
});

module.exports = router;