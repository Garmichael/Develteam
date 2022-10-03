let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {
    let query,
        search = escape(req.query.search).replace(/\?/g, '');

    query = squel.select()
        .from('users')
        .field('id', 'id')
        .field('alias', 'alias')
        .field('string_url', 'stringUrl')
        .field('has_avatar', 'hasAvatar')
        .field('avatarId', 'avatarId')
        .field('\'developer\'', 'type')
        .where('alias LIKE \'%' + search + '%\'')
        .order('alias', 'asc')
        .toString();

    databaseQuery(query, [], function (err, devRecords) {
        if (err) {
            errorLogger(err, 'DTE_0131', query, req);
            res.json([]);
            return;
        }

        query = squel.select()
            .from('games')
            .field('id', 'id')
            .field('alias', 'alias')
            .field('string_url', 'stringUrl')
            .field('has_avatar', 'hasAvatar')
            .field('avatarId', 'avatarId')
            .field('\'developer\'', 'type')
            .where('alias LIKE \'%' + search + '%\'')
            .order('alias', 'asc')
            .toString();

        databaseQuery(query, [], function (err, gameRecords) {
            if (err) {
                errorLogger(err, 'DTE_0132', query, req);
                res.json([]);
                return;
            }

            res.json({
                developers: devRecords,
                games: gameRecords
            });
        })

    });

});

module.exports = router;