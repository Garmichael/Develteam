<template>
    <article id="online-users">
        <ul id="online-users-list">
            <li v-for="user in onlineUserList" v-if="user.id">
                <template v-if="isLoggedIn">
                    <span class="message-user" v-if="loggedUser.id !== user.id" @click="openConversation(user)">
                        <i class="far fa-comment-alt"></i> Chat
                    </span>

                    <span class="self-user-message-space" v-if="loggedUser.id === user.id"></span>
                </template>

                <span class="alias">
                    <router-link :to="`/Developer/${user.stringUrl}`"> <i class="fas fa-user"></i> {{user.alias}}</router-link>
                </span>
            </li>
        </ul>
    </article>
</template>

<script>
    import bus from '../../vueGlobalEventBus';
    import _ from 'underscore';

    export default {
        name: "OnlineUsers",

        data() {
            return {}
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            loggedUser() {
                return this.isLoggedIn
                    ? this.$store.state.loggedUserModel.info
                    : undefined
            },

            onlineUserList() {
                let onlineUsers = this.$store.state.onlineUsersModel.onlineUsers;

                onlineUsers = _.sortBy(onlineUsers, function (user) {
                    return user.alias;
                });

                return onlineUsers;
            },

        },

        methods: {
            openConversation(user) {
                bus.$emit('privateChatOpenConversation', user)
            }
        },

        mounted() {

        },
    }
</script>