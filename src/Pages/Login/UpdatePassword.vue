<template>
    <section id="update-password">
        <form v-if="!showConfirmation">
            <h2>Update your Password</h2>

            <loader-large v-if="isLoading"></loader-large>
            <saver-large v-if="isSaving"></saver-large>

            <div class="validation-messages error" v-if="keycodeErrors.length > 0">
                <span v-for="error in keycodeErrors">{{error}}</span>
            </div>

            <div class="validation-messages error" v-if="formErrors.length > 0">
                <span v-for="error in formErrors">{{error}}</span>
            </div>

            <template v-if="!isLoading && !isSaving && keycodeErrors.length === 0">
                <h3>For {{recoveryEmail}}</h3>
                <input type="password" placeholder="Password" v-model="newPassword" @input="formErrors = []"/>
                <input type="password" placeholder="Verify Password" v-model="newPasswordVerify" @input="formErrors = []"/>
                <div class="button-container">
                    <button class="button" @click.prevent="submitUpdatedPassword">Update Password</button>
                </div>
            </template>
        </form>

        <div class="confirmation" v-if="showConfirmation">
            <h2>Your password has been updated!</h2>
            <span><router-link to="/Login">Log In</router-link></span>
        </div>
    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'UpdatePassword',
        metaInfo: {
            title: 'Develteam - Update Your Password | Game developer community | Game dev team up'
        },

        data(){
            return {
                isLoading: true,
                isSaving: false,
                formErrors: [],
                keycodeErrors: [],
                recoveryEmail: '',
                newPassword: '',
                newPasswordVerify: '',
                showConfirmation: false
            }
        },

        components: {},

        mounted() {
            this.getKeycodeData();
        },

        computed: {
            keycode(){
                return this.$route.params.keycode;
            }
        },

        methods: {
            getKeycodeData(){
                setTimeout(function () {
                    axios.get('/api/forgotPassword', {
                        params: {
                            keycode: this.keycode,
                        }
                    }).then(
                            (response) => {
                                this.isLoading = false;

                                if (response.data.errors) {
                                    this.keycodeErrors = response.data.errors;
                                } else {
                                    this.recoveryEmail = response.data.email;
                                }

                                console.log(response.data);
                            },

                            (response) => {

                            }
                    );
                }.bind(this), 1000)
            },

            submitUpdatedPassword(){
                if (this.newPassword === '') {
                    this.formErrors = ['Enter a Password'];
                    return;
                }

                if (this.newPassword !== this.newPasswordVerify) {
                    this.formErrors = ['Your passwords do not match'];
                    return;
                }

                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/forgotPassword/recover', {
                        keycode: this.keycode,
                        password: this.newPassword
                    }).then(
                            (response) => {
                                this.isSaving = false;
                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                } else {
                                    this.showConfirmation = true;
                                }
                            },
                            (response) => {
                                this.isSaving = false;
                                this.formErrors = ['An unknown problem occurred. Please wait a few minutes and try again.']
                            }
                    )
                }.bind(this), 1000)
            }
        }
    }
</script>