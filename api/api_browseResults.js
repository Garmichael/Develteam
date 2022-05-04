let express = require('express'),
    router = express.Router(),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require('squel'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    escape = require('js-string-escape'),
    xpLevelData = require('../modules/module_xpLevelData'),
    errorLogger = require('../modules/module_errorLogger');

let getDeveloperSearchQuery = function (filteredConditions, pagination, loggedUser) {
    let selfLat = loggedUser.info.loc_lat || 0,
        selfLon = loggedUser.info.loc_lon || 0,
        sortField = filteredConditions.sortOptions.sortCondition,
        sortDirection = escape(filteredConditions.sortOptions.sortDirection),
        perPage = pagination.perPage,
        offset = pagination.perPage * (pagination.page - 1),
        skillId = escape(filteredConditions.skillFilterId);

    let acceptableWhereFields = [
        'is_artist',
        'is_designer',
        'is_programmer',
        'is_musician',
        'is_sfx_artist',
        'is_writer',
        'is_producer',
        'is_tester',
        'looking_for_game'
    ];

    let query2 = squel.select()
        .from('users')
        .field('count(*)');

    let query = squel.select({separator: "\n"})
        .from('users')
        .field('users.id', 'id')
        .field('alias', 'alias')
        .field('users.string_url', 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field('last_active', 'lastOnline')
        .field('registrationDate', 'registrationDate')
        .field('location', 'location')
        .field('is_designer', 'isDesigner')
        .field('is_artist', 'isArtist')
        .field('is_programmer', 'isProgrammer')
        .field('is_writer', 'isWriter')
        .field('is_musician', 'isMusician')
        .field('is_sfx_artist', 'isSfxArtist')
        .field('is_tester', 'isTester')
        .field('is_producer', 'isProducer')
        .field('role', 'role')
        .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from user_skills WHERE user_id=users.id group by user_id), \'\')', 'skills')
        .field('looking_for_game', 'lookingForGame')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
        .field('"developer"', 'resultType')
        .field('IF(users.loc_lat = 0, 9999, CEIL((ACOS(SIN(' + selfLat + ' * PI() / 180) * SIN(users.loc_lat * PI() / 180) + COS(' + selfLat + ' * PI() / 180) * COS(users.loc_lat * PI() / 180) * COS((' + selfLon + ' - users.loc_lon) * PI() / 180)) * 180 / PI()) * 60 * 1.1515)) as proximity')

        .field("users.sample_id", 'hasMedia')
        .field('media.title', 'mediaTitle')
        .field('media.media_type', 'mediaType')
        .field('media.media_url', 'mediaUrl')

        .order(sortField, sortDirection === 'asc')

        .left_join('media', null, 'media.id = users.sample_id')
        .offset(offset)
        .limit(perPage);

    if (filteredConditions.filterOptions !== undefined) {
        filteredConditions.filterOptions.forEach(function (item) {
            if (acceptableWhereFields.indexOf(item.field) !== -1) {
                query.where(escape(item.field) + " = ?", escape(item.value));
                query2.where(escape(item.field) + " = ?", escape(item.value));
            }
        });
    }

    if (filteredConditions.showOptions !== undefined) {
        filteredConditions.showOptions.forEach(function (item) {
            if (acceptableWhereFields.indexOf(item.field) !== -1) {
                query.where(escape(item.field) + " = ?", escape(item.value));
                query2.where(escape(item.field) + " = ?", escape(item.value))
            }
        });
    }

    if (filteredConditions.skillFilterId > 0) {
        query.where('(SELECT SUM(skill_id) FROM user_skills WHERE user_id=users.id AND skill_id=' + skillId + ' group by user_id) = ?', skillId);
        query2.where('(SELECT SUM(skill_id) FROM user_skills WHERE user_id=users.id AND skill_id=' + skillId + ' group by user_id) = ?', skillId);
    }

    query = query.toString();
    query2 = query2.toString();

    return {
        resultsQuery: query,
        totalsQuery: query2
    };
};

