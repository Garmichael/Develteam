let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require('squel');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let _ = require('underscore');
let getXpLevelData = require('../modules/module_xpLevelData');
let escape = require('js-string-escape');
let multer = require('multer');
let jimp = require('jimp');
let socketHandler = require('../modules/module_socketHandler');
let errorLogger = require('../modules/module_errorLogger');
let graphicsMagick = require('gm');
let fs = require('fs');

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            developerId = req.query.id ? escape(req.query.id) : undefined,
            developerStringUrl = escape(req.query.stringUrl),
            selfLat = loggedUser.isLoggedIn && loggedUser.info.loc_lat && loggedUser.info.loc_lat !== 'undefined' ? loggedUser.info.loc_lat : 0,
            selfLon = loggedUser.isLoggedIn && loggedUser.info.loc_lon && loggedUser.info.loc_lon !== 'undefined' ? loggedUser.info.loc_lon : 0;

        query = squel.select({separator: "\n"})
            .from('users')
            .field('users.id', 'id')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
            .field('users.firstname', 'firstName')
            .field('users.lastname', 'lastName')
            .field('users.gender', 'gender')
            .field('users.has_avatar', 'hasAvatar')
            .field('users.last_active', 'lastOnline')
            .field('users.registrationDate', 'registrationDate')
            .field('users.location', 'location')
            .field('users.loc_lat', 'locationLat')
            .field('users.loc_lon', 'locationLon')
            .field('users.useBirth', 'useBirth')
            .field('users.birthmonth', 'birthMonth')
            .field('users.birthday', 'birthDay')
            .field('users.birthyear', 'birthYear')
            .field('users.is_designer', 'isDesigner')
            .field('users.is_artist', 'isArtist')
            .field('users.is_programmer', 'isProgrammer')
            .field('users.is_writer', 'isWriter')
            .field('users.is_musician', 'isMusician')
            .field('users.is_sfx_artist', 'isSfxArtist')
            .field('users.is_tester', 'isTester')
            .field('users.is_producer', 'isProducer')
            .field('users.role', 'role')
            .field('users.resume_work', 'workHistory')
            .field('users.resume_education', 'educationHistory')
            .field('users.looking_for_game', 'lookingForGame')
            .field('users.looking_desc', 'lookingForDescription')
            .field('users.websites', 'personalWebsites')
            .field('users.banned', 'isBanned')
            .field('users.sitemod_can_ban', 'siteModCanBan')
            .field("(SELECT IFNULL(SUM(amount),0) FROM donations WHERE email_address=users.email)", 'donatedAmount')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')

            .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from user_skills WHERE user_id=users.id group by user_id), \'\')', 'skills')

            .field('IF(users.loc_lat = 0, 9999, CEIL((ACOS(SIN(' + selfLat + ' * PI() / 180) * SIN(users.loc_lat * PI() / 180) + COS(' + selfLat + ' * PI() / 180) * COS(users.loc_lat * PI() / 180) * COS((' + selfLon + ' - users.loc_lon) * PI() / 180)) * 180 / PI()) * 60 * 1.1515)) as proximity');

        if (developerId) {
            query.where('users.id = ?', developerId)
        } else if (developerStringUrl) {
            query.where('users.string_url = ?', developerStringUrl)
        } else {
            res.json({error: 'No Valid Developer Search Parameters Given'});
            return;
        }

        query = query.toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0012: Error Retrieving Developer Data', query, req);
                res.json({error: err});
                return;
            }

            if (records.length === 0) {
                res.json({error: 'No Valid Developer Found With Given Search Parameters'});
                return;
            }

            records.forEach(function (record) {

                if (_.isEmpty(record.workHistory)) {
                    record.workHistory = {};
                }

                if (_.isEmpty(record.educationHistory)) {
                    record.educationHistory = {};
                }

                if (_.isEmpty(record.personalWebsites)) {
                    record.personalWebsites = {};
                }

                record.workHistory = JSON.parse(record.workHistory);
                record.educationHistory = JSON.parse(record.educationHistory);
                record.personalWebsites = JSON.parse(record.personalWebsites);

                record.xpLevelData = getXpLevelData(record.xp);
            });

            query = squel.select()
                .from('games_members')
                .field('games.alias', 'alias')
                .field('games.string_url', 'stringUrl')
                .field('games.id', 'id')
                .field('games.has_avatar', 'hasAvatar')
                .field('games.hasBanner', 'hasBanner')
                .field('games_members.mod_level', 'moderatorLevel')

                .left_join('games', null, 'games.id = games_members.game_id')
                .where('games_members.member_id = ?', records[0].id)
                .where('games_members.status = ?', 'Current')
                .toString();

            databaseQuery(query, [], function (err, gameData) {
                if (err) {
                    errorLogger(err, 'DTE_0013: Error Retrieving Developer Game Data', query, req);
                    res.json({error: err});
                    return;
                }

                records[0].games = gameData;

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

    });
});

