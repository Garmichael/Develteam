<template>
    <article id="forgot-password">
        <form>
            <saver-large v-if="isSaving"></saver-large>

            <template v-if="!isSaving">
                <h1>Recover your Password</h1>

                <template v-if="!showConfirmation">
                    <div class="validation-messages error" v-if="formErrors.length > 0">
                        <span v-for="error in formErrors">{{error}}</span>
                    </div>
                    <input type="email" placeholder="Email Address" v-model="email" @input="formErrors = []"/>
                    <button class="button" @click.prevent="sendRecoveryLink">Send Recovery Link</button>
                </template>

                <template v-if="showConfirmation">
                    <p>An email has been sent to {{email}}. Wait a few minutes and check your spam folder.</p>
                </template>


            </template>

        </form>
    </article>
</template>


<script>
    import axios from 'axios'
    import validator from 'validator'

    export default {
        name: 'ForgotPassword',
        metaInfo: {
            title: 'Develteam Recover Your Password | Game developer community | Game dev team up'
        },
        data(){
            return {
                isSaving: false,
                email: '',
                showConfirmation: false,
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
            sendRecoveryLink(){

                this.email = this.email.trim();

                if (!validator.isEmail(this.email)) {
                    this.formErrors = ['Invalid Email Format'];
                    return;
                }

                this.isSaving = true;
                setTimeout(function () {
                    axios.post('/api/forgotPassword', {
                        email: this.email,
                        password: this.password
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
                }.bind(this), 500);
            }
        }
    }
</script>