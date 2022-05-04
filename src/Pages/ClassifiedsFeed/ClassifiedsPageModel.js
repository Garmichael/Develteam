import axios from 'axios'

export default {
    state: {
        posts: []
    },

    actions: {
        'classifiedsPage/getClassifieds'(context, data) {
            axios.get('/api/classifieds', {
                params: {
                    postType: data.postType,
                    role: data.role,
                    skillId: data.skillId,
                }
            }).then(
                (response) => {
                    context.commit('classifiedsPage/setClassifieds', response.data.response);
                    if (data.callback) {
                        data.callback();
                    }
                }
            );
        },

        'classifiedsPage/submitNewClassifiedsPost'(context, data) {
            axios.post('/api/classifieds/new', {
                selectedGameId: data.selectedGameId,
                postTitle: data.postTitle,
                postContent: data.postContent,

            }).then(
                (response) => {
                    if (data.callback) {
                        data.callback(response.data);
                    }
                }
            )
        },

        'classifiedsPage/submitEditedClassifiedsPost'(context, data) {
            axios.post('/api/classifieds/edit', {
                postId: data.postId,
                postTitle: data.postTitle,
                postContent: data.postContent,
            }).then(
                (response) => {
                    if (data.callback) {
                        data.callback(response.data);
                    }
                }
            )
        },

        'classifiedsPage/deleteClassifiedsPost'(context, data) {
            axios.post('/api/classifieds/delete', {
                postId: data.postId
            }).then(
                (response) => {
                    if (data.callback) {
                        data.callback(response.data);
                    }
                }
            )
        },

        'classifiedsPage/getClassifiedPost'(context, data) {
            axios.get('/api/classifieds/post', {
                params: {
                    postId: data.postId
                }
            }).then(
                (response) => {
                    if (data.callback) {
                        data.callback(response.data);
                    }
                }
            );
        },
    },

    mutations: {
        'classifiedsPage/setClassifieds'(state, data) {
            state.posts = data;
        },
    }

}