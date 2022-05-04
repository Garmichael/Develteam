import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        genres: [],
        platforms: {},
        skills: [],
        totals: {}
    },

    actions: {
        'develteamData/buildData': function (context) {
            axios.get('/api/develteamData').then(
                (response) => {
                    context.commit('develteamData/setData', response.data);
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'develteamData/getTotals': function (context) {
            axios.get('/api/totals').then(
                (response) => {
                    context.commit('develteamData/setTotals', response.data);
                },
                (response) => {
                    console.log(response);
                }
            );
        }
    },

    mutations: {
        'develteamData/setData': function (state, data) {
            state.genres = data.genres;
            state.platforms = data.platforms;
            state.skills = data.skills;
        },

        'develteamData/setTotals': function (state, data) {
            state.totals = data;
        }
    }

}