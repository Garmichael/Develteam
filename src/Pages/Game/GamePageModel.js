import Vue from 'vue'
import axios from 'axios'
import _ from 'lodash'
import router from 'Routes/router'

export default {
    state: {
        gameInformation: {},
        gameConnections: {},
        gameMembers: {},
        retrievedInformation: false,
        retrievedConnections: false,
        retrievedMembers: false,
        isSavingEdit: false,
        fetchError: ''
    },

    actions: {
        'gamePage/getGameInformation': function (context, data) {
            context.state.retrievedInformation = false;
            context.state.retrievedConnections = false;
            context.state.retrievedMembers = false;

            axios.get('/api/game', {
                params: {
                    stringUrl: data.toLowerCase()
                }
            }).then(
                (response) => {
                    if (!response.data.error) {
                        context.commit('gamePage/setGameInformation', response.data);
                        context.dispatch('gamePage/getGameConnections', {id: response.data.id});
                        context.dispatch('gamePage/getGameMembers', {id: response.data.id});
                        context.state.fetchError = '';
                    } else {
                        context.state.fetchError = response.data.error;
                    }
                },
                (response) => {
                    console.log(response)
                }
            );
        },

        'gamePage/getGameConnections': function (context, data) {
            axios.get('/api/follows', {
                params: {
                    followType: 'game',
                    id: data.id
                }
            }).then(
                (response) => {
                    context.commit('gamePage/setGameConnections', response.data)
                },
                (response) => {

                }
            )
        },

        'gamePage/getGameMembers': function (context, data) {
            axios.get('/api/members', {
                params: {
                    parentId: data.id
                }
            }).then(
                (response) => {
                    context.commit('gamePage/setGameMembers', response.data)
                },
                (response) => {

                }
            )
        },

        'gamePage/updateMember': function (context, data) {
            axios.post('/api/members/update', {
                member: data.member,
                gameId: data.gameId
            })
        },

        'gamePage/removeMember': function (context, data) {
            axios.post('/api/members/remove', {
                member: data.member,
                gameId: data.gameId,
                newOwnerId: data.newOwnerId
            })
        },

        'gamePage/updateFollowStatus'(context, data){
            axios.post('/api/follows', {
                parentType: 'game',
                parentId: context.state.gameInformation.id
            }).then(
                (response) => {
                    context.dispatch('gamePage/getGameConnections', {id: response.data.parentId});
                },
                (response) => {
                }
            )
        },

        'gamePage/updateGameInformation'(context, data){
            axios.post('/api/game/update', {
                gameId: data.gameId,
                platforms: data.platforms,
                genres: data.genres,
                rating: data.rating,
                releaseDate: data.releaseDate
            });
        },

        'gamePage/updateVitals'(context, data){
            let formData = new FormData();
            formData.append('gameId', data.gameId);
            formData.append('avatarFile', data.avatarFile);
            formData.append('alias', data.alias);

            axios.post('/api/game/updateVitals', formData);
        },

        'gamePage/updateRecruitment'(context, data){
            axios.post('/api/game/updateRecruitment', data);
        }
    },

    mutations: {
        'gamePage/setGameInformation': function (state, data) {
            state.gameInformation = data;
            state.retrievedInformation = true;
        },

        'gamePage/setGameConnections': function (state, data) {
            state.gameConnections = data;
            state.retrievedConnections = true;
        },

        'gamePage/setGameMembers': function (state, data) {
            state.gameMembers = data;
            state.retrievedMembers = true;
        },

        'gamePage/setGameMembersFromSocket': function (state, data) {
            if (state.gameInformation.id === data.game) {
                state.gameMembers = data.members;
                state.retrievedMembers = true;
            }
        },

        'gamePage/updateInformation': function (state, data) {
            if (!state.gameInformation.id || data.gameId !== state.gameInformation.id) {
                return;
            }

            if (data.rating) {
                Vue.set(state.gameInformation, 'rating', data.rating);
            }

            if (data.releaseDate) {
                Vue.set(state.gameInformation, 'releaseDate', data.releaseDate);
            }

            if (data.platforms) {
                Vue.set(state.gameInformation, 'platforms', data.platforms);
            }

            if (data.genres) {
                Vue.set(state.gameInformation, 'genres', data.genres);
            }

            if (data.recruitingDescription) {
                Vue.set(state.gameInformation, 'seekingDescription', data.recruitingDescription);
            }

            if (data.roleTitles) {
                Vue.set(state.gameInformation, 'seekingRoles', data.roleTitles);
            }

            if (data.recruitingProducers) {
                Vue.set(state.gameInformation, 'seekingProducers', data.recruitingProducers);
            }

            if (data.recruitingDesigners) {
                Vue.set(state.gameInformation, 'seekingDesigners', data.recruitingDesigners);
            }

            if (data.recruitingArtists) {
                Vue.set(state.gameInformation, 'seekingArtists', data.recruitingArtists);
            }

            if (data.recruitingProgrammers) {
                Vue.set(state.gameInformation, 'seekingProgrammers', data.recruitingProgrammers);
            }

            if (data.recruitingMusicians) {
                Vue.set(state.gameInformation, 'seekingMusicians', data.recruitingMusicians);
            }

            if (data.recruitingSfxArtists) {
                Vue.set(state.gameInformation, 'seekingSfxArtists', data.recruitingSfxArtists);
            }

            if (data.recruitingWriters) {
                Vue.set(state.gameInformation, 'seekingWriters', data.recruitingWriters);
            }

            if (data.recruitingTesters) {
                Vue.set(state.gameInformation, 'seekingTesters', data.recruitingTesters);
            }

            if(data.skills){
                Vue.set(state.gameInformation, 'skills', data.skills);
            }
        },

        'gamePage/updateVitals': function (state, date) {
            if (!state.gameInformation.id || data.gameId !== state.gameInformation.id) {
                return;
            }

            Vue.set(state.alias, 'genres', data.alias);
            Vue.set(state.stringUrl, 'genres', data.stringUrl);
        }
    }

}