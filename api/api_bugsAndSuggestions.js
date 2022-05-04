let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require('squel');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let escape = require('js-string-escape');
let socketHandler = require('../modules/module_socketHandler');
let _ = require('lodash');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    let query = squel.select()
        .from('bugs_and_suggestions')
        .field('bugs_and_suggestions.id', 'id')
        .field('bugs_and_suggestions.title', 'title')
        .field('bugs_and_suggestions.description', 'description')
        .field('bugs_and_suggestions.type', 'type')
        .field('bugs_and_suggestions.status', 'status')

        .left_join('users', null, 'users.id = bugs_and_suggestions.poster_id')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')

        .toString();

    databaseQuery(query, [], function (error, items) {
        if (error) {
            errorLogger(error, 'DTE_0006: Error Retrieving Bugs and Suggestions', query, req);
            res.json({errors: [error, 'DTE_0006: Error Retrieving Bugs and Suggestions']});
            return;
        }

        _.each(items, function (item) {
            item.poster = {
                alias: item.posterAlias,
                stringUrl: item.posterStringUrl,
            };

            delete item.posterAlias;
            delete item.posterStringUrl;
        });

        res.json({items})
    })
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query,
            title = req.body.title,
            description = req.body.description,
            type = req.body.type;

        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        if (typeof title !== 'string' || title.trim() === '') {
            res.json({errors: ['Invalid Title']});
            return;
        }

        if (typeof description !== 'string') {
            res.json({errors: ['Invalid Description']});
            return;
        }

        if (['bug', 'suggestion'].indexOf(type) === -1) {
            res.json({errors: ['Invalid Work Item Type']});
            return;
        }

        query = squel.insert()
            .into('bugs_and_suggestions')
            .set('title', escape(title))
            .set('description', escape(description))
            .set('type', type)
            .set('status', 'backlog')
            .set('poster_id', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (errors, insertResponse) {
            if (errors) {
                errorLogger(error, 'DTE_0007: Error Adding Bugs and Suggestions', query, req);
                res.json({errors: [errors, 'DTE_0007: Error Adding Bugs and Suggestions']});
                return;
            }
            socketHandler.getIoInstance().emit('updatedBugsAndSuggestions');

            res.json({response: 'submitted'})
        });


    });
});

router.post('/moderatorMove', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let query;

        if (!loggedUser.isLoggedIn || loggedUser.info.id > 2) {
            res.json({errors: ['Not Logged in as a Moderator']});
            return;
        }

        query = squel.update()
            .table('bugs_and_suggestions')
            .set('status', req.body.newStatus)
            .where('id = ?', req.body.item.id)
            .toString();

        databaseQuery(query, [], function (error, updateResponse) {
            if (error) {
                errorLogger(error, 'DTE_0008: Error Moving Bugs and Suggestions', query, req);
                res.json({errors: [error, 'DTE_0008: Error Moving Bugs and Suggestions']});
                return;
            }

            socketHandler.getIoInstance().emit('updatedBugsAndSuggestions');
            res.json({response: 'moved'});
        })
    });
});

module.exports = router;