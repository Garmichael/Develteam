let express = require('express'),
    router = express.Router(),
    socketHandler = require('../modules/module_socketHandler'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    escape = require('js-string-escape'),
    errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = escape(req.body.inboxId),
            participantId = escape(req.body.participantId),
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        query = squel.select()
            .from('inbox_conv_users')
            .field('conv_id', 'conv_id')
            .where('inbox_conv_users.conv_id = ?', inboxId)
            .where('inbox_conv_users.user_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, response) {
            if (err) {
                errorLogger(err, 'DTE_0050: Error Checking User Is a Participant', query, req);
                res.json({error: err});
                return;
            }

            if (response.length === 0) {
                res.json({error: 'Logged User is not a participant in this conversation'});
                return;
            }

            query = squel.select()
                .from('inbox_conv_users')
                .field('conv_id', 'conv_id')
                .where('inbox_conv_users.conv_id = ?', inboxId)
                .where('inbox_conv_users.user_id = ?', participantId)
                .toString();

            databaseQuery(query, [], function (err, response) {
                if (err) {
                    errorLogger(err, 'DTE_0051: Error Checking Added User Is already a participant', query, req);
                    res.json({error: err});
                    return;
                }

                if (response.length > 0) {
                    res.json({error: 'User already participating'});
                    return;
                }

                query = squel.insert()
                    .into('inbox_conv_users')
                    .set('conv_id', inboxId)
                    .set('user_id', participantId)
                    .set('has_read', '0')
                    .toString();

                databaseQuery(query, [], function (err, response) {
                    if (err) {
                        errorLogger(err, 'DTE_0052: Error Setting New Participant', query, req);
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
                            errorLogger(err, 'DTE_0053: Error Grabbing Existing Participants', query, req);
                            res.json({error: err});
                            return;
                        }

                        records.forEach(function (user) {
                            socketHandler.getIoInstance().to('user_' + user.passkey).emit('inboxConversationUpdated', parseInt(inboxId, 10));
                        });
                    });

                    res.json({success: true});
                });

            });
        });
    });
});

module.exports = router;