router.post('/uploadAvatar', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
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
                cb(null, 'avatar_' + loggedUser.info.id + '.' + file.fieldname + '.' + Date.now())
            }
        });

        upload = multer({storage: storage}).single('avatarFile');

        upload(req, res, function (err) {
            if (err) {
                console.log("MULTER: " + err);
                res.json({response: 'unsuccessful'});
            } else if (req.file) {
                graphicsMagick('tempuploads/' + req.file.filename)
                    .noProfile()
                    .setFormat('jpg')
                    .gravity('Center')
                    .thumb(300, 300, 'public/userdata/avatars/developer_' + loggedUser.info.id + '.jpg', 75, (err) => {
                        fs.unlinkSync('tempuploads/' + req.file.filename);

                        let updateAvatarQuery = squel.update()
                            .table('users')
                            .set('has_avatar', 1)
                            .where('id = ?', loggedUser.info.id)
                            .toString();

                        databaseQuery(updateAvatarQuery, [], function (error, updateResponse) {
                            socketHandler.getIoInstance().emit('avatarUpdated', {
                                type: 'developer',
                                id: loggedUser.info.id
                            });

                            res.json({response: 'success'});
                        });
                    })
            }
        });
    });
});

router.post('/basicInfo', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let gender = ['male', 'female'].indexOf(req.body.gender) > -1
            ? req.body.gender
            : 'nospec';

        query = squel.update()
            .table('users')
            .set('firstname', escape(req.body.firstName))
            .set('lastname', escape(req.body.lastName))
            .set('gender', gender)

            .set('location', escape(req.body.location))
            .set('loc_lat', escape(req.body.locationLat))
            .set('loc_lon', escape(req.body.locationLon))

            .set('useBirth', !req.body.useBirth || req.body.useBirth === 'false' || req.body.useBirth === '0' ? 0 : 1)
            .set('birthmonth', escape(req.body.birthMonth))
            .set('birthday', escape(req.body.birthDay))
            .set('birthyear', escape(req.body.birthYear))

            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014a: Error Setting Developer Data (basic info)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('firstname', 'firstName')
                .field('lastname', 'lastName')
                .field('gender', 'gender')
                .field('location', 'location')
                .field('loc_lat', 'locationLat')
                .field('loc_lon', 'locationLon')
                .field('useBirth', 'useBirth')
                .field('birthmonth', 'birthMonth')
                .field('birthday', 'birthDay')
                .field('birthyear', 'birthYear')
                .where('id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/rolesAndSkills', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        query = squel.delete()
            .from('user_skills')
            .where('user_id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {

            let query = squel.insert()
                .into('user_skills');

            let skillList = [];
            req.body.skills.forEach((skillId) => {
                skillList.push({
                    user_id: loggedUser.info.id,
                    skill_id: skillId
                });
            });

            query = query.setFieldsRows(skillList);
            query = query.toString();

            databaseQuery(query, [], function (err, records) {

                query = squel.update()
                    .table('users')
                    .set('role', escape(req.body.role))
                    .set('is_designer', !req.body.isDesigner || req.body.isDesigner === 'false' || req.body.isDesigner === '0' ? 0 : 1)
                    .set('is_artist', !req.body.isArtist || req.body.isArtist === 'false' || req.body.isArtist === '0' ? 0 : 1)
                    .set('is_writer', !req.body.isWriter || req.body.isWriter === 'false' || req.body.isWriter === '0' ? 0 : 1)
                    .set('is_musician', !req.body.isMusician || req.body.isMusician === 'false' || req.body.isMusician === '0' ? 0 : 1)
                    .set('is_sfx_artist', !req.body.isSfxArtist || req.body.isSfxArtist === 'false' || req.body.isSfxArtist === '0' ? 0 : 1)
                    .set('is_programmer', !req.body.isProgrammer || req.body.isProgrammer === 'false' || req.body.isProgrammer === '0' ? 0 : 1)
                    .set('is_tester', !req.body.isTester || req.body.isTester === 'false' || req.body.isTester === '0' ? 0 : 1)
                    .set('is_producer', !req.body.isProducer || req.body.isProducer === 'false' || req.body.isProducer === '0' ? 0 : 1)

                    .where('id = ?', loggedUser.info.id)
                    .toString();

                databaseQuery(query, [], function (err, records) {
                    if (err) {
                        errorLogger(err, 'DTE_0014b: Error Setting Developer Data (roles and skills)', query, req);
                        res.json({error: err});
                        return;
                    }

                    query = squel.select()
                        .from('users')
                        .field('id', 'id')
                        .field('role', 'role')
                        .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from user_skills WHERE user_id=users.id group by user_id), \'\')', 'skills')
                        .field('is_designer', 'isDesigner')
                        .field('is_artist', 'isArtist')
                        .field('is_writer', 'isWriter')
                        .field('is_musician', 'isMusician')
                        .field('is_sfx_artist', 'isSfxArtist')
                        .field('is_programmer', 'isProgrammer')
                        .field('is_tester', 'isTester')
                        .field('is_producer', 'isProducer')
                        .where('id = ?', loggedUser.info.id)
                        .toString();

                    databaseQuery(query, [], function (err, records) {
                        records[0].skills = records[0].skills.split(',');
                        for (let i = 0; i < records[0].skills.length; i++) {
                            records[0].skills[i] = parseInt(records[0].skills[i], 10);
                        }

                        socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                        res.json({response: 'success'});
                    });
                });
            });
        });
    });
});

