let databaseQuery = require('../modules/module_mysqlQuery');
let squel = require("squel");
let escape = require('js-string-escape');

module.exports = {
    generateMetaData: function (url, callback) {
        let urlRoot = url[0].toLowerCase();

        if (urlRoot === 'media') {
            build.mediaData(function (data) {
                callback(data);
            });
        } else if (urlRoot === 'classifieds') {
            build.classifiedsData(function (data) {
                callback(data);
            });
        } else if (urlRoot === 'devlogs') {
            build.devLogsData(function (data) {
                callback(data);
            });
        } else if (urlRoot === 'browse') {
            build.browse(url, function (data) {
                callback(data);
            });
        } else if (urlRoot === 'forums') {
            build.forums(url, function (data) {
                callback(data);
            });
        } else if (urlRoot === 'resources') {
            build.resources(url, function (data) {
                callback(data);
            });
        } else if (urlRoot === 'game') {
            build.game(url, function (data) {
                callback(data);
            });
        } else if (urlRoot === 'developer') {
            build.developer(url, function (data) {
                callback(data);
            });
        } else {
            callback(initialData);
        }
    },
};

let initialData = {
    pageTitle: 'Develteam | Game Developer Community | Game dev team up',
    pageDescription: `A Community for Creating Games. Share your game developer portfolio, collaboration forums, chat rooms, game dev team up, 
                indie team up. Start Making Games!`,
    previewImage: 'https://www.develteam.com/preview_gen.png',
    url: 'https://www.develteam.com'
};

