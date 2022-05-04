let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require('squel');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let socketHandler = require('../modules/module_socketHandler');
let _ = require('underscore');
let getXpLevelData = require('../modules/module_xpLevelData');
let escape = require('js-string-escape');
let stringUrlMaker = require('../modules/module_stringUrlMaker');
let stringUrlFinder = require('../modules/module_stringUrlFinder');
let multer = require('multer');
let jimp = require('jimp');
let errorLogger = require('../modules/module_errorLogger');
let graphicsMagick = require('gm');
let fs = require('fs')

router.get('/', function (req, res) {
    let query,
        gameId = req.query.id ? escape(req.query.id) : undefined,
        gameStringUrl = escape(req.query.stringUrl);

    query = squel.select({separator: "\n"})
        .from('games')
        .field('games.id', 'id')
        .field('games.alias', 'alias')
        .field('games.string_url', 'stringUrl')
        .field('games.has_avatar', 'hasAvatar')
        .field('release_date', 'releaseDate')
        .field('rating', 'rating')
        .field('seeking_roles', 'seekingRoles')
        .field('seeking_designers', 'seekingDesigners')
        .field('seeking_programmers', 'seekingProgrammers')
        .field('seeking_artists', 'seekingArtists')
        .field('seeking_writers', 'seekingWriters')
        .field('seeking_musicians', 'seekingMusicians')
        .field('seeking_sfx_artists', 'seekingSfxArtists')
        .field('seeking_testers', 'seekingTesters')
        .field('seeking_producers', 'seekingProducers')
        .field('seeking_desc', 'seekingDescription')
        .field('created', 'created')

        .left_join('games_genres', null, 'games_genres.game_id = games.id')
        .left_join('game_genres_list', null, 'game_genres_list.id = games_genres.genre_id')
        .field('GROUP_CONCAT(distinct game_genres_list.genre SEPARATOR ", ")', 'genres')

        .left_join('games_platforms', null, 'games_platforms.game_id = games.id')
        .left_join('game_platforms_list', null, 'game_platforms_list.id = games_platforms.platform_id')
        .field('GROUP_CONCAT(distinct game_platforms_list.platform SEPARATOR ", ")', 'platforms')

        .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from game_skills WHERE game_id=games.id group by game_id), \'\')', 'skills')
        .field("(SELECT IFNULL(SUM(gameXp.points),0) FROM community_points gameXp WHERE receiver_id=games.id AND receiver_type='game')", 'xp')
        .group('games.id');

    if (gameId) {
        query.where('games.id = ?', gameId)
    } else if (gameStringUrl) {
        query.where('games.string_url = ?', gameStringUrl)
    } else {
        res.json({error: 'No Valid Game with Search Parameters Given'});
        return;
    }

    query = query.toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0027: Error Retrieving Game Data', query, req);
            res.json({error: err});
            return;
        }

        if (records.length === 0) {
            res.json({error: 'No Valid games with Given Search Parameters'});
            return;
        }

        records.forEach(function (record) {
            record.xpLevelData = getXpLevelData(record.xp);
        });

        if (records[0].skills) {
            records[0].skills = records[0].skills.split(',');
            for (let i = 0; i < records[0].skills.length; i++) {
                records[0].skills[i] = parseInt(records[0].skills[i], 10);
            }
        } else {
            records[0].skills = [];
        }

        res.json(records[0]);
    });
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let errors = [],
            alias = req.body.alias,
            rating = req.body.rating,
            platforms = req.body.platforms,
            genres = req.body.genres,
            stringUrl;

        if (typeof alias !== 'string' || alias.trim() === '') {
            errors.push('Invalid Title');
        }

        if (['everyone', 'teen', 'mature', 'adult'].indexOf(rating) === -1) {
            errors.push('Invalid Rating');
        }

        if (!Array.isArray(platforms)) {
            errors.push('Invalid Platforms');
        }

        if (!Array.isArray(genres)) {
            errors.push('Invalid Genres');
        }

        if (errors.length > 0) {
            res.json({errors});
            return;
        }

        stringUrl = stringUrlMaker(alias);

        query = squel.select()
            .from('games')
            .field('string_url', 'stringUrl')
            .where('string_url LIKE \'' + stringUrl + '%\'')
            .toString();

        databaseQuery(query, [], function (error, matchingRecords) {

            stringUrl = stringUrlFinder(stringUrl, matchingRecords);

            query = squel.insert()
                .into('games')
                .set('alias', escape(alias))
                .set('string_url', stringUrl)
                .set('rating', rating)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0028: Error Retrieving Game Data', query, req);
                    res.json({errors: [error]});
                    return;
                }

                let platformInserts = [];

                platforms.forEach(function (platform) {
                    platform = parseInt(platform, 10);
                    if (!isNaN(platform) && platform > 0) {
                        platformInserts.push({game_id: response.insertId, platform_id: platform});
                    }
                });

                if (platformInserts.length === 0) {
                    platformInserts.push({game_id: response.insertId, platform_id: 1});
                }

                query = squel.insert()
                    .into('games_platforms')
                    .setFieldsRows(platformInserts)
                    .toString();

                databaseQuery(query, [], function (error, platformsAdded) {
                    if (error) {
                        errorLogger(error, 'DTE_0029: Error Entering Platforms', query, req);
                    }

                    let genreInserts = [];

                    genres.forEach(function (genre) {
                        genre = parseInt(genre, 10);
                        if (!isNaN(genre) && genre > 0) {
                            genreInserts.push({game_id: response.insertId, genre_id: genre});
                        }
                    });

                    if (genreInserts.length === 0) {
                        genreInserts.push({game_id: response.insertId, genre_id: 1});
                    }


                    query = squel.insert()
                        .into('games_genres')
                        .setFieldsRows(genreInserts)
                        .toString();

                    databaseQuery(query, [], function (error, genresAdded) {
                        if (error) {
                            errorLogger(error, 'DTE_0030: Error Entering Genres', query, req);
                        }

                        query = squel.insert()
                            .into('games_members')
                            .set('game_id', response.insertId)
                            .set('member_id', loggedUser.info.id)
                            .set('mod_level', 'owner')
                            .set('positions', '{}')
                            .set('status', 'Current')
                            .set('contract', 0)
                            .toString();

                        databaseQuery(query, [], function (error, membersAdded) {
                            if (error) {
                                errorLogger(error, 'DTE_0031: Error Adding Game Members', query, req);
                            }

                            query = squel.insert()
                                .into("chatroom_messages")
                                .set('message', '')
                                .set('chatRoomId', 'siteGeneral')
                                .set('posterId', 0)
                                .set('is_system_message', 1)
                                .set('system_message_type', 'createdGame')
                                .set('system_message_target_id', response.insertId)
                                .toString();

                            databaseQuery(query, [], function (err, response) {
                                if (err) {
                                    errorLogger(err, 'DTE_0011b: Error Sending Game Create Chatroom Message', query, req);
                                    res.json({error: err});
                                    return;
                                }

                                socketHandler.getIoInstance().to('chatroom_' + 'siteGeneral').emit('chatroomRefreshed');

                                res.json({response: 'success', stringUrl})
                            });

                            socketHandler.getIoInstance().emit('newDeveloperOrGameRegistered');

                        })
                    });
                });
            });
        });
    });

});

