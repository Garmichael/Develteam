<template>
    <section id="inbox-compose">

        <h1>Compose New Message</h1>

        <form @submit.prevent autocomplete="off" class="participants">
            <p>To:
                <span v-for="participant in addedParticipants" class="participant" @click="removeParticipant(participant)"><i class="fas fa-minus-circle"></i>  {{participant.alias}}</span>
            </p>

            <input id="newParticipant" type="text" v-model="addedParticipantName" placeholder="Search for a Developer" :disabled="formSubmitted">

            <p v-for="dev in matchingDevsResponse" class="new-participant" @click="addParticipant(dev)" v-if="shouldShowDev(dev)"><i class="fas fa-plus-circle"></i> {{dev.alias}}</p>
        </form>

        <div v-if="validationMessage" class="validation-messages error">{{validationMessage}}</div>

        <form>
            <input type="text" v-model="newMessageSubject" placeholder="Subject" :disabled="formSubmitted" maxlength="64"/>
            <markdown-editor v-model="newMessageContent" placeholder="Enter a reply" :disabled="formSubmitted"></markdown-editor>
            <input type="submit" @click.prevent="submitNewConversation" value="Send Message" :disabled="formSubmitted"/>
        </form>

    </section>
</template>

<script>
    export default {
        name: 'InboxCompose',

        data(){
            return {
                newMessageSubject: '',
                newMessageContent: '',
                addedParticipantName: '',
                addedParticipants: [],
                validationMessage: '',
                formSubmitted: false
            }
        },

        mounted(){
            this.$store.state.inboxPageModel.matchingDevsResponse = [];
            if(this.$route.query.toId && this.$route.query.toId){
                this.addParticipant({id: this.$route.query.toId, alias: this.$route.query.toAlias})
            }
        },

        computed: {
            matchingDevsResponse(){
                return this.$store.state.inboxPageModel.matchingDevsResponse;
            }
        },

        methods: {
            addParticipant(dev){
                this.addedParticipants.push(dev);
            },

            removeParticipant(dev){
                this.addedParticipants = _.filter(this.addedParticipants, function(participant){
                    return participant.id != dev.id;
                });
            },

            getMatchingDevs: _.debounce(
                    function () {
                        this.$store.dispatch('InboxPage/getMatchingDevNames', this.addedParticipantName);
                        this.addParticipantMessage = ''
                    },
                    500
            ),

            shouldShowDev(dev){
                let foundMatch = false;

                if(dev.id == this.$store.state.loggedUserModel.info.id){
                    return false;
                }

                this.addedParticipants.forEach(function(participant){
                    if(participant.id == dev.id){
                        foundMatch = true;
                    }
                });

                return !foundMatch;
            },

            submitNewConversation(){

                if(this.addedParticipants.length === 0){
                    this.validationMessage = "You forgot to add recipients!";
                    return;
                }
                if(this.newMessageSubject.length === 0){
                    this.validationMessage = "You forgot to set a subject!";
                    return;
                }

                if(this.newMessageContent.trim().length === 0){
                    this.validationMessage = "You forgot to say something!";
                    return;
                }

                this.formSubmitted = true;

                this.$store.dispatch('InboxPage/AddNewConversation', {
                    participants: this.addedParticipants,
                    subject: this.newMessageSubject,
                    message: this.newMessageContent
                });

            }
        },

        watch: {
            addedParticipantName(){
                this.validationMessage = '';
                if (this.addedParticipantName.length >= 3) {
                    this.addParticipantMessage = 'Searching for matching developers...';
                    this.getMatchingDevs();
                } else {
                    this.addParticipantMessage = 'Enter three or more characters';
                    this.$store.commit('InboxPage/getMatchingDevNames', [])
                }
            },
            newMessageContent(){
                this.validationMessage = '';
            }
        }
    }
</script>