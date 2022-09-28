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
        if (!loggedUser.isLoggedIn || loggedUser.info.id !== 1) {
            res.json({error: 'Not logged in as Site Mod'});
            return;
        }

        console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
        ApplyWebsiteFix(function(){
            DoNext();
        });
    });

    res.json({status: 'success'});
});

function DoNext() {

}

function ApplyWebsiteFix(callback) {
    console.log(">> Applying Website Fix");

    databaseQuery("ALTER TABLE users ADD COLUMN websites mediumtext AFTER contact_websites;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        let query = squel.select()
            .from('users')
            .field('contact_facebook', 'facebook')
            .field('contact_twitter', 'twitter')
            .field('contact_instagram', 'instagram')
            .field('contact_linkedin', 'linkedin')
            .field('contact_websites', 'personalWebsites')
            .field('id', 'id')
            .toString();

        databaseQuery(query, [], (error, results) => {
            if (error) {
                console.log(error);
                return;
            }

            let updateQuery = "UPDATE users SET websites = (case ";

            results.forEach(function (result) {
                let thisNew = [];

                if (result.facebook !== '') {
                    thisNew.push({
                        name: 'Facebook',
                        url: result.facebook
                    });
                }

                if (result.twitter !== '') {
                    thisNew.push({
                        name: 'Twitter',
                        url: result.twitter
                    });
                }

                if (result.instagram !== '') {
                    thisNew.push({
                        name: 'Instagram',
                        url: result.instagram
                    });
                }

                if (result.linkedin !== '') {
                    thisNew.push({
                        name: 'LinkedIn',
                        url: result.linkedin
                    });
                }

                let personalWebsites = JSON.parse(result.personalWebsites);

                Object.keys(personalWebsites).forEach(key => {
                    thisNew.push({
                        name: key,
                        url: personalWebsites[key]
                    })
                });

                let insertJson = JSON.stringify(thisNew);

                updateQuery += " when id = " + result.id + " then '" + escape(insertJson) + "'";

            });

            updateQuery += " end)";

            databaseQuery(updateQuery, [], (error, results) => {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    console.log(">> Completed Website Fix")
                    callback();
                }
            });
        });
    });
}

module.exports = router;