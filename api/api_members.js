let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let socketHandler = require('../modules/module_socketHandler');
let getXpLevelData = require('../modules/module_xpLevelData');
let _ = require('lodash');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    let parentId = parseInt(req.query.parentId, 10),
        query;

    if (isNaN(parentId) || parentId === 0) {
        res.json({errors: ['No valid parentId set']});
        return;
    }

    query = squel.select()
        .from('games_members')
        .field('games_members.mod_level', 'modLevel')
        .field('games_members.positions', 'positions')
        .field('games_members.status', 'status')
        .field('games_members.started', 'joinDate')
        .field('games_members.ended', 'endDate')

        .left_join('users', null, 'users.id = games_members.member_id')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')

        .where('games_members.game_id = ?', parentId)
        .toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0088', query, req);
            res.json({errors: [err]});
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
            record.positionsRaw = JSON.parse(record.positions);

            record.positions = {};

            _.each(record.positionsRaw, function (value, key) {
                record.positions[key] = {
                    positionType: key,
                    positionTitle: value
                };
            });

            delete record.positionsRaw;
        });

        res.json(records);
    });
});

router.post('/update', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            gameId = parseInt(req.body.gameId, 10),
            member = req.body.member,
            query;

        (isNaN(gameId) || gameId === 0) && errors.push('No Game Id Set');
        (!member || !member.id) && errors.push('No Member Id Set');
        (!loggedUser.isLoggedIn) && errors.push('Not Logged In');

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        query = squel.select()
            .from('games_members')
            .field('id', 'id')
            .where('game_id = ?', gameId)
            .where('member_id = ?', member.id)
            .where('status = \'Current\'')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0089', query, req);
                res.json({errors: [error]});
                return;
            }

            if (records.length === 0) {
                res.json({errors: ['Member is not on this game project']});
                return;
            }

            query = squel.select()
                .from('games_members')
                .field('id', 'id')
                .where('member_id = ?', loggedUser.info.id)
                .where('mod_level = \'owner\'')
                .where('game_id = ?', gameId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0090', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    res.json({errors: ['Logged User is Not Owner of this Project']});
                    return;
                }

                let positions = {},
                    modLevel = member.isModerator ? 'mod' : 'member';

                modLevel = member.id === loggedUser.info.id ? 'owner' : modLevel;

                _.each(member.positions, function (position) {
                    if (position.checked) {
                        positions[position.positionType] = position.positionTitle;
                    }
                });

                positions = JSON.stringify(positions);

                query = squel.update()
                    .table('games_members')
                    .set('mod_level', modLevel)
                    .set('positions', positions)

                    .where('game_id = ?', gameId)
                    .where('member_id = ?', member.id)
                    .toString();

                databaseQuery(query, [], function (error, updateResponse) {
                    if (error) {
                        errorLogger(error, 'DTE_0091', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    res.json({response: 'success'});

                    query = squel.select()
                        .from('games_members')
                        .field('games_members.mod_level', 'modLevel')
                        .field('games_members.positions', 'positions')
                        .field('games_members.status', 'status')
                        .field('games_members.started', 'joinDate')
                        .field('games_members.ended', 'endDate')

                        .left_join('users', null, 'users.id = games_members.member_id')
                        .field('users.id', 'id')
                        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
                        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
                        .field('users.has_avatar', 'hasAvatar')
                        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')

                        .where('games_members.game_id = ?', gameId)
                        .toString();

                    databaseQuery(query, [], function (err, records) {
                        if (err) {
                            errorLogger(err, 'DTE_0092', query, req);
                            res.json({errors: [err]});
                            return;
                        }

                        records.forEach(function (record) {
                            record.xpLevelData = getXpLevelData(record.xp);
                            record.positionsRaw = JSON.parse(record.positions);

                            record.positions = {};

                            _.each(record.positionsRaw, function (value, key) {
                                record.positions[key] = {
                                    positionType: key,
                                    positionTitle: value
                                };
                            });

                            delete record.positionsRaw;
                        });

                        socketHandler.getIoInstance().emit('gameMembersUpdated', {members: records, game: gameId});
                    });

                });
            });
        });
    });
});

