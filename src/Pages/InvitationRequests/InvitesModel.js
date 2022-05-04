import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        invitationsToGames: [],
        requestsToJoin: [],
        sentInvitationsToGames: [],
        sentRequestsToJoin: [],
        fetchErrors: [],
        fetchStatus: 'unfetched'
    },

    actions: {
        'invites/fetchInvites': function (context) {
            context.state.fetchStatus = 'fetching';

            axios.get('/api/invites').then(
                (response) => {
                    context.state.fetchStatus = 'fetched';

                    if (response.data.errors) {
                        context.state.fetchErrors = response.data.errors;
                        return;
                    }

                    context.state.invitationsToGames = response.data.invitationsToGames ? response.data.invitationsToGames : [];
                    context.state.requestsToJoin = response.data.requestsToJoin ? response.data.requestsToJoin : [];
                    context.state.sentInvitationsToGames = response.data.sentInvitationsToGames ? response.data.sentInvitationsToGames : [];
                    context.state.sentRequestsToJoin = response.data.sentRequestsToJoin ? response.data.sentRequestsToJoin : [];
                },

                (response) => {
                    context.state.fetchErrors = ['There was a problem connecting to the server. Please reload and try again.'];
                }
            );
        }
    },

    mutations: {
        'invites/setInvites': function (state, data) {

        }
    }

}