let express = require('express'),
    router = express.Router(),
    squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    errorLogger = require('../modules/module_errorLogger'),
    _ = require('underscore');

router.get('/', function (req, res) {
    let query = squel.select()
        .from('game_genres_list')
        .field('id', 'id')
        .field('genre', 'label')
        .toString();

    databaseQuery(query, [], function (error, genres) {
        if (error) {
            errorLogger(error, 'DTE_0001: Error Retrieving Game Genre List', query, req);
            res.json({errors: [error, 'DTE_0001: Error Retrieving Game Genre List']});
            return;
        }

        let query = squel.select()
            .from('game_platforms_list')
            .field('id', 'id')
            .field('category', 'category')
            .field('platform', 'label')
            .field('initiallyHidden', 'initiallyHidden')
            .toString();

        databaseQuery(query, [], function (error, platforms) {
            if (error) {
                errorLogger(error, 'DTE_0002: Error Retrieving Game Platform List', query, req);
                res.json({errors: [error, 'DTE_0002: Error Retrieving Game Platform List']});
                return;
            }

            let formattedPlatforms = {};

            platforms.forEach(function (platform) {
                if (!formattedPlatforms[platform.category]) {
                    formattedPlatforms[platform.category] = {
                        label: platform.category,
                        hasHidden: false,
                        platforms: []
                    };
                }

                formattedPlatforms[platform.category].platforms.push({
                    id: platform.id,
                    label: platform.label,
                    initiallyHidden: platform.initiallyHidden
                });

                if (platform.initiallyHidden) {
                    formattedPlatforms[platform.category].hasHidden = true;
                }

            });

            query = squel.select()
                .from('skills')
                .field('id', 'id')
                .field('category', 'category')
                .field('skill', 'skill')
                .toString();

            databaseQuery(query, [], function (error, skills) {

                let hashedSkillList = {};
                skills.forEach(function(skill){
                    hashedSkillList[skill.id] = skill;
                });

                res.json({
                    genres: genres,
                    platforms: formattedPlatforms,
                    skills: hashedSkillList
                });
            });
        })

    });

});

module.exports = router;