router.post('/networking', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        query = squel.update()
            .table('users')
            .set('looking_desc', escape(req.body.lookingForDescription))
            .set('looking_for_game', !req.body.lookingForGame || req.body.lookingForGame === 'false' || req.body.lookingForGame === '0' ? 0 : 1)

            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014c: Error Setting Developer Data (networking data)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('looking_desc', 'lookingForDescription')
                .field('looking_for_game', 'lookingForGame')
                .where('id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/websites', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        if (req.body.personalWebsites === undefined || req.body.personalWebsites === null) {
            req.body.personalWebsites = [];
        }

        let personalWebsites = escape(req.body.personalWebsites);

        try {
            JSON.parse(JSON.stringify(personalWebsites));
        } catch (e) {
            personalWebsites = '[]';
        }

        let query = squel.update()
            .table('users')
            .set('websites', personalWebsites)

            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014d: Error Setting Developer Data (websites)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('websites', 'personalWebsites')
                .where('id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if(error){
                    console.log(error);
                }

                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/workHistory', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        if (req.body.workHistory === undefined || req.body.workHistory === null) {
            req.body.workHistory = {};
        }


        let workHistory = escape(req.body.workHistory);

        try {
            JSON.parse(JSON.stringify(workHistory));
        } catch (e) {
            workHistory = '{}';
        }

        query = squel.update()
            .table('users')
            .set('resume_work', workHistory)

            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014e: Error Setting Developer Data (work history)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('resume_work', 'workHistory')
                .where('id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/educationHistory', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        if (req.body.educationHistory === undefined || req.body.educationHistory === null) {
            req.body.educationHistory = {};
        }


        let educationHistory = escape(req.body.educationHistory);

        try {
            JSON.parse(JSON.stringify(educationHistory));
        } catch (e) {
            educationHistory = '{}';
        }

        query = squel.update()
            .table('users')
            .set('resume_education', educationHistory)

            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014f: Error Setting Developer Data (education history)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('resume_education', 'educationHistory')
                .where('id = ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/ban', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        if (!loggedUser.info.siteModCanBan) {
            res.json({error: 'You aren\'t allowed to ban developers'});
            return;
        }

        let bannedDeveloperId = escape(req.body.developerId);

        query = squel.update()
            .table('users')
            .set('banned', 1)
            .where('id = ?', bannedDeveloperId)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014z: Error Setting Developer Data (banning developer)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('banned', 'isBanned')
                .where('id = ?', bannedDeveloperId)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);

                query = squel.delete()
                    .from('chatroom_messages')
                    .where('chatRoomId = ?', 'siteGeneral')
                    .where('posterId = ?', bannedDeveloperId)
                    .toString();

                databaseQuery(query, [], function (err, records) {
                    query = squel.delete()
                        .from('chatroom_messages')
                        .where('chatRoomId = ?', 'siteGeneral')
                        .where('system_message_type = ?', 'registeredDeveloper')
                        .where('system_message_target_id = ?', bannedDeveloperId)
                        .toString();

                    databaseQuery(query, [], function (err, records) {
                        res.json({response: 'success'});
                        socketHandler.getIoInstance().to('chatroom_' + 'siteGeneral').emit('chatroomRefreshed');
                    });
                });
            });
        });
    });
});

router.post('/unBan', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        if (!loggedUser.info.siteModCanBan) {
            res.json({error: 'You aren\'t allowed to ban developers'});
            return;
        }

        let bannedDeveloperId = escape(req.body.developerId);

        let query = squel.update()
            .table('users')
            .set('banned', 0)
            .where('id = ?', bannedDeveloperId)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0014z: Error Setting Developer Data (banning developer)', query, req);
                res.json({error: err});
                return;
            }

            query = squel.select()
                .from('users')
                .field('id', 'id')
                .field('banned', 'isBanned')
                .where('id = ?', bannedDeveloperId)
                .toString();

            databaseQuery(query, [], function (err, records) {
                socketHandler.getIoInstance().emit('developerInformationUpdated', records[0]);
                res.json({response: 'success'});
            });
        });
    });
});

router.post('/catchUpOnMedia', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let query = squel.update()
            .table('users')
            .set('caughtUpOnMedia', 1)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            res.json({response: 'success'});
        });
    });
});

router.post('/catchUpOnDevlogs', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let query = squel.update()
            .table('users')
            .set('caughtUpOnDevlogs', 1)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            res.json({response: 'success'});
        });
    });
});

router.post('/catchUpOnClassifieds', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let query = squel.update()
            .table('users')
            .set('caughtUpOnClassifieds', 1)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            res.json({response: 'success'});
        });
    });
});

router.post('/catchUpOnForums', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not Logged In'});
            return;
        }

        let query = squel.update()
            .table('users')
            .set('caughtUpOnForums', 1)
            .where('id = ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            res.json({response: 'success'});
        });
    });
});

module.exports = router;