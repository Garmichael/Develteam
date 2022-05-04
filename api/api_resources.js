let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let url = require('url');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require('squel');
let validator = require('validator');
let escape = require('js-string-escape');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    let query = "" +
        "SELECT" +
        " *" +
        ", (SELECT IFNULL(SUM(vote), 0) FROM votes_binary vote WHERE vote.parent_id=resource_links.id AND vote.parent_type='resource') as allVotes" +
        " FROM resource_links" +
        " ORDER BY allVotes DESC, name ASC";

    databaseQuery(query, [], function (err, records) {
        if(err){
            errorLogger(err, 'DTE_0128', query, req);
        }

        let json;
        let currentRecord;
        let currentExport;

        let resources = [
            {
                text: 'Dev Tools',
                id: 'DevTools',
                sections: [
                    {
                        text: 'Collaboration',
                        icon: 'fa-exchange-alt',
                        id: 'Collaboration',
                        resourceItems: []
                    },
                    {
                        text: 'Game Engines',
                        icon: 'fa-cogs',
                        id: 'GameEngines',
                        resourceItems: []
                    },
                    {
                        text: 'Programming',
                        icon: 'fa-code',
                        id: 'Programming',
                        resourceItems: []
                    },
                    {
                        text: 'Graphics',
                        icon: 'fa-crop',
                        id: 'Graphics',
                        resourceItems: []
                    },
                    {
                        text: 'Audio',
                        icon: 'fa-sliders-h fa-rotate-270',
                        id: 'Audio',
                        resourceItems: []
                    },
                    {
                        text: 'Video',
                        icon: 'fa-video',
                        id: 'Video',
                        resourceItems: []
                    }
                ]
            },
            {
                text: 'Assets',
                id: 'Assets',
                sections: [
                    {
                        text: 'Graphics',
                        icon: 'fa-file-image',
                        id: 'Graphics',
                        resourceItems: []
                    },
                    {
                        text: 'Fonts',
                        icon: 'fa-font',
                        id: 'Fonts',
                        resourceItems: []
                    },
                    {
                        text: 'Sound Effects',
                        icon: 'fa-drum',
                        id: 'SoundEffects',
                        resourceItems: []
                    },
                    {
                        text: 'Music',
                        icon: 'fa-music',
                        id: 'Music',
                        resourceItems: []
                    }
                ]
            }
        ];

        for (let i = 0; i < records.length; i++) {
            currentRecord = records[i];
            currentExport = {
                id: currentRecord.id,
                text: currentRecord.name,
                url: currentRecord.url,
                allVotes: currentRecord.allVotes
            };

            if (currentRecord.resource_type === 'asset') {
                switch (currentRecord.category) {
                    case 'Graphics':
                        resources[1].sections[0].resourceItems.push(currentExport);
                        break;
                    case 'Fonts':
                        resources[1].sections[1].resourceItems.push(currentExport);
                        break;
                    case 'Sound Effects':
                        resources[1].sections[2].resourceItems.push(currentExport);
                        break;
                    case 'Music':
                        resources[1].sections[3].resourceItems.push(currentExport);
                        break;
                    default:
                        break;
                }
            } else if (currentRecord.resource_type === 'gametool') {
                switch (currentRecord.category) {
                    case 'Collaboration Tools':
                        resources[0].sections[0].resourceItems.push(currentExport);
                        break;
                    case 'Game Engines':
                        resources[0].sections[1].resourceItems.push(currentExport);
                        break;
                    case 'Programming Tools':
                        resources[0].sections[2].resourceItems.push(currentExport);
                        break;
                    case 'Graphics Programs':
                        resources[0].sections[3].resourceItems.push(currentExport);
                        break;
                    case 'Music and Audio Programs':
                        resources[0].sections[4].resourceItems.push(currentExport);
                        break;
                    case 'Video Recording and Editing Programs':
                        resources[0].sections[5].resourceItems.push(currentExport);
                        break;
                    default:
                        break;
                }
            }
        }

        json = {
            resources: resources
        };

        res.json(json);
    });
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let resourceType = escape(req.body.category),
            category = escape(req.body.section),
            name = req.body.websiteName && escape(req.body.websiteName.trim()),
            url = req.body.websiteUrl && escape(req.body.websiteUrl.trim()),
            query,
            typeMapper = {
                'assets': 'asset',
                'devtools': 'gametool'
            };

        resourceType = typeMapper[resourceType];

        let categoryMapper = {
            'graphics': 'Graphics',
            'fonts': 'Fonts',
            'sfx': 'Sound Effects',
            'music': 'Music',
            'collaboration': 'Collaboration Tools',
            'engines': 'Game Engines',
            'programming': 'Programming Tools',
            'audio': 'Music and Audio Programs',
            'video': 'Video Recording and Editing Programs'
        };

        category = categoryMapper[category];

        if (resourceType === 'gametool' && category === 'Graphics') {
            category = 'Graphics Programs'
        }

        if (loggedUser.info.id === undefined) {
            res.json({error: 'Must be logged in to do this'});
            return;
        }

        if (resourceType === undefined ||
            category === undefined ||
            name === '' ||
            name === undefined ||
            url === '' ||
            url === undefined
        ) {
            res.json({error: 'There was a problem with submitted data'});
            return;
        }

        if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
            url = "http://" + url;
        }

        if (!validator.isURL(url)) {
            res.json({error: 'Submitted Url is not a valid URL'});
            return;
        }

        query = squel.insert()
            .into("resource_links")
            .set('resource_type', resourceType)
            .set('name', name)
            .set('url', url)
            .set('category', category)
            .set('user_id', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0129', query, req);
                res.json({error: err});
                return;
            }

            res.json({message: 'success'});
        });
    });
});


module.exports = router;