let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let getXpLevelData = require('../modules/module_xpLevelData');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    let followersQuery,
        followingDevelopersQuery,
        followingGamesQuery,
        friendsQuery,
        type = escape(req.query.followType),
        id = escape(req.query.id),
        responseData = {};

    if (!type || !id) {
        res.json({error: 'Insufficient Request Data'});
        return;
    }

    followersQuery = squel.select()
        .from('follows')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field('users.avatarId', 'avatarId')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
        .where('leader_type = ?', type)
        .where('leader_id = ?', id)

        .left_join('users', null, 'users.id = follows.follower_id')
        .toString();

    databaseQuery(followersQuery, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0015: Error Getting Follows Data', followersQuery, req);
            res.json({error: err});
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
        });

        responseData.followers = records;
        sendResponseData();
    });

    friendsQuery = squel.select()
        .from('follows', 'leader')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field('users.avatarId', 'avatarId')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
        .where('leader.leader_type = ?', type)
        .where('leader.leader_id = ?', id)

        .join('follows', 'followers',
            'followers.follower_id = leader.leader_id AND leader.follower_id = followers.leader_id AND leader.leader_type = "developer" AND followers.leader_type = "developer"')
        .left_join('users', null, 'users.id = leader.follower_id')
        .toString();

    databaseQuery(friendsQuery, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0016: Error Getting Follows Data: Friends', friendsQuery, req);
            res.json({error: err});
            return;
        }


        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
        });

        responseData.friends = records;
        sendResponseData();
    });

    followingDevelopersQuery = squel.select()
        .from('follows')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field('users.avatarId', 'avatarId')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
        .where('leader_type = ?', type)
        .where('follower_id = ?', id)

        .left_join('users', null, 'users.id = follows.leader_id')
        .toString();

    databaseQuery(followingDevelopersQuery, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0017: Error Getting Follows Data: FollowingDevelopers', followingDevelopersQuery, req);
            res.json({error: err});
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
        });

        responseData.followingDevelopers = records;
        sendResponseData();
    });

    followingGamesQuery = squel.select()
        .from('follows')
        .field('games.id', 'id')
        .field('games.alias', 'alias')
        .field('games.string_url', 'stringUrl')
        .field('games.has_avatar', 'hasAvatar')
        .field('games.avatarId', 'avatarId')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'xp')
        .where('leader_type = "game"')
        .where('follower_id = ?', id)

        .left_join('games', null, 'games.id = follows.leader_id')
        .toString();

    databaseQuery(followingGamesQuery, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0018: Error Getting Follows Data: FollowingGames', followingGamesQuery, req);
            res.json({error: err});
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
        });

        responseData.followingGames = records;
        sendResponseData();
    });

    function sendResponseData() {
        if (!responseData.friends || !responseData.followers || !responseData.followingDevelopers || !responseData.followingGames
        ) {
            return;
        }

        res.json(responseData);
    }
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            parentType = req.body.parentType === 'game' ? 'game' : 'developer',
            parentId = parseInt(req.body.parentId, 10),
            query;

        (isNaN(parentId) || parentId === 0) && errors.push('No Valid Parent Id');
        !loggedUser.isLoggedIn && errors.push('Not Logged In');

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        query = squel.select()
            .from('follows')
            .where('leader_type =?', parentType)
            .where('leader_id = ?', parentId)
            .where('follower_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0019: Error Setting Follows Data', query, req);
                res.json({errors: [error, 'DTE_0019: Error Setting Follows Data']});
                return;
            }

            let isFollower = records.length > 0;
            let operation;

            if (isFollower) {
                operation = function (callback) {
                    query = squel.delete()
                        .from('follows')
                        .where('leader_type =?', parentType)
                        .where('leader_id = ?', parentId)
                        .where('follower_id = ?', loggedUser.info.id)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0020: Error Setting Follows Data', query, req);
                            callback({errors: [error, 'DTE_0020: Error Setting Follows Data']});
                            return;
                        }

                        callback({parentType, parentId, 'operation': 'deleted'});
                    });
                }
            } else {
                operation = function (callback) {
                    query = squel.insert()
                        .into('follows')
                        .set('leader_type', parentType)
                        .set('leader_id', parentId)
                        .set('follower_id', loggedUser.info.id)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0021: Error Setting Follows Data', query, req);
                            callback({errors: [error, 'DTE_0021: Error Setting Follows Data']});
                            return;
                        }

                        callback({parentType, parentId, 'operation': 'inserted'});
                    });
                }
            }

            operation(function (response) {
                res.json(response);
            });
        });
    });
});

module.exports = router;