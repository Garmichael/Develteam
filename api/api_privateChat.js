let express = require('express'),
    router = express.Router(),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel"),
    escape = require('js-string-escape'),
    socketHandler = require('../modules/module_socketHandler'),
    errorLogger = require('../modules/module_errorLogger'),
    _ = require('underscore');


router.get('/allConversations', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let loggedId,
            query1,
            query2;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        loggedId = loggedUser.info.id;

        query1 = squel.select()
            .from('private_chat_conversations')
            .field('private_chat_conversations.chatId', 'chatId')
            .field('userARead', 'hasBeenRead')
            .field('userAClosed', 'isClosed')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'partnerAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'partnerStringUrl')
            .field('(select count(*) from private_chat_messagess where private_chat_messagess.chatId = private_chat_conversations.chatId)', 'messageCount')
            .field('CAST((select max(timestamp) from private_chat_messagess where private_chat_messagess.chatId = private_chat_conversations.chatId) as UNSIGNED)', 'lastMessageTime')
            .left_join('users', null, 'users.id = userBId')
            .where('userAId = ?', loggedId)
            .toString();

        query2 = squel.select()
            .from('private_chat_conversations')
            .field('private_chat_conversations.chatId', 'chatId')
            .field('userBRead', 'hasBeenRead')
            .field('userBClosed', 'isClosed')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'partnerAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'partnerStringUrl')
            .field('(select count(*) from private_chat_messagess where private_chat_messagess.chatId = private_chat_conversations.chatId)', 'messageCount')
            .field('CAST((select max(timestamp) from private_chat_messagess where private_chat_messagess.chatId = private_chat_conversations.chatId) as UNSIGNED)', 'lastMessageTime')
            .left_join('users', null, 'users.id = userAId')
            .where('userBId = ?', loggedId)
            .toString();


        databaseQuery(query1, [], function (err, recordsAsA) {
            if (err) {
                res.json(err);
                return;
            }

            databaseQuery(query2, [], function (err, recordsAsB) {
                if (err) {
                    res.json(err);
                    return;
                }


                let combinedResults = {};

                _.each(recordsAsA, function (record) {
                    combinedResults[record.chatId] = {
                        'chatId': record.chatId,
                        'partnerAlias': record.partnerAlias,
                        'partnerStringUrl': record.partnerStringUrl,
                        'messageCount': record.messageCount,
                        'hasBeenRead': record.hasBeenRead,
                        'lastMessageTime': record.lastMessageTime
                    };
                });

                _.each(recordsAsB, function (record) {
                    if (combinedResults[record.chatId]) {
                        combinedResults[record.chatId] = {
                            'chatId': record.chatId,
                            'partnerAlias': record.partnerAlias,
                            'partnerStringUrl': record.partnerStringUrl,
                            'messageCount': combinedResults[record.chatId].messageCount + record.messageCount,
                            'hasBeenRead': record.hasBeenRead,
                            'lastMessageTime': record.lastMessageTime
                        };
                    } else {
                        combinedResults[record.chatId] = {
                            'chatId': record.chatId,
                            'partnerAlias': record.partnerAlias,
                            'partnerStringUrl': record.partnerStringUrl,
                            'messageCount': record.messageCount,
                            'hasBeenRead': record.hasBeenRead,
                            'lastMessageTime': record.lastMessageTime
                        };
                    }
                });

                let outputResults = [];

                _.each(combinedResults, function (combinedResult) {
                    outputResults.push(combinedResult);
                });

                res.json(outputResults);
            });
        });
    });
});

