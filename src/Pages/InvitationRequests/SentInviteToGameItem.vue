<template>
    <section class="invitation">

        <saver-large v-if="isSaving"></saver-large>

        <template v-if="!isSaving && !serverResponse">
            <div class="avatar-container">
                <avatar :profile-data="invitation.devDetails" profile-type="developer" size="large" :show-xp-info="false"></avatar>
            </div>

            <div class="details">
                <span>
                    Invited
                    <router-link :to="`/Developer/${invitation.devDetails.stringUrl}`"><i class="fas fa-user"></i> {{invitation.devDetails.alias}}</router-link>
                    to Join
                    <router-link :to="`/Game/${invitation.gameDetails.stringUrl}`"><i class="fas fa-gamepad"></i> {{invitation.gameDetails.alias}}</router-link>
                </span>

                <span>Recruiting for <span class="position-titles">{{invitation.positionTitles}}</span></span>
                <ul>
                    <li v-for="position in invitation.positions">{{position}}</li>
                </ul>

                <span v-if="invitation.response === 'noResponse'">Invitation is pending.</span>
                <span v-if="invitation.response === 'accept'">Your Invitation has been Accepted!</span>
                <span v-if="invitation.response === 'decline'">Your Invitation has been Declined.</span>

                <button class="button" @click.prevent="deleteInvitation('retract')" v-if="invitation.response === 'noResponse'">Retract</button>
                <button class="button" @click.prevent="deleteInvitation('dismiss')" v-if="invitation.response !== 'noResponse'">Dismiss</button>

                <router-link tag="button"
                             class="button"
                             :to="`/Inbox/Compose?toId=${invitation.devDetails.id}&toAlias=${invitation.devDetails.alias}`"
                             v-if="invitation.response === 'noResponse'">
                    Contact Developer
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
            deleteInvitation(deleteType){
                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/invites/deleteInvitation', {
                        inviteId: this.invitation.id
                    }).then(
                            (response) => {
                                this.isSaving = false;

                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                    return;
                                }

                                this.serverResponse = deleteType === 'dismiss' ?
                                        'Dismissed' :
                                        'Retracted';
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