let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../../modules/module_loggedUserBuilder');
let socketHandler = require('../../modules/module_socketHandler');
let queries = require('./queries');

router.get('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.getNotifications({
            loggedUser
        }, function (notifications) {
            res.json(notifications);
        });
    });
});

router.post('/markRead', function(req, res){
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.markRead({
            loggedUser,
            notificationIdentifier: req.body.notificationIdentifier
        }, function (notifications) {
            res.json(notifications);
        });
    });
});

module.exports = router;
