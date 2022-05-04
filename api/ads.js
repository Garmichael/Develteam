let express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    res.send(`google.com, pub-4242311851434474, DIRECT, f08c47fec0942fa0`);
});

module.exports = router;