<template>
    <article id="private-chat">
        <template v-if="!newConversationMode">
            <h2>Conversations</h2>
            <ul id="private-chat-conversations" :class="[{'shrunk': selectedConversation}]">
                <li v-for="conversation in conversations"
                    @click="selectConversation(conversation)"
                    :class="[{'selected': selectedConversation && selectedConversation.chatId === conversation.chatId}]"
                >
                    <span class="partner-alias">
                        <i v-if="showNotification(conversation)" class="fas fa-bell new-message-notification"></i>
                        {{conversation.partnerAlias}}
                    </span>
                    <span class="timestamp">{{conversation.lastMessageTime | formatDateWithoutTime}}</span>
                </li>
            </ul>

            <h2 id="private-chat-conversation-header" v-if="selectedConversation">Chat with {{selectedConversation.partnerAlias}}</h2>

            <template v-if="selectedConversation && showingHistoryDates">
                <ul id="private-chat-history-dates">
                    <li v-for="historyDate in historyDates" class="history-date-item" @click="selectHistoryDate(historyDate)">
                        <span>{{historyDate.messageCount}}</span>
                        <span>{{historyDate.day | formatDateWithoutTime}}</span>
                    </li>
                </ul>
            </template>

            <template v-if="selectedConversation && !showingHistoryDates">
            <span v-if="selectedHistoryDate" id="private-chat-history-header">
                <i @click="showHistoryDates" class="fas fa-fw fa-arrow-left"></i>
                History: {{selectedHistoryDate.day | formatDateWithoutTime}}
            </span>

                <ul id="private-chat-messages" ref="chatMessages">
                    <li v-for="message in messages">
                        <div class="avatar-container">
                            <avatar :profile-data="message.from" profile-type="developer" size="very-small" :show-xp-info="false"></avatar>
                        </div>

                        <div class="message-details">
                            <span class="message-from">
                                <router-link :to="'/Developer/' + message.from.stringUrl">{{message.from.alias}}</router-link>
                                <span class="message-date">{{message.timestamp | formatDateCondensed}}</span>
                            </span>

                            <div class="individual-message" v-for="individualMessage in message.messages">
                                <markdown-content classes="message-message" :content="individualMessage.message"></markdown-content>
                            </div>
                        </div>
                    </li>
                </ul>
            </template>

            <div id="private-chat-options" v-if="selectedConversation">
                <div :class="['option', {selected: showingHistoryDates || showingHistoryDateMessages}]" @click="toggleHistoryDates" title="History"><i class="fas fa-fw fa-history"></i></div>
                <div class="option" @click="toggleAudioNotifications('off')" v-if="audioNotificationsEnabled" title="Turn off Audio Notifications"><i class="fas fa-fw fa-volume-up"></i></div>
                <div class="option" @click="toggleAudioNotifications('on')" v-if="!audioNotificationsEnabled" title="Turn on Audio Notifications"><i class="fas fa-fw fa-volume-off"></i></div>
            </div>

            <form id="private-chat-input" v-if="selectedConversation && !showingHistoryDates && !showingHistoryDateMessages">
                <input type="text" v-model="newMessage" placeholder="Type to chat..." maxlength="450"/>
                <input type="submit" value="Send" @click.prevent="sendMessage"/>
            </form>
        </template>

        <template v-if="newConversationMode">
            <h2 id="private-chat-conversation-header-new-conversation">Chat with {{newConversationAlias}}</h2>
            <div id="private-chat-messages-new-conversation"></div>
            <form id="private-chat-input-new-conversation">
                <input type="text" v-model="newMessage" placeholder="Type to chat..." maxlength="450"/>
                <input type="submit" value="Send" @click.prevent="sendNewConversationMessage"/>
            </form>
        </template>
    </article>
</template>

