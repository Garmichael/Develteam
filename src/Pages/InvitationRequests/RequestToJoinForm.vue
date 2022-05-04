<template>
    <article id="invite-to-game">

        <form>

            <loader-large v-if="fetchingGame"></loader-large>

            <template v-if="showSuccessMessage">
                <div class="validation-messages friendly">Invitation Successfully Sent</div>
            </template>

            <template v-if="!fetchingGame && !showSuccessMessage">
                <div v-if="gameFound && isLoggedIn">
                    <h2>
                        Request to Join
                        <router-link :to="`/Game/${foundGame.stringUrl}`"><i class="fas fa-gamepad"></i> {{foundGame.alias}}</router-link>
                    </h2>

                    <div class="field">
                        <label for="position-titles">Position Title(s)</label>
                        <input id="position-titles" type="text" v-model="formData.positionTitles" :disabled="isSaving">
                    </div>

                    <div class="field">
                        <span>Position Types</span>
                        <div class="checkbox-container">
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Designer" :disabled="isSaving"><span>Designer</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Artist" :disabled="isSaving"><span>Artist</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Programmer" :disabled="isSaving"><span>Programmer</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Musician" :disabled="isSaving"><span>Musician</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="SFX Artist" :disabled="isSaving"><span>SFX Artist</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Writer" :disabled="isSaving"><span>Writer</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Producer" :disabled="isSaving"><span>Producer</span></label>
                            <label><input type="checkbox" v-model="formData.selectedPositions" value="Tester" :disabled="isSaving"><span>Tester</span></label>
                        </div>
                    </div>

                    <div class="validation-messages error" v-if="formErrors.length > 0">
                        <span v-for="error in formErrors">{{error}}</span>
                    </div>

                    <saver-large v-if="isSaving"></saver-large>

                    <div class="button-container" v-if="!isSaving">
                        <button class="button" @click.prevent="submitRequest">Send Request</button>
                    </div>
                </div>

                <div v-if="!gameFound || !isLoggedIn">
                    <h2>Error</h2>
                    <span v-if="!gameFound && isLoggedIn">Game Project Not found</span>
                    <span v-if="!isLoggedIn">You must be logged in to do this</span>
                </div>
            </template>

        </form>
    </article>
</template>


<script>
    import axios from 'axios';
    import _ from 'lodash'

    export default {
        name: 'RequestToJoin',
        metaInfo: {
            title: 'Develteam - Request to Join a Game Project | Game developer community | Game dev team up'
        },
        data(){
            return {
                isSaving: false,
                formErrors: [],
                showSuccessMessage: false,
                fetchingGame: true,
                gameFound: false,
                foundGame: {},
                formData: {
                    selectedPositions: [],
                    positionTitles: '',
                    requestedGame: 0
                }
            }
        },

        components: {},

        mounted() {
            if (this.$route.params.requestGameStringUrl) {
                this.getDeveloperInfo();
            } else {
                this.fetchingGame = false;
                this.gameFound = false;
            }
        },

        computed: {
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            self(){
                if (this.isLoggedIn) {
                    return this.$store.state.loggedUserModel.info
                }
            },

            GamesOwned(){
                if (this.isLoggedIn) {
                    return _.filter(this.$store.state.loggedUserModel.games, function (game) {
                        return game.moderatorLevel === 'owner'
                    });
                }
            }
        },

        methods: {
            getDeveloperInfo(){
                setTimeout(function () {
                    axios.get('/api/game', {
                        params: {
                            stringUrl: this.$route.params.requestGameStringUrl
                        }
                    }).then(
                            (response) => {
                                this.fetchingGame = false;

                                this.gameFound = !response.data.error;

                                if (!response.data.error) {
                                    this.foundGame = response.data;
                                    this.formData.requestedGame = this.foundGame.id;
                                }
                            },

                            (response) => {
                                this.fetchingGame = false;
                            }
                    );
                }.bind(this), 1000)
            },

            submitRequest(){
                this.formErrors = [];

                if (this.formData.selectedPositions.length === 0) {
                    this.formErrors.push('Choose at least one position type');
                }

                if (this.formData.positionTitles.trim() === '') {
                    this.formErrors.push('Enter at least Position Title');
                }

                if (this.formErrors.length > 0) {
                    return;
                }

                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/invites/frommember', this.formData).then(
                            (response) => {
                                this.isSaving = false;

                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                    return;
                                }

                                this.showSuccessMessage = true;
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