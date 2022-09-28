let express = require('express');
let router = express.Router();
let url = require('url');
let databaseQuery = require('../modules/module_mysqlQuery');
let loggedUserBuilder = require('../modules/module_loggedUserBuilder');
let validator = require('validator');
let squel = require('squel');
let escape = require('js-string-escape');
let stringUrlMaker = require('../modules/module_stringUrlMaker');
let stringUrlFinder = require('../modules/module_stringUrlFinder');
let secretKeys = require('../modules/module_secretKeys');
let request = require('request');
let socketHandler = require('../modules/module_socketHandler');
let errorLogger = require('../modules/module_errorLogger');

router.post('/', function (req, res, next) {
    let errors = [],
        email = escape(req.body.email).trim(),
        alias = escape(req.body.alias).trim(),
        password = req.body.password,
        recaptchaResponse = req.body.recaptchaResponse,
        query = '';

    if (typeof alias !== 'string' || alias.trim() === '') {
        errors.push('Screen Name not provided');
    }

    if (typeof password !== 'string' || password === '') {
        errors.push('Password not provided');
    }


    if (typeof email !== 'string' || email === '') {
        errors.push('Email not provided');
    } else if (!validator.isEmail(email)) {
        errors.push('Email is not in a valid format');
    }

    if (typeof recaptchaResponse !== 'string' || recaptchaResponse.trim() === '') {
        errors.push('Human Verification Check Failed. Reload and Try Again');
    }

    if (errors.length > 0) {
        res.json({errors});
        return;
    }


    let ipAddress;

    if (req.headers['x-forwarded-for'] !== undefined) {
        ipAddress = req.headers['x-forwarded-for'].split(',').pop();
    } else {
        ipAddress = req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }

    checkIfProxy(ipAddress, function (isProxy) {

        if (isProxy) {
            res.json({errors: ["We understand and respect that you value your privacy on the internet, however for security reasons, Develteam does not allow users with Proxy Addresses to use this site. We apologize for the inconvenience."]});
            return;
        }

        checkForPreviouslyBanned(ipAddress, function (error) {
            if (error) {
                res.json({errors: [error]});
                return;
            }

            checkForExisting(email, alias, function (error) {
                if (error) {
                    res.json({errors: [error]});
                    return;
                }

                let recaptchaSecretKey = secretKeys.recaptcha;
                let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" +
                    recaptchaSecretKey + "&response=" + recaptchaResponse + "&remoteip=" + req.connection.remoteAddress;

                request(verificationUrl, function (error, response, body) {
                    body = JSON.parse(body);

                    if (body.success !== undefined && !body.success) {
                        res.json({errors: ['Human Verification Check Failed. Reload and Try Again']});
                        return;
                    }

                    registerAccount(email, alias, password, req, res, function (error, response) {
                        if (!error) {
                            res.json(response)
                        } else {
                            res.json({errors: [error]});
                        }
                    });
                });
            });
        });
    });
});

function checkIfProxy(ip, callback) {
    let verifyIp = ip !== '::ffff:127.0.0.1';
    let ipIntelUrl = 'http://check.getipintel.net/check.php?ip=' + ip + '&contact=dirge99z@gmail.com';

    if (!verifyIp) {
        console.log("!verifyIp");
        callback(false);
        return;
    }

    request(ipIntelUrl, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            callback(true);
            return;
        }


        let proxyChance = parseFloat(response.body),
            isProxy = proxyChance >= 0.95;

        callback(isProxy);
    });
}

function checkForPreviouslyBanned(ip, callback) {
    let query = squel.select()
        .from('users')
        .field('id')
        .where('banned = 1')
        .where('ip_address = ?', ip)
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0123a', query);
            callback(error);
            return;
        }

        if (records.length > 0) {
            callback('You have been Banned from Develteam');
            return;
        }

        callback();
    })
}

function checkForExisting(email, alias, callback) {
    let query;

    query = squel.select()
        .from('users')
        .field('id')
        .where('email = ?', email)
        .toString();

    databaseQuery(query, [], function (error, records) {
        if (error) {
            errorLogger(error, 'DTE_0123', query);
            callback(error);
            return;
        }

        if (records.length > 0) {
            callback('This Email Address has already been registered. Use the Forgot Password feature to recover your account.');
            return;
        }

        query = squel.select()
            .from('users')
            .field('id')
            .where('alias = ?', alias)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0124', query);
                callback({error: error});
                return;
            }

            if (records.length > 0) {
                callback('This Screen name has already been Taken. Please choose another.');
                return;
            }

            callback(undefined);
        });
    });
}

function registerAccount(email, alias, password, req, res, callback) {
    let query,
        crypto = require('crypto'),
        sha256 = crypto.createHash('sha256'),
        hashedPassword = sha256.update(password).digest('hex'),
        stringUrl = 'mysring',
        ipAddress,
        passkey;

    if (req.headers['x-forwarded-for'] !== undefined) {
        ipAddress = req.headers['x-forwarded-for'].split(',').pop();
    } else {
        ipAddress = req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }

    stringUrl = stringUrlMaker(alias);

    query = squel.select()
        .from('users')
        .field('string_url', 'stringUrl')
        .where('string_url LIKE \'' + stringUrl + '%\'')
        .toString();

    databaseQuery(query, [], function (error, matchingRecords) {
        if (error) {
            errorLogger(error, 'DTE_0125', query);
            callback(error);
            return;
        }

        stringUrl = stringUrlFinder(stringUrl, matchingRecords);

        query = squel.insert()
            .into('users')
            .set('email', email)
            .set('password', hashedPassword)
            .set('passkey', '0')
            .set('alias', alias)
            .set('string_url', stringUrl)
            .set('ip_address', ipAddress)
            .set('resume_aboutme', '')
            .set('resume_skills', '')
            .set('resume_interests', '')
            .set('resume_inspirations', '')
            .set('resume_work', '{}')
            .set('resume_education', '{}')
            .set('websites', '[]')
            .toString();

        databaseQuery(query, [], function (error, response) {
            if (error) {
                errorLogger(error, 'DTE_0126', query);
                callback(error);
                return;
            }

            let registeredId = response.insertId;
            sha256 = crypto.createHash('sha256');
            passkey = sha256.update(registeredId + secretKeys.passkeySalt).digest('hex');

            query = squel.update()
                .table('users')
                .set('passkey', passkey)
                .where('id=?', registeredId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0127', query);
                    callback(error);
                    return;
                }

                let cookieExpiration = new Date(Date.now() + 60 * 60 * 24 * 365);

                sha256 = crypto.createHash('sha256');

                res.cookie('userid', passkey, {expires: cookieExpiration});
                res.cookie('password', hashedPassword, {expires: cookieExpiration});

                socketHandler.getIoInstance().emit('newDeveloperOrGameRegistered');

                query = squel.insert()
                    .into("chatroom_messages")
                    .set('message', '')
                    .set('chatRoomId', 'siteGeneral')
                    .set('posterId', 0)
                    .set('is_system_message', 1)
                    .set('system_message_type', 'registeredDeveloper')
                    .set('system_message_target_id', registeredId)
                    .toString();

                databaseQuery(query, [], function (err, response) {
                    if (err) {
                        errorLogger(err, 'DTE_0011a: Error Sending Registration Chatroom Message', query, req);
                        res.json({error: err});
                        return;
                    }

                    socketHandler.getIoInstance().to('chatroom_' + 'siteGeneral').emit('chatroomRefreshed');

                    callback(undefined, 'OK');
                });
            });
        });
    });

}

module.exports = router;


