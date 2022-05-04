<template>

    <article id="invites-page">
        <loader-large v-if="isLoading"></loader-large>

        <section class="validation-messages friendly" v-if="noPendingInvitations">
            You have no pending Invitations
        </section>

        <section class="invite-list" v-if="!isLoading && invitationsToGames.length > 0">
            <h2>Invitations to Game Projects</h2>
            <invitation-to-game :invitation="invitation" v-for="invitation in invitationsToGames"></invitation-to-game>
        </section>

        <section class="invite-list" v-if="!isLoading && requestsToJoin.length > 0">
            <h2>Requests to Join your Game Projects</h2>
            <request-to-join :request="request" v-for="request in requestsToJoin"></request-to-join>
        </section>

        <section class="invite-list" v-if="!isLoading && sentInvitationsToGames.length > 0">
            <h2>Sent Invitations to Game Projects</h2>
            <sent-invitation-to-game :invitation="invitation" v-for="invitation in sentInvitationsToGames"></sent-invitation-to-game>
        </section>

        <section class="invite-list" v-if="!isLoading && sentRequestsToJoin.length > 0">
            <h2>Sent Requests to Join Game Projects</h2>
            <sent-request-join :request="request" v-for="request in sentRequestsToJoin"></sent-request-join>
        </section>

    </article>
</template>


<script>
    import axios from 'axios';
    import InvitationToGameItem from './InviteToGameItem.vue'
    import RequestToJoinItem from './RequestToJoinItem.vue'
    import SentRequestToJoinItem from './SentRequestToJoinItem.vue'
    import SentInvitationToGameItem from './SentInviteToGameItem.vue'

    export default {
        name: 'Invites',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        components: {
            'invitation-to-game': InvitationToGameItem,
            'request-to-join': RequestToJoinItem,
            'sent-invitation-to-game': SentInvitationToGameItem,
            'sent-request-join': SentRequestToJoinItem
        },

        computed: {
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            gamesOwned(){
                if (this.isLoggedIn) {
                    return _.filter(this.$store.state.loggedUserModel.games, function (game) {
                        return game.moderatorLevel === 'owner'
                    });
                }
            },

            gamesOwnedIds(){
                if (this.gamesOwned) {
                    return _.map(this.gamesOwned, 'id');
                }
            },

            invitationsToGames(){
                return this.$store.state.invitesModel.invitationsToGames;
            },

            requestsToJoin(){
                return this.$store.state.invitesModel.requestsToJoin;
            },

            sentInvitationsToGames(){
                return this.$store.state.invitesModel.sentInvitationsToGames;
            },

            sentRequestsToJoin(){
                return this.$store.state.invitesModel.sentRequestsToJoin;
            },

            formErrors(){
                return this.$store.state.invitesModel.fetchErrors;
            },

            fetchStatus(){
                return this.$store.state.invitesModel.fetchStatus;
            },

            isLoading(){
                return this.fetchStatus === 'unfetched' || this.fetchStatus === 'fetching';
            },

            noPendingInvitations(){
                return !this.isLoading &&
                        this.invitationsToGames.length === 0 &&
                        this.requestsToJoin.length === 0 &&
                        this.sentInvitationsToGames.length === 0 &&
                        this.sentRequestsToJoin.length === 0;
            }
        }
    }
</script>