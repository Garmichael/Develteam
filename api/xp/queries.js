let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    getXpLevelData = require('../../modules/module_xpLevelData'),
    socketHandler = require('../../modules/module_socketHandler'),
    errorLogger = require('../../modules/module_errorLogger');

function addForForum(data) {
    let query = squel.select()
        .from('forums_posts')
        .field('poster_id', 'posterId')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, forumPost) {
        if (errors || forumPost.length === 0) {
            errorLogger(errors, 'DTE_0240', query);
            return;
        }

        forumPost = forumPost[0];


        if (data.loggedUser.info.id === forumPost.posterId) {
            return;
        }

        query = squel.insert()
            .into('community_points')
            .set('receiver_id', forumPost.posterId)
            .set('receiver_type', 'developer')
            .set('target_id', data.targetId)
            .set('target_type', 'forum')
            .set('trigger_user', data.loggedUser.info.id)
            .set('point_type', 'upvote')
            .set('inductee_id', 0)
            .set('spent_id', 0)
            .set('points', 1)
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0241', query);
                return;
            }

            sendSocket({profileType: 'developer', profileId: forumPost.posterId});
        });
    })
}

function addForPost(data) {
    let query = squel.select()
        .from('posts')
        .field('poster_id', 'posterId')
        .field('subposter_type', 'posterType')
        .field('subposter_id', 'subposterId')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, post) {
        if (errors || post.length === 0) {
            errorLogger(errors, 'DTE_0242', query);
            return;
        }

        post = post[0];


        if (data.loggedUser.info.id === post.posterId) {
            console.log("CANT DO YOUR OWN");
            return;
        }

        query = squel.insert()
            .into('community_points')
            .set('receiver_id', post.posterType === 'game' ? post.subposterId : post.posterId)
            .set('receiver_type', post.posterType)
            .set('target_id', data.targetId)
            .set('target_type', 'post')
            .set('trigger_user', data.loggedUser.info.id)
            .set('point_type', 'upvote')
            .set('inductee_id', 0)
            .set('spent_id', 0)
            .set('points', 1)
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0243', query);
                return;
            }

            sendSocket({profileType: post.posterType, profileId: post.posterType === 'game' ? post.subposterId : post.posterId});
        });
    })
}

function addForMedia(data) {
    let query = squel.select()
        .from('media')
        .field('poster_id', 'posterId')
        .field('poster_type', 'posterType')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, media) {
        if (errors || media.length === 0) {
            errorLogger(errors, 'DTE_0244', query);
            return;
        }

        media = media[0];

        if (data.loggedUser.info.id === media.posterId && media.posterType === 'developer') {
            return;
        }

        query = squel.insert()
            .into('community_points')
            .set('receiver_id', media.posterId)
            .set('receiver_type', media.posterType)
            .set('target_id', data.targetId)
            .set('target_type', 'media')
            .set('trigger_user', data.loggedUser.info.id)
            .set('point_type', 'upvote')
            .set('inductee_id', 0)
            .set('spent_id', 0)
            .set('points', 1)
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0245', query);
                return;
            }

            sendSocket({profileType: media.posterType, profileId: media.posterId});
        });
    })
}

function removeForForum(data) {
    let query = squel.select()
        .from('forums_posts')
        .field('poster_id', 'posterId')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, forumPost) {
        if (errors || forumPost.length === 0) {
            errorLogger(errors, 'DTE_0246', query);
            return;
        }

        forumPost = forumPost[0];

        query = squel.delete()
            .from('community_points')
            .where('receiver_id = ?', forumPost.posterId)
            .where('receiver_type = ?', 'developer')
            .where('target_id = ?', data.targetId)
            .where('target_type = ?', 'forum')
            .where('trigger_user = ?', data.loggedUser.info.id)
            .where('point_type = ?', 'upvote')
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0247', query);
                return;
            }

            sendSocket({profileType: 'developer', profileId: forumPost.posterId});
        });
    });
}

function removeForPost(data) {
    let query = squel.select()
        .from('posts')
        .field('poster_id', 'posterId')
        .field('subposter_type', 'posterType')
        .field('subposter_id', 'subposterId')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, post) {
        if (errors || post.length === 0) {
            errorLogger(errors, 'DTE_0248', query);
            return;
        }

        post = post[0];

        query = squel.delete()
            .from('community_points')
            .where('receiver_id = ?', post.posterType === 'game' ? post.subposterId : post.posterId)
            .where('receiver_type = ?', post.posterType)
            .where('target_id = ?', data.targetId)
            .where('target_type = ?', 'post')
            .where('trigger_user = ?', data.loggedUser.info.id)
            .where('point_type = ?', 'upvote')
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0249', query);
                return;
            }

            sendSocket({profileType: post.posterType, profileId: post.posterType === 'game' ? post.subposterId : post.posterId});
        });
    });
}

function removeForMedia(data) {
    let query = squel.select()
        .from('media')
        .field('poster_id', 'posterId')
        .field('poster_type', 'posterType')
        .where('id = ?', data.targetId)
        .toString();

    databaseQuery(query, [], function (errors, media) {
        if (errors || media.length === 0) {
            errorLogger(errors, 'DTE_0250', query);
            return;
        }

        media = media[0];

        query = squel.delete()
            .from('community_points')
            .where('receiver_id = ?', media.posterId)
            .where('receiver_type = ?', media.posterType)
            .where('target_id = ?', data.targetId)
            .where('target_type = ?', 'media')
            .where('trigger_user = ?', data.loggedUser.info.id)
            .where('point_type = ?', 'upvote')
            .toString();

        databaseQuery(query, [], function (errors) {
            if (errors) {
                errorLogger(errors, 'DTE_0251', query);
                return;
            }

            sendSocket({profileType: media.posterType, profileId: media.posterId});
        });
    });
}

function sendSocket(data) {
    let query,
        newXpData;

    if (data.profileType === 'developer') {
        query = squel.select()
            .from('users')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'xp')
            .where('id = ?', data.profileId)
            .toString();
    }

    if (data.profileType === 'game') {
        query = squel.select()
            .from('games')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=games.id AND receiver_type='game')", 'xp')
            .where('id = ?', data.profileId)
            .toString();
    }

    databaseQuery(query, [], function (errors, profile) {
        if (errors || profile.length === 0) {
            errorLogger(errors, 'DTE_0252', query);
            return;
        }

        profile = profile[0];

        newXpData = getXpLevelData(profile.xp);

        socketHandler.getIoInstance().emit('xpUpdated', {profileType: data.profileType, profileId: data.profileId, xpLevelData: newXpData});
    })
}

module.exports = {
    addXP(data){
        if (data.targetType === 'forum') {
            addForForum(data);
        }

        if (data.targetType === 'post') {
            addForPost(data);
        }

        if (data.targetType === 'media') {
            addForMedia(data);
        }
    },

    removeXP(data){
        if (data.targetType === 'forum') {
            removeForForum(data);
        }

        if (data.targetType === 'post') {
            removeForPost(data);
        }

        if (data.targetType === 'media') {
            removeForMedia(data);
        }
    }
};