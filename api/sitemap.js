let express = require('express'),
    router = express.Router(),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel");

router.get('/', function (req, res) {
    let query,
        todayDate = new Date(),
        lastMod = todayDate.getFullYear() + '-' +
            (todayDate.getMonth() < 10 ? '0' : '') + todayDate.getMonth() + '-' +
            (todayDate.getDate() < 10 ? '0' : '') + todayDate.getDate();

    query = squel.select()
        .from('users')
        .field('string_url', 'stringUrl')
        .toString();

    databaseQuery(query, [], (error, users) => {
        query = squel.select()
            .from('games')
            .field('string_url', 'stringUrl')
            .toString();

        databaseQuery(query, [], (error, games) => {
            let data = {
                lastMod,
                users,
                games
            };

            res.render('../views/sitemap', data);
        });
    });
});

module.exports = router;