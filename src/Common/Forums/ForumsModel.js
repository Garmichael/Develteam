import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        boards: {}
    },

    actions: {
        'forums/getCategoriesAndForums'(context, data) {
            context.commit('forums/setInitialState', data);

            Vue.set(context.state.boards[data.boardId], 'fetchingStatus', 'fetching');

            axios.get('/api/forums/categoriesAndForums', {
                params: {
                    parentType: data.boardId.split('.')[0],
                    parentId: data.boardId.split('.')[1]
                }
            }).then(
                (response) => {
                    context.commit('forums/setCategories', {boardId: data.boardId, categories: response.data})
                },
                (response) => {
                    console.log(response);
                }
            )
        },

        'forums/getThreads'(context, data){
            Vue.set(context.state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl], 'fetchingStatus', 'fetching');

            axios.get('/api/forums/threads', {
                params: {
                    forumId: data.forumId,
                    page: data.page,
                    perPage: data.perPage
                }
            }).then(
                (response) => {
                    context.commit('forums/setThreads', {
                        boardId: data.boardId,
                        categoryStringUrl: data.categoryStringUrl,
                        forumStringUrl: data.forumStringUrl,
                        threads: response.data
                    })
                },
                (response) => {
                    console.log(response);
                }
            )
        },

        'forums/getThread'(context, data){
            axios.get('/api/forums/thread', {
                params: {
                    forumId: data.forumId,
                    threadStringUrl: data.threadStringUrl
                }
            }).then(
                (response) => {
                    if (!response.data.errors) {
                        context.commit('forums/setThread', {
                            boardId: data.boardId,
                            categoryStringUrl: data.categoryStringUrl,
                            forumStringUrl: data.forumStringUrl,
                            threadStringUrl: data.threadStringUrl,
                            thread: response.data
                        })
                    }
                },
                (response) => {
                    console.log(response);
                }
            )
        },

        'forums/getPosts'(context, data){
            if (!data.noLoader) {
                Vue.set(context.state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl].threads[data.threadStringUrl], 'fetchingStatus', 'fetching');
            }

            axios.get('/api/forums/posts', {
                params: {
                    threadId: data.threadId,
                    page: data.page,
                    perPage: data.perPage
                }
            }).then(
                (response) => {
                    context.commit('forums/setPosts', {
                        boardId: data.boardId,
                        categoryStringUrl: data.categoryStringUrl,
                        forumStringUrl: data.forumStringUrl,
                        threadStringUrl: data.threadStringUrl,
                        posts: response.data
                    })
                },
                (response) => {
                    console.log(response);
                }
            )
        }
    },

    mutations: {
        'forums/setInitialState'(state, data){
            Vue.set(state.boards, data.boardId, {});
        },

        'forums/setCategories'(state, data) {
            Vue.set(state.boards[data.boardId], 'categories', data.categories);
            Vue.set(state.boards[data.boardId], 'fetchingStatus', 'fetched');
        },

        'forums/addCategory'(state, data){
            if (state.boards[data.boardId] && state.boards[data.boardId].categories) {
                Vue.set(state.boards[data.boardId].categories, data.category.stringUrl, data.category);
            }
        },

        'forums/addForum'(state, data){
            if (state.boards[data.boardId] &&
                state.boards[data.boardId].categories &&
                state.boards[data.boardId].categories[data.forum.category.stringUrl] &&
                state.boards[data.boardId].categories[data.forum.category.stringUrl].forums
            ) {
                Vue.set(state.boards[data.boardId].categories[data.forum.category.stringUrl].forums, data.forum.stringUrl, data.forum);
            }
        },

        'forums/setThreads'(state, data) {
            Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl], 'threads', data.threads);
            Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl], 'fetchingStatus', 'fetched');
        },

        'forums/setThread'(state, data) {
            if (state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl].threads === undefined) {
                Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl], 'threads', {});
            }

            Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl].threads, data.threadStringUrl, data.thread);
        },

        'forums/setPosts'(state, data){
            Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl].threads[data.threadStringUrl], 'posts', data.posts);
            Vue.set(state.boards[data.boardId].categories[data.categoryStringUrl].forums[data.forumStringUrl].threads[data.threadStringUrl], 'fetchingStatus', 'fetched');
        }
    }

}