let express = require('express'),
    router = express.Router(),
    databaseQuery = require('../modules/module_mysqlQuery'),
    squel = require('squel'),
    loggedUserBuilder = require('../modules/module_loggedUserBuilder'),
    escape = require('js-string-escape'),
    xpLevelData = require('../modules/module_xpLevelData'),
    errorLogger = require('../modules/module_errorLogger'),
    _ = require('lodash');

router.get('/', function (req, res) {
    let baseQuery,
        query,
        topAllTime,
        topLastSixMonths,
        topLasMonth;

    query = squel.select()
        .from('media')
        .field('media.string_url', 'pieceStringUrl')
        .field('media.media_url', 'mediaUrl')
        .field('media.preview_url', 'previewUrl')
        .field('media.title', 'title')
        .field('media.media_type', 'mediaType')
        .field('(SELECT count(*) FROM posts comments WHERE comments.parent_type = \'media\' AND comments.parent_id = media.id AND comments.type=\'comment\')', 'commentCount')
        .field('(SELECT IFNULL(SUM(votes_binary.vote),0) FROM votes_binary WHERE votes_binary.parent_type = \'media\' AND votes_binary.parent_id = media.id)', 'voteTotal')
        .where('media.parent_type = ?', 'album')
        .where('media.media_type = \'Image\' OR media.media_type = \'Youtube\' OR media.media_type = \'Audio\'')

        .left_join('media', 'album', 'album.id = media.parent_id')
        .field('album.string_url', 'albumStringUrl')

        .left_join('users', 'poster', 'album.parent_type = \'developer\' AND album.poster_id = poster.id')
        .field('poster.string_url', 'posterStringUrl')
        .field('poster.alias', 'posterAlias')

        .left_join('games', 'game', 'album.parent_type = \'game\' AND album.poster_id = game.id')
        .field('game.string_url', 'subPosterStringUrl')
        .field('game.alias', 'subPosterAlias')

        .limit('50')
        .order('voteTotal', 'desc')
        .where(`media.created between (CURDATE() - INTERVAL 12 YEAR) and (CURDATE() - INTERVAL 6 MONTH)`)
        .having('voteTotal > 0')
        .toString();

    databaseQuery(query, [], (error, allTimeResults) => {
        if (error) {
            res.json({error: error});
            return;
        }

        query = squel.select()
            .from('media')
            .field('media.string_url', 'pieceStringUrl')
            .field('media.media_url', 'mediaUrl')
            .field('media.preview_url', 'previewUrl')
            .field('media.title', 'title')
            .field('media.media_type', 'mediaType')
            .field('(SELECT count(*) FROM posts comments WHERE comments.parent_type = \'media\' AND comments.parent_id = media.id AND comments.type=\'comment\')', 'commentCount')
            .field('(SELECT IFNULL(SUM(votes_binary.vote),0) FROM votes_binary WHERE votes_binary.parent_type = \'media\' AND votes_binary.parent_id = media.id)', 'voteTotal')
            .where('media.parent_type = ?', 'album')
            .where('media.media_type = \'Image\' OR media.media_type = \'Youtube\' OR media.media_type = \'Audio\'')

            .left_join('media', 'album', 'album.id = media.parent_id')
            .field('album.string_url', 'albumStringUrl')

            .left_join('users', 'poster', 'album.parent_type = \'developer\' AND album.poster_id = poster.id')
            .field('poster.string_url', 'posterStringUrl')
            .field('poster.alias', 'posterAlias')

            .left_join('games', 'game', 'album.parent_type = \'game\' AND album.poster_id = game.id')
            .field('game.string_url', 'subPosterStringUrl')
            .field('game.alias', 'subPosterAlias')

            .limit('50')
            .order('voteTotal', 'desc')
            .where(`media.created between (CURDATE() - INTERVAL 6 MONTH ) and (CURDATE() - INTERVAL 1 MONTH)`)
            .having('voteTotal > 0')
            .toString();

        databaseQuery(query, [], (error, lastSixMonths) => {
            if (error) {
                res.json({error: error});
                return;
            }

            query = squel.select()
                .from('media')
                .field('media.string_url', 'pieceStringUrl')
                .field('media.media_url', 'mediaUrl')
                .field('media.preview_url', 'previewUrl')
                .field('media.title', 'title')
                .field('media.media_type', 'mediaType')
                .field('(SELECT count(*) FROM posts comments WHERE comments.parent_type = \'media\' AND comments.parent_id = media.id AND comments.type=\'comment\')', 'commentCount')
                .field('(SELECT IFNULL(SUM(votes_binary.vote),0) FROM votes_binary WHERE votes_binary.parent_type = \'media\' AND votes_binary.parent_id = media.id)', 'voteTotal')
                .where('media.parent_type = ?', 'album')
                .where('media.media_type = \'Image\' OR media.media_type = \'Youtube\' OR media.media_type = \'Audio\'')

                .left_join('media', 'album', 'album.id = media.parent_id')
                .field('album.string_url', 'albumStringUrl')

                .left_join('users', 'poster', 'album.parent_type = \'developer\' AND album.poster_id = poster.id')
                .field('poster.string_url', 'posterStringUrl')
                .field('poster.alias', 'posterAlias')

                .left_join('games', 'game', 'album.parent_type = \'game\' AND album.poster_id = game.id')
                .field('game.string_url', 'subPosterStringUrl')
                .field('game.alias', 'subPosterAlias')

                .limit('50')
                .order('voteTotal', 'desc')
                .where(`media.created between (CURDATE() - INTERVAL 1 MONTH ) and NOW()`)
                .having('voteTotal > 0')
                .toString();

            databaseQuery(query, [], (error, lastOneMonth) => {
                if (error) {
                    res.json({error: error});
                    return;
                }

                allTimeResults = _.shuffle(allTimeResults);
                lastSixMonths = _.shuffle(lastSixMonths);
                lastOneMonth = _.shuffle(lastOneMonth);

                allTimeResults = allTimeResults.slice(0, 9);
                lastSixMonths = lastSixMonths.slice(0, 9);
                lastOneMonth = lastOneMonth.slice(0, 10);

                let allResults = allTimeResults;
                allResults = _.concat(allResults, lastSixMonths);
                allResults = _.concat(allResults, lastOneMonth);

                allResults = _.shuffle(allResults);
                res.json(allResults);
            });
        });
    });
});

module.exports = router;