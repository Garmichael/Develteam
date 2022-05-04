let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let socketHandler = require('../modules/module_socketHandler');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let userId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        userId = loggedUser.info.id;

        query = squel.select()
            .from('inbox_conv_users', 'self')
            .field('inbox_conv.id', 'id')
            .field('subject', 'subject')
            .field('GROUP_CONCAT(DISTINCT users.alias SEPARATOR \'++||++||++\')', 'participantAliases')
            .field('GROUP_CONCAT(DISTINCT users.string_url SEPARATOR \'++||++||++\')', 'participantStringUrls')
            .field('GROUP_CONCAT(DISTINCT users.id SEPARATOR \'++||++||++\')', 'participantIds')
            .field('MAX(inbox_conv_messages.created) * 1000', 'lastMessageDate')
            .field('MAX(self.has_read)', 'hasBeenRead')

            .left_join('inbox_conv', null, 'self.conv_id = inbox_conv.id')
            .left_join('inbox_conv_users', 'allParticipants', 'allParticipants.conv_id = inbox_conv.id')
            .left_join('users', null, 'allParticipants.user_id = users.id')
            .left_join('inbox_conv_messages', null, 'inbox_conv_messages.conv_id = inbox_conv.id')

            .group('inbox_conv.id')
            .where('self.user_id = ?', userId)
            .order('lastMessageDate', 'desc')
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0044: Error Grabbing Inbox Data', query, req);
                res.json({error: err});
                return;
            }

            records.forEach(function (record) {
                let aliasList = record.participantAliases.split('++||++||++');
                let stringUrlList = record.participantStringUrls.split('++||++||++');
                let idList = record.participantIds.split('++||++||++');

                record.participants = [];

                for (let i = 0; i < aliasList.length; i++) {
                    record.participants.push({
                        id: idList[i],
                        alias: aliasList[i],
                        stringUrl: stringUrlList[i]
                    })
                }

                delete record.participantAliases;
                delete record.participantStringUrls;
                delete record.participantIds;
            });
            res.json(records);
        });
    });
});

router.get('/:inboxId', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = req.params.inboxId,
            userId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        userId = loggedUser.info.id;

        query = squel.select()
            .from('inbox_conv_users', 'self')
            .field('inbox_conv.id', 'id')
            .field('subject', 'subject')
            .field('GROUP_CONCAT(DISTINCT users.alias SEPARATOR \'++||++||++\')', 'participantAliases')
            .field('GROUP_CONCAT(DISTINCT users.string_url SEPARATOR \'++||++||++\')', 'participantStringUrls')
            .field('GROUP_CONCAT(DISTINCT users.id SEPARATOR \'++||++||++\')', 'participantIds')
            .field('MAX(inbox_conv_messages.created) * 1000', 'lastMessageDate')
            .field('MAX(self.has_read)', 'hasBeenRead')

            .left_join('inbox_conv', null, 'self.conv_id = inbox_conv.id')
            .left_join('inbox_conv_users', 'allParticipants', 'allParticipants.conv_id = inbox_conv.id')
            .left_join('users', null, 'allParticipants.user_id = users.id')
            .left_join('inbox_conv_messages', null, 'inbox_conv_messages.conv_id = inbox_conv.id')

            .group('inbox_conv.id')
            .where('self.user_id = ?', userId)
            .where('inbox_conv.id = ?', inboxId)
            .order('lastMessageDate', 'desc')
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0045: Error Grabbing Message Data', query, req);
                res.json({error: err});
                return;
            }

            records.forEach(function (record) {
                let aliasList = record.participantAliases.split('++||++||++');
                let stringUrlList = record.participantStringUrls.split('++||++||++');
                let idList = record.participantIds.split('++||++||++');

                record.participants = [];

                for (let i = 0; i < aliasList.length; i++) {
                    record.participants.push({
                        id: idList[i],
                        alias: aliasList[i],
                        stringUrl: stringUrlList[i]
                    })
                }

                delete record.participantAliases;
                delete record.participantStringUrls;
                delete record.participantIds;
            });
            res.json(records[0]);
        });
    });
});

router.post('/new', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let subject = req.body.subject,
            message = req.body.message,
            participants = req.body.participants,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: "Not Logged In"});
            return;
        }

        if (!message || !participants) {
            res.json({error: "Not enough information supplied"});
            return;
        }

        if (!Array.isArray(participants)) {
            res.json({error: "Invalid data format"});
            return;
        }

        message = escape(message);

        subject = escape(subject);
        subject = subject.replace(/</g, '&lt;');
        subject = subject.replace(/>/g, '&gt;');

        query = squel.insert()
            .into('inbox_conv')
            .set('mod_id', loggedUser.info.id)
            .set('subject', subject)
            .toString();

        databaseQuery(query, [], function (err, inbox) {
            if (err) {
                errorLogger(err, 'DTE_0046: Error Inserting new Inbox Conversation', query, req);
                res.json({error: err});
                return;
            }

            query = squel.insert()
                .into('inbox_conv_messages')
                .set('conv_id', inbox.insertId)
                .set('from_id', loggedUser.info.id)
                .set('message', message)
                .set('created', Math.floor(Date.now() / 1000))
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    errorLogger(err, 'DTE_0047: Error Inserting new Inbox Message', query, req);
                    res.json({error: err});
                    return;
                }

                let insertFields = [{
                    conv_id: inbox.insertId,
                    user_id: loggedUser.info.id,
                    has_read: 1
                }];


                participants.forEach(function (participant) {
                    insertFields.push({
                        conv_id: inbox.insertId,
                        user_id: escape(participant.id),
                        has_read: 0
                    });
                });

                query = squel.insert()
                    .into('inbox_conv_users')
                    .setFieldsRows(insertFields)
                    .toString();

                databaseQuery(query, [], function (err, records) {
                    if (err) {
                        errorLogger(err, 'DTE_0048: Error Inserting Inbox Members', query, req);
                        res.json({error: err});
                        return;
                    }

                    res.json({response: 'success'});

                    query = squel.select()
                        .from('inbox_conv_users')
                        .field('users.passkey', 'passkey')
                        .field('users.id', 'id')
                        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
                        .field('users.email', 'email')
                        .left_join('users', null, 'users.id = inbox_conv_users.user_id')
                        .where('inbox_conv_users.conv_id = ?', inbox.insertId)
                        .toString();

                    databaseQuery(query, [], function (err, records) {
                        if (err) {
                            errorLogger(err, 'DTE_0049: Error Grabbing Updated Inbox Users', query, req);
                            return;
                        }

                        let emailer = require('../modules/module_emailer');

                        records.forEach(function (user) {
                            socketHandler.getIoInstance().to('user_' + user.passkey).emit('inboxConversationUpdated', parseInt(inbox.insertId, 10));

                            if (user.id !== loggedUser.info.id) {
                                emailer.sendEmail(user.alias, user.email, 'newInboxConversation', 'You have a new Inbox Message!', '', '');
                            }
                        });
                    });
                });

            });
        });
    });
});
module.exports = router;