router.post('/remove', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            gameId = parseInt(req.body.gameId, 10),
            member = req.body.member,
            query;

        (isNaN(gameId) || gameId === 0) && errors.push('No Game Id Set');
        (!member || !member.id) && errors.push('No Member Id Set');
        (!loggedUser.isLoggedIn) && errors.push('Not Logged In');

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        query = squel.select()
            .from('games_members')
            .field('id', 'id')
            .where('game_id = ?', gameId)
            .where('member_id = ?', member.id)
            .where('status = \'Current\'')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0093', query, req);
                res.json({errors: [error]});
                return;
            }

            if (records.length === 0) {
                res.json({errors: ['Member is not on this game project']});
                return;
            }

            query = squel.select()
                .from('games_members')
                .field('id', 'id')
                .where('member_id = ?', loggedUser.info.id)
                .where('mod_level = \'owner\'')
                .where('game_id = ?', gameId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0094', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    res.json({errors: ['Logged User is Not Owner of this Project and cannot kick other members']});
                    return;
                }

                query = squel.update()
                    .table('games_members')
                    .set('mod_level', 'member')
                    .set('status', 'Former')
                    .set('ended = NOW()')

                    .where('game_id = ?', gameId)
                    .where('member_id = ?', member.id)
                    .toString();

                databaseQuery(query, [], function (error, updateResponse) {
                    if (error) {
                        errorLogger(error, 'DTE_0095', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    res.json({response: 'success'});

                    query = squel.select()
                        .from('games_members')
                        .field('games_members.mod_level', 'modLevel')
                        .field('games_members.positions', 'positions')
                        .field('games_members.status', 'status')
                        .field('games_members.started', 'joinDate')
                        .field('games_members.ended', 'endDate')

                        .left_join('users', null, 'users.id = games_members.member_id')
                        .field('users.id', 'id')
                        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
                        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
                        .field('users.has_avatar', 'hasAvatar')
                        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')

                        .where('games_members.game_id = ?', gameId)
                        .toString();

                    databaseQuery(query, [], function (err, records) {
                        if (err) {
                            errorLogger(err, 'DTE_0095', query, req);
                            res.json({errors: [err]});
                            return;
                        }

                        records.forEach(function (record) {
                            record.xpLevelData = getXpLevelData(record.xp);
                            record.positionsRaw = JSON.parse(record.positions);

                            record.positions = {};

                            _.each(record.positionsRaw, function (value, key) {
                                record.positions[key] = {
                                    positionType: key,
                                    positionTitle: value
                                };
                            });

                            delete record.positionsRaw;
                        });

                        socketHandler.getIoInstance().emit('gameMembersUpdated', {members: records, game: gameId});
                    });

                });
            });
        });
    });
});

