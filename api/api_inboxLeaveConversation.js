let express = require('express'),
    router = express.Router(),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel"),
    socketHandler = require('../modules/module_socketHandler'),
    escape = require('js-string-escape'),
    errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = req.body.inboxId && escape(req.body.inboxId),
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        query = squel.delete()
            .from('inbox_conv_users')
            .where('user_id = ?', loggedUser.info.id)
            .where('conv_id = ?', inboxId)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0054: Error Deleting User From Participants', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('inbox_conv_users')
                .field('users.passkey', 'passkey')
                .field('users.id', 'id')
                .left_join('users', null, 'users.id = inbox_conv_users.user_id')
                .where('inbox_conv_users.conv_id = ?', inboxId)
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    errorLogger(err, 'DTE_0055: Error Grabbing Remaining Active Participants', query, req);
                    res.json({error: err});
                    return;
                }

                records.forEach(function (user) {
                    socketHandler.getIoInstance().to('user_' + user.passkey).emit('inboxConversationUpdated', parseInt(inboxId, 10));
                });
            });

            res.json({response: 'success'});
        });

    });
});


module.exports = router;