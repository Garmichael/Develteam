import Vue from 'vue'
import router from 'Routes/router'
import axios from 'axios'

export default {
    state: {
        conversations: [],
        selectedConversation: undefined,
        retrievedConversations: false,
        matchingDevsResponse: [],
        notAllowedToViewConversation: false
    },

    actions: {
        'InboxPage/getConversations'(context) {
            axios.get('/api/inbox')
                .then(
                    (response) => {
                        context.commit('InboxPage/setConversations', response.data);

                        if (context.rootState.route.params.id && context.rootState.route.params.id.toLowerCase() !== 'compose') {
                            context.commit('InboxPage/setSelectedConversation', {conversationId: context.rootState.route.params.id});
                            context.dispatch('InboxPage/getMessages');
                        }
                    },
                    (response) => {
                        console.log(response);
                    }
                );
        },

        'InboxPage/updateConversation'(context, conversationId){
            axios.get('/api/inbox/' + conversationId)
                .then(
                    (response) => {
                        let matchedConversation;

                        context.state.conversations.forEach(function (conversation) {
                            if (conversation.id === conversationId) {
                                matchedConversation = conversation;
                                return false;
                            }
                        });

                        if (matchedConversation) {
                            Vue.set(matchedConversation, 'participants', response.data.participants);
                            Vue.set(matchedConversation, 'hasBeenRead', response.data.hasBeenRead);
                            Vue.set(matchedConversation, 'lastMessageDate', response.data.lastMessageDate);
                            Vue.set(matchedConversation, 'subject', response.data.subject);
                        } else {
                            context.dispatch('InboxPage/getConversations');
                        }
                    },
                    (response) => {
                        console.log(response);
                    }
                );
        },

        'InboxPage/getMessages'(context){
            if (!context.state.selectedConversation) {
                return;
            }

            axios.get('/api/inboxMessages', {
                params: {
                    inboxId: context.state.selectedConversation.id
                }
            }).then(
                (response) => {
                    context.commit('InboxPage/setMessages', response.data);
                    context.dispatch('Inbox/setRead');
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'Inbox/setRead'(context){
            axios.post('/api/inboxSetRead', {
                inboxId: context.state.selectedConversation.id
            }).then(
                (response) => {
                    Vue.set(context.state.selectedConversation, 'hasBeenRead', '1');
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'InboxPage/getMatchingDevNames'(context, search){
            axios.get('/api/searchDeveloperByAlias', {
                params: {
                    search: search
                }
            }).then(
                (response) => {
                    context.commit('InboxPage/getMatchingDevNames', response.data)
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'InboxPage/addParticipant'(context, participant){
            axios.post('/api/inboxAddParticipant', {
                participantId: participant.id,
                inboxId: context.state.selectedConversation.id
            }).then(
                (response) => {
                    console.log(response);
                    context.dispatch('InboxPage/updateConversation', context.state.selectedConversation.id);
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'InboxPage/leaveConversation'(context){
            axios.post('/api/inboxLeaveConversation', {
                inboxId: context.state.selectedConversation.id
            }).then(
                (response) => {
                    context.dispatch('InboxPage/getConversations');
                },
                (response) => {
                    console.log(response);
                }
            );
        },

        'InboxPage/addReplyMessage'(context, message){
            axios.post('/api/inboxMessages', {
                inboxId: context.state.selectedConversation.id,
                message: message
            }).then(
                (response) => {

                },
                (response) => {

                }
            );
        },

        'InboxPage/AddNewConversation'(context, data){
            axios.post('/api/inbox/new', {
                participants: data.participants,
                subject: data.subject,
                message: data.message
            }).then(
                (response) => {
                    router.push('/Inbox');
                },
                (response) => {

                }
            );
        }
    },

    mutations: {
        'InboxPage/setConversations'(state, data){
            state.conversations = data;
            state.retrievedConversations = true;
        },

        'InboxPage/setSelectedConversation'(state, data){
            let self = this,
                allConvos = state.conversations,
                selectedConvo;

            state.notAllowedToViewConversation = false;

            allConvos.forEach(function (convo) {
                if (convo.id == data.conversationId) {
                    selectedConvo = convo;
                }
            });

            if (selectedConvo) {
                state.selectedConversation = selectedConvo;
            } else {
                state.notAllowedToViewConversation = true;
            }
        },

        'InboxPage/setMessages'(state, data){
            Vue.set(state.selectedConversation, 'messages', data)
        },

        'InboxPage/getMatchingDevNames'(state, data){
            state.matchingDevsResponse = data;
            // Vue.set(state.selectedConversation, 'messages', data)
        }
    }

}