router.post('/leave', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            gameId = parseInt(req.body.gameId, 10),
            newOwnerId = parseInt(req.body.newOwnerId, 10),
            query;

        (isNaN(gameId) || gameId === 0) && errors.push('No Game Id Set');
        (!loggedUser.isLoggedIn) && errors.push('Not Logged In');

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        query = squel.select()
            .from('games_members')
            .field('id', 'id')
            .field('mod_level', 'modLevel')
            .where('game_id = ?', gameId)
            .where('member_id = ?', loggedUser.info.id)
            .where('status = \'Current\'')
            .toString();

        databaseQuery(query, [], function (error, memberDetails) {
            if (error) {
                errorLogger(error, 'DTE_0096', query, req);
                res.json({errors: [error]});
                return;
            }

            if (memberDetails.length === 0) {
                res.json({errors: ['Member is not on this game project']});
                return;
            }

            memberDetails = memberDetails[0];

            query = squel.update()
                .table('games_members')
                .set('mod_level', 'member')
                .set('status', 'Former')
                .set('ended = NOW()')

                .where('game_id = ?', gameId)
                .where('member_id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (error, updateResponse) {
                if (error) {
                    errorLogger(error, 'DTE_0097', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (memberDetails.modLevel === 'owner') {
                    query = squel.select()
                        .from('games_members')
                        .field('id', 'id')
                        .field('member_id', 'memberId')
                        .where('game_id = ?', gameId)
                        .where('status = \'Current\'')
                        .toString();

                    databaseQuery(query, [], function (error, otherMembers) {
                        if (error) {
                            errorLogger(error, 'DTE_0098', query, req);
                            return;
                        }

                        if (otherMembers.length === 0) {
                            deleteGameProject(res, gameId, loggedUser);
                            return;
                        }

                        query = squel.select()
                            .from('games_members')
                            .field('id', 'id')
                            .where('game_id = ?', gameId)
                            .where('member_id = ?', newOwnerId)
                            .where('status = \'Current\'')
                            .toString();

                        databaseQuery(query, [], function (error, newOwnerDetails) {
                            if (error || newOwnerDetails.length === 0) {
                                query = squel.update()
                                    .table('games_members')
                                    .set('mod_level', 'owner')
                                    .where('game_id = ?', gameId)
                                    .where('member_id = ?', otherMembers[0].memberId)
                                    .toString();
                            } else {
                                query = squel.update()
                                    .table('games_members')
                                    .set('mod_level', 'owner')
                                    .where('game_id = ?', gameId)
                                    .where('member_id = ?', newOwnerId)
                                    .toString();
                            }

                            databaseQuery(query, [], function () {
                                res.json({response: 'success'});
                                socketUpdatedMemberList(gameId);
                            });
                        })
                    });
                }

                if (memberDetails.modLevel !== 'owner') {
                    res.json({response: 'success'});
                    socketUpdatedMemberList(gameId);
                }
            });
        });
    });

});

function deleteGameProjectMembers(gameId, loggedUser) {
    let query = squel.delete()
        .from('games_members')
        .where('game_id=?', gameId)
        .toString();

    databaseQuery(query, [], function (error, deleteResponse) {
        if (error) {
            errorLogger(error, 'DTE_0099', query, null, loggedUser);
        }
    });
}

function deleteGameProjectMedia(gameId, loggedUser) {
    let query = squel.select()
        .from('media')
        .field('media.id', 'id')
        .where('media.parent_type = ?', 'game')
        .where('media.media_category = ?', 'album')
        .where('media.poster_id = ? ', gameId)
        .toString();

    databaseQuery(query, [], function (error, albums) {
        if (error) {
            errorLogger(error, 'DTE_0100', query, null, loggedUser);
            return;
        }

        let queries = require('./media/queries');

        albums.forEach(function (album) {
            queries.getPieces({
                albumId: album.id
            }, function (records) {
                if (!records.errors) {
                    records.forEach(function (record) {
                        queries.deletePiece({
                            id: record.id,
                            loggedUser: loggedUser
                        }, function (deletedMedia) {
                            if (!deletedMedia.errors) {
                                socketHandler.getIoInstance().emit('deletedMediaPiece', deletedMedia);
                            }
                        }, function (deletedPost) {
                            if (!deletedPost.errors) {
                                socketHandler.getIoInstance().emit('deletedPost', deletedPost);
                            }
                        });
                    });
                }
            });

            queries.deleteAlbum({
                loggedUser: loggedUser,
                albumId: album.id
            }, function (response) {
                if (response.errors) {
                    console.log("DELETE ALBUM ERROR");
                    console.log(response.errors);
                    return;
                }

                socketHandler.getIoInstance().emit('mediaAlbumDelete', {
                    id: album.id,
                    parentType: response.parentType,
                    posterId: response.posterId
                });
            });

        });
    });
}

