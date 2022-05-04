let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let getXpLevelData = require('../modules/module_xpLevelData');
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {

    let query = squel.select()
        .from('donations')
        .field('SUM(amount)', 'amount')
        .field('MAX(created)', 'date')
        .field('users.id', 'id')
        .field('IFNULL(users.alias, \'Anonymous\')', 'alias')
        .field('users.string_url', 'stringUrl')
        .field('users.has_avatar', 'hasAvatar')
        .left_join('users', null, 'users.email = email_address')
        .group('email_address')
        .order('amount', false)
        .toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0256', query, req);
            res.json({error: err});
            return;
        }

        res.json({
            'donors': records
        });
    });
});

module.exports = router;