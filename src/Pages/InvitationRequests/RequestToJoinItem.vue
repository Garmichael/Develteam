<template>
    <section class="request">

        <saver-large v-if="isSaving"></saver-large>

        <template v-if="!isSaving && !serverResponse">
            <div class="avatar-container">
                <avatar :profile-data="request.devDetails" profile-type="developer" size="large" :show-xp-info="false"></avatar>
            </div>

            <div class="details">
                <span>
                    <router-link :to="`/Developer/${request.devDetails.stringUrl}`"><i class="fas fa-user"></i> {{request.devDetails.alias}}</router-link>
                    Requesting to Join
                    <router-link :to="`/Game/${request.gameDetails.stringUrl}`"><i class="fas fa-gamepad"></i> {{request.gameDetails.alias}}</router-link>
                </span>

                <span>Requesting to be <span class="position-titles">{{request.positionTitles}}</span></span>
                <ul>
                    <li v-for="position in request.positions">{{position}}</li>
                </ul>

                <button class="button" @click.prevent="sendResponse('decline')">Decline</button>
                <button class="button" @click.prevent="sendResponse('accept')">Accept</button>

                <router-link tag="button"
                             class="button"
                             :to="`/Inbox/Compose?toId=${request.devDetails.id}&toAlias=${request.devDetails.alias}`">
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
            sendResponse(inviteResponse){
                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/invites/respondToRequestToJoin', {
                        inviteResponse,
                        inviteId: this.request.id
                    }).then(
                            (response) => {
                                this.isSaving = false;

                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                    return;
                                }

                                this.serverResponse = response.data.inviteResponse === 'accept' ?
                                        'You Accepted this request' :
                                        'You Declined this request';
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