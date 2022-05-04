let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let _ = require('lodash');
let socketHandler = require('../modules/module_socketHandler');
let errorLogger = require('../modules/module_errorLogger');
let escape = require('js-string-escape');

router.post('/togame', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            errors = [],
            invitedMember = parseInt(req.body.invitedMember, 10),
            selectedGame = parseInt(req.body.selectedGame, 10),
            selectedPositions = req.body.selectedPositions,
            positionTitles = req.body.positionTitles;

        if (!loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(invitedMember) || invitedMember === 0) {
            errors.push('Invalid Invited Member');
        }

        if (isNaN(selectedGame) || selectedGame === 0) {
            errors.push('Invalid Selected Game');
        }

        if (!Array.isArray(selectedPositions)) {
            errors.push('Invalid Selected Positions');
        } else {
            let invalidPositionFound = false;

            selectedPositions.forEach(function (position) {
                if (['Designer', 'Artist', 'Programmer', 'Musician', 'SFX Artist', 'Writer', 'Producer', 'Tester'].indexOf(position) === -1) {
                    invalidPositionFound = true;
                }
            });

            if (selectedPositions.length === 0 || invalidPositionFound) {
                errors.push('Invalid Selected Positions');
            }
        }

        if (typeof positionTitles !== 'string' || positionTitles.trim() === '') {
            errors.push('Invalid Position Titles Value');
        }

        if (errors.length > 0) {
            res.json({errors});
            return;
        }

        query = squel.select()
            .from('games_members')
            .field('mod_level', 'modLevel')
            .where('mod_level = ?', 'owner')
            .where('game_id = ?', selectedGame)
            .where('member_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0063', query, req);
                res.json({errors: [error]});
                return;
            }

            if (records.length === 0) {
                res.json({errors: ['Not Validated to Invite to this Project']});
                return;
            }

            query = squel.select()
                .from('games_members')
                .field('member_id', 'memberId')
                .where('game_id = ?', selectedGame)
                .where('member_id = ?', invitedMember)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0064', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (records.length > 0) {
                    res.json({errors: ['Invited Member is already on the Game Project']});
                    return;
                }

                query = squel.select()
                    .from('invitations_to_games')
                    .field('game_id', 'gameId')
                    .where('game_id = ?', selectedGame)
                    .where('member_id = ?', invitedMember)
                    .toString();

                databaseQuery(query, [], function (error, records) {
                    if (error) {
                        errorLogger(error, 'DTE_0065', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    if (records.length > 0) {
                        res.json({errors: ['Invitation Sent to this User to this Game Project has already been sent']});
                        return;
                    }

                    query = squel.insert()
                        .into('invitations_to_games')
                        .set('game_id', selectedGame)
                        .set('member_id', invitedMember)
                        .set('position_titles', positionTitles)
                        .set('positions', JSON.stringify(selectedPositions))
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0066', query, req);
                            res.json({errors: [error]});
                            return;
                        }

                        socketHandler.getIoInstance().emit('invitesUpdated');

                        query = squel.select()
                            .from('users')
                            .field('alias', 'alias')
                            .field('email', 'email')
                            .where('id = ?', invitedMember)
                            .toString();

                        databaseQuery(query, [], function (error, memberData) {
                            if (error) {
                                errorLogger(error, 'DTE_0067', query, req);
                                console.log(error);
                                return;
                            }

                            let emailer = require('../modules/module_emailer');
                            emailer.sendEmail(memberData[0].alias, memberData[0].email, 'newInvitation', 'You have been Invited to Join a Game Project!', '', '');
                        });

                        res.json({response: 'success'});
                    });
                });
            });

        })
    });
});

