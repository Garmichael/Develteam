import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        onlineUsers: []
    },

    actions: {

    },

    mutations: {
        'onlineUsers/setOnlineUsers': function (state, data) {
            Vue.set(state, 'onlineUsers', data)
        }
    }

}