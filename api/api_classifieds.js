let express = require('express'),
    router = express.Router(),
    squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    errorLogger = require('../modules/module_errorLogger'),
    escape = require('js-string-escape'),
    getXpLevelData = require('../modules/module_xpLevelData'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder');

router.get('/', function (req, res) {
    let query,
        postType = req.query.postType,
        role = req.query.role,
        skillId = req.query.skillId;

    if (postType === 'developers' || postType === 'developer') {
        postType = 'developer';
    } else {
        postType = 'game';
    }

    let acceptableRoles = ['all', 'designers', 'artists', 'programmers', 'writers', 'musicians', 'sfx artists', 'testers', 'producers'];

    if (!acceptableRoles.includes(role)) {
        role = 'all';
    }

    if (isNaN(skillId)) {
        skillId = 0;
    }

    query = squel.select()
        .from('classifieds')
        .field('classifieds.id', 'id')
        .field('classifieds.parent_type', 'posterType')
        .field('classifieds.parent_id', 'posterId')
        .field('classifieds.created', 'postDate')
        .field('classifieds.title', 'title')
        .field('classifieds.post_text', 'pitch')
        .where('classifieds.parent_type = ?', postType);

    if (postType === 'developer') {
        query.left_join('users', null, `users.id = classifieds.parent_id AND classifieds.parent_type = 'developer'`)
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.has_avatar', 'posterHasAvatar')

            .field('users.is_designer', 'roleDesigner')
            .field('users.is_artist', 'roleArtist')
            .field('users.is_programmer', 'roleProgrammer')
            .field('users.is_writer', 'roleWriter')
            .field('users.is_musician', 'roleMusician')
            .field('users.is_sfx_artist', 'roleSfxArtist')
            .field('users.is_tester', 'roleTester')
            .field('users.is_producer', 'roleProducer')

            .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from user_skills WHERE user_id=users.id group by user_id), \'\')', 'skills')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp');

        if (skillId > 0) {
            query.where('(SELECT SUM(skill_id) FROM user_skills WHERE user_id=users.id AND skill_id=' + skillId + ' group by user_id) = ?', skillId);
        }

        if (role === 'designers') {
            query.where('users.is_designer = 1')
        }

        if (role === 'artists') {
            query.where('users.is_artist = 1')
        }

        if (role === 'programmers') {
            query.where('users.is_programmer = 1')
        }

        if (role === 'writers') {
            query.where('users.is_writer = 1')
        }

        if (role === 'musicians') {
            query.where('users.is_musician = 1')
        }

        if (role === 'sfx artists') {
            query.where('users.is_sfx_artist = 1')
        }

        if (role === 'testers') {
            query.where('users.is_tester = 1')
        }

        if (role === 'producers') {
            query.where('users.is_producer = 1')
        }
    }

    if (postType === 'game') {
        query.left_join('games', null, `games.id = classifieds.parent_id AND classifieds.parent_type = 'game'`)
            .field('games.id', 'posterId')
            .field(`IFNULL(games.alias, 'DELETED GAME')`, 'posterAlias')
            .field(`IFNULL(games.string_url, 'DELETED-GAME')`, 'posterStringUrl')
            .field('games.has_avatar', 'posterHasAvatar')

            .field('games.seeking_designers', 'roleDesigner')
            .field('games.seeking_artists', 'roleArtist')
            .field('games.seeking_programmers', 'roleProgrammer')
            .field('games.seeking_writers', 'roleWriter')
            .field('games.seeking_musicians', 'roleMusician')
            .field('games.seeking_sfx_artists', 'roleSfxArtist')
            .field('games.seeking_testers', 'roleTester')
            .field('games.seeking_producers', 'roleProducer')

            .left_join('games_members', null, 'games_members.game_id = games.id and games_members.mod_level = \'owner\'')
            .left_join('users', null, 'users.id = games_members.member_id')
            .field('users.id', 'ownerId')
            .field('users.alias', 'ownerAlias')

            .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from game_skills WHERE game_id=games.id group by game_id), \'\')', 'skills')
            .field("(SELECT IFNULL(SUM(gameXp.points),0) FROM community_points gameXp WHERE receiver_id=games.id AND receiver_type='game')", 'xp');

        if (skillId > 0) {
            query.where('(SELECT SUM(skill_id) FROM game_skills WHERE game_id=games.id AND skill_id=' + skillId + ' group by game_id) = ?', skillId);
        }

        if (role === 'designers') {
            query.where('games.seeking_designers = 1')
        }

        if (role === 'artists') {
            query.where('games.seeking_artists = 1')
        }

        if (role === 'programmers') {
            query.where('games.seeking_programmers = 1')
        }

        if (role === 'writers') {
            query.where('games.seeking_writers = 1')
        }

        if (role === 'musicians') {
            query.where('games.seeking_musicians = 1')
        }

        if (role === 'sfx artists') {
            query.where('games.seeking_sfx_artists = 1')
        }

        if (role === 'testers') {
            query.where('games.seeking_testers = 1')
        }

        if (role === 'producers') {
            query.where('games.seeking_producers = 1')
        }
    }

    query.order('classifieds.created', 'desc');
    query.limit(30);

    query = query.toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0257: Error Retrieving Classifieds', query, req);
            res.json({error: err});
            return;
        }

        records.forEach(function (record) {

            console.log(record);
            if (record.skills) {
                record.skills = record.skills.split(',');
                for (let i = 0; i < record.skills.length; i++) {
                    record.skills[i] = parseInt(record.skills[i], 10);
                }
            } else {
                record.skills = [];
            }

            record.posterDetails = {
                alias: record.posterAlias,
                hasAvatar: record.posterHasAvatar,
                id: record.posterId,
                stringUrl: record.posterStringUrl,
                xpLevelData: getXpLevelData(record.xp)
            };

            if(postType === 'game'){
                record.posterDetails.ownerId = record.ownerId;
                record.posterDetails.ownerAlias = record.ownerAlias;
                delete record.ownerAlias;
                delete record.ownerId;
            }

            delete record.posterAlias;
            delete record.posterHasAvatar;
            delete record.posterId;
            delete record.posterStringUrl;
        });

        res.json({response: records});
    });

});