router.post('/frommember', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            errors = [],
            requestedGame = parseInt(req.body.requestedGame, 10),
            selectedPositions = req.body.selectedPositions,
            positionTitles = req.body.positionTitles;

        if (!loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(requestedGame) || requestedGame === 0) {
            errors.push('Invalid Game Project');
        }

        if (!Array.isArray(selectedPositions)) {
            errors.push('Invalid Selected Positions');
        } else {
            let invalidPositionFound = false;

            selectedPositions.forEach(function (position) {
                if (['Designer', 'Artist', 'Programmer', 'Musician', 'SFX Artist', 'Writer', 'Producer', 'Tester'].indexOf(position) === -1) {
                    invalidPositionFound = true;
                }
            });

            if (selectedPositions.length === 0 || invalidPositionFound) {
                errors.push('Invalid Selected Positions');
            }
        }

        if (typeof positionTitles !== 'string' || positionTitles.trim() === '') {
            errors.push('Invalid Position Titles Value');
        }

        if (errors.length > 0) {
            res.json({errors});
            return;
        }

        query = squel.select()
            .from('games_members')
            .field('member_id', 'memberId')
            .where('game_id = ?', requestedGame)
            .where('member_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0068', query, req);
                res.json({errors: [error]});
                return;
            }

            if (records.length > 0) {
                res.json({errors: ['You are alredy on this Game Project']});
                return;
            }

            query = squel.select()
                .from('invitations_from_members')
                .field('game_id', 'gameId')
                .where('game_id = ?', requestedGame)
                .where('member_id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0069', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (records.length > 0) {
                    res.json({errors: ['Request to Join this Game Project already sent']});
                    return;
                }

                query = squel.insert()
                    .into('invitations_from_members')
                    .set('game_id', requestedGame)
                    .set('member_id', loggedUser.info.id)
                    .set('position_titles', escape(positionTitles))
                    .set('positions', JSON.stringify(selectedPositions))
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0070', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('invitesUpdated');

                    query = squel.select()
                        .from('games_members')

                        .left_join('users', null, 'users.id = games_members.member_id')
                        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
                        .field('users.email', 'email')

                        .where('games_members.game_id = ?', requestedGame)
                        .where('games_members.mod_level = ?', 'owner')
                        .toString();

                    databaseQuery(query, [], function (error, memberData) {
                        if (error) {
                            errorLogger(error, 'DTE_0071', query, req);
                            console.log(error);
                            return;
                        }

                        let emailer = require('../modules/module_emailer');
                        emailer.sendEmail(memberData[0].alias, memberData[0].email, 'newRequest', 'Someone wants to join your Game Project!', '', '');
                    });

                    res.json({response: 'success'});
                });
            });
        });
    });
});

