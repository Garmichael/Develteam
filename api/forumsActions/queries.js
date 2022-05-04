let squel = require('squel'),
    databaseQuery = require('../../modules/module_mysqlQuery'),
    escape = require('js-string-escape'),
    stringUrlMaker = require('../../modules/module_stringUrlMaker'),
    stringUrlFinder = require('../../modules/module_stringUrlFinder'),
    socketHandler = require('../../modules/module_socketHandler'),
    errorLogger = require('../../modules/module_errorLogger');

let isGameModerator = function (boardId, loggedUser) {
    let id = parseInt(boardId.split('.')[1], 10),
        isModerator = false;

    if (!isNaN(id) && id > 0) {
        loggedUser.games.forEach(function (game) {
            if (game.id === id && (game.moderatorLevel !== 'member')) {
                isModerator = true;
            }
        });
    }

    return isModerator;
};

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
    addCategory(data, callback) {
        let errors = [],
            title = data.title,
            boardId = data.boardId,
            parentType = boardId.split('.')[0] === 'game' ? 'Game' : 'Forums',
            parentId = boardId.split('.')[1] || 0,
            isPrivate = data.isPrivate ? 1 : 0,
            stringUrl,
            query;

        (!data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (parentType === 'Forums' && data.loggedUser.isLoggedIn && data.loggedUser.info.id > 2) && errors.push('Not Validated To Add a Category to this BoardId');
        (typeof title !== 'string' || title.trim() === '') && errors.push('Invalid Title');
        (parentType === 'Game' && data.loggedUser.isLoggedIn && !isGameModerator(boardId, data.loggedUser)) && errors.push('Not Validated To Add a Category to this BoardId');

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        stringUrl = stringUrlMaker(title);

        query = squel.select()
            .from('forums_categories')
            .field('string_url', 'stringUrl')
            .where('parent_type = ?', parentType)
            .where('parent_id = ?', parentId)
            .where('string_url LIKE \'' + stringUrl + '%\'')
            .toString();

        databaseQuery(query, [], function (error, matchingRecords) {
            if (error) {
                errorLogger(error, 'DTE_0157', query);
                callback({errors: [error]});
                return;
            }

            stringUrl = stringUrlFinder(stringUrl, matchingRecords);

            query = squel.insert()
                .into('forums_categories')
                .set('parent_type', parentType)
                .set('parent_id', parentId)
                .set('title', escape(title))
                .set('string_url', stringUrl)
                .set('private', isPrivate ? 1 : 0)
                .set('rank', 22)
                .toString();

            databaseQuery(query, [], function (error, response) {
                let forumQueries = require('../forums/queries');

                if (error) {
                    errorLogger(error, 'DTE_0158', query);
                    callback({errors: [error]});
                    return;
                }

                callback({response: 'success'});

                forumQueries.getCategoryWithForums({categoryId: response.insertId}, function (category) {
                    if (category.errors) {
                        return;
                    }

                    if (!category.isPrivate) {
                        socketHandler.getIoInstance().emit('forumsNewCategory', {category: category, boardId: boardId});

                    } else {
                        if (parentType === 'Game') {
                            query = squel.select()
                                .from('games_members')
                                .left_join('users', null, 'users.id = games_members.member_id')
                                .field('users.passkey', 'passkey')
                                .where('games_members.game_id = ?', parentId)
                                .toString();
                        } else {

                            query = squel.select()
                                .from('users')
                                .field('passkey', 'passkey')
                                .where('id <= 2')
                                .toString();
                        }

                        databaseQuery(query, [], function (error, records) {
                            if (error) {
                                errorLogger(error, 'DTE_0159', query);
                                return;
                            }

                            records.forEach(function (record) {
                                let passkey = record.passkey;

                                socketHandler.getIoInstance().to('user_' + passkey).emit('forumsNewCategory', {category: category, boardId: boardId});
                            });
                        });

                    }
                });
            });
        });
    },

    editCategory(data, callback) {
        let errors = [],
            title = data.title,
            boardId = data.boardId,
            parentType = boardId.split('.')[0] === 'game' ? 'Game' : 'Forums',
            parentId = boardId.split('.')[1] || 0,
            categoryId = parseInt(data.categoryId, 10),
            isPrivate = data.isPrivate ? 1 : 0,
            stringUrl,
            query;

        (!data.loggedUser.isLoggedIn) && errors.push('Not Logged In');
        (parentType === 'Forums' && data.loggedUser.isLoggedIn && data.loggedUser.info.id > 2) && errors.push('Not Validated To Add a Category to this BoardId');
        (typeof title !== 'string' || title.trim() === '') && errors.push('Invalid Title');
        (parentType === 'Game' && data.loggedUser.isLoggedIn && !isGameModerator(boardId, data.loggedUser)) && errors.push('Not Validated To Add a Category to this BoardId');
        (isNaN(categoryId) || categoryId === 0) && errors.push('Not a valid categoryId');

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        stringUrl = stringUrlMaker(title);

        query = squel.select()
            .from('forums_categories')
            .field('string_url', 'stringUrl')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0160', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching Category Found']});
                return;
            }

            let oldStringUrl = records[0].stringUrl;

            query = squel.select()
                .from('forums_categories')
                .field('string_url', 'stringUrl')
                .where('parent_type = ?', parentType)
                .where('parent_id = ?', parentId)
                .where('string_url LIKE \'' + stringUrl + '%\'')
                .where('id != ?', categoryId)
                .toString();

            databaseQuery(query, [], function (error, matchingRecords) {
                if (error) {
                    errorLogger(error, 'DTE_0161', query);
                    callback({errors: [error]});
                    return;
                }

                stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                query = squel.update()
                    .table('forums_categories')
                    .set('title', escape(title))
                    .set('string_url', stringUrl)
                    .set('private', isPrivate ? 1 : 0)
                    .where('id = ?', categoryId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0162', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsEditCategory', {oldStringUrl: oldStringUrl, stringUrl: stringUrl, boardId: boardId});

                    callback({response: 'success'});
                });
            });
        });
    },

    addForum(data, callback) {
        let errors = [],
            title = data.title,
            description = data.description,
            categoryId = parseInt(data.categoryId, 10),
            stringUrl,
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (typeof title !== 'string' || title.length === 0) {
            errors.push('Invalid Title');
        }

        if (typeof description !== 'string') {
            description = '';
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0163', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To Add a Forum to this Game Category']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated To Add a Forum to this Site Category']});
                return;
            }

            stringUrl = stringUrlMaker(title);

            query = squel.select()
                .from('forums_forums')
                .field('string_url', 'stringUrl')
                .where('parent_id = ?', categoryId)
                .where('string_url LIKE \'' + stringUrl + '%\'')
                .toString();

            databaseQuery(query, [], function (error, matchingRecords) {
                if (error) {
                    errorLogger(error, 'DTE_0164', query);
                    callback({errors: [error]});
                    return;
                }

                stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                query = squel.insert()
                    .into('forums_forums')
                    .set('parent_id', categoryId)
                    .set('title', escape(title))
                    .set('description', escape(description))
                    .set('string_url', stringUrl)
                    .set('locked', 0)
                    .set('views', 0)
                    .set('rank', 22)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0165', query);
                        callback({errors: [error]});
                        return;
                    }

                    callback({response: 'success'});

                    let forumQueries = require('../forums/queries');

                    forumQueries.getForum({
                        forumId: response.insertId,
                        loggedUser: data.loggedUser,
                    }, function (data) {
                        if (data.errors) {
                            return;
                        }

                        let boardId;

                        if (data.category.parentType === 'Forums') {
                            boardId = 'site';
                        } else {
                            boardId = 'game.' + data.category.parentId;
                        }

                        if (!data.isPrivate) {
                            socketHandler.getIoInstance().emit('forumsNewForum', {forum: data, boardId: boardId});
                        } else {
                            if (data.category.parentType === 'Game') {
                                query = squel.select()
                                    .from('games_members')
                                    .left_join('users', null, 'users.id = games_members.member_id')
                                    .field('users.passkey', 'passkey')
                                    .where('games_members.game_id = ?', data.category.parentId)
                                    .toString();
                            } else {

                                query = squel.select()
                                    .from('users')
                                    .field('passkey', 'passkey')
                                    .where('id <= 2')
                                    .toString();
                            }

                            databaseQuery(query, [], function (error, records) {
                                if (error) {
                                    errorLogger(error, 'DTE_0166', query);
                                    return;
                                }

                                records.forEach(function (record) {
                                    let passkey = record.passkey;

                                    socketHandler.getIoInstance().to('user_' + passkey).emit('forumsNewForum', {forum: data, boardId: boardId});
                                });
                            });
                        }
                    });
                });
            });


        });

    },

    editForum(data, callback) {
        let errors = [],
            title = data.title,
            description = data.description,
            categoryId = parseInt(data.categoryId, 10),
            forumId = parseInt(data.forumId, 10),
            stringUrl,
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(forumId) || forumId === 0) {
            errors.push('Invalid forumId');
        }

        if (typeof title !== 'string' || title.length === 0) {
            errors.push('Invalid Title');
        }

        if (typeof description !== 'string') {
            description = '';
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0167', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To Add a Forum to this Game Category']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated To Add a Forum to this Site Category']});
                return;
            }

            query = squel.select()
                .from('forums_forums')
                .field('string_url', 'stringUrl')
                .where('id = ?', forumId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0168', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['No matching Forum Id']});
                    return;
                }

                let oldStringUrl = records[0].stringUrl;

                stringUrl = stringUrlMaker(title);

                query = squel.select()
                    .from('forums_forums')
                    .field('string_url', 'stringUrl')
                    .where('parent_id = ?', categoryId)
                    .where('string_url LIKE \'' + stringUrl + '%\'')
                    .where('id != ?', forumId)
                    .toString();

                databaseQuery(query, [], function (error, matchingRecords) {
                    if (error) {
                        errorLogger(error, 'DTE_0169', query);
                        callback({errors: [error]});
                        return;
                    }

                    stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                    query = squel.update()
                        .table('forums_forums')
                        .set('title', escape(title))
                        .set('description', escape(description))
                        .set('string_url', stringUrl)
                        .where('id = ?', forumId)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0170', query);
                            callback({errors: [error]});
                            return;
                        }

                        socketHandler.getIoInstance().emit('forumsEditForum', {oldStringUrl: oldStringUrl, stringUrl: stringUrl});

                        callback({response: 'success'});
                    });
                });
            });

        });
    },

    addThread(data, callback) {
        let errors = [],
            title = data.title,
            content = data.content,
            categoryId = parseInt(data.categoryId, 10),
            forumId = parseInt(data.forumId, 10),
            stringUrl,
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(forumId) || forumId === 0) {
            errors.push('Invalid forumId');
        }

        if (typeof title !== 'string' || title.trim().length === 0) {
            errors.push('Invalid Title');
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
            errors.push('No Post Content Set');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('private', 'isPrivate')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0171', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game' && category.isPrivate) {
                if (!isGameMember('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To post in this Category']});
                    return;
                }
            }


            stringUrl = stringUrlMaker(title);

            query = squel.select()
                .from('forums_threads')
                .field('string_url', 'stringUrl')
                .where('parent_id = ?', categoryId)
                .where('string_url LIKE \'' + stringUrl + '%\'')
                .where('id != ?', forumId)
                .toString();

            databaseQuery(query, [], function (error, matchingRecords) {
                if (error) {
                    errorLogger(error, 'DTE_0172', query);
                    callback({errors: [error]});
                    return;
                }

                stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                query = squel.insert()
                    .into('forums_threads')
                    .set('parent_id', forumId)
                    .set('poster_id', data.loggedUser.info.id)
                    .set('title', escape(title))
                    .set('content', null)
                    .set('string_url', stringUrl)
                    .set('pinned', 0)
                    .set('locked', 0)
                    .set('views', 0)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0173', query);
                        callback({errors: [error]});
                        return;
                    }

                    query = squel.insert()
                        .into('forums_posts')
                        .set('parent_id', response.insertId)
                        .set('poster_id', data.loggedUser.info.id)
                        .set('thread_starter', 1)
                        .set('content', escape(content))
                        .set('views', 0)
                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0174', query);
                            callback({errors: [error]});
                            return;
                        }

                        let forumsQueries = require('../forums/queries');

                        forumsQueries.getThread({
                            forumId: forumId,
                            threadStringUrl: stringUrl
                        }, function (response) {
                            socketHandler.getIoInstance().emit('forumsAddThread', {thread: response, forumId});
                            callback(response);
                        });

                        if(category.parentType === 'Forums'){
                            query = squel.update()
                                .table('users')
                                .where('id != ?', data.loggedUser.info.id)
                                .set('caughtUpOnForums', 0)
                                .toString();

                            databaseQuery(query, [], function (err, response) {
                                socketHandler.getIoInstance().emit('updateUserInfo');
                            });
                        }
                    });
                });
            });

        });
    },

    editThread(data, callback) {
        let errors = [],
            title = data.newTitle,
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            threadPosterId,
            stringUrl,
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (typeof title !== 'string' || title.trim().length === 0) {
            errors.push('Invalid Title');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('private', 'isPrivate')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0175', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            query = squel.select()
                .from('forums_threads')
                .field('string_url', 'stringUrl')
                .field('(select poster_id from forums_posts where forums_posts.parent_id = forums_threads.id and forums_posts.thread_starter = 1)', 'threadStarterId')
                .where('id = ?', threadId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0176', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['Invalid ThreadId']});
                    return;
                }
                let oldStringUrl = records[0].stringUrl;

                threadPosterId = records[0].threadStarterId;

                if (category.parentType === 'Game' && data.loggedUser.info.id !== threadPosterId) {
                    if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                        callback({errors: ['Not Validated']});
                        return;
                    }
                } else if (category.parentType === 'Forums' && ((data.loggedUser.info.id > 2 && data.loggedUser.info.id !== threadPosterId))) {
                    callback({errors: ['Not Validated']});
                    return;
                }

                stringUrl = stringUrlMaker(title);

                query = squel.select()
                    .from('forums_threads')
                    .field('string_url', 'stringUrl')
                    .where('parent_id = ?', categoryId)
                    .where('string_url LIKE \'' + stringUrl + '%\'')
                    .where('id != ?', threadId)
                    .toString();

                databaseQuery(query, [], function (error, matchingRecords) {
                    if (error) {
                        errorLogger(error, 'DTE_0177', query);
                        callback({errors: [error]});
                        return;
                    }

                    stringUrl = stringUrlFinder(stringUrl, matchingRecords);

                    query = squel.update()
                        .table('forums_threads')
                        .set('title', escape(title))
                        .set('string_url', stringUrl)
                        .where('id = ?', threadId)

                        .toString();

                    databaseQuery(query, [], function (error, response) {
                        if (error) {
                            errorLogger(error, 'DTE_0178', query);
                            callback({errors: [error]});
                            return;
                        }

                        socketHandler.getIoInstance().emit('forumsEditThread', {oldStringUrl: oldStringUrl, stringUrl: stringUrl});
                        callback({response: 'success'});

                    });
                });

            });
        });
    },

    pinThread(data, callback) {
        let errors = [],
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('private', 'isPrivate')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0179', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To Pin in this Category']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated To Pin in this Site Category']});
                return;
            }

            query = squel.select()
                .from('forums_threads')
                .field('string_url', 'stringUrl')
                .field('pinned', 'pinned')
                .where('id = ?', threadId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0180', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['No Matching thread Id']});
                    return;
                }

                let pinned = records[0].pinned === 1 ? 0 : 1;
                let stringUrl = records[0].stringUrl;

                query = squel.update()
                    .table('forums_threads')
                    .set('pinned', pinned)
                    .where('id = ?', threadId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0181', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsPinThread', {threadId: threadId, stringUrl: stringUrl, isPinned: pinned});
                    callback({response: 'success'});

                });
            });
        });
    },

    lockThread(data, callback) {
        let errors = [],
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('private', 'isPrivate')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0182', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To Pin in this Category']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated To Pin in this Site Category']});
                return;
            }

            query = squel.select()
                .from('forums_threads')
                .field('string_url', 'stringUrl')
                .field('locked', 'locked')
                .where('id = ?', threadId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0183', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['No Matching thread Id']});
                    return;
                }

                let locked = records[0].locked === 1 ? 0 : 1;
                let stringUrl = records[0].stringUrl;

                query = squel.update()
                    .table('forums_threads')
                    .set('locked', locked)
                    .where('id = ?', threadId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0184', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsLockThread', {threadId: threadId, stringUrl: stringUrl, isLocked: locked});
                    callback({response: 'success'});

                });
            });
        });
    },

    deleteThread(data, callback) {
        let errors = [],
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_threads')
            .field('forums_categories.parent_type', 'parentType')
            .field('forums_categories.parent_id', 'parentId')
            .field('forums_categories.private', 'isPrivate')

            .field('forums_threads.string_url', 'threadStringUrl')

            .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
            .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
            .where('forums_categories.id = ?', categoryId)
            .where('forums_threads.id = ?', threadId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0185', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated To Pin in this Category']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated To Pin in this Site Category']});
                return;
            }

            query = squel.delete()
                .from('forums_threads')
                .where('id = ?', threadId)
                .toString();

            databaseQuery(query, [], function (error, response) {
                if (error) {
                    errorLogger(error, 'DTE_0186', query);
                    callback({errors: [error]});
                    return;
                }

                query = squel.delete()
                    .from('forums_posts')
                    .where('parent_id = ?', threadId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0187', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsDeleteThread', {threadId: threadId, stringUrl: category.threadStringUrl});

                    callback({response: 'success'});

                });
            });
        });
    },

    moveThread(data, callback) {
        let errors = [],
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            moveToForumId = parseInt(data.moveToId, 10),
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (isNaN(moveToForumId) || moveToForumId === 0) {
            errors.push('Invalid moveToForumId');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_threads')
            .field('forums_categories.parent_type', 'parentType')
            .field('forums_categories.parent_id', 'parentId')
            .field('forums_categories.private', 'isPrivate')

            .field('forums_threads.string_url', 'threadStringUrl')

            .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
            .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
            .where('forums_categories.id = ?', categoryId)
            .where('forums_threads.id = ?', threadId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0188', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game') {
                if (!isGameModerator('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated']});
                    return;
                }
            } else if (data.loggedUser.info.id > 2) {
                callback({errors: ['Not Validated']});
                return;
            }

            query = squel.select()
                .from('forums_forums')
                .left_join('forums_categories', null, 'forums_categories.id = forums_forums.parent_id')
                .field('forums_categories.parent_type', 'parentType')
                .field('forums_categories.parent_id', 'parentId')
                .field('forums_categories.string_url', 'stringUrl')
                .field('forums_forums.string_url', 'forumStringUrl')
                .where('forums_forums.id = ?', moveToForumId)

                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0189', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['No Matching moveTo Forum Found']});
                    return;
                }

                let secondCategory = records[0];

                if (secondCategory.parentType === 'Game') {
                    if (!isGameModerator('game.' + secondCategory.parentId, data.loggedUser)) {
                        callback({errors: ['Not Validated to move to destination']});
                        return;
                    }
                } else if (data.loggedUser.info.id > 2) {
                    callback({errors: ['Not Validated to move to destination']});
                    return;
                }

                query = squel.update()
                    .table('forums_threads')
                    .set('parent_id', moveToForumId)
                    .where('id = ?', threadId)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0190', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsMoveThread', {
                        threadId: threadId,
                        categoryStringUrl: secondCategory.stringUrl,
                        forumStringUrl: secondCategory.forumStringUrl,
                        threadStringUrl: category.threadStringUrl
                    });

                    callback({response: 'success'});
                });
            });
        });
    },

    addPost(data, callback) {
        let errors = [],
            categoryId = parseInt(data.categoryId, 10),
            threadId = parseInt(data.threadId, 10),
            content = data.content,
            query;

        if (!data.loggedUser.isLoggedIn) {
            errors.push('Not Logged In');
        }

        if (isNaN(categoryId) || categoryId === 0) {
            errors.push('Invalid CategoryId');
        }

        if (isNaN(threadId) || threadId === 0) {
            errors.push('Invalid threadId');
        }

        if (typeof content !== 'string' || content.trim() === '') {
            errors.push('Invalid content');
        }

        if (errors.length > 0) {
            callback({errors});
            return;
        }

        query = squel.select()
            .from('forums_categories')
            .field('parent_type', 'parentType')
            .field('parent_id', 'parentId')
            .field('private', 'isPrivate')
            .where('id = ?', categoryId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0191', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching CategoryId Found']});
                return;
            }

            let category = records[0];

            if (category.parentType === 'Game' && category.isPrivate) {
                if (!isGameMember('game.' + category.parentId, data.loggedUser)) {
                    callback({errors: ['Not Validated']});
                    return;
                }
            }

            query = squel.select()
                .from('forums_threads')
                .field('forums_threads.id')
                .left_join('forums_forums', null, 'forums_forums.id = forums_threads.parent_id')
                .where('forums_threads.id = ?', threadId)
                .where('forums_forums.parent_id = ?', categoryId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0192', query);
                    callback({errors: [error]});
                    return;
                }

                if (records.length === 0) {
                    callback({errors: ['Not a valid threadId']});
                    return;
                }

                query = squel.insert()
                    .into('forums_posts')
                    .set('parent_id', threadId)
                    .set('poster_id', data.loggedUser.info.id)
                    .set('thread_starter', 0)
                    .set('content', escape(content))
                    .set('views', 0)
                    .toString();

                databaseQuery(query, [], function (error, response) {
                    if (error) {
                        errorLogger(error, 'DTE_0193', query);
                        callback({errors: [error]});
                        return;
                    }

                    socketHandler.getIoInstance().emit('forumsNewPost', {threadId: threadId, posterId: data.loggedUser.info.id});
                    callback({response: 'added a post'});

                    notificationQueries = require('../notifications/queries');

                    notificationQueries.sendNotificationForForumThread({
                        loggedUser: data.loggedUser,
                        threadId: threadId,
                        action: 'comment'
                    });

                    if(category.parentType === 'Forums'){
                        query = squel.update()
                            .table('users')
                            .where('id != ?', data.loggedUser.info.id)
                            .set('caughtUpOnForums', 0)
                            .toString();

                        databaseQuery(query, [], function (err, response) {
                            socketHandler.getIoInstance().emit('updateUserInfo');
                        });
                    }
                });
            });
        });
    },

    editPost(data, callback) {
        let postId = parseInt(data.postId, 10),
            content = data.content,
            query;

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (isNaN(postId) || postId === 0) {
            callback({errors: ['Not a valid post Id']});
            return;
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
            callback({errors: ['No valid content submitted']});
            return;
        }

        query = squel.select()
            .from('forums_posts')
            .field('poster_id', 'posterId')
            .where('id = ?', postId)
            .toString();


        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0194', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching postId']});
                return;
            }

            if (records[0].posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not your post to edit']});
                return;
            }

            query = squel.update()
                .table('forums_posts')
                .set('content', escape(content))
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0195', query);
                    callback({errors: [error]});
                    return;
                }

                callback({response: 'success'});

                socketHandler.getIoInstance().emit('forumsEditPost', {id: postId, content: content});
            });
        });
    },

    deletePost(data, callback) {
        let postId = parseInt(data.postId, 10),
            query;

        if (!data.loggedUser.isLoggedIn) {
            callback({errors: ['Not Logged In']});
            return;
        }

        if (isNaN(postId) || postId === 0) {
            callback({errors: ['Not a valid post Id']});
            return;
        }

        query = squel.select()
            .from('forums_posts')
            .field('poster_id', 'posterId')
            .where('id = ?', postId)
            .toString();

        databaseQuery(query, [], function (error, records) {
            if (error) {
                errorLogger(error, 'DTE_0196', query);
                callback({errors: [error]});
                return;
            }

            if (records.length === 0) {
                callback({errors: ['No Matching postId']});
                return;
            }

            if (records[0].posterId !== data.loggedUser.info.id) {
                callback({errors: ['Not your post to delete']});
                return;
            }

            query = squel.delete()
                .from('forums_posts')
                .where('id = ?', postId)
                .toString();

            databaseQuery(query, [], function (error, records) {
                if (error) {
                    errorLogger(error, 'DTE_0197', query);
                    callback({errors: [error]});
                    return;
                }

                socketHandler.getIoInstance().emit('forumsDeletePost', {id: postId});

                callback({response: 'success'});
            });
        });
    }
};