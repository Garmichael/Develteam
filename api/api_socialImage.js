let express = require('express'),
    router = express.Router(),
    graphicsMagick = require('gm'),
    squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery');

router.get('/avatar/:profileType/:id', function (req, res) {
    let profileType = req.params.profileType === 'developer' ? 'developer' : 'game';
    let id = req.params.id ? parseInt(req.params.id, 10) : 1;
    let background = 'public/userdata/avatarshare.png';
    let avatar = 'public/userdata/avatars/' + profileType + '_' + id + '.jpg';

    let query = squel.select()
        .from(profileType === 'developer' ? 'users' : 'games')
        .field('has_avatar', 'hasAvatar')
        .where('id= ?', id)
        .toString();

    databaseQuery(query, [], function (error, records) {
        let useDefault = records.length === 0 || !records[0].hasAvatar;

        let image = graphicsMagick(1260, 630, '#282b2e').draw("image Over 0,0 1260,630 '" + background + "'");
        if (!useDefault) {
            image.gravity('center').draw("image Over 450,165 0,0 '" + avatar + "'");
        }

        image.setFormat('png')
            .toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                    res.json({'response': 'error'});
                } else {
                    res.set('Content-Type', 'image/png');
                    res.send(new Buffer(buffer));
                }
            })
    });




});

router.get('/media/:id', function (req, res) {
    let id = req.params.id ? parseInt(req.params.id, 10) : 1;

    let query = squel.select()
        .from('media')
        .field('media_url', 'mediaUrl')
        .where('id=?', id)
        .where('media_type = ?', 'Image')
        .toString();

    databaseQuery(query, [], function (error, records) {
        let useDefault = records.length === 0;
        let watermark = 'public/userdata/mediasharewatermark.png';


        if (!useDefault) {
            let media = 'public/userdata/media/' + records[0].mediaUrl;
            graphicsMagick(media)
                .background('#282b2e')
                .gravity('Center')
                .geometry('1260x630>^')
                .extent('1260', '630')
                .draw("image Over 0,0 0,0 '" + watermark + "'")
                .setFormat('png')
                .toBuffer(function (err, buffer) {
                    if (err) {
                        console.log(err);
                        res.json({'response': 'error'});
                    } else {
                        res.set('Content-Type', 'image/png');
                        res.send(new Buffer(buffer));
                    }
                })

        } else {
            res.json({response: 'no media found'})
        }


    });
});
module.exports = router;