let express = require('express'),
    router = express.Router(),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel"),
    escape = require('js-string-escape'),
    _ = require('lodash'),
    errorLogger = require('../modules/module_errorLogger');

router.get('/dates', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            chatRoomId = req.query.chatRoomId,
            isGame = chatRoomId.split('.')[0] === 'game',
            groupStringUrl = chatRoomId.split('.')[1],
            validatedToGet = false,
            formattedResponse;

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
            .field('count(*)', 'messageCount')
            .field(`DATE_FORMAT(timestamp, '%Y %m %d')`, 'day')
            .where('chatRoomId = ?', escape(chatRoomId))
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

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            chatRoomId = req.query.chatRoomId,
            historyDate = new Date(req.query.historyDate),
            isGame = chatRoomId.split('.')[0] === 'game',
            groupStringUrl = chatRoomId.split('.')[1],
            validatedToGet = false,
            formattedResponse;


        if (!historyDate) {
            res.json({error: 'No History Date Supplied'});
            return;
        }

        const userTimezoneOffset = historyDate.getTimezoneOffset() * 60000;
        historyDate = new Date(historyDate.getTime() - userTimezoneOffset);


        let historyDateMin = historyDate.toISOString().slice(0, 19).replace('T', ' ');
        let historyDateMax = new Date(historyDate.setTime(historyDate.getTime() + 86400000)).toISOString().slice(0, 19).replace('T', ' ');

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
            .field(`DATE_FORMAT(timestamp, '%b %d %Y')`, 'day')
            .field('message', 'message')
            .field('users.id', 'userId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
            .field("(SELECT IFNULL(SUM(amount),0) FROM donations WHERE email_address=users.email)", 'donatedAmount')
            .field('users.sitemod_can_ban', 'canBan')
            .field('users.has_avatar', 'hasAvatar')
            .field('users.avatarId', 'avatarId')
            .field('is_system_message', 'isSystemMessage')
            .field('system_message_type', 'systemMessageType')
            .field('system_message_target_id', 'systemMessageTargetId')

            .where('chatRoomId = ?', escape(chatRoomId))
            .where('timestamp >= ?', historyDateMin)
            .where('timestamp <= ?', historyDateMax)

            .left_join('users', null, 'users.id = posterId')

            .left_join('users', 'system_message_target_user', 'system_message_target_user.id = system_message_target_id AND system_message_type=\'registeredDeveloper\'')
            .field('system_message_target_user.alias', 'systemMessageTargetUserAlias')
            .field('system_message_target_user.string_url', 'systemMessageTargetUserStringUrl')

            .left_join('games', 'system_message_target_game', 'system_message_target_game.id = system_message_target_id AND system_message_type=\'createdGame\'')
            .field('system_message_target_game.alias', 'systemMessageTargetGameAlias')
            .field('system_message_target_game.string_url', 'systemMessageTargetGameStringUrl')

            .order('timestamp', 'desc')
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0009: Error Retrieving Chatroom History', query, req);
                res.json({error: err});
                return;
            }

            formattedResponse = [];

            records.forEach(function (record) {
                record.from = {
                    id: record.userId,
                    alias: record.alias,
                    donatedAmount: record.donatedAmount,
                    isModerator: record.canBan,
                    stringUrl: record.stringUrl,
                    hasAvatar: record.hasAvatar,
                    avatarId: record.avatarId
                };

                // record.messages.reverse();

                delete record.userId;
                delete record.alias;
                delete record.donatedAmount;
                delete record.canBan;
                delete record.stringUrl;
                delete record.hasAvatar;
                delete record.avatarId;
            });

            res.json(records);
        });

    });
});

module.exports = router;