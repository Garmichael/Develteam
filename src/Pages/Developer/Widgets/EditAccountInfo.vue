<template>
    <section id="edit-developer-basic-info">
        <div class="basic-info edit-container">
            <template v-if="formData.delete !== 'DELETE'">
                <h1>Account Settings</h1>

                <div class="set">
                    <label>Username</label>
                    <div class="container">
                        <div><input type="text" placeholder="Username" :disabled="isSaving" v-model="formData.alias"/></div>
                    </div>

                    <label>Email Address</label>
                    <div class="container">
                        <div><input type="text" placeholder="Email Address" :disabled="isSaving" v-model="formData.email"/>
                        </div>
                    </div>

                    <div class="validation-messages friendly" v-if="showEmailError">
                        Not a valid Email Address
                    </div>
                </div>

                <div class="set">
                    <label>Emails</label>
                    <label><input type="checkbox" v-model="formData.receiveEmailNotifications" :disabled="isSaving" />Receive Email Notifications</label>
                    <label><input type="checkbox" v-model="formData.receivePromoEmails" :disabled="isSaving" />Receive Official Emails</label>
                </div>

                <div class="set">
                    <label>Change Password
                        <a @click="passwordsShown = true" v-if="!passwordsShown">Show</a>
                        <a @click="passwordsShown = false" v-if="passwordsShown">Hide</a>
                    </label>

                    <div class="container">
                        <div><input v-if="!passwordsShown" type="password" placeholder="New Password"
                                    :disabled="isSaving" v-model="formData.password" autocomplete="new-password"/>
                        </div>

                        <div><input v-if="passwordsShown" type="text" placeholder="New Password" v-model="formData.password"
                                    :disabled="isSaving" autocomplete="new-password"/>
                        </div>

                        <div><input v-if="!passwordsShown" type="password" placeholder="New Password Again"
                                    :disabled="isSaving" v-model="formData.passwordAgain" autocomplete="new-password"/>
                        </div>

                        <div><input v-if="passwordsShown" type="text" placeholder="New Password Again"
                                    :disabled="isSaving" v-model="formData.passwordAgain" autocomplete="new-password"/>
                        </div>
                    </div>
                </div>

                <div class="validation-messages friendly"
                     v-if="formData.password.length > 0 && formData.password !== formData.passwordAgain">
                    Passwords do not match
                </div>

            </template>

            <div class="set">
                <label>Delete Account</label>

                <div class="container">
                    <div>Type DELETE and press Save</div>
                    <div><input type="text" placeholder="delete?" :disabled="isSaving" v-model="formData.delete"/></div>
                </div>

                <div class="validation-messages friendly" :disabled="isSaving" v-if="formData.delete === 'DELETE'">
                    If you press SAVE, your account will be deleted. This cannot be undone.
                </div>

                <div class="validation-messages error" v-if="responseErrors.length > 0">
                    <span v-for="error in responseErrors">{{error}}</span>
                </div>
            </div>

            <div class="buttons">
                <button class="button minor" :disabled="isSaving" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" :disabled="isSaving" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    import validator from 'validator';

    export default {
        name: 'EditDeveloperBasicDetails',

        data() {
            return {
                formData: {
                    alias: this.$store.state.loggedUserModel.info.alias,
                    email: this.$store.state.loggedUserModel.info.email,
                    password: '',
                    passwordAgain: '',
                    delete: '',
                    receiveEmailNotifications: this.$store.state.loggedUserModel.info.receiveEmailNotifications,
                    receivePromoEmails: this.$store.state.loggedUserModel.info.receivePromoEmails,
                },
                passwordsShown: false,
                isSaving: false,
                responseErrors: []
            }
        },

        computed: {
            showEmailError() {
                return !validator.isEmail(this.formData.email);
            }
        },

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                this.isSaving = true;

                this.$store.dispatch('loggedUserModel/updateLoggedUserInfo', {
                    data: this.formData,
                    callback: (response) => {
                        this.isSaving = false;
                        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
                            this.responseErrors = response.errors;
                        } else {
                            location.reload();
                        }
                    }
                });
            }
        }
    }
</script>