router.get('/messages', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let chatId = req.query.chatId,
            loggedId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!chatId) {
            res.json({error: 'No chatId'});
            return;
        }

        chatId = escape(chatId);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('private_chat_conversations')
            .field('chatId')
            .where('chatId = ?', chatId)
            .where('userAId = ? OR userBId =?', loggedId, loggedId)
            .toString();

        databaseQuery(query, [], function (err, matchingConversations) {
            if (err) {
                errorLogger(err, 'DTE_0120p', query, req);
                res.json({error: err});
                return;
            }

            if (matchingConversations.length === 0) {
                res.json({error: 'Not Validated to view messages'});
                return;
            }

            query = squel.select()
                .from('private_chat_messagess')
                .field('chatId', 'chatId')
                .field('message', 'message')
                .field('CAST(timestamp as UNSIGNED)', 'timestamp')
                .field('users.id', 'senderId')
                .field(`IFNULL(users.alias, 'DELETED USER')`, 'senderAlias')
                .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'senderStringUrl')
                .field('users.has_avatar', 'senderHasAvatar')
                .left_join('users', null, 'users.id = senderId')
                .where('chatId = ?', chatId)
                .order('timestamp', 'desc')
                .limit(30)
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    errorLogger(err, 'DTE_0120', query, req);
                    res.json({error: err});
                    return;
                }

                _.each(records, function (record) {
                    record.from = {
                        'id': record.senderId,
                        'alias': record.senderAlias,
                        'stringUrl': record.senderStringUrl,
                        'hasAvatar': record.senderHasAvatar,
                    };

                    delete record.senderId;
                    delete record.senderAlias;
                    delete record.senderStringUrl;
                    delete record.senderHasAvatar;
                });

                res.json(records.reverse());
            });
        });
    });
});

router.post('/message', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let chatId = req.body.chatId,
            message = req.body.message,
            loggedId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!chatId) {
            res.json({error: 'No chatId'});
            return;
        }

        chatId = escape(chatId);
        message = escape(message);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('private_chat_conversations')
            .field('chatId')
            .field('userA.id', 'userAId')
            .field('userA.passkey', 'userAPasskey')
            .field('userB.id', 'userBId')
            .field('userB.passkey', 'userBPasskey')
            .left_join('users', 'userA', 'userA.id = userAId')
            .left_join('users', 'userB', 'userB.id = userBId')
            .where('chatId = ?', chatId)
            .where('userAId = ? OR userBId =?', loggedId, loggedId)
            .toString();

        databaseQuery(query, [], function (err, matchingConversations) {
            if (err) {
                errorLogger(err, 'DTE_0120p', query, req);
                res.json({error: err});
                return;
            }

            if (matchingConversations.length === 0) {
                res.json({error: 'Not Validated to view messages'});
                return;
            }

            query = squel.insert()
                .into('private_chat_messagess')
                .set('chatId', chatId)
                .set('senderId', loggedId)
                .set('message', message)
                .set('timestamp', new Date().getTime())
                .toString();

            databaseQuery(query, [], function (err, insertData) {
                if (err) {
                    errorLogger(err, 'DTE_0121', query, req);
                    res.json({error: err});
                    return;
                }

                let userSpot = matchingConversations[0].userAId === loggedId
                    ? 'userBRead'
                    : 'userARead';

                query = squel.update()
                    .table('private_chat_conversations')
                    .set(userSpot, 0)
                    .where('chatId = ?', chatId)
                    .toString();

                databaseQuery(query, [], function (err, insertData) {
                    if (err) {
                        errorLogger(err, 'DTE_0121b', query, req);
                        res.json({error: err});
                        return;
                    }

                    socketHandler.getIoInstance().to('user_' + matchingConversations[0].userAPasskey).emit('receivedPrivateChatMessage', {chatId: chatId});
                    socketHandler.getIoInstance().to('user_' + matchingConversations[0].userBPasskey).emit('receivedPrivateChatMessage', {chatId: chatId});
                    res.json({'response': 'success'});
                });
            });
        });
    });
});

