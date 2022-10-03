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
        ApplyRankToMedia(() => {
            ApplyWorkHistory(() => {
                ApplyEducationHistory(() => {
                    ApplyEmailPreferences(() => {
                        ApplyAvatarCaching(()=>{

                        });
                    });
                });
            })
        });
        res.json({status: 'success'});
    });


});

function DoNext() {

}

function ApplyRankToMedia(callback) {
    console.log(">> Applying Rank To Media");

    databaseQuery("ALTER TABLE media ADD COLUMN rank varchar(32) NOT NULL DEFAULT 0 AFTER id;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        callback();
    });
}

function ApplyWorkHistory(callback) {
    console.log(">> Applying Work History")

    databaseQuery("ALTER TABLE users ADD COLUMN work_history mediumtext AFTER websites;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        let query = squel.select()
            .from('users')
            .field('id', 'id')
            .field('resume_work', 'workHistory')
            .toString();

        databaseQuery(query, [], (error, records) => {
            let updateQuery = "UPDATE users SET work_history = (case ";

            records.forEach((record) => {
                let newWorkHistory = [];
                if (_.isEmpty(record.workHistory)) {
                    record.workHistory = {};
                }

                try {
                    JSON.parse(record.workHistory);
                } catch (e) {
                    record.workHistory = '{}';
                }

                let parsedWorkHistory = JSON.parse(record.workHistory);

                Object.keys(parsedWorkHistory).forEach(key => {
                    newWorkHistory.push(parsedWorkHistory[key]);
                });

                let insertJson = JSON.stringify(newWorkHistory);
                updateQuery += " when id = " + record.id + " then '" + escape(insertJson) + "'";
            });

            updateQuery += " end)";

            databaseQuery(updateQuery, [], (error, results) => {
                callback();
            });

        });
    });
}


function ApplyEducationHistory(callback) {
    console.log(">> Applying Education History");

    databaseQuery("ALTER TABLE users ADD COLUMN education mediumtext AFTER work_history;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        let query = squel.select()
            .from('users')
            .field('id', 'id')
            .field('resume_education', 'educationHistory')
            .toString();

        databaseQuery(query, [], (error, records) => {
            let updateQuery = "UPDATE users SET education = (case ";

            records.forEach((record) => {
                let newEducationHistory = [];
                if (_.isEmpty(record.educationHistory)) {
                    record.educationHistory = {};
                }

                try {
                    JSON.parse(record.educationHistory);
                } catch (e) {
                    record.educationHistory = '{}';
                }

                let parsedEducationHistory = JSON.parse(record.educationHistory);

                Object.keys(parsedEducationHistory).forEach(key => {
                    newEducationHistory.push(parsedEducationHistory[key]);
                });

                let insertJson = JSON.stringify(newEducationHistory);
                updateQuery += " when id = " + record.id + " then '" + escape(insertJson) + "'";
            });

            updateQuery += " end)";

            databaseQuery(updateQuery, [], (error, results) => {
                callback();
            });

        });
    });
}

function ApplyEmailPreferences(callback) {
    console.log(">> Applying Email Preferences");

    databaseQuery("ALTER TABLE users ADD COLUMN receive_user_email int(1) DEFAULT 1 AFTER hasSkillFactored;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        databaseQuery("ALTER TABLE users ADD COLUMN receive_promo_email int(1) DEFAULT 1 AFTER receive_user_email;", [], (error, results) => {
            if (error) {
                console.log("ALTER TABLE ERROR: " + error);
            }

            callback();
        });

    });
}

function ApplyAvatarCaching(callback){
    console.log(">> Applying Avatar Caching");

    databaseQuery("ALTER TABLE users ADD COLUMN avatarId int(14) DEFAULT 0 AFTER has_avatar;", [], (error, results) => {
        if (error) {
            console.log("ALTER TABLE ERROR: " + error);
        }

        databaseQuery("ALTER TABLE games ADD COLUMN avatarId int(14) DEFAULT 0 AFTER has_avatar;", [], (error, results) => {
            if (error) {
                console.log("ALTER TABLE ERROR: " + error);
            }

            databaseQuery("ALTER TABLE media ADD COLUMN avatarId int(14) DEFAULT 0 AFTER has_avatar;", [], (error, results) => {
                if (error) {
                    console.log("ALTER TABLE ERROR: " + error);
                }

                callback();
            });
        });

    });
}
module.exports = router;