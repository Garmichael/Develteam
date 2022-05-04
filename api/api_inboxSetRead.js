let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');
let errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let inboxId = req.body.inboxId && escape(req.body.inboxId),
            query;

        if (!loggedUser.isLoggedIn) {
            res.json({error: 'Not logged in'});
            return;
        }

        query = squel.update()
            .table('inbox_conv_users')
            .set('has_read', 1)
            .where('user_id = ?', loggedUser.info.id)
            .where('conv_id = ?', inboxId)
            .toString();

        databaseQuery(query, [], function (err, records) {
            if (err) {
                errorLogger(err, 'DTE_0062: Error Grabbing Participants', query, req);
                res.json({error: err});
                return;
            }

            res.json({response: 'success'});
        });

    });
});


module.exports = router;