<template>
    <article id="chatroom">
        <div v-if="isLoggedIn && !selectedHistoryDate && !showingHistoryDates" id="chatroom-room-selector">
            <label for="room-selector-input">Room: </label>
            <select id="room-selector-input" @change="chooseNewRoom">
                <option v-for="room in rooms" :value="room.id" :selected="selectedRoom.id === room.id">{{room.name}}</option>
            </select>
        </div>

<!--        <section id="official-announcements" v-if="selectedRoom.id === 'siteGeneral'">-->
<!--            <h1>Official Announcement</h1>-->
<!--            <p>Write about Game Development and Win Prizes</p>-->
<!--            <router-link to="/Forums/Develteam/Develteam/Develteam-Event-Prizes-to-be-won-by-all-Write-about-a-gamedev-topic">Get the Details</router-link>-->
<!--        </section>-->

        <template v-if="showingHistoryDates">
            <ul id="chatroom-history-dates">
                <li v-if="showHistoryDatesLoader || showHistoryMessagesLoader" class="loader-container">
                    <loader-small></loader-small>
                </li>

                <li v-if="!showHistoryMessagesLoader && !showHistoryMessagesLoader" @click="selectHistoryDate(historyDate)" v-for="historyDate in historyDates" class="history-date-item">
                    <span>{{historyDate.messageCount}}</span>
                    <span>{{historyDate.day | formatDateWithoutTime}}</span>
                </li>
            </ul>
        </template>

        <template v-if="!showingHistoryDates">

            <span v-if="selectedHistoryDate" id="chatroom-history-header">
                <i @click="showHistoryDates" class="fas fa-fw fa-arrow-left"></i>
                History: {{selectedHistoryDate.day | formatDateWithoutTime}}
            </span>

            <ul id="chatroom-messages" ref="chatMessages">
                <li v-if="showHistoryMessagesLoader" class="loader-container">
                    <loader-small></loader-small>
                </li>

                <li v-for="message in messages">
                    <div class="avatar-container" v-if="!message.isSystemMessage">
                        <avatar :profile-data="message.from" profile-type="developer" size="very-small" :show-xp-info="false"></avatar>
                    </div>

                    <div class="message-details" v-if="!message.isSystemMessage">
                                <span class="message-from">
                                    <router-link :to="'/Developer/' + message.from.stringUrl">
                                        <i class="fas fa-crown mod-icon" v-if="message.from.isModerator"></i>
                                        <i class="fas fa-heartbeat donor-icon" v-if="message.from.donatedAmount > 0"></i>
                                        {{message.from.alias}}
                                    </router-link>
                                    <span class="message-date">{{message.timestamp | formatDateCondensed}}</span>
                                </span>

                        <div class="individual-message" v-for="individualMessage in message.messages">
                            <markdown-content classes="message-message" :content="individualMessage.message"></markdown-content>
                        </div>
                    </div>

                    <div class="message-details" v-if="message.isSystemMessage">
                        <div class="individual-message" v-for="individualMessage in message.messages" v-if="message.isSystemMessage">
                            <section v-if="message.systemMessageType === 'registeredDeveloper'" class="message-message system-message">
                                <i class="fas fa-user"></i>
                                <router-link :to="message.targetUrl">{{message.targetAlias}}</router-link>
                                just registered
                            </section>

                            <section v-if="message.systemMessageType === 'createdGame'" class="message-message system-message">
                                <i class="fas fa-gamepad"></i>
                                <router-link :to="message.targetUrl">{{message.targetAlias}}</router-link>
                                just created
                            </section>

                            <section v-if="message.systemMessageType === 'message'" class="message-message system-message">
                                <markdown-content classes="message-message" :content="individualMessage.message"></markdown-content>
                            </section>
                        </div>
                    </div>
                </li>
            </ul>
        </template>

        <div id="chatroom-options">
            <div :class="['option', {selected: showingHistoryDates || showingHistoryDateMessages}]" @click="toggleHistoryDates" title="History"><i class="fas fa-fw fa-history"></i></div>
            <div class="option" @click="toggleAudioNotifications('off')" v-if="audioNotificationsEnabled" title="Turn off Audio Notifications"><i class="fas fa-fw fa-volume-up"></i></div>
            <div class="option" @click="toggleAudioNotifications('on')" v-if="!audioNotificationsEnabled" title="Turn on Audio Notifications"><i class="fas fa-fw fa-volume-off"></i></div>
        </div>

        <form v-if="isLoggedIn && !selectedHistoryDate && !showingHistoryDates" id="chatroom-input">
            <template v-if="isLoggedIn">
                <input type="text" v-model="newMessage" placeholder="Type to chat..." maxlength="450"/>
                <input type="submit" value="Send" @click.prevent="sendMessage"/>
            </template>
        </form>
    </article>
</template>