router.get('/post', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            postId = parseInt(req.query.postId);

        if (isNaN(postId) || postId === 0) {
            errors.push('Invalid Post Id')
        }

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        let query = squel.select()
            .from('classifieds')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('title', 'postTitle')
            .field('post_text', 'postContent')
            .field(`(
                SELECT game_id from games_members 
                WHERE games_members.mod_level = 'owner'
                    AND games_members.game_id = classifieds.parent_id
                    AND games_members.member_id = ` + loggedUser.info.id + `)
                `, 'validatedGameId')
            .where('id = ?', postId)
            .where(`
                (classifieds.parent_type = 'developer' AND classifieds.parent_id = ?) 
                OR
                (classifieds.parent_type = 'game')
            `, loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0259', query, req);
                res.json({errors: [error]});
                return;
            }

            let post;

            if (records.length === 0) {
                errors.push('Invalid Post Id')
            } else {
                post = records[0];

                if (post.parentType === 'game') {
                    if (post.validatedGameId !== post.parentId) {
                        errors.push('Not authorized to edit this post');
                    }
                } else if (post.parentType === 'developer') {
                    if (post.parentId !== loggedUser.info.id) {
                        errors.push('Not authorized to edit this post');
                    }
                }
            }

            if (errors.length > 0) {
                res.json({errors: errors})
            } else {
                res.json({post: records[0]})
            }
        });
    });
});

router.post('/new', function (req, res, next) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            selectedGameId = parseInt(req.body.selectedGameId, 10),
            postTitle = escape(req.body.postTitle),
            postContent = escape(req.body.postContent);

        if (isNaN(selectedGameId)) {
            errors.push('Invalid Selected Game');
        }

        if (postContent.trim() === '') {
            errors.push('No post content submitted');
        }

        if (errors.length > 0) {
            res.json({errors: errors});
        } else {
            if (selectedGameId > 0) {
                postAsGame(res, req, loggedUser, selectedGameId, postTitle, postContent);
            } else {
                postAsDeveloper(res, req, loggedUser, postTitle, postContent);
            }

            let query = squel.update()
                .table('users')
                .where('id != ?', loggedUser.info.id)
                .set('caughtUpOnClassifieds', 0)
                .toString();

            databaseQuery(query, [], function (err, response) {
                socketHandler.getIoInstance().emit('updateUserInfo');
            });
        }
    });
});

