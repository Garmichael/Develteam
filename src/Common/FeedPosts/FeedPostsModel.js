import Vue from 'vue'
import Axios from 'axios'

let publicFeeds = ['blogFeed', 'mediaFeed', 'classifiedsFeed'];

export default {
    state: {
        feedPosts: {}
    },

    actions: {
        'feedPosts/getFeedPosts': function (context, data) {
            context.commit('feedPosts/initializeDeveloperFeedData', data);
            context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetching'});

            Axios.get('/api/feedPosts', {
                params: {
                    feedType: data.feedType,
                    feedId: data.feedId,
                    startResult: context.state.feedPosts[data.feedPostsId] ? Object.keys(context.state.feedPosts[data.feedPostsId].posts).length : 0,
                    limit: data.limit || 10,
                    direction: 'desc'
                }
            }).then(
                (response) => {
                    context.commit('feedPosts/setFeedPosts', {
                        posts: response.data,
                        feedPostsId: data.feedPostsId,
                        limitFetched: 10
                    });
                    context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetched'});
                }
            );
        },

        'feedPosts/getMediaFeedPosts': function (context, data) {
            context.commit('feedPosts/initializeDeveloperFeedData', data);
            context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetching'});

            Axios.get('/api/feedPosts', {
                params: {
                    feedType: data.feedType,
                    feedId: data.feedId,
                    startResult: context.state.feedPosts[data.feedPostsId] ? Object.keys(context.state.feedPosts[data.feedPostsId].posts).length : 0,
                    limit: data.limit || 10,
                    postType: 'media',
                    direction: 'desc'
                }
            }).then(
                (response) => {
                    context.commit('feedPosts/setFeedPosts', {
                        posts: response.data,
                        feedPostsId: data.feedPostsId,
                        limitFetched: 10
                    });
                    context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetched'});
                }
            );
        },


        'feedPosts/getBlogFeedPosts': function (context, data) {
            context.commit('feedPosts/initializeDeveloperFeedData', data);
            context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetching'});

            Axios.get('/api/feedPosts', {
                params: {
                    feedType: data.feedType,
                    feedId: data.feedId,
                    startResult: context.state.feedPosts[data.feedPostsId] ? Object.keys(context.state.feedPosts[data.feedPostsId].posts).length : 0,
                    limit: data.limit || 10,
                    postType: 'blog',
                    direction: 'desc'
                }
            }).then(
                (response) => {
                    context.commit('feedPosts/setFeedPosts', {
                        posts: response.data,
                        feedPostsId: data.feedPostsId,
                        limitFetched: 10
                    });
                    context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetched'});
                }
            );
        },

        'feedPosts/getClassifiedsFeedPosts': function (context, data) {
            context.commit('feedPosts/initializeDeveloperFeedData', data);
            context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetching'});

            Axios.get('/api/feedPosts', {
                params: {
                    feedType: data.feedType,
                    feedId: data.feedId,
                    startResult: context.state.feedPosts[data.feedPostsId] ? Object.keys(context.state.feedPosts[data.feedPostsId].posts).length : 0,
                    limit: data.limit || 10,
                    postType: 'classifieds',
                    direction: 'desc'
                }
            }).then(
                (response) => {
                    context.commit('feedPosts/setFeedPosts', {
                        posts: response.data,
                        feedPostsId: data.feedPostsId,
                        limitFetched: 10
                    });
                    context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetched'});
                }
            );
        },

        'feedPosts/getSingleFeedPost': function (context, data) {
            context.commit('feedPosts/initializeDeveloperFeedData', data);
            context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetching'});

            Axios.get('/api/feedPosts/' + data.postId, {
                params: {
                    feedType: data.feedType,
                    feedId: data.feedId
                }
            }).then(
                (response) => {
                    if (response.data.parentType === data.feedType && response.data.parentId === data.feedId) {
                        context.commit('feedPosts/setFeedPosts', {
                            posts: [response.data],
                            feedPostsId: data.feedPostsId,
                            limitFetched: 10
                        });
                    }

                    context.commit('feedPosts/setFetchingStatus', {feedPostsId: data.feedPostsId, status: 'fetched'});
                }
            );
        },

        'feedPosts/postNewPost': function (context, data) {
            Axios.post('/api/feedPosts', {
                subject: data.subject,
                content: data.content,
                postParentType: data.parentType,
                postParentId: data.parentId,
                type: data.type
            });
        },

        'feedPosts/editPostContent': function (context, postData) {
            Axios.post('/api/feedPosts/edit', {
                postId: postData.id,
                title: postData.title,
                content: postData.content
            });
        },

        'feedPosts/deletePost': function (context, commentData) {
            Axios.post('/api/feedPosts/delete', {
                postId: commentData.id
            });
        },

        'feedPosts/pinPost': function (context, data) {
            Axios.post('/api/feedPosts/togglePin', {
                postId: data.id
            });
        },

        'feedPosts/getComments': function (context, postData) {
            const isMediaPost = postData.type === 'media';

            Axios.get('/api/feedPosts/comments', {
                params: {
                    postId: isMediaPost ? postData.mediaData.id : postData.id,
                    isMediaPost: isMediaPost
                }
            }).then(
                (response) => {
                    context.commit('feedPosts/setComments', {postData: postData, comments: response.data})
                }
            );
        },

        'feedPosts/addComment': function (context, data) {
            const isMediaPost = data.post.type === 'media',
                postAsType = data.postAs.split('|')[0],
                postAsId = data.postAs.split('|')[1];

            Axios.post('/api/feedPosts/comments', {
                content: data.content,
                parentId: isMediaPost ? data.post.mediaData.id : data.post.id,
                postAsType: postAsType,
                postAsId: postAsId,
                isMediaPost: isMediaPost
            });
        },

        'feedPosts/editCommentContent': function (context, commentData) {
            Axios.post('/api/feedPosts/edit', {
                content: commentData.content,
                postId: commentData.id
            });
        },

        'feedPosts/deleteComment': function (context, commentData) {
            Axios.post('/api/feedPosts/delete', {
                postId: commentData.id
            });
        }
    },

    mutations: {
        'feedPosts/initializeDeveloperFeedData': function (state, data) {
            if (!state.feedPosts[data.feedPostsId]) {
                Vue.set(state.feedPosts, data.feedPostsId, {
                    posts: {},
                    fetchingStatus: 'unfetched',
                    hasFetchedAll: false
                });
            }
        },

        'feedPosts/setFetchingStatus': function (state, data) {
            Vue.set(state.feedPosts[data.feedPostsId], 'fetchingStatus', data.status);
        },

        'feedPosts/setFeedPosts': function (state, data) {
            if (data.posts.length < data.limitFetched) {
                Vue.set(state.feedPosts[data.feedPostsId], 'hasFetchedAll', true);
            }

            data.posts.forEach(function (post) {
                Vue.set(state.feedPosts[data.feedPostsId].posts, post.id, post);
                Vue.set(state.feedPosts[data.feedPostsId].posts[post.id], 'comments', {});
            });
        },

        'feedPosts/appendPost': function (state, data) {
            let feedPostsId = data.subPosterType + '.' + data.parentId;

            if (state.feedPosts[feedPostsId]) {
                Vue.set(state.feedPosts[feedPostsId].posts, data.id, data);
                Vue.set(state.feedPosts[feedPostsId].posts[data.id], 'comments', {});
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed]) {
                    let shouldAppendToThisFeed =
                        (feed === 'blogFeed' && data.type === 'status') ||
                        (feed === 'mediaFeed' && data.type === 'media') ||
                        (feed === 'classifiedsFeed' && data.type === 'classifieds');

                    if (shouldAppendToThisFeed) {
                        Vue.set(state.feedPosts[feed].posts, data.id, data);
                        Vue.set(state.feedPosts[feed].posts[data.id], 'comments', {});
                    }
                }
            });
        },

        'feedPosts/updatePost': function (state, data) {
            const feedPostsId = data.subPosterType + '.' + data.parentId;

            if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[data.id]) {
                Vue.set(state.feedPosts[feedPostsId].posts, data.id, data);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] && state.feedPosts[feed].posts[data.id]) {
                    Vue.set(state.feedPosts[feed].posts, data.id, data);
                }
            });
        },

        'feedPosts/deletePost': function (state, data) {
            let feedPostsId = data.subPosterType + '.' + data.parentId;

            if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[data.id]) {
                Vue.delete(state.feedPosts[feedPostsId].posts, data.id);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] && state.feedPosts[feed].posts[data.id]) {
                    Vue.delete(state.feedPosts[feed].posts, data.id);
                }
            });
        },

        'feedPosts/pinnedPost':function (state, data) {
            const feedPostsId = data.subPosterType + '.' + data.parentId;

            if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[data.id]) {
                Vue.set(state.feedPosts[feedPostsId].posts[data.id], 'isPinned', data.isPinned);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] && state.feedPosts[feed].posts[data.id]) {
                    Vue.set(state.feedPosts[feed].posts[data.id], 'isPinned', data.isPinned);
                }
            });
        },

        'feedPosts/setComments': function (state, data) {
            let feedPostsId,
                postId = data.postData.id;

            if (data.postData.subPosterType === 'developer') {
                feedPostsId = data.postData.subPosterType + '.' + data.postData.posterDetails.id;
            }

            if (data.postData.subPosterType === 'game') {
                feedPostsId = data.postData.subPosterType + '.' + data.postData.subPosterDetails.id;
            }

            data.comments.forEach(function (comment) {
                if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[postId]) {
                    Vue.set(state.feedPosts[feedPostsId].posts[postId].comments, comment.id, comment);
                }

                publicFeeds.forEach(function (feed) {
                    if (state.feedPosts[feed] && state.feedPosts[feed].posts[postId]) {
                        Vue.set(state.feedPosts[feed].posts[postId].comments, comment.id, comment);
                    }
                });
            });
        },

        'feedPosts/appendComment': function (state, data) {
            const feedPostsId = data.parentData.parentType + '.' + data.parentData.parentId;

            if (state.feedPosts[feedPostsId] &&
                state.feedPosts[feedPostsId].posts[data.parentData.id] &&
                state.feedPosts[feedPostsId].posts[data.parentData.id].comments
            ) {
                Vue.set(state.feedPosts[feedPostsId].posts[data.parentData.id].comments, data.commentData.id, data.commentData);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] &&
                    state.feedPosts[feed].posts[data.parentData.id] &&
                    state.feedPosts[feed].posts[data.parentData.id].comments
                ) {
                    Vue.set(state.feedPosts[feed].posts[data.parentData.id].comments, data.commentData.id, data.commentData);
                }
            });
        },

        'feedPosts/updateComment': function (state, data) {
            let feedPostsId = data.parentData.parentType + '.' + data.parentData.parentId,
                postId = data.parentData.id,
                commentId = data.commentData.id,
                newContent = data.commentData.content;

            if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[postId]) {
                Vue.set(state.feedPosts[feedPostsId].posts[postId].comments[commentId], 'content', newContent);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] && state.feedPosts[feed].posts[postId]) {
                    Vue.set(state.feedPosts[feed].posts[postId].comments[commentId], 'content', newContent);
                }
            })
        },

        'feedPosts/deleteComment': function (state, data) {
            const feedPostsId = data.parentData.parentType + '.' + data.parentData.parentId;

            if (state.feedPosts[feedPostsId] && state.feedPosts[feedPostsId].posts[data.parentData.id]) {
                Vue.delete(state.feedPosts[feedPostsId].posts[data.parentData.id].comments, data.id);
            }

            publicFeeds.forEach(function (feed) {
                if (state.feedPosts[feed] && state.feedPosts[feed].posts[data.parentData.id]) {
                    Vue.delete(state.feedPosts[feed].posts[data.parentData.id].comments, data.id);
                }
            });
        },
    }

}