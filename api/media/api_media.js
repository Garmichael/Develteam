let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../../modules/module_loggedUserBuilder');
let socketHandler = require('../../modules/module_socketHandler');
let queries = require('./queries');

router.get('/albums', function (req, res) {
    queries.getAlbums({
        pageType: req.query.pageType,
        pageId: req.query.pageId
    }, function (records) {
        setTimeout(function () {
            res.json(records);
        }, 1);
    });
});

router.post('/album', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {

        queries.postAlbum({
            loggedUser: loggedUser,
            req: req,
            res: res
        }, function (response) {
            if (response.errors) {
                res.json({errors: response.errors});
                return;
            }

            res.json({response: 'success'});

            queries.getAlbum({
                id: response.newAlbumId
            }, function (response) {
                if (!response.error) {
                    socketHandler.getIoInstance().emit('mediaAlbumAddOrEdit', response);
                }
            });
        });
    });
});

router.post('/album/edit', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.editAlbum({
            loggedUser: loggedUser,
            req: req,
            res: res
        }, function (response) {
            if (response.errors) {
                res.json({errors: response.errors});
                return;
            }

            res.json({response: 'success'});

            queries.getAlbum({
                id: response.albumId
            }, function (response) {
                if (!response.error) {
                    socketHandler.getIoInstance().emit('mediaAlbumAddOrEdit', response);
                }
            });
        });
    });
});

router.post('/album/delete', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {

        queries.getPieces({
            albumId: req.body.albumId
        }, function (records) {
            if (!records.errors) {
                records.forEach(function (record) {
                    queries.deletePiece({
                        id: record.id,
                        loggedUser: loggedUser
                    }, function (deletedMedia) {
                        if (!deletedMedia.errors) {
                            socketHandler.getIoInstance().emit('deletedMediaPiece', deletedMedia);
                        }
                    }, function (deletedPost) {
                        if (!deletedPost.errors) {
                            socketHandler.getIoInstance().emit('deletedPost', deletedPost);
                        }
                    });
                });
            }
        });

        queries.deleteAlbum({
            loggedUser: loggedUser,
            albumId: req.body.albumId
        }, function (response) {
            if (response.errors) {
                res.json({errors: response.errors});
                return;
            }

            res.json({response: 'success'});

            socketHandler.getIoInstance().emit('mediaAlbumDelete', {
                id: req.body.albumId,
                parentType: response.parentType,
                posterId: response.posterId
            });
        });
    });
});

router.post('/albums/reorder', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        console.log(req.body);
        queries.reorderAlbums({
            loggedUser: loggedUser,
            pageType: req.body.pageType,
            pageId: req.body.pageId,
            albums: req.body.albums
        }, function (response) {
            console.log(response);
            if (response.errors) {
                res.json({errors: response.errors});
                return;
            }

            res.json({response: 'success'});

            socketHandler.getIoInstance().emit('mediaAlbumReorder', {});
        })
    });
});

router.get('/pieces', function (req, res) {
    queries.getPieces({
        albumId: req.query.albumId
    }, function (records) {
        setTimeout(function () {
            res.json(records);
        }, 1)
    });
});

router.post('/piece', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.postPiece({
            loggedUser: loggedUser,
            req: req,
            res: res
        }, function (newPiece) {
            if (newPiece.errors) {
                res.json(newPiece);
                return;
            }

            socketHandler.getIoInstance().emit('mediaPieceAddOrEdit', newPiece);
            res.json({response: 'success'});

        }, function (newPost) {
            if (!newPost.errors) {
                socketHandler.getIoInstance().emit('newPost', newPost);
            }
        })
    });
});

router.post('/piece/edit', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.editPiece({
            loggedUser: loggedUser,
            id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            mediaText: req.body.mediaText
        }, function (editedPiece) {
            if (!editedPiece.errors) {
                socketHandler.getIoInstance().emit('mediaPieceAddOrEdit', editedPiece);
            }

            res.json(editedPiece);

        }, function (editedPost) {
            if (!editedPost.errors) {
                socketHandler.getIoInstance().emit('editedPost', editedPost);
            }
        });
    });
});

router.post('/piece/delete', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.deletePiece({
            id: req.body.id,
            loggedUser: loggedUser
        }, function (deletedMedia) {
            res.json(deletedMedia);

            if (!deletedMedia.errors) {
                socketHandler.getIoInstance().emit('deletedMediaPiece', deletedMedia);
            }
        }, function (deletedPost) {
            if (!deletedPost.errors) {
                socketHandler.getIoInstance().emit('deletedPost', deletedPost);
            }
        });
    });
});

router.get('/pieces/comments', function (req, res) {
    queries.getComments({
        pieceId: req.query.pieceId
    }, function (records) {
        res.json(records)
    })

});

router.post('/pieces/comments', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {

        queries.postComment({
            content: req.body.content,
            parentId: req.body.parentId,
            postAsType: req.body.postAsType,
            postAsId: req.body.postAsId,
            loggedUser: loggedUser
        }, function (response) {

            queries.getComment({
                id: response.insertId
            }, function (comment) {

                socketHandler.getIoInstance().emit('newPostComment', comment);
                res.json({response: 'success'});
            });
        });
    });
});

router.get('/piece/:mediaId', function (req, res) {
    queries.getPiece({
        mediaId: req.params.mediaId
    }, function (mediaPiece) {
        res.json(mediaPiece);
    })
});

module.exports = router;