router.get('', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            invitationsToGames,
            requestsToJoin,
            sentRequestsToJoin,
            sentInvitationsToGames;

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['You must be logged in']});
            return;
        }

        query = squel.select()
            .from('invitations_to_games')
            .field('invitations_to_games.id', 'id')
            .field('invitations_to_games.game_id', 'gameId')
            .field('invitations_to_games.member_id', 'memberId')
            .field('invitations_to_games.position_titles', 'positionTitles')
            .field('invitations_to_games.positions', 'positions')

            .left_join('games', null, 'games.id = invitations_to_games.game_id')
            .field('games.id', 'gameId')
            .field('games.alias', 'gameAlias')
            .field('games.string_url', 'gameStringUrl')
            .field('games.has_avatar', 'gameHasAvatar')

            .left_join('games_members', null, 'games_members.game_id = games.id AND games_members.mod_level = "owner"')
            .left_join('users', null, 'users.id = games_members.member_id')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'gameOwnerId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'gameOwnerAlias')
            .field('users.string_url', 'gameOwnerStringUrl')

            .where('invitations_to_games.member_id =?', loggedUser.info.id)
            .where('response = ?', 'noResponse')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0072', query, req);
                res.json({errors: [error]});
                return;
            }

            records.forEach(function (record) {
                record.positions = JSON.parse(record.positions);
                record.gameDetails = {
                    id: record.gameId,
                    alias: record.gameAlias,
                    stringUrl: record.gameStringUrl,
                    hasAvatar: record.gameHasAvatar,
                    ownerDetails: {
                        id: record.gameOwnerId,
                        alias: record.gameOwnerAlias,
                        stringUrl: record.gameOwnerStringUrl
                    }
                };

                delete record.gameId;
                delete record.gameAlias;
                delete record.gameStringUrl;
                delete record.gameHasAvatar;
                delete record.gameOwnerId;
                delete record.gameOwnerAlias;
                delete record.gameOwnerStringUrl;
            });

            invitationsToGames = records;

            let ownerOfGames = _.filter(loggedUser.games, function (game) {
                return game.moderatorLevel === 'owner'
            });

            let ownerOfGamesId = _.map(ownerOfGames, 'id');

            if (ownerOfGamesId.length === 0) {
                ownerOfGamesId = [0];
            }

            query = squel.select()
                .from('invitations_from_members')
                .field('invitations_from_members.id', 'id')
                .field('invitations_from_members.game_id', 'gameId')
                .field('invitations_from_members.member_id', 'memberId')
                .field('invitations_from_members.position_titles', 'positionTitles')
                .field('invitations_from_members.positions', 'positions')

                .left_join('users', null, 'users.id = invitations_from_members.member_id')
                .field('users.id', 'devId')
                .field(`IFNULL(users.alias, 'DELETED USER')`, 'devAlias')
                .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'devStringUrl')
                .field('users.has_avatar', 'devHasAvatar')

                .left_join('games', null, 'games.id = invitations_from_members.game_id')
                .field('games.id', 'gameId')
                .field('games.alias', 'gameAlias')
                .field('games.string_url', 'gameStringUrl')
                .field('games.has_avatar', 'gameHasAvatar');

            if (ownerOfGamesId.length > 0) {
                query.where('invitations_from_members.game_id in (' + ownerOfGamesId.join(',') + ')')
            }

            query.where('invitations_from_members.response = ?', 'noResponse');
            query = query.toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0073', query, req);
                    res.json({errors: [error]});
                    return;
                }

                records.forEach(function (record) {
                    record.positions = JSON.parse(record.positions);

                    record.gameDetails = {
                        id: record.gameId,
                        alias: record.gameAlias,
                        stringUrl: record.gameStringUrl,
                        hasAvatar: record.gameHasAvatar
                    };

                    record.devDetails = {
                        id: record.devId,
                        alias: record.devAlias,
                        stringUrl: record.devStringUrl,
                        hasAvatar: record.devHasAvatar,
                        ownerDetails: {
                            id: record.devOwnerId,
                            alias: record.devOwnerAlias,
                            stringUrl: record.devOwnerStringUrl
                        }
                    };

                    delete record.gameId;
                    delete record.gameAlias;
                    delete record.gameStringUrl;
                    delete record.gameHasAvatar;
                    delete record.devId;
                    delete record.devAlias;
                    delete record.devStringUrl;
                    delete record.devHasAvatar;
                    delete record.devOwnerId;
                    delete record.devOwnerAlias;
                    delete record.devOwnerStringUrl;
                });

                requestsToJoin = records;

                query = squel.select()
                    .from('invitations_from_members')
                    .field('invitations_from_members.id', 'id')
                    .field('invitations_from_members.game_id', 'gameId')
                    .field('invitations_from_members.member_id', 'memberId')
                    .field('invitations_from_members.position_titles', 'positionTitles')
                    .field('invitations_from_members.positions', 'positions')
                    .field('invitations_from_members.response', 'response')

                    .left_join('games', null, 'games.id = invitations_from_members.game_id')
                    .field('games.id', 'gameId')
                    .field('games.alias', 'gameAlias')
                    .field('games.string_url', 'gameStringUrl')
                    .field('games.has_avatar', 'gameHasAvatar')

                    .left_join('games_members', null, 'games_members.game_id = games.id AND games_members.mod_level = \'owner\'')
                    .left_join('users', null, 'users.id = games_members.member_id')
                    .field('users.id', 'devId')
                    .field(`IFNULL(users.alias, 'DELETED USER')`, 'devAlias')
                    .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'devStringUrl')
                    .field('users.has_avatar', 'devHasAvatar')

                    .where('invitations_from_members.member_id = ?', loggedUser.info.id)
                    .toString();

                databaseQuery(query, [], function (error, records) {
                    if (error) {
                        errorLogger(error, 'DTE_0074', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    records.forEach(function (record) {
                        record.positions = JSON.parse(record.positions);

                        record.gameDetails = {
                            id: record.gameId,
                            alias: record.gameAlias,
                            stringUrl: record.gameStringUrl,
                            hasAvatar: record.gameHasAvatar
                        };

                        record.devDetails = {
                            id: record.devId,
                            alias: record.devAlias,
                            stringUrl: record.devStringUrl,
                            hasAvatar: record.devHasAvatar,
                            ownerDetails: {
                                id: record.devOwnerId,
                                alias: record.devOwnerAlias,
                                stringUrl: record.devOwnerStringUrl
                            }
                        };

                        delete record.gameId;
                        delete record.gameAlias;
                        delete record.gameStringUrl;
                        delete record.gameHasAvatar;
                        delete record.devId;
                        delete record.devAlias;
                        delete record.devStringUrl;
                        delete record.devHasAvatar;
                        delete record.devOwnerId;
                        delete record.devOwnerAlias;
                        delete record.devOwnerStringUrl;
                    });

                    sentRequestsToJoin = records;

                    query = squel.select()
                        .from('invitations_to_games')
                        .field('invitations_to_games.id', 'id')
                        .field('invitations_to_games.game_id', 'gameId')
                        .field('invitations_to_games.member_id', 'memberId')
                        .field('invitations_to_games.position_titles', 'positionTitles')
                        .field('invitations_to_games.positions', 'positions')
                        .field('invitations_to_games.response', 'response')

                        .left_join('users', null, 'users.id = invitations_to_games.member_id')
                        .field('users.id', 'devId')
                        .field(`IFNULL(users.alias, 'DELETED USER')`, 'devAlias')
                        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'devStringUrl')
                        .field('users.has_avatar', 'devHasAvatar')

                        .left_join('games', null, 'games.id = invitations_to_games.game_id')
                        .field('games.id', 'gameId')
                        .field('games.alias', 'gameAlias')
                        .field('games.string_url', 'gameStringUrl')
                        .field('games.has_avatar', 'gameHasAvatar');

                    if (ownerOfGamesId.length > 0) {
                        query.where('invitations_to_games.game_id in (' + ownerOfGamesId.join(',') + ')')
                    }

                    query = query.toString();

                    databaseQuery(query, [], function (error, records) {
                        if (error) {
                            errorLogger(error, 'DTE_0075', query, req);
                            res.json({errors: [error]});
                            return;
                        }

                        records.forEach(function (record) {
                            record.positions = JSON.parse(record.positions);

                            record.gameDetails = {
                                id: record.gameId,
                                alias: record.gameAlias,
                                stringUrl: record.gameStringUrl,
                                hasAvatar: record.gameHasAvatar
                            };

                            record.devDetails = {
                                id: record.devId,
                                alias: record.devAlias,
                                stringUrl: record.devStringUrl,
                                hasAvatar: record.devHasAvatar,
                                ownerDetails: {
                                    id: record.devOwnerId,
                                    alias: record.devOwnerAlias,
                                    stringUrl: record.devOwnerStringUrl
                                }
                            };

                            delete record.gameId;
                            delete record.gameAlias;
                            delete record.gameStringUrl;
                            delete record.gameHasAvatar;
                            delete record.devId;
                            delete record.devAlias;
                            delete record.devStringUrl;
                            delete record.devHasAvatar;
                            delete record.devOwnerId;
                            delete record.devOwnerAlias;
                            delete record.devOwnerStringUrl;
                        });

                        sentInvitationsToGames = records;

                        res.json({
                            invitationsToGames: invitationsToGames,
                            requestsToJoin: requestsToJoin,
                            sentRequestsToJoin: sentRequestsToJoin,
                            sentInvitationsToGames: sentInvitationsToGames
                        });
                    })
                })
            })
        })
    });
});

