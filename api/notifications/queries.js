let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    escape = require('js-string-escape'),
    fs = require('fs'),
    socketHandler = require('../../modules/module_socketHandler'),
    _ = require('lodash'),
    errorLogger = require('../../modules/module_errorLogger');

function getPostNotifications(data, callback) {
    let query;

    query = squel.select()
        .from('notifications_posts')
        .field('notifications_posts.action', 'action')
        .field('notifications_posts.created', 'created')
        .field('notifications_posts.hasBeenRead', 'hasBeenRead')

        .left_join('posts', null, 'posts.id = notifications_posts.post_id')
        .field('posts.id', 'postId')
        .field('CONCAT(SUBSTRING(content,1, 30), \'...\')', 'blurb')

        .left_join('users', null, 'posts.poster_id = users.id AND posts.subposter_type = \'developer\'')
        .field('users.id', 'devPosterId')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'devPosterAlias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'devPosterStringUrl')

        .left_join('games', null, 'posts.subposter_id = games.id AND posts.subposter_type = \'game\'')
        .field('games.id', 'gamePosterId')
        .field('games.alias', 'gamePosterAlias')
        .field('games.string_url', 'gamePosterStringUrl')

        .where('receiver_id = ?', data.loggedUser.info.id)
        .order('notifications_posts.hasBeenRead', 'asc')
        .order('notifications_posts.created', 'desc')
        .toString();

    databaseQuery(query, [], function (error, postNotifications) {
        let notificationsToSend = [],
            groupedNotifications = {};

        if (error) {
            errorLogger(error, 'DTE_0225', query);
            callback({errors: [error]});
            return;
        }

        postNotifications.forEach(function (postNotification) {
            let notificationIdentifier = 'post.' + postNotification.postId + '.' + postNotification.action;

            if (!groupedNotifications[notificationIdentifier]) {
                groupedNotifications[notificationIdentifier] = {
                    hasBeenRead: postNotification.hasBeenRead,
                    created: postNotification.created,
                    total: 1
                };
            } else {
                groupedNotifications[notificationIdentifier].total += 1;

                if (postNotification.hasBeenRead === 0) {
                    groupedNotifications[notificationIdentifier].hasBeenRead = 0;
                }

                if (postNotification.created < groupedNotifications[notificationIdentifier].created) {
                    groupedNotifications[notificationIdentifier].created = postNotification.created;
                }

            }

            if (postNotification.devPosterId) {
                groupedNotifications[notificationIdentifier].link = '/Developer/' + postNotification.devPosterStringUrl + '/Post/' + postNotification.postId;

                if (postNotification.devPosterId === data.loggedUser.info.id) {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (postNotification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on your Feed Post: ' +
                        '"' + postNotification.blurb + '"';
                } else {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (postNotification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on ' +
                        postNotification.devPosterAlias + '\'s  Feed Post: ' +
                        '"' + postNotification.blurb + '"';
                }
            }

            if (postNotification.gamePosterId) {
                groupedNotifications[notificationIdentifier].link = '/Game/' + postNotification.gamePosterStringUrl + '/Post/' + postNotification.postId;

                if (postNotification.gamePosterId === data.loggedUser.info.id) {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (postNotification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on your Feed Post: ' +
                        '"' + postNotification.blurb + '"';
                } else {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (postNotification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on ' +
                        postNotification.gamePosterAlias + '\'s  Feed Post: ' +
                        '"' + postNotification.blurb + '"';
                }
            }

            groupedNotifications[notificationIdentifier].notificationIdentifier = notificationIdentifier;
        });

        _.each(groupedNotifications, function (thisNotification) {
            if (thisNotification.link && thisNotification.text) {
                notificationsToSend.push(thisNotification);
            }
        });

        callback(notificationsToSend);
    })
}

function getCommentNotifications(data, callback) {
    let query;

    query = squel.select()
        .from('notifications_comments')
        .field('notifications_comments.action', 'action')
        .field('notifications_comments.created', 'created')
        .field('notifications_comments.hasBeenRead', 'hasBeenRead')

        //COMMENT
        .left_join('posts', 'comment', 'comment.id = notifications_comments.comment_id')
        .field('comment.id', 'commentId')
        .field('CONCAT(SUBSTRING(comment.content,1, 30), \'...\')', 'blurb')

        //ORIGINAL POST
        .left_join('posts', 'originalPost', 'originalPost.id = comment.parent_id AND comment.parent_type = \'status\'')
        .field('originalPost.id', 'originalPostId')

        //poster: user
        .left_join('users', 'originalDevPoster', 'originalDevPoster.id = originalPost.poster_id AND originalPost.subposter_type = \'developer\'')
        .field('originalDevPoster.id', 'originalDevPosterId')
        .field('originalDevPoster.alias', 'originalDevPosterAlias')
        .field('originalDevPoster.string_url', 'originalDevPosterStringUrl')

        //poster: game
        .left_join('games', 'originalGamePoster', 'originalGamePoster.id = originalPost.subposter_id AND originalPost.subposter_type = \'game\'')
        .field('originalGamePoster.id', 'originalGamePosterId')
        .field('originalGamePoster.alias', 'originalGamePosterAlias')
        .field('originalGamePoster.string_url', 'originalGamePosterStringUrl')

        //ORIGINAL MEDIA
        .left_join('media', 'originalMedia', 'originalMedia.id = comment.parent_id AND comment.parent_type = \'media\'')
        .field('originalMedia.id', 'originalMediaId')
        .field('originalMedia.string_url', 'originalPostMediaStringUrl')

        //ORIGINAL MEDIA ALBUM
        .left_join('media', 'originalMediaAlbum', 'originalMediaAlbum.id = originalMedia.parent_id')
        .field('originalMediaAlbum.id', 'originalMediaAlbumId')
        .field('originalMediaAlbum.string_url', 'originalMediaAlbumStringUrl')
        .field('originalMediaAlbum.parent_type', 'originalMediaAlbumParentType')

        //poster: user
        .left_join('users', 'originalDevMediaPoster', 'originalDevMediaPoster.id = originalMedia.poster_id AND originalMedia.poster_type = \'developer\'')
        .field('originalDevMediaPoster.id', 'originalDevMediaPosterId')
        .field('originalDevMediaPoster.alias', 'originalDevMediaPosterAlias')
        .field('originalDevMediaPoster.string_url', 'originalDevMediaPosterStringUrl')

        //poster: game
        .left_join('games', 'originalGameMediaPoster', 'originalGameMediaPoster.id = originalMedia.poster_id AND originalMedia.poster_type = \'game\'')
        .field('originalGameMediaPoster.id', 'originalGameMediaPosterId')
        .field('originalGameMediaPoster.alias', 'originalGameMediaPosterAlias')
        .field('originalGameMediaPoster.string_url', 'originalGameMediaPosterStringUrl')


        .where('receiver_id =?', data.loggedUser.info.id)
        .order('notifications_comments.hasBeenRead', 'asc')
        .order('notifications_comments.created', 'desc')
        .toString();

    databaseQuery(query, [], function (error, notifications) {
        let notificationsToSend = [],
            groupedNotifications = {};

        if (error) {
            errorLogger(error, 'DTE_0226', query);
            callback({errors: [error]});
            return;
        }

        notifications.forEach(function (notification) {
            let notificationIdentifier = 'comment.' + notification.commentId + '.' + notification.action;

            if (!groupedNotifications[notificationIdentifier]) {
                groupedNotifications[notificationIdentifier] = {
                    hasBeenRead: notification.hasBeenRead,
                    created: notification.created,
                    total: 1
                };
            } else {
                groupedNotifications[notificationIdentifier].total += 1;

                if (notification.hasBeenRead === 0) {
                    groupedNotifications[notificationIdentifier].hasBeenRead = 0;
                }

                if (notification.created < groupedNotifications[notificationIdentifier].created) {
                    groupedNotifications[notificationIdentifier].created = notification.created;
                }
            }

            if (notification.originalPostId) {
                if (notification.originalDevPosterId) {
                    groupedNotifications[notificationIdentifier].link = '/Developer/' + notification.originalDevPosterStringUrl + '/Post/' + notification.originalPostId;
                }

                if (notification.originalGamePosterId) {
                    groupedNotifications[notificationIdentifier].link = '/Game/' + notification.originalGamePosterStringUrl + '/Post/' + notification.originalPostId;
                }

                groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                    ' ' +
                    (notification.action === 'upvote' ? 'Upvote' : 'Comment') +
                    (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                    ' on your Comment: ' +
                    '"' + notification.blurb + '"';
            }

            if (notification.originalMediaId) {
                if (notification.originalMediaAlbumParentType) {
                    groupedNotifications[notificationIdentifier].link = '/Developer/' +
                        notification.originalDevMediaPosterStringUrl +
                        '/Portfolio/' +
                        notification.originalMediaAlbumStringUrl +
                        '/' +
                        notification.originalPostMediaStringUrl;
                }

                if (notification.originalGameMediaPosterId) {
                    groupedNotifications[notificationIdentifier].link = '/Game/' +
                        notification.originalGameMediaPosterStringUrl +
                        '/Media/' +
                        notification.originalMediaAlbumStringUrl +
                        '/' +
                        notification.originalPostMediaStringUrl;
                }

                groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                    ' ' +
                    (notification.action === 'upvote' ? 'Upvote' : 'Comment') +
                    (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                    ' on your Comment: ' +
                    '"' + notification.blurb + '"';
            }

            groupedNotifications[notificationIdentifier].notificationIdentifier = notificationIdentifier;
        });

        _.each(groupedNotifications, function (thisNotification) {
            if (thisNotification.link && thisNotification.text) {
                notificationsToSend.push(thisNotification);
            }
        });

        callback(notificationsToSend);
    });
}

function getMediaNotifications(data, callback) {
    let query;

    query = squel.select()
        .from('notifications_media')
        .field('notifications_media.action', 'action')
        .field('notifications_media.created', 'created')
        .field('notifications_media.hasBeenRead', 'hasBeenRead')

        .left_join('media', null, 'media.id = notifications_media.media_id')
        .field('media.id', 'mediaId')
        .field('media.title', 'mediaTitle')
        .field('media.string_url', 'mediaStringUrl')

        .left_join('media', 'album', 'album.id = media.parent_id')
        .field('album.id', 'albumId')
        .field('album.title', 'albumTitle')
        .field('album.string_url', 'albumStringUrl')

        .left_join('users', null, 'media.poster_id = users.id AND media.poster_type=\'developer\'')
        .field('users.id', 'devPosterId')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'devPosterAlias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'devPosterStringUrl')

        .left_join('games', null, 'media.poster_id = games.id AND media.poster_type = \'game\'')
        .field('games.id', 'gamePosterId')
        .field('games.alias', 'gamePosterAlias')
        .field('games.string_url', 'gamePosterStringUrl')

        .where('receiver_id = ?', data.loggedUser.info.id)
        .order('notifications_media.hasBeenRead', 'asc')
        .order('notifications_media.created', 'desc')
        .toString();

    databaseQuery(query, [], function (error, notifications) {
        let notificationsToSend = [],
            groupedNotifications = {};

        if (error) {
            errorLogger(error, 'DTE_0227', query);
            callback({errors: [error]});
            return;
        }

        notifications.forEach(function (notification) {
            let notificationIdentifier = 'media.' + notification.mediaId + '.' + notification.action;

            if (!groupedNotifications[notificationIdentifier]) {
                groupedNotifications[notificationIdentifier] = {
                    hasBeenRead: notification.hasBeenRead,
                    created: notification.created,
                    total: 1
                };
            } else {
                groupedNotifications[notificationIdentifier].total += 1;

                if (notification.hasBeenRead === 0) {
                    groupedNotifications[notificationIdentifier].hasBeenRead = 0;
                }

                if (notification.created < groupedNotifications[notificationIdentifier].created) {
                    groupedNotifications[notificationIdentifier].created = notification.created;
                }
            }

            if (notification.devPosterId) {
                groupedNotifications[notificationIdentifier].link = '/Developer/' +
                    notification.devPosterStringUrl +
                    '/Portfolio/' +
                    notification.albumStringUrl +
                    '/' +
                    notification.mediaStringUrl;

                groupedNotifications[notificationIdentifier].text = "Bah Dev"

                if (notification.devPosterId === data.loggedUser.info.id) {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (notification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on your Portfolio Piece: ' +
                        notification.mediaTitle;
                } else {
                    groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                        ' ' +
                        (notification.action === 'upvote' ? 'Upvote' : 'Comment') +
                        (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                        ' on ' +
                        notification.devPosterAlias + '\'s  Portfolio Piece: ' +
                        notification.mediaTitle;
                }
            }

            if (notification.gamePosterId) {
                groupedNotifications[notificationIdentifier].link = '/Game/' +
                    notification.gamePosterStringUrl +
                    '/Media/' +
                    notification.albumStringUrl +
                    '/' +
                    notification.mediaStringUrl;

                groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                    ' ' +
                    (notification.action === 'upvote' ? 'Upvote' : 'Comment') +
                    (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                    ' on ' +
                    notification.gamePosterAlias + '\'s  Media Piece: ' +
                    notification.mediaTitle;
            }

            groupedNotifications[notificationIdentifier].notificationIdentifier = notificationIdentifier;
        });

        _.each(groupedNotifications, function (thisNotification) {
            if (thisNotification.link && thisNotification.text) {
                notificationsToSend.push(thisNotification);
            }
        });

        callback(notificationsToSend);

    })

}

function getForumThreadNotifications(data, callback) {
    let query;

    query = squel.select()
        .from('notifications_forum_threads')
        .field('notifications_forum_threads.action', 'action')
        .field('notifications_forum_threads.created', 'created')
        .field('notifications_forum_threads.hasBeenRead', 'hasBeenRead')

        .left_join('forums_threads', null, 'forums_threads.id = notifications_forum_threads.forum_thread_id')
        .field('forums_threads.id', 'threadId')
        .field('forums_threads.title', 'threadTitle')
        .field('forums_threads.string_url', 'threadStringUrl')

        .left_join('users', null, 'users.id = forums_threads.poster_id')
        .field('users.id', 'threadPosterId')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'threadPosterAlias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'threadPosterStringUrl')

        .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
        .field('forums_forums.string_url', 'forumStringUrl')

        .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
        .field('forums_categories.string_url', 'categoryStringUrl')
        .field('forums_categories.parent_type', 'forumParentType')
        .field('forums_categories.parent_id', 'forumParentId')

        .left_join('games', null, 'games.id = forums_categories.parent_id AND forums_categories.parent_type = \'Game\'')
        .field('games.id', 'gamesId')
        .field('games.alias', 'gameAlias')
        .field('games.string_url', 'gameStringUrl')

        .where('receiver_id = ?', data.loggedUser.info.id)
        .order('notifications_forum_threads.hasBeenRead', 'asc')
        .order('notifications_forum_threads.created', 'desc')

        .toString();

    databaseQuery(query, [], function (error, notifications) {
        let notificationsToSend = [],
            groupedNotifications = {};

        if (error) {
            errorLogger(error, 'DTE_0228', query);
            callback({errors: [error]});
            return;
        }

        notifications.forEach(function (notification) {
            let notificationIdentifier = 'forumThread.' + notification.threadId + '.' + notification.action;
            if (!groupedNotifications[notificationIdentifier]) {
                groupedNotifications[notificationIdentifier] = {
                    hasBeenRead: notification.hasBeenRead,
                    created: notification.created,
                    total: 1
                };
            } else {
                groupedNotifications[notificationIdentifier].total += 1;

                if (notification.hasBeenRead === 0) {
                    groupedNotifications[notificationIdentifier].hasBeenRead = 0;
                }

                if (notification.created < groupedNotifications[notificationIdentifier].created) {
                    groupedNotifications[notificationIdentifier].created = notification.created;
                }
            }

            if (notification.forumParentType === 'Forums') {
                groupedNotifications[notificationIdentifier].link = '/Forums/' +
                    notification.categoryStringUrl + '/' +
                    notification.forumStringUrl + '/' +
                    notification.threadStringUrl;
            }

            if (notification.forumParentType === 'Game') {
                groupedNotifications[notificationIdentifier].link = '/Game/' +
                    notification.gameStringUrl + '/' +
                    'Forums/' +
                    notification.categoryStringUrl + '/' +
                    notification.forumStringUrl + '/' +
                    notification.threadStringUrl;
            }

            groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                ' ' +
                (notification.action === 'upvote' ? 'Upvote' : 'Post') +
                (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                ' on the Forum Thread: ' +
                notification.threadTitle;

            groupedNotifications[notificationIdentifier].notificationIdentifier = notificationIdentifier;
        });

        _.each(groupedNotifications, function (thisNotification) {
            if (thisNotification.link && thisNotification.text) {
                notificationsToSend.push(thisNotification);
            }
        });

        callback(notificationsToSend);
    });
}

function getForumPostNotifications(data, callback) {
    let query;

    query = squel.select()
        .from('notifications_forum_posts')
        .field('notifications_forum_posts.action', 'action')
        .field('notifications_forum_posts.created', 'created')
        .field('notifications_forum_posts.hasBeenRead', 'hasBeenRead')

        .left_join('forums_posts', null, 'forums_posts.id = notifications_forum_posts.forum_post_id')
        .field('forums_posts.id', 'postId')
        .field('CONCAT(SUBSTRING(forums_posts.content,1, 30), \'...\')', 'blurb')

        .left_join('forums_threads', null, 'forums_threads.id = forums_posts.parent_id')
        .field('forums_threads.id', 'threadId')
        .field('forums_threads.title', 'threadTitle')
        .field('forums_threads.string_url', 'threadStringUrl')

        .left_join('users', null, 'users.id = forums_threads.poster_id')
        .field('users.id', 'threadPosterId')
        .field(`IFNULL(users.alias, 'DELETED USER')`, 'threadPosterAlias')
        .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'threadPosterStringUrl')

        .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
        .field('forums_forums.string_url', 'forumStringUrl')

        .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
        .field('forums_categories.string_url', 'categoryStringUrl')
        .field('forums_categories.parent_type', 'forumParentType')
        .field('forums_categories.parent_id', 'forumParentId')

        .left_join('games', null, 'games.id = forums_categories.parent_id AND forums_categories.parent_type = \'Game\'')
        .field('games.id', 'gamesId')
        .field('games.alias', 'gameAlias')
        .field('games.string_url', 'gameStringUrl')

        .where('receiver_id = ?', data.loggedUser.info.id)
        .order('notifications_forum_posts.hasBeenRead', 'asc')
        .order('notifications_forum_posts.created', 'desc')

        .toString();

    databaseQuery(query, [], function (error, notifications) {
        let notificationsToSend = [],
            groupedNotifications = {};

        if (error) {
            errorLogger(error, 'DTE_0229', query);
            callback({errors: [error]});
            return;
        }

        notifications.forEach(function (notification) {
            let notificationIdentifier = 'forumPost.' + notification.postId + '.' + notification.action;
            if (!groupedNotifications[notificationIdentifier]) {
                groupedNotifications[notificationIdentifier] = {
                    hasBeenRead: notification.hasBeenRead,
                    created: notification.created,
                    total: 1
                };
            } else {
                groupedNotifications[notificationIdentifier].total += 1;

                if (notification.hasBeenRead === 0) {
                    groupedNotifications[notificationIdentifier].hasBeenRead = 0;
                }

                if (notification.created < groupedNotifications[notificationIdentifier].created) {
                    groupedNotifications[notificationIdentifier].created = notification.created;
                }
            }

            if (notification.forumParentType === 'Forums') {
                groupedNotifications[notificationIdentifier].link = '/Forums/' +
                    notification.categoryStringUrl + '/' +
                    notification.forumStringUrl + '/' +
                    notification.threadStringUrl;
            }

            if (notification.forumParentType === 'Game') {
                groupedNotifications[notificationIdentifier].link = '/Game/' +
                    notification.gameStringUrl + '/' +
                    'Forums/' +
                    notification.categoryStringUrl + '/' +
                    notification.forumStringUrl + '/' +
                    notification.threadStringUrl;
            }

            groupedNotifications[notificationIdentifier].text = groupedNotifications[notificationIdentifier].total +
                ' ' +
                (notification.action === 'upvote' ? 'Upvote' : 'Post') +
                (groupedNotifications[notificationIdentifier].total !== 1 ? 's' : '') +
                ' on your Forum Post: ' +
                '"' + notification.blurb + '"';

            groupedNotifications[notificationIdentifier].notificationIdentifier = notificationIdentifier;
        });

        _.each(groupedNotifications, function (thisNotification) {
            if (thisNotification.link && thisNotification.text) {
                notificationsToSend.push(thisNotification);
            }
        });

        callback(notificationsToSend);
    });
}

function sendSockets(memberId) {
    let query = squel.select()
        .from('users')
        .field('passkey', 'passkey')
        .where('id = ?', memberId)
        .toString();

    databaseQuery(query, [], function (error, memberData) {
        if (!error && memberData.length === 1) {
            socketHandler.getIoInstance().to('user_' + memberData[0].passkey).emit('notificationsUpdated');
        }
    });

}

module.exports = {
    getNotifications(data, callback){
        let query,
            notificationsToSend = [];

        if (!data.loggedUser.isLoggedIn) {
            callback({notifications: []});
            return;
        }

        getPostNotifications(data, function (notifications) {
            notificationsToSend = _.concat(notificationsToSend, notifications);

            getCommentNotifications(data, function (notifications) {
                notificationsToSend = _.concat(notificationsToSend, notifications);

                getMediaNotifications(data, function (notifications) {
                    notificationsToSend = _.concat(notificationsToSend, notifications);

                    getForumThreadNotifications(data, function (notifications) {
                        notificationsToSend = _.concat(notificationsToSend, notifications);

                        getForumPostNotifications(data, function (notifications) {
                            notificationsToSend = _.concat(notificationsToSend, notifications);

                            notificationsToSend.sort(function (a, b) {
                                if (a.hasBeenRead === b.hasBeenRead) {
                                    return b.created - a.created;
                                } else {
                                    return a.hasBeenRead - b.hasBeenRead;
                                }
                            });

                            callback({notifications: notificationsToSend})

                        });
                    });
                });
            });
        });
    },

    markRead(data, callback){
        let query,
            notificationIdentifier = data.notificationIdentifier,
            idSegments,
            idData;

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (typeof notificationIdentifier !== 'string') {
            callback({errors: ['Invalid Notification Identifier']});
            return;
        }

        idSegments = notificationIdentifier.split('.');

        if (idSegments.length !== 3) {
            callback({errors: ['Invalid Notification Identifier']});
            return;
        }

        idData = {
            type: idSegments[0],
            targetId: parseInt(idSegments[1], 10),
            action: idSegments[2]
        };

        if (['post', 'comment', 'forumPost', 'forumThread', 'media'].indexOf(idData.type) === -1 ||
            ['upvote', 'comment'].indexOf(idData.action) === -1 ||
            isNaN(idData.targetId) ||
            idData.targetId == 0
        ) {
            callback({errors: ['Invalid Notification Identifier']});
            return;
        }

        if (idData.type === 'post') {
            query = squel.update()
                .table('notifications_posts')
                .set('hasBeenRead', 1)
                .where('post_id = ?', idData.targetId)
                .where('receiver_id = ?', data.loggedUser.info.id)
                .where('action =?', idData.action)
                .toString();
        } else if (idData.type === 'media') {
            query = squel.update()
                .table('notifications_media')
                .set('hasBeenRead', 1)
                .where('media_id = ?', idData.targetId)
                .where('receiver_id = ?', data.loggedUser.info.id)
                .where('action =?', idData.action)
                .toString();
        } else if (idData.type === 'comment') {
            query = squel.update()
                .table('notifications_comments')
                .set('hasBeenRead', 1)
                .where('comment_id = ?', idData.targetId)
                .where('receiver_id = ?', data.loggedUser.info.id)
                .where('action =?', idData.action)
                .toString();
        } else if (idData.type === 'forumPost') {
            query = squel.update()
                .table('notifications_forum_posts')
                .set('hasBeenRead', 1)
                .where('forum_post_id = ?', idData.targetId)
                .where('receiver_id = ?', data.loggedUser.info.id)
                .where('action =?', idData.action)
                .toString();
        } else if (idData.type === 'forumThread') {
            query = squel.update()
                .table('notifications_forum_threads')
                .set('hasBeenRead', 1)
                .where('forum_thread_id = ?', idData.targetId)
                .where('receiver_id = ?', data.loggedUser.info.id)
                .where('action =?', idData.action)
                .toString();
        }

        if (query) {
            databaseQuery(query, [], function (error, updateResponse) {
                callback({response: 'ok'});
                sendSockets(data.loggedUser.info.id);
            });
        } else {
            callback({notificationIdentifier})
        }
    },

    sendNotificationForForumThread(data, callback){
        let query,
            threadId = parseInt(data.threadId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(threadId) || threadId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'comment') {
            query = squel.select()
                .from('forums_posts')
                .field('forums_posts.poster_id', 'posterId')
                .where('forums_posts.parent_id = ?', threadId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0230', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                let members = _.map(postData, 'posterId');
                members = _.uniq(members);

                members.forEach(function (member) {
                    if (member !== data.loggedUser.info.id) {
                        query = squel.insert()
                            .into('notifications_forum_threads')
                            .set('receiver_id', member)
                            .set('sender_id', data.loggedUser.info.id)
                            .set('forum_thread_id', threadId)
                            .set('action', 'comment')
                            .toString();

                        databaseQuery(query, [], function (error, insertResponse) {
                            sendSockets(member);
                        });
                    }
                });
            });
        }
    },

    sendNotificationForForumPost(data, callback){
        let query,
            postId = parseInt(data.postId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(postId) || postId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('forums_posts')
                .field('forums_posts.poster_id', 'posterId')
                .where('forums_posts.id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0231', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                if (postData[0].posterId !== data.loggedUser.info.id) {
                    query = squel.insert()
                        .into('notifications_forum_posts')
                        .set('receiver_id', postData[0].posterId)
                        .set('sender_id', data.loggedUser.info.id)
                        .set('forum_post_id', postId)
                        .set('action', 'upvote')
                        .toString();

                    databaseQuery(query, [], function (error, insertResponse) {
                        sendSockets(postData[0].posterId);
                    });
                }
            });
        }
    },

    deleteNotificationForForumPost(data, callback){
        let query,
            postId = parseInt(data.postId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(postId) || postId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('forums_posts')
                .field('forums_posts.poster_id', 'posterId')
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0232', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                query = squel.delete()
                    .from('notifications_forum_posts')
                    .where('receiver_id = ?', postData[0].posterId)
                    .where('sender_id = ?', data.loggedUser.info.id)
                    .where('forum_post_id = ?', postId)
                    .where('action = ?', 'upvote')
                    .toString();

                databaseQuery(query, [], function (error, insertResponse) {
                    sendSockets(postData[0].posterId);
                });
            });
        }
    },

    sendNotificationForMedia(data, callback){
        let query,
            mediaId = parseInt(data.mediaId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(mediaId) || mediaId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('media')
                .field('media.poster_type', 'mediaPosterType')
                .field('media.poster_id', 'posterId')

                .left_join('games_members', null, 'game_id = media.poster_id AND games_members.status = "Current" AND media.poster_type = \'game\'')
                .field('games_members.member_id', 'memberId')
                .where('media.id = ?', mediaId)
                .toString();

            databaseQuery(query, [], function (error, mediaData) {
                if (error) {
                    errorLogger(error, 'DTE_0233', query);
                    callback({error: [error]});
                    return;
                }

                if (mediaData.length === 0) {
                    return;
                }
                let members = [];

                if (mediaData[0].mediaPosterType === 'game') {
                    members = _.map(mediaData, 'memberId');
                    members = _.uniq(members);
                } else {
                    members = [mediaData[0].posterId]
                }

                members.forEach(function (memberId) {
                    if (memberId !== data.loggedUser.info.id) {
                        query = squel.insert()
                            .into('notifications_media')
                            .set('receiver_id', memberId)
                            .set('sender_id', data.loggedUser.info.id)
                            .set('media_id', mediaId)
                            .set('action', 'upvote')
                            .toString();

                        databaseQuery(query, [], function (error, insertResponse) {
                            sendSockets(memberId);
                        });
                    }
                });
            });
        }

        if (action === 'comment') {
            query = squel.select()
                .from('media')
                .field('media.poster_type', 'mediaPosterType')
                .field('media.poster_id', 'posterId')

                .left_join('games_members', null, 'game_id = media.poster_id AND games_members.status = "Current" AND media.poster_type = \'game\'')
                .field('games_members.member_id', 'memberId')
                .where('media.id = ?', mediaId)
                .toString();

            databaseQuery(query, [], function (error, mediaData) {
                if (error) {
                    errorLogger(error, 'DTE_0234', query);
                    callback({error: [error]});
                    return;
                }

                if (mediaData.length === 0) {
                    return;
                }

                let members = [];

                if (mediaData[0].mediaPosterType === 'game') {
                    members = _.map(mediaData, 'memberId');
                } else {
                    members = [mediaData[0].posterId]
                }

                query = squel.select()
                    .from('posts')

                    .left_join('users', null, 'users.id = posts.poster_id')
                    .field('users.id', 'commenterId')
                    .where('posts.type = ?', 'comment')
                    .where('posts.parent_type = ?', 'media')
                    .where('posts.parent_id = ?', mediaId)
                    .toString();

                databaseQuery(query, [], function (error, commenters) {
                    let commentersIds;

                    if (!error) {
                        commentersIds = _.map(commenters, 'commenterId');
                    }

                    members = _.concat(members, commentersIds);
                    members = _.uniq(members);

                    members.forEach(function (memberId) {
                        if (memberId !== data.loggedUser.info.id) {
                            query = squel.insert()
                                .into('notifications_media')
                                .set('receiver_id', memberId)
                                .set('sender_id', data.loggedUser.info.id)
                                .set('media_id', mediaId)
                                .set('action', 'comment')
                                .toString();


                            databaseQuery(query, [], function (error, insertResponse) {
                                sendSockets(memberId);
                            });
                        }
                    });
                });
            });
        }
    },

    deleteNotificationForMedia(data, callback){
        let query,
            mediaId = parseInt(data.mediaId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(mediaId) || mediaId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('media')
                .field('media.poster_id', 'posterId')

                .left_join('games_members', null, 'game_id = media.poster_id AND games_members.status = "Current"')
                .field('games_members.member_id', 'memberId')
                .where('media.id = ?', mediaId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0235', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                query = squel.delete()
                    .from('notifications_media')
                    .where('sender_id = ?', data.loggedUser.info.id)
                    .where('media_id = ?', mediaId)
                    .where('action = ?', 'upvote')
                    .toString();

                databaseQuery(query, [], function (error, insertResponse) {
                    sendSockets([postData[0].posterId])
                });
            });
        }
    },

    sendNotificationForPost(data, callback){
        let query,
            postId = parseInt(data.postId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(postId) || postId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('posts')
                .field('posts.poster_id', 'posterId')
                .field('posts.type', 'postType')
                .where('posts.id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0236', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                if (postData[0].posterId !== data.loggedUser.info.id) {
                    if (postData[0].postType === 'status') {
                        query = squel.insert()
                            .into('notifications_posts')
                            .set('receiver_id', postData[0].posterId)
                            .set('sender_id', data.loggedUser.info.id)
                            .set('post_id', postId)
                            .set('action', 'upvote')
                            .toString();
                    }


                    if (postData[0].postType === 'comment') {
                        query = squel.insert()
                            .into('notifications_comments')
                            .set('receiver_id', postData[0].posterId)
                            .set('sender_id', data.loggedUser.info.id)
                            .set('comment_id', postId)
                            .set('action', 'upvote')
                            .toString();
                    }

                    databaseQuery(query, [], function (error, insertResponse) {
                        sendSockets(postData[0].posterId);
                    });


                }
            });
        }

        if (action === 'comment') {
            query = squel.select()
                .from('posts')
                .field('posts.poster_id', 'posterId')
                .where('posts.id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0237', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                let postPoster = postData[0].posterId;

                query = squel.select()
                    .from('posts')
                    .field('posts.poster_id', 'posterId')
                    .where('posts.type = ?', 'comment')
                    .where('posts.parent_id = ?', postId)
                    .toString();

                databaseQuery(query, [], function (error, commentsData) {
                    if (error) {
                        errorLogger(error, 'DTE_0238', query);
                        return;
                    }

                    let posterIds = _.map(commentsData, 'posterId');
                    posterIds.push(postPoster);
                    posterIds = _.uniq(posterIds);

                    posterIds.forEach(function (posterId) {
                        if (posterId !== data.loggedUser.info.id) {
                            query = squel.insert()
                                .into('notifications_posts')
                                .set('receiver_id', posterId)
                                .set('sender_id', data.loggedUser.info.id)
                                .set('post_id', postId)
                                .set('action', 'comment')
                                .toString();

                            databaseQuery(query, [], function (error, insertResponse) {
                                sendSockets(posterId);
                            });
                        }
                    });
                });
            });
        }
    },

    deleteNotificationForPost(data, callback){
        let query,
            postId = parseInt(data.postId, 10),
            action = data.action;

        if (!callback) {
            callback = function () {
            }
        }

        if (isNaN(postId) || postId == 0) {
            callback({errors: ['Invalid Post Id']});
            return;
        }

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (['comment', 'upvote'].indexOf(action) === -1) {
            callback({errors: ['Invalid Action']});
            return;
        }

        if (action === 'upvote') {
            query = squel.select()
                .from('posts')
                .field('posts.poster_id', 'posterId')
                .field('posts.type', 'postType')
                .where('posts.id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, postData) {
                if (error) {
                    errorLogger(error, 'DTE_0239', query);
                    callback({error: [error]});
                    return;
                }

                if (postData.length === 0) {
                    return;
                }

                if (postData[0].postType === 'status') {
                    query = squel.delete()
                        .from('notifications_posts')
                        .where('receiver_id = ?', postData[0].posterId)
                        .where('sender_id = ?', data.loggedUser.info.id)
                        .where('post_id = ?', postId)
                        .where('action = ?', 'upvote')
                        .toString();
                }


                if (postData[0].postType === 'comment') {
                    query = squel.delete()
                        .from('notifications_comments')
                        .where('receiver_id = ?', postData[0].posterId)
                        .where('sender_id = ?', data.loggedUser.info.id)
                        .where('comment_id = ?', postId)
                        .where('action = ?', 'upvote')
                        .toString();
                }


                databaseQuery(query, [], function (error, insertResponse) {
                    sendSockets(postData[0].posterId);
                });
            });
        }
    }
};