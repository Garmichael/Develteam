let express = require('express');
let router = express.Router();
let loggedUserBuilder = require('../../modules/module_loggedUserBuilder');
let socketHandler = require('../../modules/module_socketHandler');
let queries = require('./queries');

router.get('/', function (req, res) {
    queries.getPosts(req.query, function (records) {
        res.json(records);
    });
});

router.get('/comments', function (req, res) {
    queries.getPostComments(req.query, function (records) {
        res.json(records);
    });
});

router.get('/:id', function (req, res) {
    queries.getPost({
        postId: req.params.id
    }, function (record) {
        res.json(record);
    });
});

router.get('/comment/:id', function (req, res) {
    queries.getPostComment({
        commentId: req.params.id
    }, function (record) {
        res.json(record);
    });
});

router.post('/', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.postPost({
            postParentType: req.body.postParentType,
            postParentId: req.body.postParentId,
            title: req.body.subject,
            content: req.body.content,
            type: req.body.type,
            loggedUser: loggedUser
        }, function (newPostData) {
            if (newPostData.errors) {
                res.json(newPostData);
                return;
            }

            res.json({response: 'success'});

            queries.getPost({postId: newPostData.id}, function (record) {
                socketHandler.getIoInstance().emit('newPost', record);
            });

        })
    });
});

router.post('/comments', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.postPostComment({
            content: req.body.content,
            parentId: req.body.parentId,
            postAsType: req.body.postAsType,
            postAsId: req.body.postAsId,
            isMediaPost: req.body.isMediaPost === true || req.body.isMediaPost === 'true',
            loggedUser: loggedUser
        }, function (commentData) {
            if (commentData.errors) {
                res.json(commentData);
                return;
            }

            res.json({response: 'success'});
            socketHandler.getIoInstance().emit('newPostComment', commentData);
        })
    });
});

router.post('/edit', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.editPostOrComment({
            postId: req.body.postId,
            newTitle: req.body.title,
            newContent: req.body.content,
            loggedUser: loggedUser
        }, function (editedPost) {
            if (editedPost.errors) {
                res.json(editedPost);
                return;
            }

            res.json({response: 'success'});
            socketHandler.getIoInstance().emit('editedPost', editedPost);
        });
    });
});

router.post('/delete', function (req, res) {
    loggedUserBuilder.buildLoggedUserData(req, function (loggedUser) {
        queries.deletePostOrComment({
            postId: req.body.postId,
            loggedUser: loggedUser
        }, function (deletedPost) {
            if (deletedPost.errors) {
                res.json(deletedPost);
                return;
            }

            res.json({response: 'success'});

            socketHandler.getIoInstance().emit('deletedPost', deletedPost);
        })
    })
});

module.exports = router;