router.post('/respondToGameInvite', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            inviteId = parseInt(req.body.inviteId, 10),
            inviteResponse = req.body.inviteResponse;

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        if (['accept', 'decline'].indexOf(inviteResponse) === -1) {
            res.json({errors: ['Invalid Invite Response']});
            return;
        }

        if (isNaN(inviteId) || inviteId === 0) {
            res.json({errors: ['Invalid Invite Id']});
            return;
        }

        query = squel.select()
            .from('invitations_to_games')
            .field('id')
            .field('game_id', 'gameId')
            .where('id = ?', inviteId)
            .where('member_id=?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, invitationDetails) {
            if (error) {
                errorLogger(error, 'DTE_0076', query, req);
                res.json({errors: [error]});
                return;
            }

            if (invitationDetails.length === 0) {
                res.json({errors: ['Not your Invitation']});
                return;
            }

            invitationDetails = invitationDetails[0];

            query = squel.update()
                .table('invitations_to_games')
                .set('response', inviteResponse)
                .where('id = ?', inviteId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0077', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (inviteResponse === 'accept') {
                    query = squel.insert()
                        .into('games_members')
                        .set('member_id', loggedUser.info.id)
                        .set('game_id', invitationDetails.gameId)
                        .set('mod_level', 'member')
                        .set('positions', '{}')
                        .set('status', 'Current')
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0078', query, req);
                        }
                    });
                }

                socketHandler.getIoInstance().emit('invitesUpdated');

                res.json({response: 'success', inviteResponse})
            })

        });
    });
});