let postAsGame = function (res, req, loggedUser, selectedGameId, postTitle, postContent) {

    let query = squel.select()
        .from('games_members')
        .field('mod_level', 'modLevel')
        .where('mod_level = ?', 'owner')
        .where('game_id = ?', selectedGameId)
        .where('member_id = ?', loggedUser.info.id)
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0063', query, req);
            res.json({errors: [error]});
            return;
        }

        if (records.length === 0) {
            res.json({errors: ['Not Validated post as this project']});
            return;
        }

        query = squel.insert()
            .into('classifieds')
            .set('parent_type', 'game')
            .set('parent_id', selectedGameId)
            .set('title', postTitle)
            .set('post_text', postContent)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0258', query, req);
                res.json({errors: [error]});
                return;
            }

            res.json({response: 'ok'})
        });
    });
};

let postAsDeveloper = function (res, req, loggedUser, postTitle, postContent) {
    let query = squel.insert()
        .into('classifieds')
        .set('parent_type', 'developer')
        .set('parent_id', loggedUser.info.id)
        .set('title', postTitle)
        .set('post_text', postContent)
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0258a', query, req);
            res.json({errors: [error]});
            return;
        }

        res.json({response: 'ok'})
    });
};

router.post('/edit', function (req, res, next) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            postId = parseInt(req.body.postId),
            postTitle = escape(req.body.postTitle),
            postContent = escape(req.body.postContent);

        if (isNaN(postId) || postId === 0) {
            errors.push('Invalid Post Id')
        }

        if (postContent.trim() === '') {
            errors.push('No content set')
        }

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        let query = squel.select()
            .from('classifieds')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('title', 'postTitle')
            .field('post_text', 'postContent')
            .field(`(
                SELECT game_id from games_members 
                WHERE games_members.mod_level = 'owner'
                    AND games_members.game_id = classifieds.parent_id
                    AND games_members.member_id = ` + loggedUser.info.id + `)
                `, 'validatedGameId')
            .where('id = ?', postId)
            .where(`
                (classifieds.parent_type = 'developer' AND classifieds.parent_id = ?) 
                OR
                (classifieds.parent_type = 'game')
            `, loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0260', query, req);
                res.json({errors: [error]});
                return;
            }

            let post;

            if (records.length === 0) {
                errors.push('Invalid Post Id')
            } else {
                post = records[0];

                if (post.parentType === 'game') {
                    if (post.validatedGameId !== post.parentId) {
                        errors.push('Not authorized to edit this post');
                    }
                } else if (post.parentType === 'developer') {
                    if (post.parentId !== loggedUser.info.id) {
                        errors.push('Not authorized to edit this post');
                    }
                }
            }

            if (errors.length > 0) {
                res.json({errors: errors})
            } else {
                query = squel.update()
                    .table('classifieds')
                    .set('title', postTitle)
                    .set('post_text', postContent)
                    .where('id = ?', postId)
                    .toString();

                databaseQuery(query, [], function (error, records) {
                    if (error) {
                        errorLogger(error, 'DTE_0261', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    res.json({response: 'success'})
                });
            }
        });
    })
});

router.post('/delete', function (req, res, next) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let errors = [],
            postId = parseInt(req.body.postId);

        if (isNaN(postId) || postId === 0) {
            errors.push('Invalid Post Id')
        }

        if (errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        let query = squel.select()
            .from('classifieds')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('title', 'postTitle')
            .field('post_text', 'postContent')
            .field(`(
                SELECT game_id from games_members 
                WHERE games_members.mod_level = 'owner'
                    AND games_members.game_id = classifieds.parent_id
                    AND games_members.member_id = ` + loggedUser.info.id + `)
                `, 'validatedGameId')
            .where('id = ?', postId)
            .where(`
                (classifieds.parent_type = 'developer' AND classifieds.parent_id = ?) 
                OR
                (classifieds.parent_type = 'game')
            `, loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0260', query, req);
                res.json({errors: [error]});
                return;
            }

            let post;

            if (records.length === 0) {
                errors.push('Invalid Post Id')
            } else {
                post = records[0];

                if (post.parentType === 'game') {
                    if (post.validatedGameId !== post.parentId) {
                        errors.push('Not authorized to edit this post');
                    }
                } else if (post.parentType === 'developer') {
                    if (post.parentId !== loggedUser.info.id) {
                        errors.push('Not authorized to edit this post');
                    }
                }
            }

            if (errors.length > 0) {
                res.json({errors: errors})
            } else {
                query = squel.delete()
                    .from('classifieds')
                    .where('id = ?', postId)
                    .toString();

                databaseQuery(query, [], function (error, records) {
                    if (error) {
                        errorLogger(error, 'DTE_0261', query, req);
                        res.json({errors: [error]});
                        return;
                    }

                    res.json({response: 'success'})
                });
            }
        });
    })
});

module.exports = router;