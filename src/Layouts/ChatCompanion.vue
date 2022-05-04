<template>
    <aside id="chat-companion">
        <ul id="chat-companion-switcher">
            <li v-for="tab in tabs"
                :class="{selected: activeTab === tab.label}"
                @click="activeTab = tab.label"
                v-if="!tab.requiresLogin || isLoggedIn"
            >
                {{tab.label}}
                <i class="fas fa-bell" v-if="tab.notificationType === 'badge' && tab.showNotification"></i>
                <i class="total-notification" v-if="tab.notificationType === 'total' && tab.showNotification">{{tab.notificationCount}}</i>
            </li>
        </ul>

        <chat-companion v-if="activeTab === 'Chatroom'"></chat-companion>
        <private-chat-companion ref="privateChat" v-if="activeTab === 'Private Chat'"></private-chat-companion>
        <online-users-companion v-if="activeTab === 'Online Users'"></online-users-companion>
    </aside>
</template>

<script>
    import Chatroom from '../Pages/ChatRoom/ChatRoom.vue';
    import PrivateChat from '../Pages/PrivateChat/PrivateChat.vue';
    import OnlineUsers from '../Pages/OnlineUsers/OnlineUsers.vue'
    import bus from '../vueGlobalEventBus';

    export default {
        name: "ChatCompanion",
        components: {
            'chat-companion': Chatroom,
            'private-chat-companion': PrivateChat,
            'online-users-companion': OnlineUsers
        },
        data() {
            return {
                activeTab: 'Chatroom',
                chatNotificationSound: new Audio('src/sounds/chatNotification.mp3'),
                lastNotificationSoundTime: 0
            }
        },

        computed: {
            tabs() {
                return [
                    {
                        label: 'Chatroom',
                        requiresLogin: false,
                        showNotification: false,
                        notificationType: 'badge'
                    },
                    {
                        label: 'Private Chat',
                        requiresLogin: true,
                        showNotification: this.hasUnreadPrivateChats,
                        notificationType: 'badge'
                    },
                    {
                        label: 'Online Users',
                        requiresLogin: false,
                        showNotification: true,
                        notificationType: 'total',
                        notificationCount: this.onlineUserCount
                    }
                ]
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },


            totalGuests() {
                let onlineUsers = this.$store.state.onlineUsersModel.onlineUsers;
                let guests = 0;

                _.each(onlineUsers, function (user) {
                    if (!user.id) {
                        guests++;
                    }
                });

                return guests;
            },

            onlineUserCount() {
                let onlineUserCount = this.$store.state.onlineUsersModel.onlineUsers.length - this.totalGuests;
                if(onlineUserCount < 0){
                    onlineUserCount = 0;
                }

                return onlineUserCount;
            },

            audioNotificationsEnabled() {
                return this.isLoggedIn
                    ? this.$store.state.loggedUserModel.options.chatroomNotificationSound === 'on'
                    : false;
            },

            selectedPrivateChatConversation() {
                return this.$store.state.privateChatModel.selectedConversation;
            },

            hasUnreadPrivateChats() {
                let conversations = this.$store.state.privateChatModel.conversations;

                for (let i in conversations) {
                    let conversation = conversations[i];
                    let isUnread = !conversation.hasBeenRead;
                    let hasOpenConversation = this.selectedPrivateChatConversation;
                    let isActiveConversation = hasOpenConversation && this.activeTab === 'Private Chat'
                        ? conversation.chatId === this.selectedPrivateChatConversation.chatId
                        : false;

                    if (isUnread && !isActiveConversation) {
                        return true;
                    }
                }

                return false;
            }
        },

        sockets: {
            'updateConversations'() {
                this.$store.dispatch('privateChat/getConversations');
            },

            'receivedPrivateChatMessage'(data) {
                this.$store.dispatch('privateChat/getConversations');

                this.$store.dispatch('privateChat/getMessages', {
                    chatId: data.chatId,
                    forceReFetch: true
                });

                let shouldPlaySound = document.visibilityState !== 'visible' &&
                    this.audioNotificationsEnabled &&
                    new Date().getTime() - this.lastNotificationSoundTime > 5000;

                if (shouldPlaySound) {
                    this.chatNotificationSound.play();
                    this.lastNotificationSoundTime = new Date().getTime();
                }
            }
        },

        mounted() {
            this.$store.dispatch('privateChat/getConversations');

            bus.$on('privateChatOpenConversation', function (participant) {
                this.activeTab = 'Private Chat';

                this.$nextTick(function () {
                    let userA = this.$store.state.loggedUserModel.info.id;
                    let userB = participant.id;
                    let matchingConversation = this.$refs.privateChat.getMatchingConversation(userA, userB);

                    if (matchingConversation !== undefined) {
                        this.$refs.privateChat.selectConversation(matchingConversation);
                    } else {
                        this.$refs.privateChat.createNewConversation(participant);
                    }
                });

            }.bind(this));
        },

        watch: {
            'isLoggedIn'() {
                this.$store.dispatch('privateChat/getConversations');
            }
        }
    }
</script>