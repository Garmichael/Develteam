let express = require('express'),
    router = express.Router(),
    url = require('url'),
    databaseQuery = require('../modules/module_mysqlQuery'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    validator = require('validator'),
    squel = require('squel'),
    escape = require('js-string-escape'),
    stringUrlMaker = require('../modules/module_stringUrlMaker'),
    stringUrlFinder = require('../modules/module_stringUrlFinder'),
    crypto = require('crypto'),
    errorLogger = require('../modules/module_errorLogger'),
    secretKeys = require('../modules/module_secretKeys');

router.post('/', function (req, res, next) {
    let errors = [],
        email = req.body.email,
        query = '';

    if (typeof email !== 'string' || email === '') {
        errors.push('Email not provided');
    } else if (!validator.isEmail(email)) {
        errors.push('Email is not in a valid format');
    }

    if (errors.length > 0) {
        res.json({errors});
        return;
    }

    query = squel.select()
        .from('users')
        .field('id')
        .field('alias')
        .where('email = ?', escape(email))
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0022: Error Setting new Forgotten Password', query, req);
            res.json({errors: [error]});
            return;
        }

        if (records.length === 0) {
            res.json({errors: ['This Email Address has not been Registered']});
            return;
        }

        let alias = records[0].alias;

        query = squel.select()
            .from('forgotten_passwords')
            .field('email', 'email')
            .where('email = ?', escape(email))
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0023: Error Setting new Forgotten Password', query, req);
                res.json({errors: [error]});
                return;
            }

            let sha256 = crypto.createHash('sha256'),
                keycode = sha256.update(Date.now() + secretKeys.passkeySalt).digest('hex');

            if (records.length === 0) {
                query = squel.insert()
                    .into('forgotten_passwords')
                    .set('email', escape(email))
                    .set('keycode', keycode)
                    .toString();
            } else {
                query = squel.update()
                    .table('forgotten_passwords')
                    .set('keycode', keycode)
                    .where('email = ?', escape(email))
                    .toString();
            }

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0024: Error Setting new Forgotten Password', query, req);
                    res.json({errors: [error]});
                    return;
                }

                let emailer = require('../modules/module_emailer');
                emailer.sendEmail(alias, email, 'passwordRecover', 'Your Password Recovery Link', '', 'http://www.develteam.com/Login/Update/' + keycode);

                res.json({response: 'ok'});
            });

        });
    });
});

router.post('/recover', function (req, res, next) {
    let query,
        errors = [],
        keycode = req.body.keycode,
        password = req.body.password;

    if (typeof password !== 'string' || password === '') {
        res.json({errors: ['No updated password supplied']});
        return;
    }

    query = squel.select()
        .from('forgotten_passwords')
        .field('email', 'email')
        .where('keycode = ?', escape(keycode))
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0025: Error Recovering Forgotten Password', query, req);
            res.json({errors: [error]});
            return;
        }

        if (records.length === 0) {
            res.json({errors: ['Invalid Keycode']});
            return;
        }

        let sha256 = crypto.createHash('sha256');

        password = sha256.update(password).digest('hex');

        query = squel.update()
            .table('users')
            .set('password', password)
            .where('email = ?', escape(records[0].email))
            .toString();

        databaseQuery(query, [], function (error, response) {
            if (error) {
                errorLogger(error, 'DTE_0026: Error Recovering Forgotten Password', query, req);
                res.json({errors: [error]});
                return;
            }

            query = squel.delete()
                .from('forgotten_passwords')
                .where('keycode = ?', keycode)
                .toString();

            databaseQuery(query, [], function (error, response) {
            });

            res.json({response: 'Password Updated'});
        });
    })
});

router.get('/', function (req, res, next) {
    let query,
        keycode = req.query.keycode;

    if (typeof keycode !== 'string') {
        res.json({errors: ['Invalid Keycode']});
        return;
    }

    query = squel.select()
        .from('forgotten_passwords')
        .field('email')
        .where('keycode = ?', escape(keycode))
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0027: Error Recovering Forgotten Password', query, req);
            res.json({errors: [error]});
            return;
        }

        if (records.length === 0) {
            res.json({errors: ['Recovery URL is Invalid']});
            return;
        }

        res.json({email: records[0].email});
    });
});

module.exports = router;


