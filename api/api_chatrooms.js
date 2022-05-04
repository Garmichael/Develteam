let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let socketHandler = require('../modules/module_socketHandler');
let stripTags = require('striptags');
let escape = require('js-string-escape');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            chatRoomId = req.query.chatRoomId,
            isGame = chatRoomId.split('.')[0] === 'game',
            groupStringUrl = chatRoomId.split('.')[1],
            validatedToGet = false;

        if (!chatRoomId) {
            res.json({error: 'No Chatroom Id supplied'});
            return;
        }

        if (!isGame) {
            validatedToGet = true;
        } else {
            loggedUser.games.forEach(function (game) {
                if (game.stringUrl === groupStringUrl) {
                    validatedToGet = true;
                }
            });
        }

        if (!validatedToGet) {
            res.json({err: 'Not validated to retrieve chatroom messages'});
            return;
        }

        query = squel.select()
            .from('chatroom_messages')
            .field('chatroom_messages.id', 'id')
            .field('chatRoomId', 'chatRoomId')
            .field('timestamp', 'timestamp')
            .field('message', 'message')
            .field('users.id', 'userId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
            .field('users.sitemod_can_ban', 'canBan')
            .field("(SELECT IFNULL(SUM(amount),0) FROM donations WHERE email_address=users.email)", 'donatedAmount')
            .field('users.has_avatar', 'hasAvatar')
            .field('is_system_message', 'isSystemMessage')
            .field('system_message_type', 'systemMessageType')
            .field('system_message_target_id', 'systemMessageTargetId')

            .where('chatRoomId = ?', escape(chatRoomId))
            .left_join('users', null, 'users.id = posterId')

            .left_join('users', 'system_message_target_user', 'system_message_target_user.id = system_message_target_id AND system_message_type=\'registeredDeveloper\'')
            .field('system_message_target_user.alias', 'systemMessageTargetUserAlias')
            .field('system_message_target_user.string_url', 'systemMessageTargetUserStringUrl')

            .left_join('games', 'system_message_target_game', 'system_message_target_game.id = system_message_target_id AND system_message_type=\'createdGame\'')
            .field('system_message_target_game.alias', 'systemMessageTargetGameAlias')
            .field('system_message_target_game.string_url', 'systemMessageTargetGameStringUrl')

            .limit(30)
            .order('timestamp', 'desc')
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0010: Error Retrieving Chatroom Data', query, req);
                res.json({error: err});
                return;
            }

            records.forEach(function (record) {
                record.from = {
                    id: record.userId,
                    alias: record.alias,
                    isModerator: record.canBan,
                    donatedAmount: record.donatedAmount,
                    stringUrl: record.stringUrl,
                    hasAvatar: record.hasAvatar
                };

                delete record.userId;
                delete record.alias;
                delete record.canBan;
                delete record.donatedAmount;
                delete record.stringUrl;
                delete record.hasAvatar;
            });

            res.json({messages: records.reverse()});
        });

    });
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let message = req.body.message,
            chatRoomId = req.body.chatRoomId,
            senderId = loggedUser.info.id,
            isGame = chatRoomId.split('.')[0] === 'game',
            isDevteam = chatRoomId.split('.')[0] === 'devteam',
            groupStringUrl = chatRoomId.split('.')[1],
            validatedToSend = false,
            query;

        message = message.substring(0, 450);

        if (senderId === undefined) {
            res.json({error: 'User not logged in'});
            return;
        }

        if (isGame) {
            loggedUser.games.forEach(function (game) {
                if (game.stringUrl === groupStringUrl) {
                    validatedToSend = true;
                }
            });
        } else if (isDevteam) {
            loggedUser.devteams.forEach(function (devteam) {
                if (devteam.stringUrl === groupStringUrl) {
                    validatedToSend = true;
                }
            });
        } else {
            validatedToSend = true;
        }

        if (!validatedToSend) {
            res.json({error: 'Not validated to post to this chatroom'});
            return;
        }

        query = squel.insert()
            .into("chatroom_messages")
            .set('message', escape(message))
            .set('chatRoomId', escape(chatRoomId))
            .set('posterId', escape(senderId))
            .toString();

        databaseQuery(query, [], function (err, response) {
            if (err) {
                errorLogger(err, 'DTE_0011: Error Sending Chatroom Message', query, req);
                res.json({error: err});
                return;
            }

            socketHandler.getIoInstance().to('chatroom_' + chatRoomId).emit('chatroomUpdated');

            res.json({success: true});
        });

    });
});

module.exports = router;