<template>
    <article id="inbox">

        <div v-if="!isLoggedIn">
            <div class="not-logged">
                <h1><router-link to="/Login">Log in</router-link> to view your inbox.</h1>
            </div>
        </div>

        <div v-else>
            <ul id="section-switcher">


                <li v-if="!composeView" class="selected"><span>Inbox</span></li>
                <li v-else>
                    <router-link to="/Inbox" title="Compose">Inbox</router-link>
                </li>

                <li v-if="composeView" class="selected"><span>Compose New</span></li>
                <li v-else>
                    <router-link to="/Inbox/Compose" title="Compose">Compose New</router-link>
                </li>

            </ul>

            <section id="conversations" v-if="inboxView">

                <nav>
                    <span>Subject</span>
                    <span>Participants</span>
                    <span>Last Message</span>
                </nav>

                <router-link :to="`/Inbox/${conversation.id}`" v-for="conversation in conversations" :class="{unread: !conversation.hasBeenRead}">
                    <span>{{conversation.subject}}</span>
                    <span>{{conversation.participants | joinArray('alias')}}</span>
                    <span>{{conversation.lastMessageDate | formatDate}}</span>
                </router-link>

            </section>

            <inbox-conversation v-if="!inboxView && !composeView"></inbox-conversation>

            <inbox-compose v-if="composeView"></inbox-compose>
        </div>
    </article>
</template>

<script>
    import InboxConversation from './InboxConversation.vue';
    import InboxCompose from './InboxCompose.vue';

    export default {
        name: 'InboxHome',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },
        data(){
            return {}
        },

        components: {
            'inbox-conversation': InboxConversation,
            'inbox-compose': InboxCompose
        },

        computed: {
            conversations(){
                return this.$store.state.inboxPageModel.conversations;
            },

            inboxView(){
                return this.selectedConversationId === undefined;
            },

            composeView(){
                return this.selectedConversationId !== undefined && this.selectedConversationId.toLowerCase() === 'compose'
            },

            selectedConversationId(){
                return this.$route.params.id;
            },

            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        },

        sockets: {
            'inboxConversationUpdated'(inboxId){
                this.$store.dispatch('InboxPage/updateConversation', inboxId);
            }
        },

        methods: {}
    }
</script>