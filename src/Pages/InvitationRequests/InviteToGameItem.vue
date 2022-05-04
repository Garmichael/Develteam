<template>
    <section class="invitation">

        <saver-large v-if="isSaving"></saver-large>

        <template v-if="!isSaving && !serverResponse">
            <div class="avatar-container">
                <avatar :profile-data="invitation.gameDetails" profile-type="game" size="large" :show-xp-info="false"></avatar>
            </div>

            <div class="details">
                <span>
                    <router-link :to="`/Game/${invitation.gameDetails.stringUrl}`"><i class="fas fa-gamepad"></i> {{invitation.gameDetails.alias}}</router-link>
                </span>

                <span>Recruiting for <span class="position-titles">{{invitation.positionTitles}}</span></span>
                <ul>
                    <li v-for="position in invitation.positions">{{position}}</li>
                </ul>

                <button class="button" @click.prevent="sendResponse('decline')">Decline</button>
                <button class="button" @click.prevent="sendResponse('accept')">Accept</button>

                <router-link tag="button"
                             class="button"
                             :to="`/Inbox/Compose?toId=${invitation.gameDetails.ownerDetails.id}&toAlias=${invitation.gameDetails.ownerDetails.alias}`">
                    Contact Game Project Owner
                </router-link>

                <div class="validation-messages error" v-if="formErrors.length > 0 ">
                    <span v-for="error in formErrors">{{error}}</span>
                </div>
            </div>
        </template>

        <template v-if="serverResponse">
            <div class="validation-messages friendly">{{serverResponse}}</div>
        </template>
    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'InvitationToGame',
        props: ['invitation'],
        data(){
            return {
                isSaving: false,
                serverResponse: '',
                formErrors: []
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {
            sendResponse(inviteResponse){
                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/invites/respondToGameInvite', {
                        inviteResponse,
                        inviteId: this.invitation.id
                    }).then(
                            (response) => {
                                this.isSaving = false;

                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                    return;
                                }

                                this.serverResponse = response.data.inviteResponse === 'accept' ?
                                        'You Accepted this Invitation' :
                                        'You Declined this Invitation';
                            },

                            (response) => {
                                this.isSaving = false;
                                this.formErrors = ['There was a problem connecting to the server. Please reload and try again.']
                            }
                    );
                }.bind(this), 1000)
            }
        }
    }
</script>