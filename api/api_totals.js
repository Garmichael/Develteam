let express = require('express');
let router = express.Router();
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let errorLogger = require('../modules/module_errorLogger');

router.get('/', function (req, res) {

    let query = squel.select()
        .field("(SELECT count(*) FROM users)", 'developers')
        .field("(SELECT count(*) FROM devteams)", 'devteams')
        .field("(SELECT count(*) FROM games)", 'games')
        .toString();

    databaseQuery(query, [], function (err, records) {
        if (err) {
            errorLogger(err, 'DTE_0133', query, req);
            
            res.json({
                developers: 0,
                devteams: 0,
                games: 0
            });

            return;
        }

        res.json({
            developers: records[0].developers,
            devteams: records[0].devteams,
            games: records[0].games
        });
    });


});

module.exports = router;