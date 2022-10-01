import Vue from 'vue'
import axios from 'axios'
import _ from 'lodash'
import router from 'Routes/router'

export default {
    state: {
        developerInformation: {},
        developerConnections: {},
        retrievedInformation: false,
        retrievedConnections: false,
        isSavingEdit: false,
        fetchError: ''
    },

    actions: {
        'developerPage/getDeveloperInformation': function (context, data) {
            let payload = {
                stringUrl: data.toLowerCase()
            };

            context.state.retrievedInformation = false;

            axios.get('/api/developer', {
                params: payload
            }).then(
                (response) => {
                    context.commit('developerPage/setDeveloperInformation', response.data);
                    if (!response.data.error) {
                        context.dispatch('developerPage/getDeveloperConnections', {id: response.data.id});
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

        'developerPage/getDeveloperConnections': function (context, data) {
            axios.get('/api/follows', {
                params: {
                    followType: 'developer',
                    id: data.id
                }
            }).then(
                (response) => {
                    context.commit('developerPage/setDeveloperConnections', response.data)
                },
                (response) => {

                }
            )
        },

        'developerPage/SaveAvatar'(context, data) {
            const formData = new FormData();
            formData.append('avatarFile', data);

            axios.post('/api/developer/uploadAvatar', formData).then(
                (response) => {
                    if(response.data.response === 'unsuccessful'){
                        alert("Maximum filesize for an Avatar is 10MB")
                    } else {
                        context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                    }
                },
                (response) => {
                }
            )
        },

        'developerPage/updateBasicInfo'(context, data) {
            axios.post('/api/developer/basicInfo', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateRolesAndSkills'(context, data) {
            axios.post('/api/developer/rolesAndSkills', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateNetworking'(context, data) {
            axios.post('/api/developer/networking', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateWebsites'(context, data) {
            data.personalWebsites = JSON.stringify(_.cloneDeep(data.personalWebsites));

            axios.post('/api/developer/websites', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateWorkHistory'(context, data) {
            data.workHistory = JSON.stringify(_.cloneDeep(data.workHistory));

            axios.post('/api/developer/workHistory', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateEducationHistory'(context, data) {
            data.educationHistory = JSON.stringify(_.cloneDeep(data.educationHistory));

            axios.post('/api/developer/educationHistory', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/banDeveloper'(context, data) {
            data.educationHistory = JSON.stringify(_.cloneDeep(data.educationHistory));

            axios.post('/api/developer/ban', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/unBanDeveloper'(context, data) {
            axios.post('/api/developer/unBan', data).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperInformation', context.state.developerInformation.stringUrl);
                },
                (response) => {
                }
            )
        },

        'developerPage/updateFollowStatus'(context, data) {
            axios.post('/api/follows', {
                parentType: 'developer',
                parentId: context.state.developerInformation.id
            }).then(
                (response) => {
                    context.dispatch('developerPage/getDeveloperConnections', {id: response.data.parentId});
                },
                (response) => {
                }
            )
        }
    },

    mutations: {
        'developerPage/setDeveloperInformation': function (state, data) {
            if (data.error) {
                return;
            }

            state.developerInformation = data;
            state.retrievedInformation = true;
        },

        'developerPage/setDeveloperConnections': function (state, data) {
            if (data.error) {
                return;
            }

            state.developerConnections = data;
            state.retrievedConnections = true;
        },

        'developerPage/updateInformation': function (state, data) {
            if (!state.developerInformation.id || data.developerId !== state.developerInformation.id) {
                return;
            }

            if (data.firstName) {
                Vue.set(state.developerInformation, 'firstName', data.firstName);
            }

            if (data.lastName) {
                Vue.set(state.developerInformation, 'lastName', data.lastName);
            }

            if (data.gender) {
                Vue.set(state.developerInformation, 'gender', data.gender);
            }

            if (data.location) {
                Vue.set(state.developerInformation, 'location', data.location);
            }

            if (data.locationLat) {
                Vue.set(state.developerInformation, 'locationLat', data.locationLat);
            }

            if (data.locationLon) {
                Vue.set(state.developerInformation, 'locationLon', data.locationLon);
            }

            if (data.useBirth) {
                Vue.set(state.developerInformation, 'useBirth', data.useBirth);
            }

            if (data.birthMonth) {
                Vue.set(state.developerInformation, 'birthMonth', data.birthMonth);
            }

            if (data.birthDay) {
                Vue.set(state.developerInformation, 'birthDay', data.birthDay);
            }

            if (data.birthYear) {
                Vue.set(state.developerInformation, 'birthYear', data.birthYear);
            }

            if (data.role) {
                Vue.set(state.developerInformation, 'role', data.role);
            }

            if (data.skills) {
                Vue.set(state.developerInformation, 'skills', data.skills);
            }

            if (data.isDesigner) {
                Vue.set(state.developerInformation, 'isDesigner', data.isDesigner);
            }

            if (data.isDesigner) {
                Vue.set(state.developerInformation, 'isDesigner', data.isDesigner);
            }

            if (data.isArtist) {
                Vue.set(state.developerInformation, 'isArtist', data.isArtist);
            }

            if (data.isWriter) {
                Vue.set(state.developerInformation, 'isWriter', data.isWriter);
            }

            if (data.isMusician) {
                Vue.set(state.developerInformation, 'isMusician', data.isMusician);
            }

            if (data.isSfxArtist) {
                Vue.set(state.developerInformation, 'isSfxArtist', data.isSfxArtist);
            }

            if (data.isProgrammer) {
                Vue.set(state.developerInformation, 'isProgrammer', data.isProgrammer);
            }

            if (data.isTester) {
                Vue.set(state.developerInformation, 'isTester', data.isTester);
            }

            if (data.isProducer) {
                Vue.set(state.developerInformation, 'isProducer', data.isProducer);
            }

            if (data.lookingForDescription) {
                Vue.set(state.developerInformation, 'lookingForDescription', data.lookingForDescription);
            }

            if (data.lookingForGame) {
                Vue.set(state.developerInformation, 'lookingForGame', data.lookingForGame);
            }

            if (data.websiteFacebook) {
                Vue.set(state.developerInformation, 'websiteFacebook', data.websiteFacebook);
            }

            if (data.websiteTwitter) {
                Vue.set(state.developerInformation, 'websiteTwitter', data.websiteTwitter);
            }

            if (data.websiteInstagram) {
                Vue.set(state.developerInformation, 'websiteInstagram', data.websiteInstagram);
            }

            if (data.websiteLinkedIn) {
                Vue.set(state.developerInformation, 'websiteLinkedIn', data.websiteLinkedIn);
            }

            if (data.personalWebsites) {
                Vue.set(state.developerInformation, 'personalWebsites', data.personalWebsites);
            }

            if (data.workHistory) {
                Vue.set(state.developerInformation, 'workHistory', data.workHistory);
            }

            if (data.educationHistory) {
                Vue.set(state.educationHistory, 'workHistory', data.educationHistory);
            }
        },
    }

}