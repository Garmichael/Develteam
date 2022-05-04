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
        .where('alias LIKE \'%' + search + '%\'')
        .order('alias', 'asc')
        .limit(20)
        .toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0130', query, req);
            console.log(err);
            res.json([]);
            return;
        }

        res.json(records);
    });

});

module.exports = router;