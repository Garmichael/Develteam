let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    getXpLevelData = require('../../modules/module_xpLevelData'),
    escape = require('js-string-escape'),
    jimp = require('jimp'),
    fs = require('fs'),
    socketHandler = require('../../modules/module_socketHandler'),
    errorLogger = require('../../modules/module_errorLogger');

module.exports = {

    getPost: function (data, callback) {
        let query,
            postId = parseInt(data.postId, 10);


        if (isNaN(postId)) {
            callback({errors: ['No Post Id Set']});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.id', 'id')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.title', 'title')
            .field('posts.content', 'content')
            .field('(SELECT count(*) FROM posts comments WHERE ((posts.type=\'status\' AND comments.parent_type = \'status\' AND comments.parent_id = posts.id) OR (posts.type=\'media\' AND comments.parent_type = \'media\' AND comments.parent_id = posts.content)) AND comments.type=\'comment\')', 'commentCount')
            .field('posts.type', 'type')
            .field('posts.created', 'postDate')
            .field('posts.modified', 'modifiedDate')
            .field('posts.parent_type', 'posterType')
            .field('posts.parent_type', 'parentType')
            .field('posts.parent_id', 'parentId')

            .left_join('media', null, 'posts.type =\'media\' and posts.content = media.id')
            .field('media.id', 'mediaId')
            .field('media.title', 'mediaTitle')
            .field('media.description', 'mediaDescription')
            .field('media.media_url', 'mediaMediaUrl')
            .field('media.media_type', 'mediaType')
            .field('media.string_url', 'mediaStringUrl')
            .field('media.preview_url', 'mediaPreviewImageUrl')
            .field('media.poster_type', 'mediaPosterType')
            .field('media.poster_id', 'mediaPosterId')

            .left_join('media', 'album', 'posts.type =\'media\' and album.id = media.parent_id')
            .field('album.id', 'albumId')
            .field('album.string_url', 'albumStringUrl')

            .left_join('users', null, 'posts.poster_id = users.id')
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.hasBanner', 'posterHasBanner')
            .field('users.has_avatar', 'posterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'posterXp')

            .left_join('games', null, `posts.subposter_type = \'game\' AND posts.subposter_id = games.id`)
            .field('games.id', 'subPosterId')
            .field('games.alias', 'subPosterAlias')
            .field('games.string_url', 'subPosterStringUrl')
            .field('games.hasBanner', 'subPosterHasBanner')
            .field('games.has_avatar', 'subPosterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subPosterXp')

            .where('posts.id = ? ', postId)
            .where('posts.type != \'comment\'')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0141', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Post with this Id']});
                return;
            }

            let record = records[0];

            if (record.type === 'media') {
                record.mediaData = {
                    id: record.mediaId,
                    title: record.mediaTitle,
                    description: record.mediaDescription,
                    mediaUrl: record.mediaMediaUrl,
                    mediaType: record.mediaType,
                    stringUrl: record.mediaStringUrl,
                    previewImageUrl: record.mediaPreviewImageUrl,
                    posterType: record.mediaPosterType,
                    posterId: record.mediaPosterId,
                    albumId: record.albumId,
                    albumStringUrl: record.albumStringUrl
                };
            }

            delete record.mediaId;
            delete record.mediaTitle;
            delete record.mediaDescription;
            delete record.mediaMediaUrl;
            delete record.mediaType;
            delete record.mediaStringUrl;
            delete record.previewImageUrl;
            delete record.mediaPreviewImageUrl;
            delete record.mediaPosterType;
            delete record.mediaPosterId;
            delete record.albumId;
            delete record.albumStringUrl;

            record.posterDetails = {
                id: record.posterId,
                hasBanner: record.posterHasBanner,
                hasAvatar: record.posterHasAvatar,
                alias: record.posterAlias,
                stringUrl: record.posterStringUrl,
                xpLevelData: getXpLevelData(record.posterXp)
            };

            delete record.posterId;
            delete record.posterHasBanner;
            delete record.posterHasAvatar;
            delete record.posterAlias;
            delete record.posterStringUrl;
            delete record.posterXp;

            if (record.subPosterType === 'game') {
                record.subPosterDetails = {
                    id: record.subPosterId,
                    hasBanner: record.subPosterHasBanner,
                    hasAvatar: record.subPosterHasAvatar,
                    alias: record.subPosterAlias,
                    stringUrl: record.subPosterStringUrl,
                    xpLevelData: getXpLevelData(record.subPosterXp)
                };
            }

            delete record.subPosterId;
            delete record.subPosterHasBanner;
            delete record.subPosterHasAvatar;
            delete record.subPosterAlias;
            delete record.subPosterStringUrl;
            delete record.subPosterXp;


            callback(record);
        });
    },

    getPosts: function (data, callback) {
        let errors = [],
            feedType = data.feedType === 'game' || 'home' ? data.feedType : 'developer',
            feedId = parseInt(data.feedId, 10),
            startResult = parseInt(data.startResult, 10),
            limit = parseInt(data.limit, 10),
            direction = data.direction === 'desc' ? 'desc' : 'asc',
            shouldGroup = feedType === 'home',
            postType = ['media', 'blog', 'classifieds'].indexOf(data.postType) === -1 ? 'all' : data.postType,
            query;

        if (feedType !== 'home' && (isNaN(feedId) || feedId === 0)) {
            errors.push('No Feed Id Set');
        }

        if (isNaN(startResult) || startResult < 0) {
            startResult = 0;
        }

        if (isNaN(limit) || limit < 0) {
            limit = 0;
        }

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('posts FORCE INDEX (PRIMARY)')

            .field('posts.id', 'id')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.title', 'title')
            .field('posts.content', 'content')
            .field('(SELECT count(*) FROM posts comments WHERE ((posts.type=\'status\' AND comments.parent_type = \'status\' AND comments.parent_id = posts.id) OR (posts.type=\'media\' AND comments.parent_type = \'media\' AND comments.parent_id = posts.content)) AND comments.type=\'comment\')', 'commentCount')
            .field('posts.type', 'type')
            .field('posts.created', 'postDate')
            .field('posts.modified', 'modifiedDate')
            .field('pinned', 'isPinned')

            .left_join('media', null, 'posts.type =\'media\' and posts.content = media.id')
            .field('media.id', 'mediaId')
            .field('media.title', 'mediaTitle')
            .field('media.description', 'mediaDescription')
            .field('media.media_url', 'mediaMediaUrl')
            .field('media.media_type', 'mediaType')
            .field('media.string_url', 'mediaStringUrl')
            .field('media.preview_url', 'mediaPreviewImageUrl')
            .field('media.poster_type', 'mediaPosterType')
            .field('media.poster_id', 'mediaPosterId')

            .left_join('media', 'album', 'posts.type =\'media\' and album.id = media.parent_id')
            .field('album.id', 'albumId')
            .field('album.string_url', 'albumStringUrl')

            .left_join('users', null, `posts.poster_id = users.id`)
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.hasBanner', 'posterHasBanner')
            .field('users.has_avatar', 'posterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'posterXp')

            .left_join('games', null, `posts.subposter_type = 'game' AND posts.parent_type = 'game' AND posts.parent_id = games.id AND posts.subposter_id = games.id`)
            .field('games.id', 'subPosterId')
            .field('games.alias', 'subPosterAlias')
            .field('games.string_url', 'subPosterStringUrl')
            .field('games.hasBanner', 'subPosterHasBanner')
            .field('games.has_avatar', 'subPosterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subPosterXp')

            //Block posts not made by page
            .where(`(posts.subposter_type = \'developer\' AND posts.poster_id = posts.parent_id) OR (posts.subposter_type = \'game\' AND posts.subposter_id = posts.parent_id)`);

        if (feedType !== 'home') {
            query = query.where('posts.parent_type = ?', feedType)
                .where('posts.parent_id = ?', feedId)
        }

        if (postType === 'media') {
            query = query.where('posts.type = ?', 'media')
        }

        if (postType === 'blog') {
            query = query.where('posts.type = ?', 'status')
        }

        if (postType === 'classifieds') {
            query = query.where('posts.type = ?', 'classifieds')
        }

        if (data.feedType === 'game' || data.feedType === 'developer') {
            query = query.order('pinned', 'desc');
        }

        query = query.order('posts.created', direction);

        query = query.limit(postType === 'media' ? limit * 6 : limit)
            .offset(startResult)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0142', query);
                callback({errors: [error]});
                return;
            }

            records.forEach(function (record) {
                record.posterDetails = {
                    id: record.posterId,
                    hasBanner: record.posterHasBanner,
                    hasAvatar: record.posterHasAvatar,
                    alias: record.posterAlias,
                    stringUrl: record.posterStringUrl,
                    xpLevelData: getXpLevelData(record.posterXp)
                };

                delete record.posterId;
                delete record.posterHasBanner;
                delete record.posterHasAvatar;
                delete record.posterAlias;
                delete record.posterStringUrl;
                delete record.posterXp;

                record.subPosterDetails = {
                    id: record.subPosterId,
                    hasBanner: record.subPosterHasBanner,
                    hasAvatar: record.subPosterHasAvatar,
                    alias: record.subPosterAlias,
                    stringUrl: record.subPosterStringUrl,
                    xpLevelData: getXpLevelData(record.subPosterXp)
                };

                delete record.subPosterId;
                delete record.subPosterHasBanner;
                delete record.subPosterHasAvatar;
                delete record.subPosterAlias;
                delete record.subPosterStringUrl;
                delete record.subPosterXp;

                record.mediaData = {
                    id: record.mediaId,
                    title: record.mediaTitle,
                    description: record.mediaDescription,
                    mediaUrl: record.mediaMediaUrl,
                    mediaType: record.mediaType,
                    stringUrl: record.mediaStringUrl,
                    previewImageUrl: record.mediaPreviewImageUrl,
                    posterType: record.mediaPosterType,
                    posterId: record.mediaPosterId,
                    albumId: record.albumId,
                    albumStringUrl: record.albumStringUrl,
                    posterAlias: record.posterDetails.alias,
                    subPosterAlias: record.subPosterDetails.alias
                };

                delete record.mediaId;
                delete record.mediaTitle;
                delete record.mediaDescription;
                delete record.mediaMediaUrl;
                delete record.mediaType;
                delete record.mediaStringUrl;
                delete record.mediaPreviewImageUrl;
                delete record.mediaPosterType;
                delete record.mediaPosterId;
                delete record.albumId;
                delete record.albumStringUrl;

                record.isPinned = record.isPinned === 1;
            });
            
            if (postType === 'media' && records.length > limit) {
                let groupedPostCount = 0;
                let lastAcceptedRecord = limit;
                for (let index = 1; index < records.length; index++) {
                    let thisPosterDetails = JSON.stringify(records[index].posterDetails);
                    let lastPosterDetails = JSON.stringify(records[index - 1].posterDetails);

                    if (thisPosterDetails !== lastPosterDetails) {
                        groupedPostCount++;
                    }

                    if (groupedPostCount === limit) {
                        lastAcceptedRecord = index;
                        break;
                    }
                }

                records = records.splice(0, lastAcceptedRecord);
            }

            callback(records);
        });

    },

    getPostComments: function (data, callback) {
        let postId = parseInt(data.postId, 10),
            isMediaPost = data.isMediaPost === true || data.isMediaPost === 'true',
            query;

        if (isNaN(postId) || postId === 0) {
            callback({errors: ['No Post Parent Id Set']});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.id', 'id')
            .field('posts.content', 'content')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.created', 'timestamp')
            .field('posts.modified', 'modifiedDate')
            .field('posts.parent_id', 'parentId')

            .left_join('users', null, 'users.id = posts.poster_id')
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.has_avatar', 'posterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'posterXp')

            .left_join('games', null, 'games.id = posts.subposter_id AND posts.subposter_type = \'game\'')
            .field('games.id', 'subposterId')
            .field('games.alias', 'subposterAlias')
            .field('games.string_url', 'subposterStringUrl')
            .field('games.has_avatar', 'subposterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subposterXp')

            .where('type = ?', 'comment')
            .where('parent_type = ?', isMediaPost ? 'media' : 'status')
            .where('parent_id = ?', postId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0143', query);
                callback({errors: [error]});
                return;
            }

            records.forEach(function (record) {
                record.poster = {
                    id: record.posterId,
                    alias: record.posterAlias,
                    stringUrl: record.posterStringUrl,
                    hasAvatar: record.posterHasAvatar,
                    xpLevelData: getXpLevelData(record.posterXp)
                };

                delete record.posterId;
                delete record.posterAlias;
                delete record.posterStringUrl;
                delete record.posterHasAvatar;
                delete record.posterXp;

                if (record.subposterId !== null) {
                    record.subPoster = {
                        id: record.subposterId,
                        alias: record.subposterAlias,
                        stringUrl: record.subposterStringUrl,
                        hasAvatar: record.subposterHasAvatar,
                        xpLevelData: getXpLevelData(record.subposterXp)
                    }
                }

                delete record.subposterId;
                delete record.subposterAlias;
                delete record.subposterStringUrl;
                delete record.subposterHasAvatar;
                delete record.subposterXp;
            });

            callback(records);
        });

    },

    postPost: function (data, callback) {
        let errors = [],
            postParentType = data.postParentType === 'game' ? 'game' : 'developer',
            postParentId = parseInt(data.postParentId, 10),
            title = data.title,
            content = data.content,
            type = data.type === 'classifieds' ? 'classifieds' : 'status',
            query;

        (!data.loggedUser || !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        !content && errors.push('No Post Content Supplied');
        (postParentType === 'game' && (isNaN(postParentId) || postParentId === 0)) && errors.push('No Parent Id Supplied');

        if (data.loggedUser.isLoggedIn && postParentType === 'game') {
            let isGameMember = false;
            data.loggedUser.games.forEach(function (game) {
                if (game.id === postParentId) {
                    isGameMember = true;
                }
            });

            if (!isGameMember) {
                errors.push('Not Validated as part of this game project');
            }
        }

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        if (postParentType === 'developer') {
            postParentId = data.loggedUser.info.id;
        }

        if (!title || typeof title !== 'string') {
            title = '';
        }

        if (postParentType === 'developer') {
            query = squel.insert()
                .into('posts')
                .set('parent_id', postParentId)
                .set('parent_type', postParentType)
                .set('poster_id', postParentId)
                .set('subposter_id', 0)
                .set('subposter_type', postParentType)
                .set('type', type)
                .set('title', escape(title))
                .set('content', escape(content))
                .set('pinned', 0)
                .set('published', 1)
                .toString();
        }

        if (postParentType === 'game') {
            query = squel.insert()
                .into('posts')
                .set('parent_id', postParentId)
                .set('parent_type', postParentType)
                .set('poster_id', data.loggedUser.info.id)
                .set('subposter_id', postParentId)
                .set('subposter_type', postParentType)
                .set('type', type)
                .set('title', escape(title))
                .set('content', escape(content))
                .set('pinned', 0)
                .set('published', 1)
                .toString();
        }

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0144', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            let field = type === 'classifieds'
                ? 'caughtUpOnClassifieds'
                : 'caughtUpOnDevlogs';

            query = squel.update()
                .table('users')
                .where('id != ?', data.loggedUser.info.id)
                .set(field, 0)
                .toString();

            databaseQuery(query, [], function (err, response) {
                socketHandler.getIoInstance().emit('updateUserInfo');
            });

            callback({
                id: records.insertId,
            });
        });
    },

    getPostComment: function (data, callback) {
        let errors = [],
            commentId = parseInt(data.commentId, 10),
            query;

        if (isNaN(commentId) || commentId === 0) {
            errors.push('No Feed Id Set');
        }

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.id', 'id')
            .field('posts.content', 'content')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.created', 'timestamp')
            .field('posts.modified', 'modifiedDate')
            .field('posts.parent_id', 'parentId')

            .left_join('users', null, 'users.id = posts.poster_id')
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.has_avatar', 'posterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'posterXp')

            .left_join('games', null, 'posts.subposter_type = \'game\' AND games.id = posts.subposter_id')
            .field('games.id', 'subposterId')
            .field('games.alias', 'subposterAlias')
            .field('games.string_url', 'subposterStringUrl')
            .field('games.has_avatar', 'subposterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subposterXp')

            .left_join('posts', 'parentPost', '(parentPost.type = \'media\' AND parentPost.content = posts.parent_id) OR (parentPost.type = \'status\' AND posts.parent_id = parentPost.id)')
            .field('parentPost.id', 'parentPostId')
            .field('parentPost.parent_type', 'parentPostParentType')
            .field('parentPost.parent_id', 'parentPostParentId')

            .left_join('media', 'piece', 'parentPost.type = \'media\' AND parentPost.content = piece.id')
            .field('piece.id', 'pieceId')

            .left_join('media', 'album', 'parentPost.type = \'media\' AND piece.parent_id = album.id')
            .field('album.id', 'albumId')

            .where('posts.id = ?', commentId)
            .where('posts.type = \'comment\'')
            .toString();

        databaseQuery(query, [], function (error, comments) {
            if (error) {
                errorLogger(error, 'DTE_0145', query);
                callback({errors: [error]});
                return;
            }

            if (comments.length === 0) {
                callback({errors: ['No Comment Found by set Id']});
                return;
            }

            let comment = comments[0],
                parentData,
                albumData,
                pieceData;

            comment.poster = {
                id: comment.posterId,
                alias: comment.posterAlias,
                stringUrl: comment.posterStringUrl,
                hasAvatar: comment.posterHasAvatar,
                xpLevelData: getXpLevelData(comment.posterXp)
            };

            delete comment.posterId;
            delete comment.posterAlias;
            delete comment.posterStringUrl;
            delete comment.posterHasAvatar;
            delete comment.posterXp;

            if (comment.subposterId) {
                comment.subPoster = {
                    id: comment.subposterId,
                    alias: comment.subposterAlias,
                    stringUrl: comment.subposterStringUrl,
                    hasAvatar: comment.subposterHasAvatar,
                    xpLevelData: getXpLevelData(comment.subposterXp)
                }
            }

            delete comment.subposterId;
            delete comment.subposterAlias;
            delete comment.subposterStringUrl;
            delete comment.subposterHasAvatar;
            delete comment.subposterHasAvatar;
            delete comment.subposterXp;

            parentData = {
                id: comment.parentPostId,
                parentType: comment.parentPostParentType,
                parentId: comment.parentPostParentId
            };

            delete comment.parentPostId;
            delete comment.parentPostParentType;
            delete comment.parentPostParentId;


            if (comment.albumId) {
                albumData = {
                    id: comment.albumId
                };
            }

            delete comment.albumId;

            if (comment.pieceId) {
                pieceData = {
                    id: comment.pieceId
                };
            }

            delete comment.pieceId;

            callback({
                commentData: comment,
                parentData: parentData,
                albumData: albumData,
                pieceData: pieceData
            });
        })
    },

    postPostComment: function (data, callback) {
        let errors = [],
            content = data.content,
            parentId = parseInt(data.parentId, 10),
            postAsType = data.postAsType,
            postAsId = parseInt(data.postAsId, 10),
            isMediaPost = data.isMediaPost === true || data.isMediaPost === 'true',
            query,
            queries = this;

        (!data.loggedUser || !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (!content || content === 'undefined' || typeof content !== 'string') && errors.push('No Content Set');
        (isNaN(parentId) || parentId === 0) && errors.push('No Post Id Set');
        ((isNaN(postAsId) || postAsId === 0) && postAsType !== 'developer') && errors.push('No Post As Id Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        postAsType = postAsType === 'game' ? 'game' : 'developer';

        query = squel.insert()
            .into('posts')
            .set('parent_id', parentId)
            .set('parent_type', isMediaPost ? 'media' : 'status')
            .set('poster_id', data.loggedUser.info.id)
            .set('subposter_id', postAsId ? postAsId : 0)
            .set('subposter_type', postAsType)
            .set('type', 'comment')
            .set('title', '')
            .set('content', escape(content))
            .set('pinned', 0)
            .set('published', 1)
            .toString();


        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0146', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            let notificationQueries = require('../notifications/queries');

            if (!isMediaPost) {
                notificationQueries.sendNotificationForPost({
                    loggedUser: data.loggedUser,
                    postId: parentId,
                    action: 'comment'
                });
            }

            if (isMediaPost) {
                notificationQueries.sendNotificationForMedia({
                    loggedUser: data.loggedUser,
                    mediaId: parentId,
                    action: 'comment'
                });
            }

            queries.getPostComment({
                    commentId: records.insertId
                },
                function (commentData) {
                    callback(commentData);
                });
        });

    },

    editPostOrComment: function (data, callback) {
        let errors = [],
            postId = parseInt(data.postId, 10),
            newTitle = data.newTitle,
            newContent = data.newContent,
            query,
            queries = this;

        !data.loggedUser && data.loggedUser.isLoggedIn && errors.push('Not Logged In');
        (isNaN(postId) || postId === 0) && errors.push('Post Id not Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.poster_id', 'posterId')
            .field('posts.subposter_id', 'subPosterId')
            .field('posts.type', 'type')
            .field('posts.subposter_type', 'subPosterType')
            .where('posts.id = ?', postId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0147', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            records.length === 0 && errors.push('No matching Id exists');
            (records[0] && records[0].subPosterType === 'developer' && records[0].posterId !== data.loggedUser.info.id) && errors.push('Not your post to edit');

            if (records[0] && records[0].subPosterType === 'game') {
                let isGameMember = false;
                data.loggedUser.games.forEach(function (game) {
                    if (game.id === records[0].subPosterId) {
                        isGameMember = true;
                    }
                });

                if (!isGameMember) {
                    errors.push('Not Validated to Edit Posts on Game Projects Logged User Is Not a Member of');
                }

                if (isGameMember && records[0].posterId !== data.loggedUser.info.id) {
                    errors.push('Not Validated to Edit Posts not made by Logged User');
                }
            }

            if (errors.length > 0) {
                callback({errors: errors});
                return;
            }

            query = squel.update()
                .table('posts')
                .set('title', escape(newTitle))
                .set('content', escape(newContent))
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (errors, updateResponse) {
                if (errors) {
                    errorLogger(error, 'DTE_0148', query, null, data.loggedUser);
                    callback({errors: [errors]});
                    return;
                }

                if (records[0].type === 'comment') {
                    queries.getPostComment({commentId: postId}, function (comment) {
                        callback(comment);
                    });
                } else {
                    queries.getPost({postId: postId}, function (post) {
                        callback(post);
                    });
                }
            });

        });
    },

    deletePostOrComment: function (data, callback) {
        let errors = [],
            postId = parseInt(data.postId, 10),
            query;

        (!data.loggedUser || !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (isNaN(postId) || postId === 0) && errors.push('Post Id not Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.id', 'id')
            .field('posts.type', 'type')
            .field('posts.parent_type', 'parentType')
            .field('posts.parent_id', 'parentId')
            .field('posts.poster_id', 'posterId')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.subposter_id', 'subPosterId')

            .left_join('posts', 'parentPost', '(posts.parent_type = \'status\' AND posts.parent_id = parentPost.id) OR (posts.parent_type = \'media\' AND parentPost.content = posts.parent_id)')
            .field('parentPost.id', 'parentPostId')
            .field('parentPost.parent_type', 'parentPostParentType')
            .field('parentPost.parent_id', 'parentPostParentId')

            .left_join('media', 'piece', 'piece.id = posts.parent_id')
            .field('piece.id', 'pieceId')

            .left_join('media', 'album', 'album.id = piece.parent_id')
            .field('album.id', 'albumId')

            .where('posts.id = ?', postId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0149', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No matching Id exists']});
                return;
            }

            let record = records[0];

            if (record.posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not your post to delete']});
                return;
            }

            record.parentData = {
                id: record.parentPostId,
                parentType: record.parentPostParentType,
                parentId: record.parentPostParentId
            };

            delete record.parentPostId;
            delete record.parentPostParentType;
            delete record.parentPostParentId;

            record.albumData = {
                id: record.albumId
            };

            delete record.albumId;

            record.pieceData = {
                id: record.pieceId
            };

            delete record.pieceId;

            query = squel.delete()
                .from('posts')
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, updateResponse) {
                if (error) {
                    errorLogger(error, 'DTE_0150', query, null, data.loggedUser);
                    callback({errors: [error]});
                    return;
                }

                callback(record);
            });

        });
    },

    togglePin: function (data, callback) {
        let errors = [],
            postId = parseInt(data.postId, 10),
            query;

        (!data.loggedUser || !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (isNaN(postId) || postId === 0) && errors.push('Post Id not Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('posts')
            .field('posts.id', 'id')
            .field('posts.type', 'type')
            .field('posts.parent_type', 'parentType')
            .field('posts.parent_id', 'parentId')
            .field('posts.poster_id', 'posterId')
            .field('posts.subposter_type', 'subPosterType')
            .field('posts.subposter_id', 'subPosterId')
            .field('posts.pinned', 'isPinned')

            .left_join('posts', 'parentPost', '(posts.parent_type = \'status\' AND posts.parent_id = parentPost.id) OR (posts.parent_type = \'media\' AND parentPost.content = posts.parent_id)')
            .field('parentPost.id', 'parentPostId')
            .field('parentPost.parent_type', 'parentPostParentType')
            .field('parentPost.parent_id', 'parentPostParentId')

            .left_join('media', 'piece', 'piece.id = posts.parent_id')
            .field('piece.id', 'pieceId')

            .left_join('media', 'album', 'album.id = piece.parent_id')
            .field('album.id', 'albumId')

            .where('posts.id = ?', postId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0149', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No matching Id exists']});
                return;
            }

            let record = records[0];

            if (record.posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not your post to delete']});
                return;
            }

            record.parentData = {
                id: record.parentPostId,
                parentType: record.parentPostParentType,
                parentId: record.parentPostParentId
            };

            delete record.parentPostId;
            delete record.parentPostParentType;
            delete record.parentPostParentId;

            record.albumData = {
                id: record.albumId
            };

            delete record.albumId;

            record.pieceData = {
                id: record.pieceId
            };

            delete record.pieceId;

            query = squel.update()
                .table('posts')
                .set('pinned', record.isPinned === 0 ? 1 : 0)
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, updateResponse) {
                if (error) {
                    errorLogger(error, 'DTE_0150p', query, null, data.loggedUser);
                    callback({errors: [error]});
                    return;
                }

                record.isPinned = record.isPinned === 0 ? 1 : 0;
                callback(record);
            });

        });
    }
}
;