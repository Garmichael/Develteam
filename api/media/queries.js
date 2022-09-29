let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    getXpLevelData = require('../../modules/module_xpLevelData'),
    escape = require('js-string-escape'),
    multer = require('multer'),
    jimp = require('jimp'),
    stringUrlMaker = require('../../modules/module_stringUrlMaker'),
    stringUrlFinder = require('../../modules/module_stringUrlFinder'),
    fs = require('fs'),
    socketHandler = require('../../modules/module_socketHandler'),
    checkForFile = require('../../modules/module_checkForFile'),
    errorLogger = require('../../modules/module_errorLogger'),
    gm = require('gm');

module.exports = {

    getAlbum(data, callback) {
        let query = squel.select()
            .from('media')
            .field('id', 'id')
            .field('title', 'title')
            .field('has_avatar', 'hasAvatar')
            .field('string_url', 'stringUrl')
            .field('parent_type', 'parentType')
            .field('poster_id', 'posterId')
            .where('media_category = ?', 'album')
            .where('id = ?', data.id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0198', query);
                callback({errors: error});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Album by Set Id']});
                return;
            }

            callback(records[0]);
        });
    },

    getAlbums(data, callback) {
        let errors = [],
            query;

        !data.pageType && errors.push('No Page Type Set');
        !data.pageId && errors.push('No Page Id Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('media')
            .field('id', 'id')
            .field('rank', 'rank')
            .field('title', 'title')
            .field('has_avatar', 'hasAvatar')
            .field('string_url', 'stringUrl')
            .where('media_category = ?', 'album')
            .where('parent_type = ?', escape(data.pageType))
            .where('poster_id = ?', escape(data.pageId))
            .order('rank', 'asc')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0199', query);
                callback({errors: [error]});
                return;
            }

            callback(records);
        });
    },

    postAlbum(data, callback) {
        let errors = [],
            query,
            storage = multer.memoryStorage(),
            upload = multer({storage: storage, limits: {fileSize: 300 * 1024}}).single('albumAvatar');

        !data.loggedUser.isLoggedIn && errors.push('Not Logged In');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        upload(data.req, data.res, function (error) {
            let uploadedImage,
                stringUrl,
                albumName,
                pageType,
                pageId;

            if (error) {
                callback({errors: [error]});
                return;
            }

            albumName = data.req.body.albumName;
            pageType = data.req.body.pageType;
            pageId = parseInt(data.req.body.pageId, 10);

            if (!albumName || typeof albumName !== 'string' || albumName.trim() === '') {
                callback({errors: ['No Album Name set']});
                return;
            }

            if (pageType !== 'developer' && pageType !== 'game') {
                callback({errors: ['Invalid Parent Type Set']});
                return;
            }

            if (pageType === 'game' && (isNaN(pageId) || pageId === 0)) {
                callback({errors: ['Invalid Page Id Set']});
                return;
            }

            if (data.req.file) {
                jimp.read(data.req.file.buffer, function (error, image) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    uploadedImage = image;
                });
            }

            stringUrl = stringUrlMaker(albumName);

            query = squel.select()
                .from('media')
                .field('string_url', 'stringUrl')
                .where('parent_type = ?', pageType)
                .where('poster_id = ?', data.loggedUser.info.id)
                .where('media_category = ?', 'album')
                .where('string_url LIKE \'' + stringUrl + '%\'')
                .toString();

            databaseQuery(query, [], function (error, matchingRecords) {
                if (error) {
                    errorLogger(error, 'DTE_0200', query);
                    callback({errors: [error]});
                    return;
                }

                stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                query = squel.insert()
                    .into('media')
                    .set('media_type', '');

                if (pageType === 'developer') {
                    query = query.set('poster_id', data.loggedUser.info.id)
                } else {
                    query = query.set('poster_id', pageId)
                }

                query = query.set('poster_type', pageType)
                    .set('parent_id', 0)
                    .set('parent_type', pageType)
                    .set('media_category', 'album')
                    .set('title', escape(albumName))
                    .set('description', '')
                    .set('has_avatar', 0)
                    .set('string_url', stringUrl)
                    .set('media_url', '')
                    .set('media_id', 0)
                    .set('preview_url', '')
                    .set('preview_id', 0)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0201', query);
                        callback({errors: [error]});
                        return;
                    }

                    if (uploadedImage) {
                        uploadedImage.cover(200, 200).quality(100).write('public/userdata/avatars/media_' + response.insertId + '.jpg');

                        query = squel.update()
                            .table('media')
                            .set('has_avatar', 1)
                            .where('id = ?', response.insertId)
                            .toString();

                        databaseQuery(query, [], function (error, setHasAvatarResponse) {
                            if (error) {
                                errorLogger(error, 'DTE_0202', query);
                            }
                            callback({newAlbumId: response.insertId})
                        });
                    } else {
                        callback({newAlbumId: response.insertId})
                    }
                });
            });
        });
    },

    editAlbum(data, callback) {
        let errors = [],
            query,
            storage = multer.memoryStorage(),
            upload = multer({storage: storage, limits: {fileSize: 300 * 1024}}).single('albumAvatar');

        !data.loggedUser.isLoggedIn && errors.push('Not Logged In');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        upload(data.req, data.res, function (error) {
            let uploadedImage,
                stringUrl,
                newTitle = data.req.body.newName,
                albumId = parseInt(data.req.body.albumId, 10);

            if (error) {
                callback({errors: [error]});
                return;
            }

            if (isNaN(albumId) || albumId === 0) {
                callback({errors: ['No Album Id Set']});
                return;
            }

            if (typeof newTitle !== 'string' || newTitle.trim() === '') {
                callback({errors: ['New Title Not Set']});
                return;
            }

            if (data.req.file) {
                jimp.read(data.req.file.buffer, function (err, image) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    uploadedImage = image;
                });
            }

            query = squel.select()
                .from('media')
                .field('id', 'id')
                .field('parent_type', 'parentType')
                .field('poster_id', 'posterId')
                .where('media_category = ?', 'album')
                .where('id = ?', escape(albumId))
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0203', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['No Album Found by this Id']});
                    return;
                }

                if (records[0].parentType === 'developer' && records[0].posterId !== data.loggedUser.info.id) {
                    errors.push('Not Validated to Edit this User Album');
                }

                if (records[0].parentType === 'game') {
                    let isGameMember = false;
                    data.loggedUser.games.forEach(function (game) {
                        if (game.id === records[0].posterId) {
                            isGameMember = true;
                        }
                    });

                    if (!isGameMember) {
                        errors.push('Not Validated to Edit this Game Album');
                    }
                }

                if (errors.length > 0) {
                    callback({errors: errors});
                    return;
                }

                stringUrl = stringUrlMaker(newTitle);

                query = squel.select()
                    .from('media')
                    .field('string_url', 'stringUrl')
                    .where('parent_type = ?', records[0].parentType)
                    .where('poster_id = ?', records[0].posterId)
                    .where('media_category = ?', 'album')
                    .where('string_url LIKE \'' + stringUrl + '%\'')
                    .where('id != ?', albumId)
                    .toString();

                databaseQuery(query, [], function (error, matchingRecords) {
                    if (error) {
                        errorLogger(error, 'DTE_0204', query);
                        callback({errors: [error]});
                        return;
                    }

                    stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                    query = squel.update()
                        .table('media')
                        .set('title', escape(newTitle))
                        .set('string_url', stringUrl)
                        .where('id = ?', albumId)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0205', query);
                            callback({errors: [error]});
                            return;
                        }

                        if (uploadedImage) {
                            uploadedImage.cover(200, 200).quality(100).write('public/userdata/avatars/media_' + albumId + '.jpg');

                            socketHandler.getIoInstance().emit('avatarUpdated', {
                                type: 'media',
                                id: albumId
                            });

                            query = squel.update()
                                .table('media')
                                .set('has_avatar', 1)
                                .where('id = ?', albumId)
                                .toString();

                            databaseQuery(query, [], function (err, setHasAvatarResponse) {
                                if (err) {
                                    errorLogger(err, 'DTE_0206', query);
                                }
                                callback({albumId: albumId})
                            });
                        } else {
                            callback({albumId: albumId})
                        }
                    });
                });
            });
        });

    },

    deleteAlbum(data, callback) {
        let errors = [],
            query;

        !data.albumId && errors.push('No Album Id set');
        !data.loggedUser.isLoggedIn && errors.push('Not Logged In');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('media')
            .field('id', 'id')
            .field('parent_type', 'parentType')
            .field('poster_id', 'posterId')
            .where('media_category = ?', 'album')
            .where('id = ?', escape(data.albumId))
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0207', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['Album does not Exist']});
                return;
            }

            if (records[0].parentType === 'developer' && records[0].posterId !== data.loggedUser.info.id) {
                errors.push('Not Validated to Edit this User Album');
            }

            if (records[0].parentType === 'game') {
                let isGameMember = false;
                data.loggedUser.games.forEach(function (game) {
                    if (game.id === records[0].posterId) {
                        isGameMember = true;
                    }
                });

                if (!isGameMember) {
                    errors.push('Not Validated to Edit this Game Album');
                }
            }

            if (errors.length > 0) {
                callback({errors: errors});
                return;
            }

            query = squel.delete()
                .from('media')
                .where('id = ?', escape(data.albumId))
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0208', query);
                    callback({errors: [error]});
                    return;
                }

                callback({parentType: records[0].parentType, posterId: records[0].posterId});
            });

        });
    },

    reorderAlbums(data, callback) {
        let errors = [];

        !data.pageType && errors.push('No Page Type set');
        (data.pageType !== 'developer' && data.pageType !== 'game') && errors.push('Invalid Page Type')
        !data.pageId && errors.push('No Page Id set');
        !data.albums && errors.push('No Album List set');
        !data.loggedUser.isLoggedIn && errors.push('Not Logged In');
        !Array.isArray(data.albums) && errors.push('Album List is not an Array');

        if (Array.isArray(data.albums)) {
            data.albums.length === 0 && errors.push('Album length is 0');

            data.albums.forEach((albumId) => {
                !Number.isInteger(albumId) && errors.push('album Id is not an integer')
            });
        }

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        let query = squel.select()
            .from('media')
            .field('id', 'id')
            .field('id', 'id')
            .where('parent_type = ?', data.pageType)
            .where('poster_id = ?', data.pageId)
            .where('id IN ?', data.albums)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0262', query);
                callback({errors: [error]});
                return;
            }

            if (records.length !== data.albums.length) {
                callback({errors: ['These albums do not belong to the same profile']});
                return;
            }

            if (data.pageType === 'developer' && data.loggedUser.info.id !== data.pageId) {
                callback({errors: ['Not validated as a User']});
                return;
            }

            if(data.pageType === 'game'){
                let validated = false;
                data.loggedUser.games.forEach((game)=>{
                    if(game.id === data.pageId){
                        validated = true;
                    }
                });

                if(!validated){
                    callback({errors: ['Not validated as a User']});
                    return;
                }
            }

            let updateQuery = "UPDATE media SET rank = (case ";

            for(let index = 0; index < data.albums.length; index++){
                updateQuery += ' WHEN id = ' + data.albums[index] + ' THEN ' + index;
            }

            updateQuery += " ELSE rank end)";

            databaseQuery(updateQuery, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_026e', query);
                    callback({errors: [error]});
                    return;
                }

                callback({response: 'success'});
            });
        });
    },

    getPiece(data, callback) {
        let errors = [],
            mediaId = parseInt(data.mediaId, 10),
            query;

        (isNaN(mediaId) || mediaId === 0) && errors.push('No Media Id Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('media')
            .field('media.id', 'id')
            .field('media.media_type', 'mediaType')
            .field('media.poster_type', 'posterType')
            .field('media.poster_id', 'posterId')
            .field('media.title', 'title')
            .field('media.description', 'description')
            .field('media.string_url', 'stringUrl')
            .field('media.media_url', 'mediaUrl')
            .field('media.preview_url', 'previewImageUrl')
            .field('media.created', 'created')
            .field('media.parent_id', 'albumId')
            .field('(SELECT count(*) FROM posts comments WHERE comments.parent_type = \'media\' AND comments.parent_id = media.id AND comments.type=\'comment\')', 'commentCount')

            .left_join('media', 'album', 'album.id = media.parent_id')
            .field('album.string_url', 'albumStringUrl')

            .left_join('users', 'poster', 'media.poster_type = \'developer\' AND poster.id = media.poster_id')
            .field('poster.string_url', 'posterStringUrl')
            .field('poster.alias', 'posterAlias')

            .left_join('games', 'game', 'media.poster_type = \'game\' AND game.id = media.poster_id')
            .field('game.string_url', 'subPosterStringUrl')
            .field('game.alias', 'subPosterAlias')

            .where('media.id = ?', escape(data.mediaId))
            .where('media.parent_type = ?', 'album')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0209', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['Piece not found']});
                return;
            }

            callback(records[0]);
        });
    },

    getPieces(data, callback) {
        let errors = [],
            query;

        !data.albumId && errors.push('No Album Id Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('media')
            .field('media.id', 'id')
            .field('media.media_type', 'mediaType')
            .field('media.poster_type', 'posterType')
            .field('media.poster_id', 'posterId')
            .field('media.title', 'title')
            .field('media.description', 'description')
            .field('media.string_url', 'stringUrl')
            .field('media.media_url', 'mediaUrl')
            .field('media.preview_url', 'previewImageUrl')
            .field('media.created', 'created')
            .field('media.parent_id', 'albumId')
            .field('(SELECT count(*) FROM posts comments WHERE comments.parent_type = \'media\' AND comments.parent_id = media.id AND comments.type=\'comment\')', 'commentCount')

            .left_join('media', 'album', 'album.id = media.parent_id')
            .field('album.string_url', 'albumStringUrl')

            .left_join('users', 'poster', 'media.poster_type = \'developer\' AND poster.id = media.poster_id')
            .field('poster.string_url', 'posterStringUrl')
            .field('poster.alias', 'posterAlias')

            .left_join('games', 'game', 'media.poster_type = \'game\' AND game.id = media.poster_id')
            .field('game.string_url', 'subPosterStringUrl')
            .field('game.alias', 'subPosterAlias')

            .where('media.parent_id = ?', escape(data.albumId))
            .where('media.parent_type = ?', 'album')
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0210', query);
                callback({errors: [error]});
                return;
            }

            callback(records);
        });
    },

    postPiece(data, callback, callbackForPost) {
        let errors = [],
            query,
            queries = this,
            userId = data.loggedUser.isLoggedIn ? data.loggedUser.info.id : 0,
            storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, 'tempuploads')
                },
                filename: function (req, file, cb) {
                    cb(null, Date.now() + userId + '.' + file.filename)
                }
            }),
            upload = multer({
                storage: storage,
                limits: {fileSize: 10 * 1024 * 1024}
            }).fields([{name: 'previewFile'}, {name: 'mediaFile'}]);

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        upload(data.req, data.res, function (error) {
            if (error) {
                callback({errors: [error]});
                return;
            }

            let pageType = data.req.body.pageType,
                pageId = parseInt(data.req.body.pageId, 10),
                albumId = parseInt(data.req.body.albumId, 10),
                title = data.req.body.title,
                description = data.req.body.description,
                selectedMediaType = data.req.body.selectedMediaType,
                mediaText = data.req.body.mediaText,
                errors = [];

            (!selectedMediaType || selectedMediaType === 'undefined') && errors.push('No Media Type set');
            (!title || title === 'undefined') && errors.push('No Title set');
            (pageType !== 'developer' && pageType !== 'game') && errors.push('No Valid Page Type Set');
            (isNaN(pageId) || pageId === 0) && errors.push('No Valid Page Id set');
            (isNaN(albumId) || albumId === 0) && errors.push('No Valid Album Id set');

            if (['image', 'audio', 'flash', 'archive', 'document'].indexOf(selectedMediaType) > -1) {
                if (!data.req.files.mediaFile || !data.req.files.mediaFile[0]) {
                    errors.push('No Media Uploaded');
                } else {

                    let fileExtension = data.req.files.mediaFile[0].originalname.split('.')[data.req.files.mediaFile[0].originalname.split('.').length - 1].toLowerCase(),
                        acceptableExtensions = {
                            'image': ['jpg', 'jpeg', 'png', 'gif'],
                            'audio': ['mp3'],
                            'flash': ['swf'],
                            'archive': ['rar', 'zip'],
                            'document': ['txt', 'doc', 'docx', 'xsxl', 'pdf']
                        };

                    if (acceptableExtensions[selectedMediaType].indexOf(fileExtension) === -1) {
                        errors.push('Unaccepted File Type');
                    }
                }
            }

            if (['video', 'url'].indexOf(selectedMediaType) > -1) {
                if (!mediaText || mediaText === 'undefined' || mediaText.trim().length === 0) {
                    errors.push('No Media Content Set');
                }
            }

            if (data.req.files.previewFile && data.req.files.previewFile[0]) {
                let fileExtension = data.req.files.previewFile[0].originalname.split('.')[data.req.files.previewFile[0].originalname.split('.').length - 1].toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif'].indexOf(fileExtension) === -1) {
                    errors.push('Preview File is an Unaccepted File Type');
                }
            }

            if (errors.length > 0) {
                if (data.req.files.mediaFile) {
                    fs.unlinkSync('tempuploads/' + data.req.files.mediaFile[0].filename)
                }

                if (data.req.files.previewFile) {
                    fs.unlinkSync('tempuploads/' + data.req.files.previewFile[0].filename);
                }

                callback({errors: errors});
                return;
            }

            query = squel.select()
                .from('media')
                .field('id', 'id')
                .field('parent_type', 'parentType')
                .field('poster_id', 'posterId')
                .where('id = ?', escape(albumId))
                .where('media_category = ?', 'album')
                .where('parent_type = ?', pageType)
                .where('poster_id = ?', pageId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                let errors = [];

                if (error) {
                    errors.push(error);
                }

                if (records.length === 0) {
                    callback({errors: ['No Album Found by this Id']});
                    return;
                }

                if (records[0].parentType === 'developer' && records[0].posterId !== data.loggedUser.info.id) {
                    errors.push('Not Validated to Add to this User Album');
                }

                if (records[0].parentType === 'game') {
                    let isGameMember = false;
                    data.loggedUser.games.forEach(function (game) {
                        if (game.id === records[0].posterId) {
                            isGameMember = true;
                        }
                    });

                    if (!isGameMember) {
                        errors.push('Not Validated to Add to this Game Album');
                    }
                }

                if (errors.length > 0) {
                    if (data.req.files.mediaFile) {
                        fs.unlinkSync('tempuploads/' + data.req.files.mediaFile[0].filename);
                    }

                    if (data.req.files.previewFile) {
                        fs.unlinkSync('tempuploads/' + data.req.files.previewFile[0].filename);
                    }

                    callback({errors: errors});
                    return;
                }


                let mediaTypeMap = {
                        'image': 'Image',
                        'archive': 'Archive',
                        'video': 'Youtube',
                        'audio': 'Audio',
                        'url': 'External',
                        'flash': 'Flash',
                        'document': 'Text'
                    },
                    stringUrl = stringUrlMaker(title);

                query = squel.select()
                    .from('media')
                    .field('string_url', 'stringUrl')
                    .where('parent_id = ?', albumId)
                    .where('parent_type = ?', 'album')
                    .where('string_url LIKE \'' + stringUrl + '%\'')
                    .toString();

                databaseQuery(query, [], function (error, matchingRecords) {
                    if (error) {
                        errorLogger(error, 'DTE_0211', query);
                        callback({errors: [error]});
                        return;
                    }

                    stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                    query = squel.insert()
                        .into('media')
                        .set('media_type', mediaTypeMap[selectedMediaType])
                        .set('poster_id', pageId)
                        .set('poster_type', pageType)
                        .set('parent_id', escape(albumId))
                        .set('parent_type', 'album')
                        .set('media_category', 'media')
                        .set('title', escape(title))
                        .set('description', escape(description))
                        .set('has_avatar', 0)
                        .set('string_url', stringUrl)
                        .set('media_url', '')
                        .set('preview_url', '')
                        .set('media_id', 0)
                        .set('preview_id', 0)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0212', query);

                            if (data.req.files.mediaFile) {
                                fs.unlinkSync('tempuploads/' + data.req.files.mediaFile[0].filename);
                            }

                            if (data.req.files.previewFile) {
                                fs.unlinkSync('tempuploads/' + data.req.files.previewFile[0].filename);
                            }

                            callback({errors: [error]});
                            return;
                        }

                        let newMediaFileName,
                            newPreviewFileName,
                            builtMediaFile = false,
                            builtPreviewImage = false;

                        if (data.req.files.mediaFile) {
                            newMediaFileName = 'al' + albumId + 'id' + response.insertId + '_' + data.req.files.mediaFile[0].originalname;

                            fs.rename('tempuploads/' + data.req.files.mediaFile[0].filename, 'tempuploads/' + newMediaFileName, function () {
                                if (selectedMediaType === 'image') {
                                    gm('tempuploads/' + newMediaFileName)
                                        .coalesce()
                                        .write('tempuploads/' + newMediaFileName, function (err) {
                                            if (!err) {
                                                gm('tempuploads/' + newMediaFileName)
                                                    .dispose('Previous')
                                                    .dispose('Background')
                                                    .resize(300, 300)
                                                    .noProfile()
                                                    .write('public/userdata/mediaThumbs/' + newMediaFileName, function (err) {
                                                        if (err) {
                                                            fs.copyFile('tempuploads/' + newMediaFileName, 'public/userdata/mediaThumbs/' + newMediaFileName);
                                                        }

                                                        fs.rename('tempuploads/' + newMediaFileName, 'public/userdata/media/' + newMediaFileName, function () {
                                                            builtMediaFile = true;
                                                            if (builtMediaFile && builtPreviewImage) {
                                                                finalizeMediaEntry();
                                                            }
                                                        });
                                                    });
                                            }
                                        });
                                } else {
                                    fs.rename('tempuploads/' + newMediaFileName, 'public/userdata/media/' + newMediaFileName, function () {
                                        builtMediaFile = true;
                                        if (builtMediaFile && builtPreviewImage) {
                                            finalizeMediaEntry();
                                        }
                                    });
                                }
                            });
                        } else {
                            builtMediaFile = true;
                            if (builtMediaFile && builtPreviewImage) {
                                finalizeMediaEntry();
                            }
                        }

                        if (data.req.files.previewFile) {
                            newPreviewFileName = 'al' + albumId + 'id' + response.insertId + '_preview_' + data.req.files.previewFile[0].originalname;

                            fs.rename('tempuploads/' + data.req.files.previewFile[0].filename, 'tempuploads/' + newPreviewFileName, function () {
                                gm('tempuploads/' + newPreviewFileName)
                                    .coalesce()
                                    .write('tempuploads/' + newPreviewFileName, function (err) {
                                        if (!err) {
                                            gm('tempuploads/' + newPreviewFileName)
                                                .dispose('Previous')
                                                .dispose('Background')
                                                .resize(300, 300)
                                                .noProfile()
                                                .write('public/userdata/mediaThumbs/' + newPreviewFileName, function (err) {
                                                    if (!err) {
                                                        fs.rename('tempuploads/' + newPreviewFileName, 'public/userdata/media/' + newPreviewFileName, function () {
                                                            builtPreviewImage = true;
                                                            if (builtMediaFile && builtPreviewImage) {
                                                                finalizeMediaEntry();
                                                            }
                                                        });
                                                    }
                                                });
                                        }
                                    });
                            });
                        } else {
                            builtPreviewImage = true;
                            if (builtMediaFile && builtPreviewImage) {
                                finalizeMediaEntry();
                            }
                        }

                        function finalizeMediaEntry() {
                            query = squel.update().table('media');

                            if (data.req.files.mediaFile) {
                                query = query.set('media_url', escape(newMediaFileName));
                            } else {
                                query = query.set('media_url', escape(mediaText));
                            }

                            if (data.req.files.previewFile) {
                                query = query.set('preview_url', newPreviewFileName);
                            }

                            query = query.where('id = ?', response.insertId)
                                .toString();

                            databaseQuery(query, [], function (error, updated) {
                                if (error) {
                                    errorLogger(error, 'DTE_0213', query);
                                    callback({errors: error});
                                    return;
                                }

                                queries.getPiece({
                                    mediaId: response.insertId
                                }, function (newPiece) {
                                    callback(newPiece);
                                })
                            });

                            query = squel.insert()
                                .into('posts')
                                .set('parent_id', pageId)
                                .set('parent_type', pageType)
                                .set('poster_id', data.loggedUser.info.id)
                                .set('subposter_id', pageId)
                                .set('subposter_type', pageType)
                                .set('type', 'media')
                                .set('title', mediaTypeMap[selectedMediaType])
                                .set('content', response.insertId)
                                .set('pinned', 0)
                                .set('published', 1)
                                .toString();

                            databaseQuery(query, [], function (err, response) {
                                let postQueries = require('../feedPosts/queries');

                                postQueries.getPost({postId: response.insertId}, function (record) {
                                    callbackForPost(record);
                                });

                                query = squel.update()
                                    .table('users')
                                    .where('id != ?', data.loggedUser.info.id)
                                    .set('caughtUpOnMedia', 0)
                                    .toString();

                                databaseQuery(query, [], function (err, response) {
                                    socketHandler.getIoInstance().emit('updateUserInfo');
                                });
                            });
                        }
                    });
                });
            })
        });

    },

    editPiece(data, callback, callbackForPost) {
        let errors = [],
            id = parseInt(data.id, 10),
            title = data.title,
            description = data.description + '',
            mediaText = data.mediaText,
            newStringUrl,
            query,
            queries = this,
            postQueries = require('../feedPosts/queries');

        (isNaN(id) || id === 0) && errors.push('Not a Valid Id');
        (!data.loggedUser && !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (!title || typeof title !== 'string' || title.trim() === '') && errors.push('Title not Set');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.select()
            .from('media')
            .field('id', 'id')
            .field('title', 'title')
            .field('poster_type', 'posterType')
            .field('poster_id', 'posterId')
            .field('media_type', 'mediaType')
            .field('parent_id', 'parentId')
            .where('id = ?', id)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0214', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching Piece Found']});
                return;
            }

            if (records[0].posterType === 'developer' && records[0].posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not Validated to Edit this Piece']});
                return;
            }

            if (records[0].posterType === 'game') {
                let isGameMember = false;
                data.loggedUser.games.forEach(function (game) {
                    if (game.id === records[0].posterId) {
                        isGameMember = true;
                    }
                });

                if (!isGameMember) {
                    callback({errors: ['Not Validated To Edit this Game Piece']});
                    return;
                }
            }

            if (['Youtube', 'External'].indexOf(records[0].mediaType) > -1 && (!mediaText || mediaText.trim() === '')) {
                callback({errors: ['No Media Url Set']});
                return;
            }

            newStringUrl = stringUrlMaker(title);

            query = squel.select()
                .from('media')
                .field('string_url', 'stringUrl')
                .where('parent_type = ?', 'album')
                .where('parent_id = ?', records[0].parentId)
                .where('id != ?', records[0].id)
                .where('string_url LIKE \'' + newStringUrl + '%\'')
                .toString();

            databaseQuery(query, [], function (error, matchingRecords) {
                if (error) {
                    errorLogger(error, 'DTE_0215', query);
                    callback({errors: [error]});
                    return;
                }

                newStringUrl = stringUrlFinder(newStringUrl, matchingRecords);


                query = squel.update()
                    .table('media')
                    .set('title', escape(title))
                    .set('description', escape(description))
                    .set('string_url', escape(newStringUrl))
                    .where('id = ?', id);

                if (['Youtube', 'External'].indexOf(records[0].mediaType) > -1) {
                    query = query.set('media_url', escape(mediaText))
                }

                query = query.toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0216', query);
                        callback({errors: [error]});
                        return;
                    }

                    queries.getPiece({
                        mediaId: id
                    }, function (mediaPiece) {
                        callback(mediaPiece)
                    });
                });

                query = squel.select()
                    .from('posts')
                    .field('id', 'id')
                    .where('type = ? ', 'media')
                    .where('content = ? ', records[0].id)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0217', query);
                        return;
                    }

                    postQueries.getPost({
                        postId: response[0].id
                    }, function (updatedPost) {
                        callbackForPost(updatedPost);
                    })
                })
            });
        });


    },

    deletePiece(data, callback, callbackForPost) {
        let errors = [],
            pieceId = parseInt(data.id, 10),
            query,
            queries = this;

        (isNaN(pieceId) || pieceId === 0) && errors.push('Not a valid Post Id');
        (!data.loggedUser || !data.loggedUser.isLoggedIn) && errors.push('Not Logged In');

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        queries.getPiece({
            mediaId: pieceId
        }, function (piece) {
            if (!piece || piece.errors) {
                callback(piece);
                return;
            }

            if (piece.posterType === 'developer' && piece.posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not Validated To Delete']});
                return;
            }

            if (piece.posterType === 'game') {
                let isGameMember = false;
                data.loggedUser.games.forEach(function (game) {
                    if (game.id === piece.posterId) {
                        isGameMember = true;
                    }
                });

                if (!isGameMember) {
                    callback({errors: ['Not Validated To Delete']});
                    return;
                }
            }

            checkForFile('public/userdata/media/' + piece.mediaUrl, function (err, isFile) {
                if (isFile) {
                    fs.unlink('public/userdata/media/' + piece.mediaUrl, function () {
                    });
                }
            });

            checkForFile('public/userdata/media/' + piece.previewImageUrl, function (err, isFile) {
                if (isFile) {
                    fs.unlink('public/userdata/media/' + piece.previewImageUrl, function () {
                    });
                }
            });


            //DELETING COMMENTS
            query = squel.delete()
                .from('posts')
                .where('parent_type = ?', 'media')
                .where('parent_id = ?', pieceId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0218', query);
                    callback({errors: [error]});
                    return;
                }

                //GRABBING THE ID OF THE POST
                query = squel.select()
                    .from('posts')
                    .field('id')
                    .where('type = ?', 'media')
                    .where('content = ?', pieceId)
                    .toString();

                databaseQuery(query, [], function (error, postData) {
                    if (error) {
                        errorLogger(error, 'DTE_0219', query);
                        callbackForPost({errors: ['Problem Getting The Post', error]});
                        return;
                    }

                    if (postData.length === 0) {
                        return;
                    }


                    //GET ALL THE POST DATA
                    let postQueries = require('../feedPosts/queries');

                    postQueries.getPost({
                        postId: postData[0].id
                    }, function (postData) {

                        if (postData.errors) {
                            callbackForPost(postData);
                            return;
                        }

                        //DELETE THE POST ENTRY
                        query = squel.delete()
                            .from('posts')
                            .where('type = ?', 'media')
                            .where('content = ?', pieceId)
                            .toString();

                        databaseQuery(query, [], function (error, response) {
                            if (error) {
                                errorLogger(error, 'DTE_0220', query);
                                callbackForPost({errors: ['Media Entry Deleted But Not Accompanying Post', error]});
                                return;
                            }

                            callbackForPost(postData);

                            //DELETE THE MEDIA ENTRY
                            query = squel.delete()
                                .from('media')
                                .where('id = ?', pieceId)
                                .toString();

                            databaseQuery(query, [], function () {
                                if (error) {
                                    errorLogger(error, 'DTE_0221', query);
                                    callback({errors: ['Media Files Deleted, Comments Deleted, But Not Media Entry Itself', error]});
                                    return;
                                }

                                callback(piece);

                            });
                        })
                    });
                });
            });
        });
    },

    getComment(data, callback) {
        let errors = [],
            query;

        !data.id && errors.push('No Comment Id set');

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

            .left_join('games', null, 'games.id = posts.subposter_id AND posts.subposter_type = \'game\'')
            .field('games.id', 'subposterId')
            .field('games.alias', 'subposterAlias')
            .field('games.string_url', 'subposterStringUrl')
            .field('games.has_avatar', 'subposterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subposterXp')

            .left_join('posts', 'parentPost', 'parentPost.type = \'media\' AND parentPost.content = posts.parent_id')
            .field('parentPost.id', 'parentPostId')
            .field('parentPost.parent_type', 'parentPostParentType')
            .field('parentPost.parent_id', 'parentPostParentId')

            .left_join('media', 'piece', 'piece.id = posts.parent_id')
            .field('piece.id', 'pieceId')

            .left_join('media', 'album', 'album.id = piece.parent_id')
            .field('album.id', 'albumId')

            .where('posts.id = ?', escape(data.id))
            .toString();

        databaseQuery(query, [], function (error, comment) {
            let parentData,
                albumData,
                pieceData;

            if (error) {
                errorLogger(error, 'DTE_0222', query);
                callback({errors: [error]});
                return;
            }

            comment = comment[0];

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

            if (comment.subposterId !== null) {
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

            albumData = {
                id: comment.albumId
            };

            delete comment.albumId;

            pieceData = {
                id: comment.pieceId
            };

            delete comment.pieceId;

            callback({
                commentData: comment,
                parentData: parentData,
                albumData: albumData,
                pieceData: pieceData
            });
        });
    },

    getComments(data, callback) {
        let errors = [],
            query;

        !data.pieceId && errors.push('No Piece Id Set');

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

            .left_join('games', null, 'games.id = posts.subposter_id AND posts.subposter_type = \'game\'')
            .field('games.id', 'subposterId')
            .field('games.alias', 'subposterAlias')
            .field('games.string_url', 'subposterStringUrl')
            .field('games.has_avatar', 'subposterHasAvatar')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'subposterXp')

            .where('type = ?', 'comment')
            .where('parent_type = ?', 'media')
            .where('parent_id = ?', escape(data.pieceId))
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0223', query);
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
        })
    },

    postComment(data, callback) {
        let errors = [],
            query;

        !data.content && errors.push('No Content Set');
        !data.parentId && errors.push('No parentId Set');
        !data.loggedUser.isLoggedIn && errors.push('Not Logged In');
        parseInt(escape(data.parentId), 10) === 0 && errors.push('Invalid Parent Id');

        data.postAsType = data.postAsType !== 'game' ? 'developer' : 'game';

        if (errors.length > 0) {
            callback({errors: errors});
            return;
        }

        query = squel.insert()
            .into('posts')
            .set('parent_id', data.parentId)
            .set('parent_type', 'media')
            .set('poster_id', data.loggedUser.info.id)
            .set('subposter_id', data.postAsId ? escape(data.postAsId) : 0)
            .set('subposter_type', data.postAsType)
            .set('type', 'comment')
            .set('title', '')
            .set('content', escape(data.content))
            .set('pinned', 0)
            .set('published', 1)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0224', query);
                callback({errors: [error]});
                return;
            }

            let notificationQueries = require('../notifications/queries.js');

            notificationQueries.sendNotificationForMedia({
                loggedUser: data.loggedUser,
                mediaId: data.parentId,
                action: 'comment'
            });

            callback(records);
        });
    }
};