let getGameSearchQuery = function (filteredConditions, pagination) {
    let sortField = escape(filteredConditions.sortOptions.sortCondition),
        sortDirection = escape(filteredConditions.sortOptions.sortDirection),
        acceptableWhereFields = [
            'seeking_is',
            'seeking_designers',
            'seeking_artists',
            'seeking_programmers',
            'seeking_writers',
            'seeking_musicians',
            'seeking_sfx_artists',
            'seeking_testers',
            'seeking_producers'
        ],
        perPage = pagination.perPage,
        offset = pagination.perPage * (pagination.page - 1),
        skillId = escape(filteredConditions.skillFilterId);

    let query = squel.select({separator: "\n"})
        .from('games FORCE INDEX (PRIMARY)')
        .field('games.id', 'id')
        .field('games.alias', 'alias')
        .field('games.string_url', 'stringUrl')
        .field('games.has_avatar', 'hasAvatar')
        .field('games.seeking_is', 'lookingForMembers')
        .field('seeking_designers', 'seekingDesigners')
        .field('seeking_artists', 'seekingArtists')
        .field('seeking_programmers', 'seekingProgrammers')
        .field('seeking_writers', 'seekingWriters')
        .field('seeking_musicians', 'seekingMusicians')
        .field('seeking_sfx_artists', 'seekingSfxArtists')
        .field('seeking_testers', 'seekingTesters')
        .field('seeking_producers', 'seekingProducers')
        .field('games.created', 'created')
        .field('games.rating', 'rating')
        .field('GROUP_CONCAT(DISTINCT games_members.member_id)', 'memberIds')
        .field("(SELECT IFNULL(COUNT(*), 0) FROM games_members WHERE games_members.game_id = games.id AND games_members.status='Current')", 'memberCount')
        .field('IFNULL((SELECT GROUP_CONCAT(skill_id) from game_skills WHERE game_id=games.id group by game_id), \'\')', 'skills')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'xp')
        .field('"games"', 'resultType')

        .left_join('games_members', null, 'games_members.game_id = games.id AND games_members.status = "Current"')

        .left_join('games_genres', null, 'games_genres.game_id = games.id')
        .left_join('game_genres_list', null, 'game_genres_list.id = games_genres.genre_id')
        .field('GROUP_CONCAT(DISTINCT game_genres_list.genre SEPARATOR ", ")', 'genres')

        .left_join('games_platforms', null, 'games_platforms.game_id = games.id')
        .left_join('game_platforms_list', null, 'game_platforms_list.id = games_platforms.platform_id')
        .field('GROUP_CONCAT(DISTINCT game_platforms_list.platform SEPARATOR ", ")', 'platforms')

        .left_join('posts', null, "subposter_type = 'game' && subposter_id = games.id")
        .field('MAX(posts.created)', 'lastActive')

        .order(sortField, sortDirection === 'asc')

        .group('games.id')
        .offset(offset)
        .limit(perPage);

    let query2 = squel.select()
        .from('games')
        .field('count(*)');

    if (filteredConditions.filterOptions !== undefined) {
        filteredConditions.filterOptions.forEach(function (item) {
            if (acceptableWhereFields.indexOf(item.field) !== -1) {
                query.where(escape(item.field) + " = ?", escape(item.value));
                query2.where(escape(item.field) + " = ?", escape(item.value));
            }
        });
    }

    if (filteredConditions.showOptions !== undefined) {
        filteredConditions.showOptions.forEach(function (item) {
            if (acceptableWhereFields.indexOf(item.field) !== -1) {
                query.where(escape(item.field) + " = ?", escape(item.value));
                query2.where(escape(item.field) + " = ?", escape(item.value));
            }
        });
    }

    if (filteredConditions.recruitingOptions !== undefined) {
        filteredConditions.recruitingOptions.forEach(function (item) {
            if (acceptableWhereFields.indexOf(item.field) !== -1) {
                query.where(escape(item.field) + " = ?", escape(item.value));
                query2.where(escape(item.field) + " = ?", escape(item.value));
            }
        });
    }

    if (filteredConditions.skillFilterId > 0) {
        query.where('(SELECT SUM(skill_id) FROM game_skills WHERE game_id=games.id AND skill_id=' + skillId + ' group by game_id) = ?', skillId);
        query2.where('(SELECT SUM(skill_id) FROM game_skills WHERE game_id=games.id AND skill_id=' + skillId + ' group by game_id) = ?', skillId);
    }

    query = query.toString();
    query2 = query2.toString();

    return {
        resultsQuery: query,
        totalsQuery: query2
    };
};