function deleteGameProjectPosts(gameId, loggedUser) {
    let queries = require('./feedPosts/queries'),
        query;

    query = squel.select()
        .from('posts')
        .field('id', 'id')
        .where('subposter_id = ?', gameId)
        .where('subposter_type = ?', 'game')
        .where('type != ?', 'media')
        .toString();

    databaseQuery(query, [], function (error, posts) {
        if (error) {
            errorLogger(error, 'DTE_0101', query, null, loggedUser);
            return;
        }

        posts.forEach(function (post) {
            queries.deletePostOrComment({
                postId: post.id,
                loggedUser: loggedUser
            }, function (deletedPost) {
                if (deletedPost.errors) {
                    console.log("DELETE POST ERROR");
                    console.log(deletedPost.errors);
                    return;
                }

                socketHandler.getIoInstance().emit('deletedPost', deletedPost);
            })
        });
    })
}

function deleteGameProjectInvitations(gameId, loggedUser) {
    let query;

    query = squel.delete()
        .from('invitations_to_games')
        .where('game_id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (error, response) {
        if (error) {
            errorLogger(error, 'DTE_0102', query, null, loggedUser);
        }

        query = squel.delete()
            .from('invitations_from_members')
            .where('game_id = ?', gameId)
            .toString();

        databaseQuery(query, [], function (error, response) {
            if (error) {
                errorLogger(error, 'DTE_0103', query, null, loggedUser);
            }
        })
    });
}

function deleteGameProjectFollows(gameId) {
    let query = squel.delete()
        .from('follows')
        .where('leader_type = ?', 'game')
        .where('leader_id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (error, response) {
        if (error) {
            errorLogger(error, 'DTE_0104', query);
        }
    })
}

function deleteGamesProjectGenresAndPlatforms(gameId) {
    let query;

    query = squel.delete()
        .from('games_genres')
        .where('game_id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (error, response) {
        if (error) {
            errorLogger(error, 'DTE_0105', query);
        }
    });

    query = squel.delete()
        .from('games_platforms')
        .where('game_id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (error, response) {
        if (error) {
            errorLogger(error, 'DTE_0106', query);
        }
    });
}

function deleteGameProjectEntry(gameId) {
    let query = squel.delete()
        .from('games')
        .where('id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (error, response) {
        if (error) {
            errorLogger(error, 'DTE_0107', query);
        }

        socketHandler.getIoInstance().emit('gameProjectDeleted', {gameId: gameId});
    });
}

function deleteGameProject(res, gameId, loggedUser) {
    deleteGameProjectMembers(gameId, loggedUser);
    deleteGameProjectMedia(gameId, loggedUser);
    deleteGameProjectPosts(gameId, loggedUser);
    deleteGameProjectInvitations(gameId, loggedUser);
    deleteGamesProjectGenresAndPlatforms(gameId);
    deleteGameProjectFollows(gameId);
    deleteGameProjectEntry(gameId);
    res.json({delete: 'true', gameId});
}


function socketUpdatedMemberList(gameId) {
    let query;

    query = squel.select()
        .from('games_members')
        .field('games_members.mod_level', 'modLevel')
        .field('games_members.positions', 'positions')
        .field('games_members.status', 'status')
        .field('games_members.started', 'joinDate')
        .field('games_members.ended', 'endDate')

        .left_join('users', null, 'users.id = games_members.member_id')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')

        .where('games_members.game_id = ?', gameId)
        .toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(error, 'DTE_0108', query);
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
            record.positionsRaw = JSON.parse(record.positions);

            record.positions = {};

            _.each(record.positionsRaw, function (value, key) {
                record.positions[key] = {
                    positionType: key,
                    positionTitle: value
                };
            });

            delete record.positionsRaw;
        });

        socketHandler.getIoInstance().emit('gameMembersUpdated', {members: records, game: gameId});
    });
}

module.exports = router;
