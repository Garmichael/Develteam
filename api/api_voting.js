let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require('squel');
let _ = require('lodash');
let escape = require('js-string-escape');
let socketHandler = require('../modules/module_socketHandler');
let notificationQueries = require('./notifications/queries.js');
let xpQueries = require('./xp/queries.js');
let errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let loggedId = loggedUser.isLoggedIn ? loggedUser.info.id : 0,
            parentType = req.body.parentType,
            parentId = parseInt(req.body.parentId, 10),
            voteDirection = req.body.direction,
            query;

        let operations = {
            isSameVote: function (votedValue) {
                return votedValue === 1 && voteDirection === 'up' ||
                    votedValue === -1 && voteDirection === 'down'
            },

            addVoteEntry: function () {
                query = "INSERT INTO votes_binary (parent_type, parent_id, voter_id, vote) " +
                    "VALUES (?, ?, ?, ?)";

                databaseQuery(query, [escape(parentType), parentId, loggedId, voteDirection === 'up' ? 1 : -1], function (err) {
                    if (err) {
                        errorLogger(err, 'DTE_0136', query, req);
                        res.json({errors: [err]});
                        return;
                    }

                    operations.sendResponseAndSocket();

                    if (parentType === 'post' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'media' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForMedia({
                            loggedUser: loggedUser,
                            mediaId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'forum' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForForumPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (voteDirection === 'up') {
                        xpQueries.addXP({
                            loggedUser: loggedUser,
                            targetType: parentType,
                            targetId: parentId,
                            pointType: 'upvote'
                        });
                    }
                });

            },

            changeVoteEntry: function () {
                query = "UPDATE votes_binary " +
                    "SET vote = ? " +
                    "WHERE parent_type = ? " +
                    "AND parent_id = ? " +
                    "AND voter_id = ?";

                databaseQuery(query, [voteDirection === 'up' ? 1 : -1, parentType, parentId, loggedId], function (err) {
                    if (err) {
                        errorLogger(err, 'DTE_0137', query, req);
                        res.json({errors: [err]});
                        return;
                    }

                    operations.sendResponseAndSocket();

                    if (parentType === 'post' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'post' && voteDirection === 'down') {
                        notificationQueries.deleteNotificationForPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'media' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForMedia({
                            loggedUser: loggedUser,
                            mediaId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'media' && voteDirection === 'down') {
                        notificationQueries.deleteNotificationForMedia({
                            loggedUser: loggedUser,
                            mediaId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'forum' && voteDirection === 'up') {
                        notificationQueries.sendNotificationForForumPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'forum' && voteDirection === 'down') {
                        notificationQueries.deleteNotificationForForumPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (voteDirection === 'up') {
                        xpQueries.addXP({
                            loggedUser: loggedUser,
                            targetType: parentType,
                            targetId: parentId,
                            pointType: 'upvote'
                        });
                    }

                    if (voteDirection === 'down') {
                        xpQueries.removeXP({
                            loggedUser: loggedUser,
                            targetType: parentType,
                            targetId: parentId,
                            pointType: 'upvote'
                        });
                    }
                });
            },

            deleteVoteEntry: function () {

                let query = "DELETE FROM votes_binary " +
                    "WHERE parent_type = ? " +
                    "AND parent_id = ? " +
                    "AND voter_id = ? ";

                databaseQuery(query, [escape(parentType), parentId, loggedId], function (err) {
                    if (err) {
                        errorLogger(err, 'DTE_0138', query, req);
                        res.json({err: err});
                        return;
                    }

                    operations.sendResponseAndSocket();

                    if (parentType === 'post') {
                        notificationQueries.deleteNotificationForPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'media') {
                        notificationQueries.deleteNotificationForMedia({
                            loggedUser: loggedUser,
                            mediaId: parentId,
                            action: 'upvote'
                        });
                    }

                    if (parentType === 'forum') {
                        notificationQueries.deleteNotificationForForumPost({
                            loggedUser: loggedUser,
                            postId: parentId,
                            action: 'upvote'
                        });
                    }

                    xpQueries.removeXP({
                        loggedUser: loggedUser,
                        targetType: parentType,
                        targetId: parentId,
                        pointType: 'upvote'
                    });
                });
            },

            sendResponseAndSocket: function (passedJSON) {
                let insideDelimiter = '{||}{||}',
                    outsideDelimiter = '[||][||]';

                query = squel.select()
                    .from('votes_binary')
                    .field('IFNULL(SUM(votes_binary.vote), 0)', 'voteTotal')
                    .field(`concat(votes_binary.parent_type, '_', votes_binary.parent_id)`, 'id')

                    .left_join('users', 'upVoterUsers', 'upVoterUsers.id = votes_binary.voter_id AND votes_binary.vote = 1')
                    .left_join('users', 'downVoterUsers', 'downVoterUsers.id = votes_binary.voter_id AND votes_binary.vote = -1')

                    .field(`IFNULL(GROUP_CONCAT(CONCAT(upVoterUsers.id, '${insideDelimiter}' , upVoterUsers.alias, '${insideDelimiter}', upVoterUsers.string_url) SEPARATOR '${outsideDelimiter}'), '')`, 'upVoters')
                    .field(`IFNULL(GROUP_CONCAT(CONCAT(downVoterUsers.id, '${insideDelimiter}' , downVoterUsers.alias, '${insideDelimiter}', downVoterUsers.string_url) SEPARATOR '${outsideDelimiter}'), '')`, 'downVoters')

                    .where('votes_binary.parent_type = ?', parentType)
                    .where('votes_binary.parent_id = ?', parentId)
                    .toString();

                databaseQuery(query, [], function (error, records) {
                    if (error) {
                        errorLogger(error, 'DTE_0139', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    let voteData = records[0],
                        i,
                        loggedVote = 0;

                    if (voteData.upVoters !== '') {
                        voteData.upVoters = voteData.upVoters.split(outsideDelimiter);

                        for (i = 0; i < voteData.upVoters.length; i++) {
                            let arr = voteData.upVoters[i].split(insideDelimiter);
                            voteData.upVoters[i] = {
                                id: parseInt(arr[0], 10),
                                alias: arr[1],
                                stringUrl: arr[2]
                            }
                        }
                    } else {
                        voteData.upVoters = [];
                    }

                    if (voteData.downVoters !== '') {
                        voteData.downVoters = voteData.downVoters.split(outsideDelimiter);

                        for (i = 0; i < voteData.downVoters.length; i++) {
                            let arr = voteData.downVoters[i].split(insideDelimiter);
                            voteData.downVoters[i] = {
                                id: parseInt(arr[0], 10),
                                alias: arr[1],
                                stringUrl: arr[2]
                            }
                        }
                    } else {
                        voteData.downVoters = [];
                    }

                    if (loggedUser.isLoggedIn) {
                        let votedUp = _.filter(voteData.upVoters, function (upvote) {
                            return upvote.id === loggedUser.info.id
                        }).length > 0;

                        let votedDown = _.filter(voteData.downVoters, function (upvote) {
                            return upvote.id === loggedUser.info.id
                        }).length > 0;

                        if (votedUp) {
                            loggedVote = 1;
                        }

                        if (votedDown) {
                            loggedVote = -1;
                        }
                    }

                    voteData.loggedVote = loggedVote;

                    voteData.parentType = parentType;
                    voteData.parentId = parentId;

                    res.json(voteData);
                    socketHandler.getIoInstance().emit('voteWidgetUpdated', voteData);
                });

            }
        };

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }


        if (typeof parentType !== 'string') {
            res.json({errors: ['Invalid Parent Type']});
            return;
        }

        if (isNaN(parentId) || parentId === 0) {
            res.json({errors: ['Invalid Parent Id']});
            return;
        }

        if (['up', 'down'].indexOf(voteDirection) === -1) {
            res.json({errors: ['Invalid Vote Direction']});
            return;
        }

        query = "SELECT * FROM votes_binary vote " +
            "WHERE vote.parent_type = ? " +
            "AND vote.parent_id = ? " +
            "AND vote.voter_id = ? ";

        databaseQuery(query, [escape(parentType), parentId, loggedId], function (err, records) {
            let alreadyVoted = false,
                votedValue = 0;

            if (err) {
                errorLogger(err, 'DTE_0140', query, req);
                res.json({errors: [err]});
                return;
            }

            if (records.length > 0) {
                alreadyVoted = true;
                votedValue = records[0].vote;
            }

            if (alreadyVoted) {
                if (operations.isSameVote(votedValue)) {
                    operations.deleteVoteEntry();
                } else {
                    operations.changeVoteEntry();
                }
            } else {
                operations.addVoteEntry();
            }
        });


    });
});

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            parentType = req.query.parentType,
            parentId = parseInt(req.query.parentId, 10),
            insideDelimiter = '{||}{||}',
            outsideDelimiter = '[||][||]';

        if (typeof parentType !== 'string') {
            res.json({errors: ['Invalid Parent Type']});
            return;
        }

        if (isNaN(parentId) || parentId === 0) {
            res.json({errors: ['Invalid Parent Id']});
            return;
        }

        query = squel.select()
            .from('votes_binary')
            .field('IFNULL(SUM(votes_binary.vote), 0)', 'voteTotal')
            .field(`concat(votes_binary.parent_type, '_', votes_binary.parent_id)`, 'id')

            .left_join('users', 'upVoterUsers', 'upVoterUsers.id = votes_binary.voter_id AND votes_binary.vote = 1')
            .left_join('users', 'downVoterUsers', 'downVoterUsers.id = votes_binary.voter_id AND votes_binary.vote = -1')

            .field(`IFNULL(GROUP_CONCAT(CONCAT(upVoterUsers.id, '${insideDelimiter}' , upVoterUsers.alias, '${insideDelimiter}', upVoterUsers.string_url) SEPARATOR '${outsideDelimiter}'), '')`, 'upVoters')
            .field(`IFNULL(GROUP_CONCAT(CONCAT(downVoterUsers.id, '${insideDelimiter}' , downVoterUsers.alias, '${insideDelimiter}', downVoterUsers.string_url) SEPARATOR '${outsideDelimiter}'), '')`, 'downVoters')

            .where('votes_binary.parent_type = ?', parentType)
            .where('votes_binary.parent_id = ?', parentId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                res.json({errors: [error]});
                return;
            }

            let voteData = records[0],
                i,
                loggedVote = 0;

            if (voteData.upVoters !== '') {
                voteData.upVoters = voteData.upVoters.split(outsideDelimiter);

                for (i = 0; i < voteData.upVoters.length; i++) {
                    let arr = voteData.upVoters[i].split(insideDelimiter);
                    voteData.upVoters[i] = {
                        id: parseInt(arr[0], 10),
                        alias: arr[1],
                        stringUrl: arr[2]
                    }
                }
            } else {
                voteData.upVoters = [];
            }

            if (voteData.downVoters !== '') {
                voteData.downVoters = voteData.downVoters.split(outsideDelimiter);

                for (i = 0; i < voteData.downVoters.length; i++) {
                    let arr = voteData.downVoters[i].split(insideDelimiter);
                    voteData.downVoters[i] = {
                        id: parseInt(arr[0], 10),
                        alias: arr[1],
                        stringUrl: arr[2]
                    }
                }
            } else {
                voteData.downVoters = [];
            }

            if (loggedUser.isLoggedIn) {
                let votedUp = _.filter(voteData.upVoters, function (upvote) {
                    return upvote.id === loggedUser.info.id
                }).length > 0;

                let votedDown = _.filter(voteData.downVoters, function (upvote) {
                    return upvote.id === loggedUser.info.id
                }).length > 0;

                if (votedUp) {
                    loggedVote = 1;
                }

                if (votedDown) {
                    loggedVote = -1;
                }
            }

            voteData.loggedVote = loggedVote;

            res.json(voteData);

        });
    });
});

module.exports = router;