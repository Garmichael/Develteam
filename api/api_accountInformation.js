let express = require('express'),
    router = express.Router(),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require("squel"),
    escape = require('js-string-escape'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    errorLogger = require('../modules/module_errorLogger'),
    validator = require('validator'),
    stringUrlMaker = require('../modules/module_stringUrlMaker'),
    stringUrlFinder = require('../modules/module_stringUrlFinder');

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        if (!loggedUser.isLoggedIn) {
            res.json({errors: ['Not Logged In']});
            return;
        }

        let newInfo = req.body.info;
        let errors = [];
        let updatedEmail = loggedUser.info.email;
        let updatedAlias = newInfo.alias;
        let updatedPassword = '';

        if (newInfo.delete === 'DELETE') {
            deleteAccount(res, loggedUser.info.id);
            return;
        }

        if (newInfo.password.trim() !== '' && newInfo.password === newInfo.passwordAgain) {
            let crypto = require('crypto'),
                sha256 = crypto.createHash('sha256');

            updatedPassword = sha256.update(newInfo.password).digest('hex');
        }

        if (!validator.isEmail(newInfo.email)) {
            errors.push('Email is not in a valid format');
        } else {
            updatedEmail = newInfo.email;
        }

        let query = squel.select()
            .from('users')
            .field('id')
            .where('email = ?', updatedEmail)
            .where('id != ?', loggedUser.info.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0123x', query);
            } else {
                if (records.length > 0) {
                    errors.push('Email already in use by another account');
                    updatedEmail = loggedUser.info.email;
                }
            }

            query = squel.select()
                .from('users')
                .field('id')
                .where('alias = ?', updatedAlias)
                .where('id != ?', loggedUser.info.id)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0123y', query);
                } else {
                    if (records.length > 0) {
                        errors.push('Alias already in use by another account');
                        updatedAlias = loggedUser.info.alias;
                    }
                }

                let stringUrl = stringUrlMaker(updatedAlias);

                query = squel.select()
                    .from('users')
                    .field('string_url', 'stringUrl')
                    .where('string_url LIKE \'' + stringUrl + '%\'')
                    .toString();

                databaseQuery(query, [], function (error, matchingRecords) {
                    if (error) {
                        errorLogger(error, 'DTE_0125x', query);
                    }

                    if (errors.length === 0) {
                        query = squel.update()
                            .table('users')
                            .where('id = ?', loggedUser.info.id)
                            .set('alias', updatedAlias)
                            .set('email', updatedEmail)
                            .set('string_url', stringUrl);

                        if (updatedPassword !== '') {
                            query = query.set('password', updatedPassword)
                        }

                        query = query.toString();

                        databaseQuery(query, [], function (error) {
                            if (error) {
                                errorLogger(error, 'DTE_0125y', query);
                            }

                            if (updatedPassword !== '') {
                                let cookieExpiration = new Date(Date.now() + 60 * 60 * 24 * 365);
                                res.cookie('password', updatedPassword, {expires: cookieExpiration});
                            }

                            res.json({response: 'ok', errors: errors});
                        });
                    } else {
                        res.json({response: 'ok', errors: errors});
                    }
                });
            });
        });
    });

    function deleteAccount(res, userId) {
        let query = squel.delete()
            .from('users')
            .where('id = ?', userId)
            .toString();

        databaseQuery(query, [], function (error) {
            if (error) {
                errorLogger(error, 'DTE_0125zzzzz', query);
            }

            res.json({response: 'ok'});
        });
    }
})
;

module.exports = router;