<script>
    import axios from 'axios';

    export default {
        name: "Chatroom",

        data() {
            return {
                chatNotificationSound: new Audio('src/sounds/chatNotification.mp3'),
                lastNotificationSoundTime: 0,
                newMessage: '',
                showingHistoryDates: false,
                showingHistoryDateMessages: false,
                selectedHistoryDate: undefined,
            }
        },

        sockets: {
            chatroomUpdated: function () {
                let self = this;
                let shouldScrollAfter = self.$refs.chatMessages.scrollTop >= self.$refs.chatMessages.scrollHeight - self.$refs.chatMessages.clientHeight;

                this.$store.dispatch('chatRoom/getMessages', function () {
                    if (shouldScrollAfter) {
                        self.scrollDownMessages();
                    }
                });

                if (document.visibilityState !== 'visible' && this.audioNotificationsEnabled && new Date().getTime() - this.lastNotificationSoundTime > 5000) {
                    this.chatNotificationSound.play();
                    this.lastNotificationSoundTime = new Date().getTime();
                }
            },

            chatroomRefreshed: function () {
                let self = this;
                let shouldScrollAfter = self.$refs.chatMessages.scrollTop >= self.$refs.chatMessages.scrollHeight - self.$refs.chatMessages.clientHeight;

                this.$store.dispatch('chatRoom/getMessages', function () {
                    if (shouldScrollAfter) {
                        self.scrollDownMessages();
                    }
                });
            },

            serverReconnect: function () {
                this.joinRoom(this.selectedRoom.id)
            }
        },

        computed: {
            isLoggedIn() {
                if (this.$store.state.loggedUserModel.isLoggedIn && !this.selectedRoom) {
                    this.switchRooms('siteGeneral')
                }

                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            rooms() {
                let rooms = this.$store.state.chatRoomModel.rooms,
                    games;

                if (this.isLoggedIn) {
                    games = this.$store.state.loggedUserModel.games;
                    games.forEach(function (game) {
                        const id = 'game.' + game.stringUrl;
                        rooms[id] = {
                            name: 'Game: ' + game.alias,
                            id: id
                        }
                    });
                }

                return this.$store.state.chatRoomModel.rooms;
            },

            audioNotificationsEnabled() {
                if (this.isLoggedIn) {
                    return this.$store.state.loggedUserModel.options.chatroomNotificationSound === 'on';
                }
            },

            selectedRoom() {
                return this.$store.state.chatRoomModel.selectedRoom;
            },

            messages() {
                let messageGroups = [];

                let messages = this.$store.state.chatRoomModel.messages;

                if (this.showingHistoryDateMessages) {
                    messages = this.$store.state.chatRoomModel.historyMessages[this.selectedRoom.id + "_" + this.selectedHistoryDate.day] || [];
                }

                for (let i = 0; i < messages.length; i++) {
                    if (i > 0 && messages[i].from.id === messages[i - 1].from.id && messages[i].from.id !== null) {
                        messageGroups[messageGroups.length - 1].messages.push(messages[i]);
                    } else {
                        messageGroups.push({
                            from: messages[i].from,
                            timestamp: messages[i].timestamp,
                            messages: [messages[i]],
                            isSystemMessage: messages[i].isSystemMessage,
                            systemMessageType: messages[i].systemMessageType,
                            targetUrl: messages[i].systemMessageType === 'createdGame'
                                ? '/Game/' + messages[i].systemMessageTargetGameStringUrl
                                : '/Developer/' + messages[i].systemMessageTargetUserStringUrl,
                            targetAlias: messages[i].systemMessageType === 'createdGame'
                                ? messages[i].systemMessageTargetGameAlias
                                : messages[i].systemMessageTargetUserAlias
                        });
                    }
                }

                return messageGroups;
            },

            historyDates() {
                return this.$store.state.chatRoomModel.historyDates || [];
            },

            showHistoryDatesLoader() {
                return this.$store.state.chatRoomModel.retrievingHistoryDates;
            },

            showHistoryMessagesLoader() {
                return this.$store.state.chatRoomModel.retrievingHistoryMessages;
            }
        },

        methods: {
            sendMessage() {
                if (this.newMessage.trim() === '') {
                    return;
                }

                this.$store.dispatch('chatRoom/sendMessage', {message: this.newMessage});
                this.newMessage = '';
            },

            switchRooms(newRoomId) {
                // this.closeHistoryPanel();
                this.joinRoom(newRoomId);
            },

            chooseNewRoom(e) {
                let newRoom = e.target.value;
                this.switchRooms(newRoom);
            },

            joinRoom(newRoomId) {
                let self = this;

                this.$store.dispatch('chatRoom/switchRooms', {
                    newRoomId: newRoomId,
                    callback: function () {
                        self.scrollDownMessages();
                    }
                });

                this.$socket.emit('joinedRoom', newRoomId);
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
                this.$store.dispatch('chatRoom/getHistoryDates');
            },

            selectHistoryDate(selectedHistoryDate) {
                let self = this;

                this.$store.dispatch('chatRoom/getHistoryForDate', {
                    selectedHistoryDate: selectedHistoryDate, callback: function () {
                        self.selectedHistoryDate = selectedHistoryDate;
                        self.showingHistoryDates = false;
                        self.showingHistoryDateMessages = true;
                    }
                });
            }
        },

        mounted() {
            if (!this.selectedRoom) {
                this.switchRooms('siteGeneral');
            } else {
                this.joinRoom(this.selectedRoom.id)
            }
        },
    }
</script>