router.post('/respondToRequestToJoin', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            inviteId = parseInt(req.body.inviteId, 10),
            inviteResponse = req.body.inviteResponse;

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        if (['accept', 'decline'].indexOf(inviteResponse) === -1) {
            res.json({errors: ['Invalid Invite Response']});
            return;
        }

        if (isNaN(inviteId) || inviteId === 0) {
            res.json({errors: ['Invalid Invite Id']});
            return;
        }

        let ownerOfGames = _.filter(loggedUser.games, function (game) {
            return game.moderatorLevel === 'owner'
        });

        let ownerOfGamesId = _.map(ownerOfGames, 'id');

        query = squel.select()
            .from('invitations_from_members')
            .field('id', 'id')
            .field('member_id', 'memberId')
            .field('game_id', 'gameId')
            .where('id = ?', inviteId);

        if (ownerOfGamesId.length > 0) {
            query.where('game_id in (' + ownerOfGamesId + ')')
        }

        query = query.toString();

        databaseQuery(query, [], function (error, invitationDetails) {
            if (error) {
                errorLogger(error, 'DTE_0079', query, req);
                res.json({errors: [error]});
                return;
            }

            if (invitationDetails.length === 0) {
                res.json({errors: ['Not your Invitation']});
                return;
            }

            invitationDetails = invitationDetails[0];

            query = squel.update()
                .table('invitations_from_members')
                .set('response', inviteResponse)
                .where('id = ?', inviteId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0080', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (inviteResponse === 'accept') {
                    query = squel.insert()
                        .into('games_members')
                        .set('member_id', invitationDetails.memberId)
                        .set('game_id', invitationDetails.gameId)
                        .set('mod_level', 'member')
                        .set('positions', '{}')
                        .set('status', 'Current')
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0081', query, req);
                        }
                    });
                }

                socketHandler.getIoInstance().emit('invitesUpdated');
                res.json({response: 'success', inviteResponse})
            })

        });
    });
});

router.post('/deleteInvitation', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            inviteId = parseInt(req.body.inviteId, 10),
            ownerOfGames,
            ownerOfGamesId;

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        if (isNaN(inviteId) || inviteId <= 0) {
            res.json({errors: ['Invalid Invite Id']});
            return;
        }

        ownerOfGames = _.filter(loggedUser.games, function (game) {
            return game.moderatorLevel === 'owner'
        });

        ownerOfGamesId = _.map(ownerOfGames, 'id');

        query = squel.select()
            .from('invitations_to_games')
            .field('id', 'id')
            .field('game_id', 'gameId')
            .field('member_id', 'memberId')
            .field('position_titles', 'positionTitles')
            .field('positions', 'positions')
            .field('response', 'response')
            .where('id = ?', inviteId);

        if (ownerOfGamesId.length > 0) {
            query.where('game_id in (' + ownerOfGamesId.join(',') + ')')
        }

        query = query.toString();

        databaseQuery(query, [], function (error, invite) {
            if (error) {
                errorLogger(error, 'DTE_0082', query, req);
                res.json({errors: [error]});
                return;
            }

            if (invite.length === 0) {
                res.json({errors: ['Invite not Found']});
                return;
            }

            query = squel.delete()
                .from('invitations_to_games')
                .where('id = ?', inviteId)
                .toString();

            databaseQuery(query, [], function (error, invite) {
                if (error) {
                    errorLogger(error, 'DTE_0083', query, req);
                    res.json({errors: [error]});
                    return;
                }

                socketHandler.getIoInstance().emit('invitesUpdated');

                res.json({response: 'success'});
            });
        });
    });
});

router.post('/deleteRequest', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            requestId = parseInt(req.body.requestId, 10);

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        if (isNaN(requestId) || requestId <= 0) {
            res.json({errors: ['Invalid Request Id']});
            return;
        }
        query = squel.select()
            .from('invitations_from_members')
            .field('id', 'id')
            .field('game_id', 'gameId')
            .field('member_id', 'memberId')
            .field('position_titles', 'positionTitles')
            .field('positions', 'positions')
            .field('response', 'response')
            .where('id = ?', requestId)
            .where('member_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, request) {
            if (error) {
                errorLogger(error, 'DTE_0084', query, req);
                res.json({errors: [error]});
                return;
            }

            if (request.length === 0) {
                res.json({errors: ['Invite not Found']});
                return;
            }

            query = squel.delete()
                .from('invitations_from_members')
                .where('id = ?', requestId)
                .toString();

            databaseQuery(query, [], function (error, request) {
                if (error) {
                    errorLogger(error, 'DTE_0085', query, req);
                    res.json({errors: [error]});
                    return;
                }

                socketHandler.getIoInstance().emit('invitesUpdated');
                res.json({response: 'success'});
            });
        });
    });
});

module.exports = router;