let getGroupMembersQuery = function (groupType, parentIds) {
    let query = squel.select({separator: "\n"})
        .distinct()
        .from(groupType + '_members')
        .field('users.id', 'id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'alias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
        .left_join('users', null, 'users.id = ' + groupType + '_members.member_id');

    if (groupType === 'games') {
        query.where('games_members.game_id in (' + parentIds.join(',') + ')');
        query.where('games_members.status = "Current"');
    }


    query = query.toString();

    return query;
};

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            filteredConditions = req.query.filteredConditions,
            pagination = req.query.pagination;

        if (!filteredConditions || !pagination) {
            res.json({error: 'invalid data sent'});
            return;
        }

        if (filteredConditions.category === 'developers') {
            query = getDeveloperSearchQuery(filteredConditions, pagination, loggedUser);
        } else if (filteredConditions.category === 'games') {
            query = getGameSearchQuery(filteredConditions, pagination);
        }

        databaseQuery(query.resultsQuery, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0003: Error Retrieving Browse Results', query.resultsQuery, req);
                res.json({error: err});
                return;
            }

            records.forEach(function (record) {
                record.xpLevelData = xpLevelData(record.xp);
            });

            databaseQuery(query.totalsQuery, [], function (err, totals) {
                let totalResults;

                if (err) {
                    errorLogger(err, 'DTE_0004: Error Retrieving Browse Results Totals', query.totalsQuery, req);
                    res.json({error: err});
                    return;
                }

                totalResults = totals[0]['count(*)'];

                if (filteredConditions.category === 'games') {
                    returnGameResults(res, records, filteredConditions, totalResults);
                } else {
                    returnDeveloperResults(res, records, totalResults);
                }
            });
        });

    });
});

let returnGameResults = function (res, records, filteredConditions, totalResults) {
    let parentIds = [];

    records.forEach(function (item) {
        parentIds.push(item.id);
    });

    let query = getGroupMembersQuery(filteredConditions.category, parentIds);

    if (totalResults === 0) {
        res.json({
            totalResults: totalResults,
            browseResults: records
        });
        return;
    }

    databaseQuery(query, [], function (err, memberRecords) {
        if (err) {
            errorLogger(err, 'DTE_0005: Error Retrieving Browse Results: Game Members', query, req);
            res.json({error: err});
            return;
        }

        records.forEach(function (record) {
            record.memberList = [];
            memberRecords.forEach(function (memberItem) {
                if (record.memberIds === null) {
                    return;
                }

                let memberList = record.memberIds.split(',');

                if (memberList.indexOf('' + memberItem.id) !== -1) {
                    record.memberList.push(memberItem);
                }

                memberItem.xpLevelData = xpLevelData(memberItem.xp);
            });

            delete (record.memberIds);

            record.xpLevelData = xpLevelData(record.xp);

            if (record.skills) {
                record.skills = record.skills.split(',');
                for (let i = 0; i < record.skills.length; i++) {
                    record.skills[i] = parseInt(record.skills[i], 10);
                }
            } else {
                record.skills = [];
            }
        });

        res.json({
            totalResults: totalResults,
            browseResults: records
        });
    });
};

let returnDeveloperResults = function (res, records, totalResults) {
    records.forEach(function (record) {
        record.xpLevelData = xpLevelData(record.xp);

        if (record.skills) {
            record.skills = record.skills.split(',');
            for (let i = 0; i < record.skills.length; i++) {
                record.skills[i] = parseInt(record.skills[i], 10);
            }
        } else {
            record.skills = [];
        }
    });

    res.json({
        totalResults: totalResults,
        browseResults: records
    });
};

module.exports = router;