router.get('/historyDates', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            chatId = req.query.chatId,
            loggedId;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!chatId) {
            res.json({error: 'No chatId'});
            return;
        }

        chatId = escape(chatId);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('private_chat_conversations')
            .field('chatId')
            .where('chatId = ?', chatId)
            .where('userAId = ? OR userBId =?', loggedId, loggedId)
            .toString();

        databaseQuery(query, [], function (err, matchingConversations) {
            if (err) {
                errorLogger(err, 'dte_0115', query, req);
                res.json({error: err});
                return;
            }

            if (matchingConversations.length === 0) {
                res.json({error: 'Not Validated to view messages'});
                return;
            }

            query = squel.select()
                .from('private_chat_messagess')
                .field('count(*)', 'messageCount')
                .field(`from_unixtime(CEILING(timestamp/1000), '%Y %m %d')`, 'day')
                .where('chatId = ?', escape(chatId))
                .order('day', 'desc')
                .group('day')
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    console.log(err);
                }

                res.json({history: records});

            });
        });
    });
});

router.get('/historyMessages', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let chatId = req.query.chatId,
            historyDate = new Date(req.query.historyDate),
            loggedId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!chatId) {
            res.json({error: 'No chatId'});
            return;
        }

        if (!historyDate) {
            res.json({error: 'No History Date Supplied'});
            return;
        }

        historyDate = new Date(historyDate.getTime());
        let historyDateMin = historyDate.getTime();
        let historyDateMax = new Date(historyDate.setTime(historyDate.getTime() + 86400000)).getTime();

        chatId = escape(chatId);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('private_chat_conversations')
            .field('chatId')
            .where('chatId = ?', chatId)
            .where('userAId = ? OR userBId =?', loggedId, loggedId)
            .toString();

        databaseQuery(query, [], function (err, matchingConversations) {
            if (err) {
                errorLogger(err, 'DTE_0120p', query, req);
                res.json({error: err});
                return;
            }

            if (matchingConversations.length === 0) {
                res.json({error: 'Not Validated to view messages'});
                return;
            }

            query = squel.select()
                .from('private_chat_messagess')
                .field('chatId', 'chatId')
                .field('message', 'message')
                .field('CAST(timestamp as UNSIGNED)', 'timestamp')
                .field('users.id', 'senderId')
                .field(`IFNULL(users.alias, 'DELETED USER')`, 'senderAlias')
                .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'senderStringUrl')
                .field('users.has_avatar', 'senderHasAvatar')
                .left_join('users', null, 'users.id = senderId')
                .where('chatId = ?', chatId)
                .where('timestamp >= ?', historyDateMin)
                .where('timestamp <= ?', historyDateMax)
                .order('timestamp', 'desc')
                .toString();

            databaseQuery(query, [], function (err, records) {
                if (err) {
                    errorLogger(err, 'DTE_0116', query, req);
                    res.json({error: err});
                    return;
                }

                console.log(records);
                _.each(records, function (record) {
                    record.from = {
                        'id': record.senderId,
                        'alias': record.senderAlias,
                        'stringUrl': record.senderStringUrl,
                        'hasAvatar': record.senderHasAvatar,
                    };

                    delete record.senderId;
                    delete record.senderAlias;
                    delete record.senderStringUrl;
                    delete record.senderHasAvatar;
                });

                res.json(records.reverse());
            });
        });
    });
});

router.post('/markRead', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let chatId = req.body.chatId,
            loggedId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!chatId) {
            res.json({error: 'No chatId'});
            return;
        }

        chatId = escape(chatId);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('private_chat_conversations')
            .field('chatId')
            .field('userA.id', 'userAId')
            .field('userA.passkey', 'userAPasskey')
            .field('userB.id', 'userBId')
            .field('userB.passkey', 'userBPasskey')
            .left_join('users', 'userA', 'userA.id = userAId')
            .left_join('users', 'userB', 'userB.id = userBId')
            .where('chatId = ?', chatId)
            .where('userAId = ? OR userBId =?', loggedId, loggedId)
            .toString();

        databaseQuery(query, [], function (err, matchingConversations) {
            if (err) {
                errorLogger(err, 'DTE_0122', query, req);
                res.json({error: err});
                return;
            }

            if (matchingConversations.length === 0) {
                res.json({error: 'Not Validated to view messages'});
                return;
            }

            let userSpot = matchingConversations[0].userAId === loggedId
                ? 'userARead'
                : 'userBRead';

            query = squel.update()
                .table('private_chat_conversations')
                .set(userSpot, 1)
                .where('chatId = ?', chatId)
                .toString();

            databaseQuery(query, [], function (err, insertData) {
                if (err) {
                    errorLogger(err, 'DTE_0121', query, req);
                    res.json({error: err});
                    return;
                }

                let userPassKey = matchingConversations[0].userAId === loggedId
                    ? matchingConversations[0].userAPasskey
                    : matchingConversations[0].userBPasskey;

                socketHandler.getIoInstance().to('user_' + userPassKey).emit('updateConversations');
                res.json({'response': 'success'});
            });
        });
    });
});

