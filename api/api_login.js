let express = require('express'),
    router = express.Router(),
    url = require('url'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    errorLogger = require('../modules/module_errorLogger'),
    secretKeys = require('../modules/module_secretKeys');

router.post('/', function (req, res, next) {
    let crypto = require('crypto'),
        sha256 = crypto.createHash('sha256'),
        email = escape(req.body.email).trim(),
        password = escape(req.body.password),
        id = null,
        cookieExpiration = 0;

    databaseQuery('select id from users WHERE email=?', [email], function (err, rows) {
        if (err) {
            errorLogger(err, 'DTE_0086', "", req);
            res.json({
                isLoggedIn: false,
                info: {},
                validationError: true,
                validationMessage: 'Unknown Failure. Please wait a few minutes and try again.'
            });
            return;
        }

        if (rows.length === 0) {
            res.json({
                isLoggedIn: false,
                info: {},
                validationError: true,
                validationMessage: 'This Email Address has not been Registered with Develteam'
            });
            return;
        }

        databaseQuery('select id, banned from users WHERE email = ? AND password = ?', [email, password], function (err, rows) {
            if (err) {
                errorLogger(err, 'DTE_0087', "", req);
                res.json({
                    isLoggedIn: false,
                    info: {},
                    validationError: true,
                    validationMessage: 'Unknown Failure. Please wait a few minutes and try again.'
                });
                return;
            }

            if (rows.length === 0) {
                res.json({
                    isLoggedIn: false,
                    info: {},
                    validationError: true,
                    validationMessage: 'Incorrect Password given for this Email Address'
                });
                return;
            } else if (rows[0].banned === 1) {
                res.json({
                    isLoggedIn: false,
                    info: {},
                    validationError: true,
                    validationMessage: 'You have been Banned from using Develteam'
                });
                return;
            }

            cookieExpiration = req.body.remember ? new Date(Date.now() + 60 * 60 * 24 * 365) : 0;
            sha256 = crypto.createHash('sha256');
            id = sha256.update(rows[0].id + secretKeys.passkeySalt).digest('hex');

            res.cookie('userid', id, {expires: cookieExpiration});
            res.cookie('password', password, {expires: cookieExpiration});

            loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
                    res.json({
                        isLoggedIn: true,
                        info: loggedUser.info,
                        games: loggedUser.games,
                        options: loggedUser.options,
                        validationError: false,
                        validationMessage: 'Successfully Logged In'
                    });
                },
                {passKey: id, password: password}
            );
        });
    });

});

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        let url_params = url.parse(req.url, true),
            logOut = url_params.query.logOut,
            json = {
                isLoggedIn: loggedUser.isLoggedIn,
                info: loggedUser.info,
                games: loggedUser.games,
                options: loggedUser.options
            };

        if (logOut) {
            let cookieExpiration = 0;

            res.cookie('userid', '', {expires: cookieExpiration});
            res.cookie('password', '', {expires: cookieExpiration});

            json = {
                isLoggedIn: false,
                validationError: false,
                validationMessage: 'Successfully logged out',
                info: {}
            };
        }

        res.json(json);
    });
});

module.exports = router;