router.post('/update', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            gameId = parseInt(req.body.gameId),
            platforms = req.body.platforms,
            genres = req.body.genres,
            releaseDate = req.body.releaseDate || '',
            rating = req.body.rating,
            query;

        (isNaN(gameId) || gameId === 0) && errors.push('No Game Id Set');
        (!Array.isArray(platforms) || platforms.length === 0) && errors.push('No Platforms Set');
        (!Array.isArray(genres) || genres.length === 0) && errors.push('No Genres Set');
        (!loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (typeof releaseDate !== 'string') && errors.push('Invalid Release Date Set');

        if (typeof rating === 'string') {
            rating = rating.toLowerCase();
        }

        if (['everyone', 'teen', 'mature', 'adult'].indexOf(rating) === -1) {
            rating = 'everyone'
        }

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        releaseDate = escape(releaseDate);

        query = squel.select()
            .from('games_members')
            .field('id', 'id')
            .where('member_id = ?', loggedUser.info.id)
            .where('mod_level = \'owner\' OR mod_level = \'mod\'')
            .where('game_id = ?', gameId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0032: Error Retrieving Game Members', query, req);
                res.json({errors: errors});
                return;
            }

            if (records.length === 0) {
                res.json({errors: ['Not a Moderator of this Project']});
                return;
            }

            query = squel.update()
                .table('games')
                .set('release_date', releaseDate)
                .set('rating', rating)
                .where('id = ?', gameId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0033: Error Updating Game Data', query, req);
                    res.json({errors: [error, 'DTE_0033: Error Updating Game Data']});
                    return;
                }

                query = squel.delete()
                    .from('games_genres')
                    .where('game_id = ?', gameId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0034: Error Deleting Existing Genres', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    query = squel.delete()
                        .from('games_platforms')
                        .where('game_id = ?', gameId)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0035: Error Deleting Existing Platforms', query, req);
                            res.json({errors: [error]});
                            return;
                        }

                        let idList = [];

                        platforms.forEach(function (platformId) {
                            idList.push({game_id: gameId, platform_id: platformId});
                        });

                        query = squel.insert()
                            .into('games_platforms')
                            .setFieldsRows(idList)
                            .toString();

                        databaseQuery(query, [], function (error, response) {
                            if (error) {
                                errorLogger(error, 'DTE_0036: Error Adding New Platoforms', query, req);
                                res.json({errors: [error]});
                                return;
                            }

                            let idList = [];

                            genres.forEach(function (genreId) {
                                idList.push({game_id: gameId, genre_id: genreId});
                            });

                            query = squel.insert()
                                .into('games_genres')
                                .setFieldsRows(idList)
                                .toString();

                            databaseQuery(query, [], function (error, response) {
                                if (error) {
                                    errorLogger(error, 'DTE_0037: Error Adding New Genres', query, req);
                                    res.json({errors: [error]});
                                    return;
                                }

                                query = squel.select()
                                    .from('games')
                                    .field('games.id', 'id')
                                    .field('games.alias', 'alias')
                                    .field('games.string_url', 'stringUrl')
                                    .left_join('games_genres', null, 'games_genres.game_id = games.id')
                                    .left_join('game_genres_list', null, 'game_genres_list.id = games_genres.genre_id')
                                    .field('GROUP_CONCAT(distinct game_genres_list.genre SEPARATOR ", ")', 'genres')

                                    .left_join('games_platforms', null, 'games_platforms.game_id = games.id')
                                    .left_join('game_platforms_list', null, 'game_platforms_list.id = games_platforms.platform_id')
                                    .field('GROUP_CONCAT(distinct game_platforms_list.platform SEPARATOR ", ")', 'platforms')
                                    .where('games.id = ?', gameId)
                                    .toString();

                                databaseQuery(query, [], function (error, gameInfo) {
                                    if (error) {
                                        errorLogger(error, 'DTE_0038: Error Grabbing updated Game data', query, req);
                                        res.json({errors: [error]});
                                        return;
                                    }

                                    socketHandler.getIoInstance().emit('gameInformationUpdated', {
                                        gameId: gameId,
                                        rating: rating,
                                        releaseDate: releaseDate,
                                        genres: gameInfo[0].genres,
                                        platforms: gameInfo[0].platforms
                                    });

                                    res.json({response: 'success'});
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.post('/updateVitals', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            gameId,
            newAlias,
            newStringUrl,
            storage,
            upload;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'tempuploads')
            },
            filename: function (req, file, cb) {
                cb(null, 'gameAvatar' + loggedUser.info.id + '.' + file.fieldname + '.' + Date.now())
            }
        });

        upload = multer({storage: storage, limits: {fileSize: 300 * 1024}}).single('avatarFile');

        upload(req, res, function (err) {
            if (err) {
                console.log("MULTER: " + err);
            }

            gameId = parseInt(req.body.gameId, 10);
            newAlias = req.body.alias;

            if (isNaN(gameId) || gameId === 0) {
                res.json({errors: ['No Valid Game Id Set']});
                return;
            }

            if (typeof newAlias !== 'string' || newAlias.trim() === '') {
                res.json({errors: ['No Valid Alias Set']});
                return;
            }

            query = squel.select()
                .from('games_members')

                .left_join('games', null, 'games.id = games_members.game_id')
                .field('games.alias', 'alias')
                .field('games.id', 'id')

                .where('member_id = ?', loggedUser.info.id)
                .where('mod_level = \'owner\' OR mod_level = \'mod\'')
                .where('game_id = ?', gameId)

                .toString();

            databaseQuery(query, [], function (error, gameDetails) {
                if (error) {
                    errorLogger(error, 'DTE_0039: Error Grabbing Game data', query, req);
                    res.json({errors: [error]});
                    return;
                }

                if (gameDetails.length === 0) {
                    res.json({errors: ['Not Validated To Edit this Game Project']});
                    return;
                }

                if (req.file) {
                    graphicsMagick('tempuploads/' + req.file.filename)
                        .noProfile()
                        .setFormat('jpg')
                        .gravity('Center')
                        .thumb(300, 300, 'public/userdata/avatars/game_' + gameId + '.jpg', 75, (err) => {
                            let updateHasAvatar = squel.update()
                                .table('games')
                                .set('has_avatar', 1)
                                .where('id = ?', gameId)
                                .toString();

                            databaseQuery(updateHasAvatar, [], function (error, responseData) {
                                socketHandler.getIoInstance().emit('avatarUpdated', {
                                    type: 'game',
                                    id: gameId
                                });
                            });

                            fs.unlinkSync('tempuploads/' + req.file.filename)
                        })
                }

                if (newAlias !== gameDetails[0].alias) {
                    newStringUrl = stringUrlMaker(newAlias);

                    query = squel.select()
                        .from('games')
                        .field('string_url', 'stringUrl')
                        .where('id != ?', gameId)
                        .where('string_url LIKE \'' + newStringUrl + '%\'')
                        .toString();

                    databaseQuery(query, [], function (error, matchingRecords) {
                        if (error) {
                            errorLogger(error, 'DTE_0040: Error Grabbing Game data', query, req);
                            res.json({errors: [error]});
                            return;
                        }

                        newStringUrl = stringUrlFinder(newStringUrl, matchingRecords);

                        query = squel.update()
                            .table('games')
                            .set('alias', escape(newAlias))
                            .set('string_url', newStringUrl)
                            .where('id = ?', gameId)
                            .toString();

                        databaseQuery(query, [], function (error, response) {
                            if (error) {
                                errorLogger(error, 'DTE_0041: Error Updating Game Vitals', query, req);
                                res.json({errors: [error]});
                                return;
                            }

                            socketHandler.getIoInstance().emit('gameAliasUpdated', {
                                gameId: gameId,
                                stringUrl: newStringUrl,
                                alias: newAlias
                            });

                            res.json({response: 'Successful Change with Alias'})
                        });
                    });
                } else {

                    socketHandler.getIoInstance().emit('gameVitalsWithoutAliasUpdated', {
                        gameId: gameId
                    });

                    res.json({response: 'Successful Change without Alias'})
                }
            });
        });
    });
});

router.post('/updateRecruitment', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let gameId = parseInt(req.body.gameId, 10),
            roleTitles = escape(req.body.roleTitles),
            recruitingProducers = req.body.recruitingProducers ? 1 : 0,
            recruitingDesigners = req.body.recruitingDesigners ? 1 : 0,
            recruitingArtists = req.body.recruitingArtists ? 1 : 0,
            recruitingProgrammers = req.body.recruitingProgrammers ? 1 : 0,
            recruitingMusicians = req.body.recruitingMusicians ? 1 : 0,
            recruitingSfxArtists = req.body.recruitingSfxArtists ? 1 : 0,
            recruitingWriters = req.body.recruitingWriters ? 1 : 0,
            recruitingTesters = req.body.recruitingTesters ? 1 : 0,
            isRecruiting = (
                recruitingProducers ||
                recruitingDesigners ||
                recruitingArtists ||
                recruitingProgrammers ||
                recruitingMusicians ||
                recruitingSfxArtists ||
                recruitingWriters ||
                recruitingTesters
            ),
            skills = req.body.skills,
            query;

        if (isNaN(gameId) || gameId === 0) {
            res.json({errors: ['No valid Id']});
            return;
        }

        query = squel.select()
            .from('games_members')

            .left_join('games', null, 'games.id = games_members.game_id')
            .field('games.alias', 'alias')
            .field('games.id', 'id')

            .where('member_id = ?', loggedUser.info.id)
            .where('mod_level = \'owner\' OR mod_level = \'mod\'')
            .where('game_id = ?', gameId)

            .toString();

        databaseQuery(query, [], function (error, gameDetails) {
            if (error) {
                errorLogger(error, 'DTE_0042: Error Grabbing Game Details', query, req);
                res.json({errors: [error]});
                return;
            }

            if (gameDetails.length === 0) {
                res.json({errors: ['Not Validated to do this']});
                return;
            }

            query = squel.update()
                .table('games')
                .set('seeking_is', isRecruiting)
                .set('seeking_roles', roleTitles)

                .set('seeking_producers', recruitingProducers)
                .set('seeking_designers', recruitingDesigners)
                .set('seeking_artists', recruitingArtists)
                .set('seeking_programmers', recruitingProgrammers)
                .set('seeking_musicians', recruitingMusicians)
                .set('seeking_sfx_artists', recruitingSfxArtists)
                .set('seeking_writers', recruitingWriters)
                .set('seeking_testers', recruitingTesters)

                .where('games.id = ?', gameId)
                .toString();

            databaseQuery(query, [], function (error, gameDetails) {
                if (error) {
                    errorLogger(error, 'DTE_0043: Error Updating Recruitment Info', query, req);
                    res.json({errors: [error]});
                    return;
                }

                query = squel.delete()
                    .from('game_skills')
                    .where('game_id = ?', gameId)
                    .toString();

                databaseQuery(query, [], function (err, records) {

                    let query = squel.insert()
                        .into('game_skills');

                    let skillList = [];
                    skills.forEach((skillId) => {
                        skillList.push({
                            game_id: gameId,
                            skill_id: skillId
                        });
                    });

                    query = query.setFieldsRows(skillList);
                    query = query.toString();

                    databaseQuery(query, [], function (err, records) {
                        socketHandler.getIoInstance().emit('gameInformationUpdated', {
                            gameId: gameId,
                            skills: skills,

                            roleTitles: roleTitles,
                            isRecruiting: isRecruiting,
                            recruitingProducers: recruitingProducers,
                            recruitingDesigners: recruitingDesigners,
                            recruitingArtists: recruitingArtists,
                            recruitingProgrammers: recruitingProgrammers,
                            recruitingMusicians: recruitingMusicians,
                            recruitingSfxArtists: recruitingSfxArtists,
                            recruitingWriters: recruitingWriters,
                            recruitingTesters: recruitingTesters
                        });

                        res.json({response: 'success'});
                    });
                });
            });
        });
    });
});

module.exports = router;