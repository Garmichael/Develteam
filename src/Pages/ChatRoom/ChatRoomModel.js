import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        messages: [],
        historyMessages: [],
        historyDates: [],
        retrievingHistoryDates: false,
        retrievedHistoryDates: false,
        selectedHistoryMessage: undefined,
        retrievingHistoryMessages: false,

        rooms: {
            'siteGeneral': {
                name: 'Develteam: General',
                id: 'siteGeneral'
            }
        },
        selectedRoom: undefined
    },

    actions: {
        'chatRoom/getMessages'(context, callback) {
            if (context.state.selectedRoom === undefined) {
                context.state.selectedRoom = context.state.rooms.siteGeneral;
            }

            axios.get('/api/chatrooms', {
                params: {
                    chatRoomId: context.state.selectedRoom.id
                }
            }).then(
                (response) => {
                    context.commit('chatRoom/setMessages', response.data);
                    if (callback) {
                        callback();
                    }
                }
            );
        },

        'chatRoom/sendMessage'(context, data) {
            axios.post('/api/chatrooms', {
                message: data.message,
                chatRoomId: context.state.selectedRoom.id
            }).then(
                (response) => {
                    // context.dispatch('chatRoom/getMessages')
                },
                (response) => {

                }
            )
        },

        'chatRoom/switchRooms'(context, data) {
            context.state.selectedRoom = context.state.rooms[data.newRoomId];

            context.dispatch('chatRoom/getMessages', function () {
                if (data.callback) {
                    data.callback();
                }
            });
        },

        'chatRoom/getHistoryDates'(context) {
            if (context.state.selectedRoom === undefined) {
                return;
            }

            context.state.retrievedHistoryDates = false;
            context.state.retrievingHistoryDates = true;

            axios.get('/api/chatroomHistory/dates', {
                params: {
                    chatRoomId: context.state.selectedRoom.id
                }
            }).then(
                (response) => {
                    context.commit('chatRooms/setHistoryDates', response.data);
                }
            );
        },

        'chatRoom/getHistoryForDate'(context, data) {
            if (context.state.selectedRoom === undefined || data.selectedHistoryDate === undefined || data.callback === undefined) {
                return;
            }

            if (context.state.historyMessages[context.state.selectedRoom.id + "_" + data.selectedHistoryDate.day]) {
                data.callback();
                return;
            }

            context.state.retrievingHistoryMessages = true;
            axios.get('/api/chatroomHistory', {
                params: {
                    chatRoomId: context.state.selectedRoom.id,
                    historyDate: data.selectedHistoryDate.day
                }
            }).then(
                (response) => {
                    context.commit('chatRoom/setHistoryMessages', {date: data.selectedHistoryDate.day, messages: response.data});
                    context.state.retrievingHistoryMessages = false;
                    data.callback();
                }
            );
        }
    },

    mutations: {
        'chatRoom/setMessages'(state, data) {
            state.messages = data.messages;
        },

        'chatRooms/setHistoryDates'(state, data) {
            state.historyDates = data.history;
            state.retrievedHistoryDates = true;
            state.retrievingHistoryDates = false;
        },

        'chatRoom/setHistoryMessages'(state, data) {
            state.historyMessages[state.selectedRoom.id + "_" + data.date] = data.messages;
        }
    }

}