let express = require('express'),
    router = express.Router(),
    squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    errorLogger = require('../modules/module_errorLogger'),
    escape = require('js-string-escape');
_ = require('underscore');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn || loggedUser.info.id > 2) {
            res.json({error: 'Not logged in as Site Mod: ' + loggedUser.info.id});
            return;
        }

        console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
        // ApplyRankToMedia(() => {});
        res.json({status: 'success'});
    });


});

module.exports = router;