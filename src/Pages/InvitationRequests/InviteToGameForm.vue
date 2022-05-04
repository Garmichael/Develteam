<template>
    <article id="invite-to-game">

        <form>

            <loader-large v-if="fetchingMember"></loader-large>

            <template v-if="showSuccessMessage">
                <div class="validation-messages friendly success-message">Invitation Successfully Sent to
                    <router-link :to="`/Developer/${foundMember.stringUrl}`"><i class="fas fa-user"></i> {{foundMember.alias}}</router-link>
                </div>
            </template>

            <template v-if="!fetchingMember && !showSuccessMessage">
                <div v-if="memberFound && isLoggedIn">
                    <h2>
                        Invite
                        <router-link :to="`/Developer/${foundMember.stringUrl}`"><i class="fas fa-user"></i> {{foundMember.alias}}</router-link>
                        to a Game
                    </h2>

                    <div class="field">
                        <label for="selected-game">Invite to Join</label>
                        <select id="selected-game" v-model="formData.selectedGame" :disabled="isSaving">
                            <option v-for="game in GamesOwned" :value="game.id">{{game.alias}}</option>
                        </select>
                    </div>

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
                        <button class="button" @click.prevent="submitInvitation">Send Invitation</button>
                    </div>
                </div>

                <div v-if="!memberFound || !isLoggedIn">
                    <h2>Error</h2>
                    <span v-if="!memberFound && isLoggedIn">Invited member was not found</span>
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
        name: 'InviteToGame',
        metaInfo: {
            title: 'Develteam - Invite a Member to a Game Project | Game developer community | Game dev team up'
        },

        data(){
            return {
                isSaving: false,
                formErrors: [],
                showSuccessMessage: false,
                fetchingMember: true,
                memberFound: false,
                foundMember: {},
                formData: {
                    selectedGame: 0,
                    selectedPositions: [],
                    positionTitles: '',
                    invitedMember: 0
                }
            }
        },

        components: {},

        mounted() {
            if (this.$route.params.inviteMemberStringUrl) {
                this.getDeveloperInfo();
            } else {
                this.fetchingMember = false;
                this.memberFound = false;
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
                    axios.get('/api/developer', {
                        params: {
                            stringUrl: this.$route.params.inviteMemberStringUrl
                        }
                    }).then(
                            (response) => {
                                this.fetchingMember = false;

                                this.memberFound = !response.data.error;

                                if (!response.data.error) {
                                    this.foundMember = response.data;
                                    this.formData.invitedMember = this.foundMember.id;
                                }
                            },

                            (response) => {
                                this.fetchingMember = false;
                            }
                    );
                }.bind(this), 1000)
            },

            submitInvitation(){
                this.formErrors = [];

                if (this.formData.selectedGame === 0) {
                    this.formErrors.push('Choose a Game to invite this user to');
                }

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
                    axios.post('/api/invites/togame', this.formData).then(
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