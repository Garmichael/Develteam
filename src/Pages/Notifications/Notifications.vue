<template>
    <article id="notifications">
        <h2>Notifications</h2>

        <loader-large v-if="notificationsFetchingStatus !== 'fetched'"></loader-large>

        <template v-if="notificationsFetchingStatus === 'fetched'">

            <router-link v-for="notification in notifications"
                         v-if="notifications.length > 0 && notification.text && notification.link"
                         :to="notification.link"
                         :class="{new: notification.hasBeenRead === 0}">
                <span class="text"><i class="fas fa-bell" v-if="!notification.hasBeenRead"></i> {{notification.text}}</span>
                <span class="time-stamp">{{notification.created | formatDate}}</span>
            </router-link>

            <span class="no-notifications-message" v-if="notifications.length === 0">You don't have any notifications</span>

        </template>

    </article>
</template>


<script>
    export default {
        name: 'NotificationsPage',
        data(){
            return {}
        },

        components: {},

        mounted() {

        },

        computed: {
            notifications(){
                return this.$store.state.notificationsModel.notifications;
            },

            notificationsFetchingStatus(){
                return this.$store.state.notificationsModel.fetchingStatus;
            }
        },

        methods: {}
    }
</script>