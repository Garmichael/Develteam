import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        conversations: [],
        selectedConversation: undefined,
        messages: {},
        historyMessages: {},
        historyDates: {},
        temporaryConversations: []
    },

    actions: {
        'privateChat/getConversations'(context) {
            axios.get('/api/privateChat/allConversations').then(
                (response) => {
                    context.commit('privateChat/setConversations', response.data);
                }
            );
        },

        'privateChat/getMessages'(context, data) {
            if (context.state.messages[data.chatId] && !data.forceReFetch) {
                context.commit('privateChat/setMessages', {
                    chatId: data.chatId,
                    messages: context.state.messages[data.chatId]
                });

                if (data.callback) {
                    data.callback();
                }
                return;
            }

            axios.get('/api/privateChat/messages', {
                params: {
                    chatId: data.chatId
                }
            }).then(
                (response) => {
                    context.commit('privateChat/setMessages', {
                        chatId: data.chatId,
                        messages: response.data
                    });

                    if (data.callback) {
                        data.callback();
                    }
                }
            );
        },

        'privateChat/sendMessage'(context, data) {
            axios.post('/api/privateChat/message', data);
        },

        'privateChat/sendNewConversation'(context, data) {
            axios.post('/api/privateChat/newConversation', {
                participantId: data.participantId,
                message: data.message
            }).then(
                (response) => {
                    if (data.callback) {
                        data.callback(response.data.newChatId);
                    }
                }
            );
        },

        'privateChat/markReadConversation'(context, data) {
            axios.post('/api/privateChat/markRead', {chatId: data.chatId});
        },

        'privateChat/getHistoryDates'(context) {
            if (context.state.selectedConversation === undefined) {
                return;
            }

            axios.get('/api/privateChat/historyDates', {
                params: {
                    chatId: context.state.selectedConversation.chatId
                }
            }).then(
                (response) => {
                    context.commit('privateChat/setHistoryDates', {
                        chatId: context.state.selectedConversation.chatId,
                        history: response.data.history
                    });
                }
            );
        },

        'privateChat/getHistoryForDate'(context, data) {
            if (context.state.selectedConversation === undefined || data.selectedHistoryDate === undefined || data.callback === undefined) {
                return;
            }

            if (context.state.historyMessages[context.state.selectedConversation.chatId + "_" + data.selectedHistoryDate.day]) {
                data.callback();
                return;
            }

            axios.get('/api/privateChat/historyMessages', {
                params: {
                    chatId: context.state.selectedConversation.chatId,
                    historyDate: data.selectedHistoryDate.day
                }
            }).then(
                (response) => {
                    context.commit('privateChat/setHistoryMessages', {
                        date: data.selectedHistoryDate.day, messages: response.data
                    });
                    data.callback();
                }
            );
        }
    },

    mutations: {
        'privateChat/setConversations'(state, data) {
            Vue.set(state, 'conversations', data);
        },

        'privateChat/setActiveConversation'(state, conversation) {
            Vue.set(state, 'selectedConversation', conversation)
        },

        'privateChat/setMessages'(state, data) {
            Vue.set(state.messages, data.chatId, data.messages);
        },

        'privateChat/setHistoryDates'(state, data) {
            Vue.set(state.historyDates, data.chatId, data.history);
        },

        'privateChat/setHistoryMessages'(state, data) {
            Vue.set(state.historyMessages, state.selectedConversation.chatId + "_" + data.date, data.messages);
        },

        'privateChat/addTemporaryConversation'(state, data) {
            let x = state.temporaryConversations;
            let z = {
                chatId: data.self.id + "." + data.participant.id,
                partnerAlias: data.participant.alias,
                lastMessageTime: new Date().getTime()
            };

            x.push(z);
            Vue.set(state, 'temporaryConversations', x);
        }
    }

}