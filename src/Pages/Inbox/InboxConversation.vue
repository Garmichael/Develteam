<template>
    <section id="conversation-view">

        <router-link to="/Inbox" class="return-to-inbox">
            <i class="fas fa-arrow-circle-left"></i> Back to Inbox
        </router-link>

        <div v-if="notAllowedToViewConversation">
            <h1>You don't have access to this Conversation</h1>
        </div>

        <div v-if="!notAllowedToViewConversation && conversation">
            <h1>{{conversation.subject}}</h1>

            <div class="participants">

                Participants:

                <span v-for="participant in conversation.participants">
                    <router-link :to="`/Developer/${participant.stringUrl}`">{{participant.alias}}</router-link>
                </span>

                <a v-if="!addParticipantFormVisible && !confirmAddingParticipant" class="add-participant" @click="addParticipantFormVisible = true"><i class="fas fa-plus-circle"></i> Add Participant</a>

                <form v-if="addParticipantFormVisible" @submit.prevent autocomplete="off">
                    <input id="newParticipant" type="text" v-model="addedParticipantName" placeholder="Search for a Developer">
                    <p v-if="addParticipantMessage" class="add-participant-message">{{addParticipantMessage}}</p>
                    <p class="new-participant" v-for="dev in matchingDevsResponse" @click="confirmParticipant(dev)" v-if="devInAliasList(dev)"><i class="fas fa-plus-circle"></i> {{dev.alias}}</p>
                </form>

                <div v-if="confirmAddingParticipant" class="confirm-adding-participant">
                    <h1>Confirm to add {{addedParticipant.alias}}?</h1>
                    <form>
                        <input type="submit" value="Cancel" @click.prevent="confirmAddingParticipant = false; addParticipantFormVisible = true"/>
                        <input type="submit" :value="`Yes, add ${addedParticipant.alias}`" @click.prevent="addParticipant"/>
                    </form>
                </div>
            </div>

            <div v-if="conversation.messages">
                <ul id="conversation-messages">
                    <li v-for="message in conversation.messages">
                        <div class="avatar-container">
                            <avatar :profile-data="message.from" profile-type="developer" size="large" :show-xp-info="false"></avatar>
                        </div>

                        <div class="message-details">
                            <span class="message-from"><router-link :to="'/Developer/' + message.from.stringUrl">{{message.from.alias}}</router-link></span>
                            <span class="message-date">{{message.timestamp | formatDate}}</span>
                            <markdown-content classes="message-message" :content="message.message"></markdown-content>
                        </div>
                    </li>
                </ul>

                <section id="new-reply" v-if="!leaveConversationMode">
                    <h1>Add Reply</h1>

                    <form>
                        <markdown-editor v-model="newReplyContent" placeholder="Enter a reply"></markdown-editor>
                        <input type="submit" @click.prevent="submitReply"/>
                    </form>

                    <a class="leave-conversation" @click="leaveConversationMode = true"><i class="fas fa-trash"></i> Leave Conversation</a>

                </section>

                <section id="leave-conversation-form" v-else>

                    <h1>Are you sure you want to leave this conversation?</h1>
                    <p>You will no longer be allowed to view this conversation or participate in it.</p>

                    <form>
                        <input type="submit" value="Cancel" @click.prevent="leaveConversationMode = false"/>
                        <input type="submit" value="Yes, leave this conversation" @click.prevent="leaveConversation"/>
                    </form>

                </section>
            </div>

            <div v-else>
                <loader-large></loader-large>
            </div>

        </div>
    </section>
</template>

<script>
    export default {
        name: 'InboxConversation',

        data(){
            return {
                leaveConversationMode: false,
                addParticipantFormVisible: false,
                addedParticipantName: '',
                addParticipantMessage: '',
                confirmAddingParticipant: false,
                addedParticipant: undefined,
                newReplyContent: ''
            }
        },

        mounted(){
            this.$store.state.inboxPageModel.matchingDevsResponse = [];

            if (this.$store.state.inboxPageModel.retrievedConversations) {
                this.$store.commit('InboxPage/setSelectedConversation', {conversationId: this.$route.params.id});
                this.$store.dispatch('InboxPage/getMessages');
            }
        },

        computed: {
            conversation(){
                return this.$store.state.inboxPageModel.selectedConversation;
            },

            matchingDevsResponse(){
                return this.$store.state.inboxPageModel.matchingDevsResponse;
            },

            notAllowedToViewConversation(){
                return this.$store.state.inboxPageModel.notAllowedToViewConversation;
            }
        },

        methods: {
            leaveConversation(){
                this.$store.dispatch('InboxPage/leaveConversation');
            },

            getMatchingDevs: _.debounce(
                function () {
                    this.$store.dispatch('InboxPage/getMatchingDevNames', this.addedParticipantName);
                    this.addParticipantMessage = ''
                },
                500
            ),

            confirmParticipant(participant){
                this.addedParticipant = participant;
                this.confirmAddingParticipant = true;
                this.addParticipantFormVisible = false;
            },

            addParticipant(){
                this.$store.dispatch('InboxPage/addParticipant', this.addedParticipant);
                this.confirmAddingParticipant = false;
            },

            devInAliasList(dev){
                let foundMatch = false;

                this.conversation.participants.forEach(function (participant) {
                    if (participant.id == dev.id) {
                        foundMatch = true;
                    }
                });

                return !foundMatch;
            },

            submitReply(){
                if (this.newReplyContent.trim() === '') {
                    return;
                }

                this.$store.dispatch('InboxPage/addReplyMessage', this.newReplyContent);
                this.newReplyContent = '';
            }
        },

        sockets: {
            'inboxConversationMessagesUpdated'(inboxId){
                this.$store.dispatch('InboxPage/getMessages', inboxId);
            }
        },

        watch: {
            addedParticipantName(){
                if (this.addedParticipantName.length >= 3) {
                    this.addParticipantMessage = 'Searching for matching developers...';
                    this.getMatchingDevs();
                } else {
                    this.addParticipantMessage = 'Enter three or more characters';
                    this.$store.commit('InboxPage/getMatchingDevNames', [])
                }
            }
        }
    }
</script>