let build = {
    mediaData(callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        outData.pageTitle += " | Media";
        outData.url += "/Media";
        callback(outData);
    },

    classifiedsData(callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        outData.pageTitle += " | Classifieds";
        outData.url += "/Classifieds";
        callback(outData);
    },

    devLogsData(callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        outData.pageTitle += " | Devlogs";
        outData.url += "/Devlogs";
        callback(outData);
    },

    browse(url, callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        if (url[1] && url[1].toLowerCase() === 'games') {
            outData.pageTitle += " | Browse Games";
            outData.url += "/Browse/Games";
        } else {
            outData.pageTitle += " | Browse Developers";
            outData.url += "/Browse";
        }
        callback(outData);
    },

    forums(url, callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        outData.pageTitle += " | Forums";
        outData.url += '/' + url.join('/');
        callback(outData);
    },

    resources(url, callback) {
        let outData = JSON.parse(JSON.stringify(initialData));
        if (url[1] && url[1].toLowerCase() === 'assets') {
            outData.pageTitle += " | Assets";
            outData.url += "/Resources/Assets";
        } else {
            outData.pageTitle += " | Dev Tools";
            outData.url += "/Resources";
        }
        callback(outData);
    },

    game(url, callback) {
        let outData = JSON.parse(JSON.stringify(initialData));

        if (!url[1]) {
            callback(outData);
            return;
        }

        let stringUrl = url[1];

        let query = squel.select()
            .from('games')
            .field('id', 'id')
            .field('alias', 'alias')
            .where('string_url = ?', escape(stringUrl))
            .toString();

        databaseQuery(query, [], (error, game) => {
            if (error || game.length === 0) {
                outData.pageTitle = game.length;
                callback(outData);
                return;
            }

            let gameInfo = game[0];

            if (!url[2] || ['forums', 'post', 'media'].indexOf(url[2].toLowerCase()) === -1) {
                outData.pageTitle = gameInfo.alias + ` Game Project on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = gameInfo.alias + ` Game Project on Develteam, A Community for Creating Games. Share your game developer portfolio, 
            collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Game/' + stringUrl;
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + gameInfo.id;

                callback(outData);
                return;
            }

            let subPage = url[2].toLowerCase();

            if (subPage === 'forums') {
                outData.pageTitle = gameInfo.alias + ` Game Project Forums on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = gameInfo.alias + ` Game Project Forums on Develteam, A Community for Creating Games. Share your game developer portfolio, 
            collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += url.join('/');
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + gameInfo.id;

                callback(outData);
                return;
            }

            if (subPage === 'post') {
                outData.pageTitle = gameInfo.alias + ` Game Project on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = gameInfo.alias + ` Game Project on Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Game/' + stringUrl;
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + gameInfo.id;

                let postId = url[3];

                if (!postId) {
                    callback(outData);
                    return;
                }

                postId = parseInt(postId, 10);

                query = squel.select()
                    .from('posts')
                    .field('posts.id', 'postId')
                    .field('posts.type', 'postType')
                    .field('posts.content', 'postContent')
                    .field('posts.title', 'postTitle')
                    .field('media.title', 'mediaTitle')
                    .field('media.description', 'mediaDescription')
                    .field('media.id', 'mediaId')
                    .field('media.string_url', 'mediaStringUrl')
                    .field('media.media_type', 'mediaType')
                    .field('album.string_url', 'albumStringUrl')
                    .left_join('media', null, 'media.id = posts.content')
                    .left_join('media', 'album', 'album.id = media.parent_id')
                    .where('id = ?', postId)
                    .toString();

                databaseQuery(query, [], (error, post) => {
                    if (error || post.length === 0) {
                        callback(outData);
                        return;
                    }

                    let postInfo = post[0];

                    if (postInfo.postType === 'classifieds' || postInfo === 'status') {
                        outData.pageTitle = postInfo.postTitle + ' | Develteam';
                        outData.pageDescription = postInfo.postContent;
                        outData.url += '/post/' + postInfo.postId;
                    }

                    if (postInfo.postType === 'media') {
                        outData.pageTitle = postInfo.mediaTitle + ' | Develteam';
                        outData.pageDescription = postInfo.mediaDescription;
                        outData.url += '/media/' + postInfo.albumStringUrl + '/' + postInfo.mediaStringUrl;
                        if (postInfo.mediaType === 'Image') {
                            outData.previewImage = 'https://www.develteam.com/socialImage/media/' + postInfo.mediaId;
                        }
                    }

                    callback(outData);
                });
            }

            if (subPage === 'media') {
                outData.pageTitle = gameInfo.alias + ` Game Project Media on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = gameInfo.alias + ` at Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Game/' + stringUrl + '/Media';
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + gameInfo.id;

                let albumStringUrl = url[3];
                let mediaStringUrl = url[4];

                if (!albumStringUrl) {
                    callback(outData);
                    return;
                }

                if (!mediaStringUrl) {
                    outData.url += '/' + albumStringUrl;
                    callback(outData);
                    return;
                }

                query = squel.select()
                    .from('media')
                    .field('id', 'id')
                    .field('parent_type', 'parent_type')
                    .where('string_url = ?', escape(albumStringUrl))
                    .where('media_category = ?', 'album')
                    .where('poster_type = ?', 'game')
                    .where('poster_id = ?', gameInfo.id)
                    .toString();

                databaseQuery(query, [], (error, album) => {
                    if (error || album.length === 0) {
                        outData.url += '/' + albumStringUrl;
                        callback(outData);
                        return;
                    }

                    let albumInfo = album[0];

                    query = squel.select()
                        .from('media')
                        .field('id', 'id')
                        .field('media_type', 'mediaType')
                        .field('title', 'title')
                        .field('description', 'description')
                        .where('string_url = ?', mediaStringUrl)
                        .where('parent_id = ?', albumInfo.id)
                        .where('parent_type = ?', 'album')
                        .toString();

                    databaseQuery(query, [], (error, media) => {
                        if (error || media.length === 0) {
                            callback(outData);
                            return;
                        }

                        let mediaInfo = media[0];

                        outData.pageTitle = mediaInfo.title + ` on Develteam | Game Developer Community | Game dev team up`;
                        outData.pageDescription = mediaInfo.description + ` Game Project Media on Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                        outData.url += '/' + albumStringUrl + '/' + mediaStringUrl;
                        if (mediaInfo.mediaType === 'Image') {
                            outData.previewImage = 'https://www.develteam.com/socialImage/media/' + mediaInfo.id;
                        } else {
                            outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + gameInfo.id;
                        }

                        callback(outData);
                    });
                });
            }
        });
    },

    developer(url, callback) {
        let outData = JSON.parse(JSON.stringify(initialData));

        if (!url[1]) {
            callback(outData);
            return;
        }

        let stringUrl = url[1];

        let query = squel.select()
            .from('users')
            .field('id', 'id')
            .field('alias', 'alias')
            .where('string_url = ?', escape(stringUrl))
            .toString();

        databaseQuery(query, [], (error, developer) => {
            if (error || developer.length === 0) {
                outData.pageTitle = developer.length;
                callback(outData);
                return;
            }

            let developerInfo = developer[0];

            if (!url[2] || ['post', 'portfolio'].indexOf(url[2].toLowerCase()) === -1) {
                outData.pageTitle = developerInfo.alias + ` on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = developerInfo.alias + ` on Develteam, A Community for Creating Games. Share your game developer portfolio, 
            collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Developer/' + stringUrl;
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/developer/' + developerInfo.id;

                callback(outData);
                return;
            }

            let subPage = url[2].toLowerCase();

            if (subPage === 'post') {
                outData.pageTitle = developerInfo.alias + ` on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = developerInfo.alias + ` on Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Developer/' + stringUrl;
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/developer/' + developerInfo.id;

                let postId = url[3];

                if (!postId) {
                    callback(outData);
                    return;
                }

                postId = parseInt(postId, 10);

                query = squel.select()
                    .from('posts')
                    .field('posts.id', 'postId')
                    .field('posts.type', 'postType')
                    .field('posts.content', 'postContent')
                    .field('posts.title', 'postTitle')
                    .field('media.title', 'mediaTitle')
                    .field('media.description', 'mediaDescription')
                    .field('media.id', 'mediaId')
                    .field('media.string_url', 'mediaStringUrl')
                    .field('media.media_type', 'mediaType')
                    .field('album.string_url', 'albumStringUrl')
                    .left_join('media', null, 'media.id = posts.content')
                    .left_join('media', 'album', 'album.id = media.parent_id')
                    .where('id = ?', postId)
                    .toString();

                databaseQuery(query, [], (error, post) => {
                    if (error || post.length === 0) {
                        callback(outData);
                        return;
                    }

                    let postInfo = post[0];

                    if (postInfo.postType === 'classifieds' || postInfo === 'status') {
                        outData.pageTitle = postInfo.postTitle + ' | Develteam';
                        outData.pageDescription = postInfo.postContent;
                        outData.url += '/post/' + postInfo.postId;
                    }

                    if (postInfo.postType === 'media') {
                        outData.pageTitle = postInfo.mediaTitle + ' | Develteam';
                        outData.pageDescription = postInfo.mediaDescription;
                        outData.url += '/media/' + postInfo.albumStringUrl + '/' + postInfo.mediaStringUrl;
                        if (postInfo.mediaType === 'Image') {
                            outData.previewImage = 'https://www.develteam.com/socialImage/media/' + postInfo.mediaId;
                        }
                    }

                    callback(outData);
                });
            }

            if (subPage === 'portfolio') {
                outData.pageTitle = developerInfo.alias + `'s Portfolio on Develteam | Game Developer Community | Game dev team up`;
                outData.pageDescription = developerInfo.alias + `'s Portfolio on Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                outData.url += '/Developer/' + stringUrl + '/Portfolio';
                outData.previewImage = 'https://www.develteam.com/socialImage/avatar/developer/' + developerInfo.id;

                let albumStringUrl = url[3];
                let mediaStringUrl = url[4];

                if (!albumStringUrl) {
                    callback(outData);
                    return;
                }

                if (!mediaStringUrl) {
                    outData.url += '/' + albumStringUrl;
                    callback(outData);
                    return;
                }

                query = squel.select()
                    .from('media')
                    .field('id', 'id')
                    .field('parent_type', 'parent_type')
                    .where('string_url = ?', escape(albumStringUrl))
                    .where('media_category = ?', 'album')
                    .where('poster_type = ?', 'developer')
                    .where('poster_id = ?', developerInfo.id)
                    .toString();

                databaseQuery(query, [], (error, album) => {
                    if (error || album.length === 0) {
                        outData.url += '/' + albumStringUrl;
                        callback(outData);
                        return;
                    }

                    let albumInfo = album[0];

                    query = squel.select()
                        .from('media')
                        .field('id', 'id')
                        .field('media_type', 'mediaType')
                        .field('title', 'title')
                        .field('description', 'description')
                        .where('string_url = ?', mediaStringUrl)
                        .where('parent_id = ?', albumInfo.id)
                        .where('parent_type = ?', 'album')
                        .toString();

                    databaseQuery(query, [], (error, media) => {
                        if (error || media.length === 0) {
                            callback(outData);
                            return;
                        }

                        let mediaInfo = media[0];

                        outData.pageTitle = mediaInfo.title + ` on Develteam | Game Developer Community | Game dev team up`;
                        outData.pageDescription = mediaInfo.description + ` Portfolio on Develteam, A Community for Creating Games. Share your 
                    game developer portfolio, collaboration forums, chat rooms, game dev team up, indie team up. Start Making Games!`;
                        outData.url += '/' + albumStringUrl + '/' + mediaStringUrl;
                        if (mediaInfo.mediaType === 'Image') {
                            outData.previewImage = 'https://www.develteam.com/socialImage/media/' + mediaInfo.id;
                        } else {
                            outData.previewImage = 'https://www.develteam.com/socialImage/avatar/game/' + developerInfo.id;
                        }

                        callback(outData);
                    });
                });
            }
        });
    },
};