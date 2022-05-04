import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        gotInitialLoggedUserInfo: false,
        isLoggedIn: false,
        info: [],
        games: [],
        options: {}
    },

    actions: {
        'loggedUserModel/getLoggedUserInfo': function (context, callback) {
            axios.get('/api/login').then(
                (response) => {
                    if (callback) {
                        callback({
                            status: response.data.isLoggedIn ? 'online' : 'offline',
                            id: response.data.info.id,
                            alias: response.data.info.alias,
                            stringUrl: response.data.info.stringUrl,
                            passkey: response.data.info.passkey,
                            siteModCanBan: response.data.info.siteModCanBan
                        });
                    }
                    context.commit('loggedUserModel/setLoggedUserInfo', response.data)
                },
                (response) => {
                    console.log(response);
                }
            )
        },
        'loggedUserModel/logOut': function (context, callback) {
            axios.get('/api/login', {
                params: {
                    logOut: true
                }
            }).then(
                (response) => {
                    callback({
                        status: 'offline',
                        id: context.state.info.id
                    });
                    context.commit('loggedUserModel/setLoggedUserInfo', response.data);
                    context.rootState.loginPageModel.validationMessage = ""
                },
                (response) => {
                    console.log(response);
                }
            )
        },

        'loggedUserModel/CatchUpOnMedia': function (context) {
            context.rootState.loggedUserModel.info.caughtUpOnMedia = 1;
            axios.post('/api/developer/catchUpOnMedia');
        },

        'loggedUserModel/CatchUpOnDevlogs': function (context) {
            context.rootState.loggedUserModel.info.caughtUpOnDevlogs = 1;
            axios.post('/api/developer/catchUpOnDevlogs');
        },

        'loggedUserModel/CatchUpOnClassifieds': function (context) {
            context.rootState.loggedUserModel.info.caughtUpOnClassifieds = 1;
            axios.post('/api/developer/catchUpOnClassifieds');
        },

        'loggedUserModel/CatchUpOnForums': function (context) {
            context.rootState.loggedUserModel.info.caughtUpOnForums = 1;
            axios.post('/api/developer/catchUpOnForums');
        },

        'loggedUserModel/updateLoggedUserInfo': function (state, data) {
            axios.post('/api/accountInformation', {
                info: data.data
            }).then(
                (response) => {
                    data.callback(response.data);
                }
            );

        }
    },

    mutations: {
        'loggedUserModel/setLoggedUserInfo': function (state, data) {
            state.isLoggedIn = data.isLoggedIn;
            state.info = data.info;
            state.gotInitialLoggedUserInfo = true;
            state.games = data.games;
            state.options = data.options;
        }
    }

}