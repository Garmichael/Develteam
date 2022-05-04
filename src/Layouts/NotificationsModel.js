import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        notifications: [],
        fetchingStatus: 'unfetched'
    },

    actions: {
        'notificationsModel/getNotifications': function (context) {
            context.state.fetchingStatus = 'fetching';

            axios.get('/api/notifications').then(
                (response) => {
                    context.state.fetchingStatus = 'fetched';
                    context.commit('notificationsModel/setNotifications', response.data);
                }
            );
        },

        'notificationsModel/markReadFromRoute'(context, data){
            context.state.notifications.forEach(function (notification) {
                if (notification.hasBeenRead === 0 && (notification.link === data.to.fullPath || notification.link === data.from.fullPath)) {
                    axios.post('/api/notifications/markRead', {
                        notificationIdentifier: notification.notificationIdentifier
                    }).then(
                        (response) => {
                        },
                        (response) => {
                        }
                    )
                }
            })
        }
    },

    mutations: {
        'notificationsModel/setNotifications': function (state, data) {
            state.notifications = data.notifications;
        }
    }

}