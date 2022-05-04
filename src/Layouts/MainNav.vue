<template>
    <nav id="main-nav">

        <div class="container">

            <div id="site-details">
                <router-link to="/">
                    <h1 id="logo">Develteam</h1>
                </router-link>

                <!--<div id="site-social-sharing">-->
                    <!--<a href="https://www.facebook.com/Develteam/" target="_blank"><i class="fab fa-fw fa-facebook-f"></i></a>-->
                    <!--<a href="https://twitter.com/Develteam" target="_blank"><i class="fab fa-fw fa-twitter"></i></a>-->
                <!--</div>-->
            </div>



            <search-widget></search-widget>

            <div id="logged-in-user-details">

                <div v-if="!isLoggedIn && showUserPanel" class="unlogged">
                    <router-link to="/Login" class="log-in">Log In</router-link>
                    <router-link to="/Register" class="sign-up">Sign Up</router-link>
                </div>

                <div v-if="isLoggedIn && showUserPanel" class="logged">
                    <div class="log-out" @click.prevent="logOut">Log out</div>

                    <div class="avatar-container">
                        <avatar :profile-data="loggedUserDetails.info" profile-type="developer" size="very-small" :show-xp-info="true"></avatar>
                    </div>

                    <div @click="showNotificationsList = !showNotificationsList">
                        <i class="far fa-bell"></i>
                        <div class="notification-count" v-if="unreadNotifications  > 0">{{unreadNotifications}}</div>
                    </div>

                    <router-link to="/Invites" tag="div">
                        <i class="far fa-user"></i>
                        <div class="notification-count" v-if="unreadInvitesNotificationCount > 0">{{unreadInvitesNotificationCount}}</div>
                    </router-link>

                    <router-link to="/Inbox" tag="div">
                        <i class="far fa-envelope"></i>
                        <div class="notification-count" v-if="unreadInboxCount> 0">{{unreadInboxCount}}</div>
                    </router-link>

                    <div id="notifications-list" v-if="showNotificationsList" @mouseleave="showNotificationsList = false">
                        <loader-small v-if="notificationsFetchingStatus !== 'fetched' && notifications && notifications.length == 0"></loader-small>

                        <template v-if="notificationsFetchingStatus === 'fetched'">
                            <div class="notifications" v-if="notifications.length > 0">
                                <router-link v-for="notification in notifications"
                                             v-if="notification.text && notification.link"
                                             :to="notification.link"
                                             :class="{new: notification.hasBeenRead === 0}">
                                    <span class="text"><i class="fas fa-bell" v-if="!notification.hasBeenRead"></i> {{notification.text}}</span>
                                    <span class="time-stamp">{{notification.created | formatDate}}</span>
                                </router-link>
                            </div>

                            <div class="notifications" v-if="notifications.length === 0">
                                <span class="no-notifications-message">You don't have any notifications</span>
                            </div>
                            <router-link to="/Notifications"><span>View all...</span></router-link>
                        </template>
                    </div>
                </div>
            </div>

        </div>

    </nav>
</template>

<script>
    import SearchWidget from './SearchWidget.vue'

    export default {
        name: 'mainNav',

        components: {
            'search-widget': SearchWidget
        },

        data() {
            return {
                showNotificationsList: false
            }
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            showUserPanel() {
                return this.$store.state.loggedUserModel.gotInitialLoggedUserInfo;
            },

            loggedUserDetails() {
                if (this.isLoggedIn) {
                    return this.$store.state.loggedUserModel;
                }
            },

            unreadInboxCount() {
                let conversations = this.$store.state.inboxPageModel.conversations,
                    total = 0;

                conversations.forEach(function (conversation) {
                    if (!conversation.hasBeenRead) {
                        total++;
                    }
                });

                return total;
            },

            unreadInvitesNotificationCount() {
                const totalInvitationsToGames = this.$store.state.invitesModel.invitationsToGames.length;
                const totalRequestsToJoin = this.$store.state.invitesModel.requestsToJoin.length;
                const sentInvitationsToGames = this.$store.state.invitesModel.sentInvitationsToGames;
                const sentRequestsToJoin = this.$store.state.invitesModel.sentRequestsToJoin;

                const totalSentInvitationsToGames = _.filter(sentInvitationsToGames, function (sentInvite) {
                    return sentInvite.response !== 'noResponse';
                }).length;

                const totalSentRequestsToJoin = _.filter(sentRequestsToJoin, function (sentRequest) {
                    return sentRequest.response !== 'noResponse';
                }).length;

                return totalInvitationsToGames + totalRequestsToJoin + totalSentInvitationsToGames + totalSentRequestsToJoin;
            },

            notifications() {
                let allNotifications = this.$store.state.notificationsModel.notifications;
                let unreadNotificationCount = _.filter(allNotifications, function (notification) {
                    return notification.hasBeenRead === 0;
                }).length;

                let truncateCount = unreadNotificationCount > 10 ? unreadNotificationCount : 10;

                return this.$store.state.notificationsModel.notifications.slice(0, 1000);
            },

            unreadNotifications() {
                let allNotifications = this.$store.state.notificationsModel.notifications;

                return _.filter(allNotifications, function (notification) {
                    return notification.hasBeenRead === 0;
                }).length;
            },

            totalUnreadNotifications() {
                return this.unreadInboxCount + this.unreadInvitesNotificationCount + this.unreadNotifications;
            },

            notificationsFetchingStatus() {
                return this.$store.state.notificationsModel.fetchingStatus;
            }
        },

        methods: {
            logOut(e) {
                this.$store.dispatch('loggedUserModel/logOut', function (user) {
                    this.$socket.emit("unsetUserSocketData", user)
                }.bind(this));
            },

            socialShare(site) {
                let url = '';
                let postUrl = postUrl = `https://www.develteam.com`;

                if (site === 'facebook') {
                    url = 'https://www.facebook.com/sharer/sharer.php?u=' + postUrl;
                } else if (site === 'twitter') {
                    url = 'https://twitter.com/home?status=' + postUrl;
                } else if (site === 'linkedin') {
                    url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + postUrl + '&title=&summary=&source=';
                }

                window.open(url, '_blank');
            }
        },

        watch: {
            'isLoggedIn'() {
                if (this.isLoggedIn) {
                    this.$store.dispatch('InboxPage/getConversations');
                    this.$store.dispatch('invites/fetchInvites');
                    this.$store.dispatch('notificationsModel/getNotifications');
                }
            }
        },

        sockets: {
            'invitesUpdated'() {
                this.$store.dispatch('invites/fetchInvites');
            },

            'notificationsUpdated'() {
                this.$store.dispatch('notificationsModel/getNotifications');
            }
        }
    }
</script>