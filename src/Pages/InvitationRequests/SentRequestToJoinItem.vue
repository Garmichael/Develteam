<template>
    <section class="request">

        <saver-large v-if="isSaving"></saver-large>

        <template v-if="!isSaving && !serverResponse">
            <div class="avatar-container">
                <avatar :profile-data="request.gameDetails" profile-type="game" size="large" :show-xp-info="false"></avatar>
            </div>

            <div class="details">
                <span>
                    Requested to Join
                    <router-link :to="`/Game/${request.gameDetails.stringUrl}`"><i class="fas fa-gamepad"></i> {{request.gameDetails.alias}}</router-link>
                </span>

                <span>Requesting to be <span class="position-titles">{{request.positionTitles}}</span></span>
                <ul>
                    <li v-for="position in request.positions">{{position}}</li>
                </ul>

                <span v-if="request.response === 'noResponse'">Request is pending.</span>
                <span v-if="request.response === 'accept'">Your Request has been Accepted!</span>
                <span v-if="request.response === 'decline'">Your Request has been Declined.</span>

                <button class="button" v-if="request.response === 'noResponse'" @click.prevent="deleteRequest('retract')">Retract Request</button>
                <button class="button" v-if="request.response !== 'noResponse'" @click.prevent="deleteRequest('dismiss')">Dismiss</button>

                <router-link tag="button"
                             class="button"
                             :to="`/Inbox/Compose?toId=${request.devDetails.id}&toAlias=${request.devDetails.alias}`"
                             v-if="request.response === 'noResponse'">
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
        name: 'RequestToJoinItem',
        props: ['request'],
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
            deleteRequest(deleteType){
                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/invites/deleteRequest', {
                        requestId: this.request.id
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