<script>
    import axios from 'axios';
    import _ from 'underscore';

    export default {
        name: "PrivateChat",

        data() {
            return {
                newMessage: '',
                showingHistoryDates: false,
                selectedHistoryDate: undefined,
                showingHistoryDateMessages: false,
                newConversationMode: false,
                newConversationParticipantId: undefined,
                newConversationAlias: undefined
            }
        },

        computed: {
            conversations() {
                let conversations = this.$store.state.privateChatModel.conversations;

                conversations = _.sortBy(conversations, function (conversation) {
                    return -conversation.lastMessageTime;
                });

                conversations = _.sortBy(conversations, function (conversation) {
                    return conversation.hasBeenRead;
                });

                return conversations;
            },

            messages() {
                let messageGroups = [];
                let messages = [];
                if (!this.selectedConversation ||
                    !this.selectedConversation.chatId ||
                    !this.$store.state.privateChatModel.messages[this.selectedConversation.chatId]
                ) {
                    return messages;
                }

                messages = this.$store.state.privateChatModel.messages[this.selectedConversation.chatId];

                if (this.showingHistoryDateMessages) {
                    messages = this.$store.state.privateChatModel.historyMessages[this.selectedConversation.chatId + "_" + this.selectedHistoryDate.day] || [];
                }

                for (let i = 0; i < messages.length; i++) {
                    if (i > 0 && messages[i].from.id === messages[i - 1].from.id && messages[i].from.id !== null) {
                        messageGroups[messageGroups.length - 1].messages.push(messages[i]);
                    } else {
                        messageGroups.push({
                            from: messages[i].from,
                            timestamp: messages[i].timestamp,
                            messages: [messages[i]]
                        });
                    }
                }

                return messageGroups;
            },

            selectedConversation() {
                return this.$store.state.privateChatModel.selectedConversation;
            },

            audioNotificationsEnabled() {
                return this.$store.state.loggedUserModel.options.chatroomNotificationSound === 'on';
            },

            historyDates() {
                return this.$store.state.privateChatModel.historyDates[this.selectedConversation.chatId] || [];
            },
        },

        methods: {
            showNotification(conversation) {
                let isUnread = !conversation.hasBeenRead;
                let hasOpenConversation = this.selectedConversation;
                let isActiveConversation = hasOpenConversation
                    ? conversation.chatId === this.selectedConversation.chatId
                    : false;

                return isUnread && !isActiveConversation;
            },

            sendMessage() {
                this.newMessage = this.newMessage.trim();

                if (this.newMessage === '') {
                    return;
                }

                this.$store.dispatch('privateChat/sendMessage', {
                    chatId: this.selectedConversation.chatId,
                    message: this.newMessage
                });

                this.newMessage = '';
            },

            selectConversation(conversation) {
                let self = this;

                this.$store.dispatch('privateChat/getMessages', {
                    chatId: conversation.chatId,
                    callback: function () {
                        self.showingHistoryDates = false;
                        self.$store.commit('privateChat/setActiveConversation', conversation);
                        self.$store.dispatch('privateChat/markReadConversation', conversation);
                        self.scrollDownMessages();
                    }
                });
            },

            scrollDownMessages() {
                this.$nextTick(function () {
                    if (this.$refs.chatMessages) {
                        this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
                    }
                });
            },

            toggleAudioNotifications(state) {
                this.$set(this.$store.state.loggedUserModel.options, 'chatroomNotificationSound', state);

                axios.post('/api/userOptions/updateChatroomNotificationSound', {
                    state: state
                });
            },

            toggleHistoryDates() {
                if (this.showingHistoryDates || this.showingHistoryDateMessages) {
                    this.showingHistoryDates = false;
                } else {
                    this.showHistoryDates();
                }

                this.showingHistoryDateMessages = false;
                this.selectedHistoryDate = undefined;
            },

            showHistoryDates() {
                this.showingHistoryDates = true;
                this.$store.dispatch('privateChat/getHistoryDates');
            },

            selectHistoryDate(historyDate) {
                let self = this;

                this.$store.dispatch('privateChat/getHistoryForDate', {
                    selectedHistoryDate: historyDate, callback: function () {
                        self.selectedHistoryDate = historyDate;
                        self.showingHistoryDates = false;
                        self.showingHistoryDateMessages = true;
                    }
                });
            },

            createNewConversation(participant) {
                this.newConversationMode = true;
                this.newConversationParticipantId = participant.id;
                this.newConversationAlias = participant.alias;
            },

            sendNewConversationMessage() {
                this.newMessage = this.newMessage.trim();

                if (this.newMessage === '') {
                    return;
                }

                this.$store.dispatch('privateChat/sendNewConversation', {
                    participantId: this.newConversationParticipantId,
                    message: this.newMessage,
                    callback: function(response){

                    }
                });

                this.newMessage = '';
                this.newConversationMode = false;
            },

            getMatchingConversation(userAId, userBId) {
                let conversationIdA = userAId + '.' + userBId;
                let conversationIdB = userBId + '.' + userAId;
                let matchingConversation = undefined;

                _.each(this.$store.state.privateChatModel.conversations, function (conversation) {
                    if (conversation.chatId === conversationIdA || conversation.chatId === conversationIdB) {
                        matchingConversation = conversation;
                    }
                });

                return matchingConversation;
            }
        },

        sockets: {
            'receivedPrivateChatMessage'(data) {
                if (this.selectedConversation && this.selectedConversation.chatId === data.chatId) {
                    this.$store.dispatch('privateChat/markReadConversation', this.selectedConversation);
                }
            }
        },

        watch: {
            'messages'() {
                let shouldScroll = this.$refs.chatMessages &&
                    this.$refs.chatMessages.scrollTop >= this.$refs.chatMessages.scrollHeight - this.$refs.chatMessages.clientHeight;

                if (shouldScroll) {
                    this.scrollDownMessages();
                }
            }
        },

        mounted() {
            this.scrollDownMessages();

            if (this.selectedConversation && this.selectedConversation.chatId) {
                this.$store.dispatch('privateChat/markReadConversation', this.selectedConversation);
            }
        }
    }
</script>