router.post('/newConversation', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let participantId = req.body.participantId,
            message = req.body.message,
            loggedId,
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        if (!participantId) {
            res.json({error: 'No participantId'});
            return;
        }

        participantId = parseInt(participantId, 10);
        message = escape(message);
        loggedId = loggedUser.info.id;

        query = squel.select()
            .from('users')
            .field('id', 'id')
            .where('id = ?', participantId)
            .toString();

        databaseQuery(query, [], function (err, matchingParticipant) {
            if (err) {
                errorLogger(err, 'dte_0117', query, req);
                res.json({error: err});
                return;
            }

            if (matchingParticipant.length === 0) {
                res.json({error: 'Invalid participantId'});
                return;
            }

            query = squel.select()
                .from('private_chat_conversations')
                .field('chatId')
                .where('(userAId = ? AND userBId = ?) OR (userAId = ? AND userBId = ?)', loggedId, participantId, participantId, loggedId)
                .toString();

            databaseQuery(query, [], function (err, matchingConversations) {
                if (err) {
                    errorLogger(err, 'dte_0117b', query, req);
                    res.json({error: err});
                    return;
                }

                if (matchingConversations.length > 0) {
                    res.json({error: 'Conversation Already Exists'});
                    return;
                }

                let chatId = loggedId + '.' + participantId;

                query = squel.insert()
                    .into('private_chat_messagess')
                    .set('chatId', chatId)
                    .set('senderId', loggedId)
                    .set('message', message)
                    .set('timestamp', new Date().getTime())
                    .toString();

                databaseQuery(query, [], function (err, insertMessageData) {
                    if (err) {
                        errorLogger(err, 'dte_0117c', query, req);
                        res.json({error: err});
                        return;
                    }

                    query = squel.insert()
                        .into('private_chat_conversations')
                        .set('chatId', chatId)
                        .set('userAId', loggedId)
                        .set('userARead', 1)
                        .set('userAClosed', 0)
                        .set('userBId', participantId)
                        .set('userBRead', 0)
                        .set('userBClosed', 0)
                        .toString();

                    databaseQuery(query, [], function (err, insertConversationData) {
                        if (err) {
                            errorLogger(err, 'dte_0117d', query, req);
                            res.json({error: err});
                            return;
                        }

                        query = squel.select()
                            .from('private_chat_conversations')
                            .field('chatId')
                            .field('userA.id', 'userAId')
                            .field('userA.passkey', 'userAPasskey')
                            .field('userB.id', 'userBId')
                            .field('userB.passkey', 'userBPasskey')
                            .left_join('users', 'userA', 'userA.id = userAId')
                            .left_join('users', 'userB', 'userB.id = userBId')
                            .where('chatId = ?', chatId)
                            .toString();

                        databaseQuery(query, [], function (err, matchingUsers) {
                            if (err) {
                                errorLogger(err, 'dte_0117e', query, req);
                                res.json({error: err});
                                return;
                            }

                            socketHandler.getIoInstance().to('user_' + matchingUsers[0].userAPasskey).emit('receivedPrivateChatMessage', {
                                chatId: chatId
                            });

                            socketHandler.getIoInstance().to('user_' + matchingUsers[0].userBPasskey).emit('receivedPrivateChatMessage', {
                                chatId: chatId
                            });

                            res.json({
                                'response': 'success',
                                'newChatId': chatId
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
