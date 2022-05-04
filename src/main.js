require('es6-promise').polyfill();

import styles from './main.less';

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import {sync} from 'vuex-router-sync'
import VueSocketio from './ForkedModules/VueSocketIo/main';
import axios from 'axios'
import Qs from 'qs'
import imageReloader from './Common/imgReloader';
import Meta from 'vue-meta'

axios.defaults.paramsSerializer = function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
};

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(Meta);

process.env.NODE_ENV === 'production'
    ? Vue.use(VueSocketio, 'https://www.develteam.com/')
    : Vue.use(VueSocketio, 'http://127.0.0.1:1337/');

Vue.config.productionTip = false;

import VueGmaps from 'vue-gmaps'

Vue.use(VueGmaps, {
    key: 'AIzaSyCWfnTRxeRTJkkdtgzS7-1pDAxzIbKyTxI',
    libraries: ['places']
});

import 'vueFilters.js';
import 'vueComponents.js';
import 'vueGlobalEventBus.js'

import Store from 'Store/store.js';

let store = Store({Vue: Vue, Vuex: Vuex});

import router from 'Routes/router.js';

sync(store, router);

import App from 'Index.vue';

let app = new Vue({
    el: '#app',
    router: router,
    store: store,

    render: createElement => createElement(App),

    mounted() {
        let self = this;

        store.dispatch('loggedUserModel/getLoggedUserInfo', function (user) {
            self.$socket.emit("setUserSocketData", user)
        });

        store.dispatch('develteamData/buildData');
        store.dispatch('develteamData/getTotals');
    },

    sockets: {
        'serverReconnect'() {
            let self = this;

            store.dispatch('loggedUserModel/getLoggedUserInfo', function (user) {
                self.$socket.emit("setUserSocketData", user)
            });
        },

        'updateUserInfo'() {
            let self = this;

            store.dispatch('loggedUserModel/getLoggedUserInfo', function (user) {
                self.$socket.emit("setUserSocketData", user)
            });
        },

        'newDeveloperOrGameRegistered'() {
            store.dispatch('develteamData/getTotals');
        },

        'avatarUpdated'(data) {
            imageReloader('/userdata/avatars/' + data.type + '_' + data.id + '.jpg');
        },

        'newPost'(data) {
            this.$store.commit('feedPosts/appendPost', data);
        },

        'editedPost'(data) {
            if (data.commentData && data.parentData) {
                this.$store.commit('feedPosts/updateComment', data);
                this.$store.commit('medias/updateComment', data);
            }

            if (data.type === 'status' || data.type === 'media') {
                this.$store.commit('feedPosts/updatePost', data);
            }
        },

        'deletedPost'(data) {
            if (data.type === 'comment') {
                this.$store.commit('feedPosts/deleteComment', data);
                this.$store.commit('medias/deleteComment', data);
            }

            if (data.type === 'status' || data.type === 'media') {
                this.$store.commit('feedPosts/deletePost', data);
            }
        },

        'newPostComment'(data) {
            this.$store.commit('feedPosts/appendComment', data);
            this.$store.commit('medias/appendComment', data);
        },

        'mediaAlbumAddOrEdit'(data) {
            this.$store.commit('medias/mediaAlbumAddOrEdit', data);
        },

        'mediaAlbumDelete'(data) {
            this.$store.commit('medias/mediaAlbumDelete', data);
        },

        'mediaPieceAddOrEdit'(data) {
            this.$store.commit('medias/mediaPieceAddOrEdit', data)
        },

        'deletedMediaPiece'(data) {
            this.$store.commit('medias/mediaPieceDelete', data);
        },

        'gameMembersUpdated'(data) {
            this.$store.commit('gamePage/setGameMembersFromSocket', data);
        },

        'gameInformationUpdated'(data) {
            this.$store.commit('gamePage/updateInformation', data);
        },

        'developerInformationUpdated'(data) {
            this.$store.commit('developerPage/updateInformation', data);
        },

        'forumsNewCategory'(data) {
            this.$store.commit('forums/addCategory', data);
        },

        'forumsNewForum'(data) {
            this.$store.commit('forums/addForum', data);
        },

        'onlineUsersUpdate'(data) {
            this.$store.commit('onlineUsers/setOnlineUsers', data);
        },

        'inboxConversationUpdated'(data) {
            this.$store.dispatch('InboxPage/updateConversation', data);
        }
    }
});