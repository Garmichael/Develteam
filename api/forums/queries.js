let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    getXpLevelData = require('../../modules/module_xpLevelData'),
    escape = require('js-string-escape'),
    stringUrlMaker = require('../../modules/module_stringUrlMaker'),
    stringUrlFinder = require('../../modules/module_stringUrlFinder'),
    xpLevelData = require('../../modules/module_xpLevelData'),
    errorLogger = require('../../modules/module_errorLogger');


let isGameMember = function (boardId, loggedUser) {
    let id = parseInt(boardId.split('.')[1], 10),
        isMember = false;

    if (!isNaN(id) && id > 0) {
        loggedUser.games.forEach(function (game) {
            if (game.id === id) {
                isMember = true;
            }
        });
    }

    return isMember;
};

module.exports = {
    getCategoriesAndForums: function (data, callback) {
        let parentType = data.parentType;
        let parentId = parseInt(data.parentId, 10);
        let includePrivate = false;
        let query;

        if (parentType !== 'site' && (isNaN(parentId) || parentId === 0)) {
            callback({errors: ['No Parent Id Set']});
            return;
        }

        if (parentType === 'site') {
            parentId = 0;
        }

        if (parentType === 'site') {
            parentType = 'Forums';
        }

        if (parentType.toLowerCase() === 'game') {
            parentType = 'Game'
        }

        if (parentType !== 'Game' && parentType !== 'Forums') {
            callback({errors: ['Invalid ParentType']});
            return;
        }

        includePrivate = (
            data.loggedUser.isLoggedIn &&
            parentType === 'Game' &&
            isGameMember('game.' + parentId, data.loggedUser)
        ) || (
            data.loggedUser.isLoggedIn &&
            parentType === 'Forums' &&
            data.loggedUser.info.id <= 2
        );

        query = squel.select()
            .from('forums_categories')
            .field('forums_categories.id', 'categoryId')
            .field('forums_categories.title', 'categoryTitle')
            .field('forums_categories.string_url', 'categoryStringUrl')
            .field('forums_categories.private', 'categoryIsPrivate')
            .field('forums_categories.rank', 'categoryRank')

            .field('forums_forums.id', 'forumId')
            .field('forums_forums.title', 'forumTitle')
            .field('forums_forums.description', 'forumDescription')
            .field('forums_forums.string_url', 'forumStringUrl')

            .field('(select count(*) from forums_threads where forums_threads.parent_id = forums_forums.id)', 'forumTotalThreads')
            .field(`(select count(*) from forums_posts 
                left join forums_threads on forums_threads.id = forums_posts.parent_id 
                where forums_threads.parent_id = forums_forums.id)`, 'forumTotalPosts')

            .left_join('forums_forums', null, 'forums_categories.id = forums_forums.parent_id')

            .where('forums_categories.parent_type = ?', parentType)
            .where('forums_categories.parent_id = ?', parentId);

        if (!includePrivate) {
            query = query.where('forums_categories.private = ?', '0')
        }

        query = query.toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0151', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            let categories = {};

            records.forEach(function (record) {
                if (categories[record.categoryStringUrl] === undefined) {
                    categories[record.categoryStringUrl] = {
                        id: record.categoryId,
                        title: record.categoryTitle,
                        stringUrl: record.categoryStringUrl,
                        isPrivate: record.categoryIsPrivate,
                        rank: record.categoryRank,
                        forums: {}
                    };
                }

                if (record.forumId) {
                    categories[record.categoryStringUrl].forums[record.forumStringUrl] = {
                        id: record.forumId,
                        title: record.forumTitle,
                        description: record.forumDescription,
                        stringUrl: record.forumStringUrl,
                        locked: record.forumLocked,
                        views: record.forumViews,
                        lastReply: record.forumLastReply,
                        totalThreads: record.forumTotalThreads,
                        totalPosts: record.forumTotalPosts
                    }
                }
            });

            callback(categories);
        });
    },

    getCategoryWithForums: function (data, callback) {
        let categoryId = parseInt(data.categoryId, 10),
            query;

        if (isNaN(categoryId)) {
            callback({errors: ['Invalid CategoryId']});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('forums_categories.id', 'categoryId')
            .field('forums_categories.title', 'categoryTitle')
            .field('forums_categories.string_url', 'categoryStringUrl')
            .field('forums_categories.private', 'categoryIsPrivate')
            .field('forums_categories.rank', 'categoryRank')

            .field('forums_forums.id', 'forumId')
            .field('forums_forums.title', 'forumTitle')
            .field('forums_forums.description', 'forumDescription')
            .field('forums_forums.string_url', 'forumStringUrl')

            .field('(select count(*) from forums_threads where forums_threads.parent_id = forums_forums.id)', 'forumTotalThreads')
            .field(`(select count(*) from forums_posts 
                left join forums_threads on forums_threads.id = forums_posts.parent_id 
                where forums_threads.parent_id = forums_forums.id)`, 'forumTotalPosts')

            .left_join('forums_forums', null, 'forums_categories.id = forums_forums.parent_id')

            .where('forums_categories.id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0152', query, null, data.loggedUser);
                callback({errors: [error]});
                return;
            }

            let category = {
                id: records[0].categoryId,
                title: records[0].categoryTitle,
                stringUrl: records[0].categoryStringUrl,
                isPrivate: records[0].categoryIsPrivate,
                rank: records[0].categoryRank,
                forums: {}
            };

            records.forEach(function (record) {
                if (record.forumId) {
                    category.forums[record.forumStringUrl] = {
                        id: record.forumId,
                        title: record.forumTitle,
                        description: record.forumDescription,
                        stringUrl: record.forumStringUrl,
                        locked: record.forumLocked,
                        views: record.forumViews,
                        lastReply: record.forumLastReply,
                        totalThreads: record.forumTotalThreads,
                        totalPosts: record.forumTotalPosts
                    }
                }
            });

            callback(category);
        });
    },

    getForum: function (data, callback) {
        let forumId = parseInt(data.forumId, 10),
            query;

        if (isNaN(forumId)) {
            callback({errors: ['Invalid forumId']});
            return;
        }

        query = squel.select()
            .from('forums_forums')
            .field('forums_forums.id', 'id')
            .field('forums_forums.title', 'title')
            .field('forums_forums.description', 'description')
            .field('forums_forums.string_url', 'stringUrl')

            .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
            .field('forums_categories.id', 'categoryId')
            .field('forums_categories.title', 'categoryTitle')
            .field('forums_categories.string_url', 'categoryStringUrl')
            .field('forums_categories.private', 'categoryIsPrivate')
            .field('forums_categories.rank', 'categoryRank')
            .field('forums_categories.parent_type', 'categoryParentType')
            .field('forums_categories.parent_id', 'categoryParentId')

            .where('forums_forums.id = ?', forumId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0153', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['forumId not found']});
                return;
            }

            let forum = records[0];

            forum.category = {
                id: forum.categoryId,
                title: forum.categoryTitle,
                stringUrl: forum.categoryStringUrl,
                isPrivate: forum.categoryIsPrivate,
                rank: forum.categoryRank,
                parentType: forum.categoryParentType,
                parentId: forum.categoryParentId,
            };

            delete forum.categoryId;
            delete forum.categoryTitle;
            delete forum.categoryStringUrl;
            delete forum.categoryIsPrivate;
            delete forum.categoryRank;
            delete forum.categoryParentType;
            delete forum.categoryParentId;

            if (forum.category.isPrivate) {
                if (!data.loggedUser.isLoggedIn) {
                    callback({errors: ['Not Validated to access this Forum']});
                    return;
                }

                if (forum.category.parentType === 'Forums' && data.loggedUser.info.id > 2) {
                    callback({errors: ['Not Validated to access this Forum']});
                    return;
                }

                if (forum.category.parentType === 'Game' && !isGameMember('game.' + forum.category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated to access this Forum']});
                    return;
                }
            }

            callback(forum);
        })
    },

    getThread: function (data, callback) {
        let forumId = parseInt(data.forumId, 10);
        let threadStringUrl = data.threadStringUrl;
        let query;

        if (isNaN(forumId) || forumId === 0) {
            callback({errors: 'No Forum Id set'});
            return;
        }

        if (typeof threadStringUrl !== 'string' || threadStringUrl.trim() === '') {
            callback({errors: 'No thread identifier set'});
            return;
        }

        query = squel.select()
            .from('forums_threads')
            .field('id', 'id')
            .field('parent_id', 'parentId')
            .field('poster_id', 'posterId')
            .field('title', 'title')
            .field('string_url', 'stringUrl')
            .field('pinned', 'pinned')
            .field('locked', 'locked')
            .field('views', 'views')
            .field('(select count(*) from forums_posts where forums_posts.parent_id = forums_threads.id)', 'totalPosts')
            .field('created', 'created')
            .field('(select poster_id from forums_posts where forums_posts.parent_id = forums_threads.id and forums_posts.thread_starter = 1)', 'threadStarterId')
            .where('string_url = ?', escape(threadStringUrl))
            .where('parent_id = ?', forumId)
            .toString();

        databaseQuery(query, [], function (error, threads) {
            if (error) {
                errorLogger(error, 'DTE_0154', query);
                callback({errors: [error]});
                return;
            }

            if (threads.length === 0) {
                callback({errors: ['No Matching Thread Found']});
                return;
            }

            let thread = threads[0];

            query = squel.update()
                .table('forums_threads')
                .set('views', thread.views + 1)
                .where('string_url = ?', escape(threadStringUrl))
                .where('parent_id = ?', forumId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                thread.views += 1;
                callback(thread);
            })
        });

    },

    getThreads: function (data, callback) {
        let parentId = parseInt(data.forumId, 10);
        let page = parseInt(data.page, 10);
        let perPage = parseInt(data.perPage, 10);
        let offset;
        let query;

        if (isNaN(parentId) || parentId === 0) {
            callback({errors: ['No Parent Id Set']});
            return;
        }

        if (isNaN(page) || page < 1) {
            page = 1;
        }

        if (isNaN(perPage) || perPage === 0) {
            perPage = 20;
        }

        offset = (page - 1) * perPage;

        query = squel.select()
            .from('forums_threads')
            .field('forums_threads.id', 'id')
            .field('forums_threads.parent_id', 'parentId')
            .field('forums_threads.poster_id', 'posterId')
            .field('forums_threads.title', 'title')
            .field('forums_threads.string_url', 'stringUrl')
            .field('forums_threads.pinned', 'pinned')
            .field('forums_threads.locked', 'locked')
            .field('forums_threads.views', 'views')
            .field('forums_threads.created', 'created')
            .field('(select count(*) from forums_posts where forums_posts.parent_id = forums_threads.id)', 'totalPosts')
            .field('(select max(created) from forums_posts where forums_posts.parent_id = forums_threads.id)', 'lastPostTime')
            .field('(select poster_id from forums_posts where forums_posts.parent_id = forums_threads.id and forums_posts.thread_starter = 1)', 'threadStarterId')

            .where('parent_id = ?', parentId)
            .offset(offset)
            .limit(perPage)
            .order('pinned', 'desc')
            .order('lastPostTime', 'desc')
            .toString();

        databaseQuery(query, [], function (error, threads) {
            if (error) {
                errorLogger(error, 'DTE_0155', query);
                callback({errors: [error]});
                return;
            }

            let payload = {};

            threads.forEach(function (thread) {
                payload[thread.stringUrl] = thread;
            });

            callback(payload);
        });
    },

    getPosts(data, callback) {
        let threadId = parseInt(data.threadId, 10);
        let page = parseInt(data.page, 10);
        let perPage = parseInt(data.perPage, 10);
        let offset;
        let query;

        if (isNaN(threadId) || threadId === 0) {
            callback({errors: ['No Thread Id Set']});
            return;
        }

        if (isNaN(page) || page <= 0) {
            page = 1;
        }

        if (isNaN(perPage) || perPage <= 0) {
            perPage = 20;
        }

        offset = (page - 1) * perPage;

        query = squel.select()
            .from('forums_posts')
            .field('forums_posts.id', 'id')
            .field('forums_posts.thread_starter', 'threadStarter')
            .field('forums_posts.content', 'content')
            .field('forums_posts.created', 'created')
            .field('forums_posts.modified', 'modified')

            .left_join('users', null, 'users.id = forums_posts.poster_id')
            .field('users.id', 'posterId')
            .field(`IFNULL(users.alias, 'DELETED USER')`, 'posterAlias')
            .field(`IFNULL(users.string_url, 'DELETED-USER')`, 'posterStringUrl')
            .field('users.has_avatar', 'posterHasAvatar')
            .field('users.avatarId', 'posterAvatarId')
            .field("(SELECT IFNULL(SUM(userXP.points),0) FROM community_points userXP WHERE receiver_id=users.id AND receiver_type='developer')", 'posterXp')

            .where('parent_id = ?', threadId)

            .order('forums_posts.created', 'asc')
            .offset(offset)
            .limit(perPage)

            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0156', query);
                callback({errors: [error]});
                return;
            }

            let posts = {};

            records.forEach(function (record) {
                record.posterData = {
                    id: record.posterId,
                    alias: record.posterAlias,
                    stringUrl: record.posterStringUrl,
                    hasAvatar: record.posterHasAvatar,
                    avatarId: record.posterAvatarId,
                    xpLevelData: xpLevelData(record.posterXp)
                };

                delete record.posterId;
                delete record.posterAlias;
                delete record.posterStringUrl;
                delete record.posterHasAvatar;
                delete record.posterXp;

                posts[record.id] = record;

            });

            callback(posts);
        });
    },

    getRecentPosts(callback) {
        let query;

        query = squel.select()
            .from('forums_posts')
            .field('forums_posts.created', 'postDate')

            .left_join('users', 'poster', 'poster.id = forums_posts.poster_id')
            .field('poster.alias', 'posterAlias')
            .field('poster.string_url', 'posterStringUrl')

            .left_join('forums_threads', null, 'forums_threads.id = forums_posts.parent_id')
            .field('forums_threads.title', 'threadAlias')
            .field('forums_threads.string_url', 'threadStringUrl')

            .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
            .field('forums_forums.title', 'forumAlias')
            .field('forums_forums.string_url', 'forumStringUrl')

            .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
            .field('forums_categories.title', 'categoryAlias')
            .field('forums_categories.string_url', 'categoryStringUrl')

            .left_join('games', null, 'games.id = forums_categories.parent_id')
            .field('games.alias', 'gameAlias')
            .field('games.string_url', 'gameStringUrl')

            .where('forums_categories.private = 0')

            .order('postDate', 'desc')
            .limit('5')
            .toString();

        databaseQuery(query, [], (errors, posts) => {
            if (errors) {
                callback({errors: errors});
                return;
            }

            callback(posts);
        });
    }
};