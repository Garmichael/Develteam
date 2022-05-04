let express = require('express'),
    router = express.Router(),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel"),
    escape = require('js-string-escape'),
    socketHandler = require('../modules/module_socketHandler'),
    errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = req.body.inboxId && escape(req.body.inboxId),
            message = req.body.message && escape(req.body.message),
            created = Date.now(),
            fromId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        fromId = loggedUser.info.id;

        query = squel.select()
            .from('inbox_conv_users')
            .field('conv_id', 'conv_id')
            .where('inbox_conv_users.conv_id = ?', inboxId)
            .where('inbox_conv_users.user_id = ?', fromId)
            .toString();

        databaseQuery(query, [], function (err, response) {
            if (err) {
                errorLogger(err, 'DTE_0056: Error Grabbing Active Participants', query, req);
                res.json({error: err});
                return;
            }

            if (response.length === 0) {
                res.json({error: 'Logged USer is not a participant in this conversation'});
                return;
            }

            query = squel.insert()
                .into('inbox_conv_messages')
                .set('conv_id', inboxId)
                .set('from_id', fromId)
                .set('message', message)
                .set('created', Math.floor(created / 1000))
                .toString();

            databaseQuery(query, [], function (err, response) {
                if (err) {
                    errorLogger(err, 'DTE_0057: Error Inserting New Message', query, req);
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
                        errorLogger(err, 'DTE_0058: Grabbing Active Participants', query, req);
                        res.json({error: err});
                        return;
                    }

                    records.forEach(function (user) {

                        query = squel.update()
                            .table('inbox_conv_users')
                            .set('has_read', 0)
                            .where('inbox_conv_users.user_id = ?', user.id)
                            .where('inbox_conv_users.user_id != ?', fromId)
                            .where('inbox_conv_users.conv_id = ?', inboxId)
                            .toString();


                        databaseQuery(query, [], function (err, records) {
                            if (err) {
                                errorLogger(err, 'DTE_0059: Error Setting Read Status', query, req);
                                return;
                            }

                            socketHandler.getIoInstance().to('user_' + user.passkey).emit('inboxConversationMessagesUpdated', parseInt(inboxId, 10));
                            socketHandler.getIoInstance().to('user_' + user.passkey).emit('inboxConversationUpdated', parseInt(inboxId, 10));
                        });
                    });
                });

                res.json({response: 'success'});
            });
        });
    });
});

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = escape(req.query.inboxId),
            userId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        userId = loggedUser.info.id;


        query = squel.select()
            .from('inbox_conv_users')
            .field('conv_id', 'conv_id')
            .where('inbox_conv_users.conv_id = ?', inboxId)
            .where('inbox_conv_users.user_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, response) {
            if (err) {
                errorLogger(err, 'DTE_0061: Error Grabbing Participants', query, req);
                res.json({error: err});
                return;
            }

            if (response.length === 0) {
                res.json({error: 'Logged USer is not a participant in this conversation'});
                return;
            }

            query = squel.select()
                .from('inbox_conv_messages')
                .field('created * 1000', 'timestamp')
                .field('message', 'message')
                .field('from_id', 'from')
                .field(`IFNULL(users.alias, 'DELETED USER')`, 'fromAlias')
                .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'fromStringUrl')
                .field('users.has_avatar', 'fromHasAvatar')
                .field('users.id', 'fromId')
                .order('timestamp', 'asc')

                .left_join('users', null, 'users.id = from_id')
                .where('conv_id = ?', inboxId)
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    errorLogger(err, 'DTE_0062: Grabbing Messages', query, req);
                    res.json({error: err});
                    return;
                }

                records.forEach(function (record) {
                    record.from = {
                        id: record.fromId,
                        alias: record.fromAlias,
                        stringUrl: record.fromStringUrl,
                        hasAvatar: record.fromHasAvatar
                    };

                    delete record.fromId;
                    delete record.fromAlias;
                    delete record.fromStringUrl;
                    delete record.fromHasAvatar;
                });

                res.json(records);


            });
        });
    });
});

module.exports = router;