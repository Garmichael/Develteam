<template>
    <article id="register-page">

        <form id="register-form" v-if="!successfullyRegistered">
            <h2>Register a New Account</h2>

            <div class="register-form-fields">
                <saver-large v-if="isSaving"></saver-large>

                <template v-if="!isSaving">
                    <label>Screen Name </label>
                    <input type="text" placeholder="Screen Name" v-model="alias" :class="{invalid: aliasHasError}" @input="aliasHasError=false"/>

                    <label>Email</label>
                    <input type="email" placeholder="Email Address" v-model="email" :class="{invalid: emailHasError}" @input="emailHasError=false"/>

                    <label>Verify Email</label>
                    <input type="email" placeholder="Confirm Email Address" v-model="emailVerify" :class="{invalid: emailHasError}" @input="emailHasError=false"/>

                    <label>Password</label>
                    <input type="password" placeholder="Password" v-model="password" :class="{invalid: passwordHasError}" @input="passwordHasError=false"/>

                    <label>Verify Password</label>
                    <input type="password" placeholder="Confiirm Password" v-model="passwordVerify" :class="{invalid: passwordHasError}" @input="passwordHasError=false"/>

                    <div class="recaptcha-container">
                        <div class="recpatcha-inner-container">
                            <div class="g-recaptcha" ref="recaptchaContainer" :data-sitekey="rcapt_sig_key"></div>
                        </div>
                    </div>

                    <div class="validation-messages error" v-if="formErrors.length > 0">
                        <span v-for="error in formErrors">{{error}}</span>
                    </div>

                    <div class="button-container">
                        <button class="button" @click.prevent="submit">Register Account</button>
                    </div>
                </template>
            </div>
        </form>

        <div id="successful-registration" v-if="successfullyRegistered">
            <h2>Welcome to Develteam!</h2>
            <p>
                <router-link to="/">Return to the Home Page</router-link>
                |
                <router-link :to="`/Developer/${loggedUser.stringUrl}`">Edit your Profile</router-link>
            </p>
        </div>
    </article>
</template>


<script>
    import validator from 'validator';
    import axios from 'axios';

    export default {
        name: 'Register',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up',
            script: [
                {src: 'https://www.google.com/recaptcha/api.js'}
            ]
        },
        data(){
            return {
                isSaving: false,
                formErrors: [],
                alias: '',
                aliasHasError: false,
                email: '',
                emailVerify: '',
                emailHasError: false,
                password: '',
                passwordVerify: '',
                passwordHasError: false,
                rcapt_sig_key: '6LdvOxcUAAAAAGi4eOcWZgw-IyPy9zAAWpFX3ReC'

            }
        },

        components: {},

        mounted() {

        },

        computed: {
            loggedUser(){
                if (this.$store.state.loggedUserModel.isLoggedIn) {
                    return this.$store.state.loggedUserModel.info
                } else {
                    {
                    }
                }
            },

            successfullyRegistered(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        },

        methods: {
            submit(){
                let recaptchaResponse;

                if (window.grecaptcha) {
                    recaptchaResponse = window.grecaptcha.getResponse(0);
                }

                this.formErrors = [];

                if (this.alias.trim() === '') {
                    this.formErrors.push('Enter a Screen Name');
                    this.aliasHasError = true;
                }

                this.email = this.email.trim();
                this.emailVerify = this.emailVerify.trim();

                if (!validator.isEmail(this.email)) {
                    this.formErrors.push('Enter a Valid Email Address');
                    this.emailHasError = true;
                }

                if (!validator.isEmail(this.email)) {
                    this.formErrors.push('Enter a Valid Email Address');
                    this.emailHasError = true;
                }

                if (this.email.toLowerCase() !== this.emailVerify.toLowerCase()) {
                    this.formErrors.push('Emails do not match');
                    this.emailHasError = true;
                }

                if (this.password === '') {
                    this.formErrors.push('Enter a Password');
                    this.passwordHasError = true;
                }

                if (this.password !== this.passwordVerify) {
                    this.formErrors.push('Passwords do not match');
                    this.passwordHasError = true;
                }

                if (this.formErrors.length > 0) {
                    return;
                }

                this.isSaving = true;

                setTimeout(function () {
                    axios.post('/api/registerAccount', {
                        alias: this.alias,
                        email: this.email,
                        password: this.password,
                        recaptchaResponse: recaptchaResponse
                    }).then(
                            (response) => {
                                if (response.data.errors) {
                                    this.isSaving = false;
                                    this.formErrors = response.data.errors;
                                } else {
                                    this.$store.dispatch('loggedUserModel/getLoggedUserInfo', function (user) {
                                        this.$socket.emit("setUserSocketData", user)
                                    }.bind(this));
                                }
                            },
                            (response) => {
                                this.formErrors = ['An unknown problem occurred. Please wait a few minutes and try again.']
                            }
                    )
                }.bind(this), 500);
            }
        }
    }
</script>