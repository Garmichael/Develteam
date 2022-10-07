let squel = require('squel');
let crypto = require('crypto');
let databaseQuery = require('./module_mysqlQuery');
let getXpLevelData = require('./module_xpLevelData');
let errorLogger = require('./module_errorLogger');

module.exports = {
    buildLoggedUserData: function (req, callback, overrides) {
        let passKey = req.cookies.userid,
            password = req.cookies.password,
            sha256 = crypto.createHash('sha256'),
            defaultUserData = {
                isLoggedIn: false,
                info: {},
            },
            query;

        if (overrides && overrides.passKey) {
            passKey = overrides.passKey;
        }

        if (overrides && overrides.password) {
            password = overrides.password;
        }

        if (!passKey || !password) {
            callback(defaultUserData);
            return;
        }

        let ipAddress;
        if (req.headers['x-forwarded-for'] !== undefined) {
            ipAddress = req.headers['x-forwarded-for'].split(',').pop();
        } else {
            ipAddress = req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        }

        checkForPreviouslyBanned(ipAddress, function (isBanned) {
            if (isBanned) {
                query = squel.update()
                    .table('users')
                    .set('banned', 1)
                    .where('ip_address = ?', ipAddress)
                    .toString();
                databaseQuery(query, [], function (err, rows) {
                    callback(defaultUserData);
                });
            } else {
                query = squel.select()
                    .from('users')
                    .field('id', 'id')
                    .field('email', 'email')
                    .field('alias', 'alias')
                    .field('string_url', 'stringUrl')
                    .field('has_avatar', 'hasAvatar')
                    .field('avatarId', 'avatarId')
                    .field('hasBanner', 'hasBanner')
                    .field('loc_lat', 'loc_lat')
                    .field('loc_lon', 'loc_lon')
                    .field('passkey', 'passkey')
                    .field('feed_layout_style', 'feedLayoutStyle')
                    .field('chatroom_notification_sound', 'chatroomNotificationSound')
                    .field('sitemod_can_ban', 'siteModCanBan')
                    .field('caughtUpOnMedia', 'caughtUpOnMedia')
                    .field('caughtUpOnDevlogs', 'caughtUpOnDevlogs')
                    .field('caughtUpOnClassifieds', 'caughtUpOnClassifieds')
                    .field('caughtUpOnForums', 'caughtUpOnForums')
                    .field('receive_user_email', 'receiveEmailNotifications')
                    .field('receive_promo_email', 'receivePromoEmails')
                    .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
                    .where('passkey = ? AND password = ?', passKey, password)
                    .where('banned = 0')
                    .toString();

                databaseQuery(query, [], function (err, rows) {
                    if (err) {
                        errorLogger(err, 'DTE_0253', query);
                        callback(defaultUserData);
                        return;
                    }

                    if (rows.length !== 1) {
                        callback(defaultUserData);
                        return;
                    }

                    let userOptions = {
                        feedLayoutStyle: rows[0].feedLayoutStyle,
                        chatroomNotificationSound: rows[0].chatroomNotificationSound

                    };

                    query = squel.select()
                        .from('games_members')
                        .field('games.alias', 'alias')
                        .field('games.string_url', 'stringUrl')
                        .field('games.id', 'id')
                        .field('games.has_avatar', 'hasAvatar')
                        .field('games.avatarId', 'avatarId')
                        .field('games.hasBanner', 'hasBanner')
                        .field('games_members.mod_level', 'moderatorLevel')

                        .left_join('games', null, 'games.id = games_members.game_id')
                        .where('games_members.member_id = ?', rows[0].id)
                        .where('games_members.status = ?', 'Current')
                        .toString();

                    databaseQuery(query, [], function (err, gameData) {
                        if (err) {
                            errorLogger(err, 'DTE_0254', query);
                            callback(defaultUserData);
                            return;
                        }

                        let developerInfo = rows[0];
                        developerInfo.xpLevelData = getXpLevelData(developerInfo.xp);

                        callback({
                            info: developerInfo,
                            options: userOptions,
                            games: gameData,
                            isLoggedIn: true
                        });

                        query = squel.update()
                            .table('users')
                            .set('last_active = NOW()')
                            .set('ip_address', ipAddress)
                            .where('id = ?', rows[0].id)
                            .toString();

                        databaseQuery(query, [], function (error, response) {
                            if (error) {
                                errorLogger(error, 'DTE_0255', query);
                            }
                        })
                    });
                });
            }
        });


    }
};

function checkForPreviouslyBanned(ip, callback) {
    let query = squel.select()
        .from('users')
        .field('id')
        .where('banned = 1')
        .where('ip_address = ?', ip)
        .toString();

    databaseQuery(query, [], function (error, records) {
        callback(records.length > 0);
    })
}

/*
 ipNum = req.connection.remoteAddress;
 ipNum = ipNum.replace(/^.*:/, '');
 ipNum = '98.247.248.215';
 ipNum = ipNum.split('.');
 ipNum = (parseInt(ipNum[3], 10) +
 (parseInt(ipNum[2], 10) * 256) +
 (parseInt(ipNum[1], 10) * 256 * 256) +
 (parseInt(ipNum[0], 10) * 256 * 256 * 256));

 databaseQuery('SELECT latitude, longitude FROM ip2loc where ip_from <= ? AND ip_to >= ?', [ipNum, ipNum], function (err, rows) {
 let lat,
 lon;

 if (err) {
 callback(err);
 } else {
 if (rows.length > 0) {
 lat = rows[0].latitude;
 lon = rows[0].longitude;
 } else {
 lat = 0;
 lon = 0;
 }

 module.exports.loggedUserData = {
 isLoggedIn: false,
 info: {
 loc_lat: lat,
 loc_lon: lon
 }
 };
 callback();
 }
 });*/