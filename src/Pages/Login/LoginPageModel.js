import Vue from 'vue'
import Crypto from 'crypto'
import axios from 'axios'

export default {
    state: {
        validationMessage: '',
        email: '',
        password: '',
        rememberMe: false,
        isLoggedIn: false
    },

    actions: {
        'loginPage/validateLogin': function (context, callback) {
            let sha256 = Crypto.createHash('sha256'),
                password = sha256.update(context.state.password).digest('hex'),
                email = context.state.email;

            let payload = {
                email: email,
                password: password
            };

            axios.post('/api/login', payload)
                .then(
                    (response) => {
                        callback({
                            status: response.data.isLoggedIn ? 'online' : 'offline',
                            id: response.data.isLoggedIn ? response.data.info.id : 0,
                            alias: response.data.isLoggedIn ? response.data.info.alias : '',
                            stringUrl: response.data.isLoggedIn ? response.data.info.stringUrl : '',
                            passkey: response.data.isLoggedIn ? response.data.info.passkey : ''
                        });
                        context.state.validationMessage = response.data.validationMessage;
                        context.commit('loggedUserModel/setLoggedUserInfo', response.data);
                    },
                    (response) => {
                        console.log(response);
                    }
                )
        }
    },

    mutations: {
        'loginPage/updateEmail': function (state, data) {
            state.email = data;
        },

        'loginPage/updatePassword': function (state, data) {
            state.password = data;
        }
    }

}