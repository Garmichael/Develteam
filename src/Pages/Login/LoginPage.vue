<template>
    <div>

        <div v-if="isLoggedIn" class="validation-messages friendly">You are Logged In</div>

        <div v-if="!isLoggedIn" id="login-form">
            <h2>Log In</h2>

            <form name="login">
                <div v-if="validationMessage" class="validation-messages error">{{validationMessage}}</div>
                <input type="text" id="login-email" name="email" placeholder="Email" v-model="email"/>
                <input type="password" id="login-password" name="password" size="20" placeholder="Password" v-model="password"/>

                <label class='remember-me' for="remember"><input type="checkbox" name="remember" id="remember" value="Yes" checked v-bind="rememberMe"/>Remember me</label>

                <div class="button-container">
                <button class="button" @click.prevent="submit">Log In</button>
                </div>

                <div class="options">
                    <span><router-link class="forgot-password" to="/Login/Forgot">I forgot my password!</router-link></span>
                    <span><router-link class="register-link" to="/Register">Register new account</router-link></span>
                </div>
            </form>
        </div>

    </div>
</template>


<script>
    export default {
        name: 'LoginPage',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up',
        },
        data(){
            return {
                rememberMe: false
            }
        },

        computed: {
            email: {
                get(){
                    return this.$store.state.loginPageModel.email;
                },
                set(value){
                    this.$store.commit('loginPage/updateEmail', value)
                }
            },
            password: {
                get(){
                    return this.$store.state.loginPageModel.password;
                },
                set(value){
                    this.$store.commit('loginPage/updatePassword', value)
                }
            },
            remember(){
                return this.$store.state.loginPageModel.rememberMe;
            },
            validationMessage(){
                return this.$store.state.loginPageModel.validationMessage;
            },
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        },

        methods: {
            submit(e) {
                let self = this;

                this.$store.dispatch('loginPage/validateLogin', function (user) {
                    self.$socket.emit("setUserSocketData", user)
                });
            }
        }
    }
</script>