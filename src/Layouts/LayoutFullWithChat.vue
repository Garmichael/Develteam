<template>
    <div id="layout-full-width" class="layout">

        <div id="tooltip-container"></div>

        <header id="nav-container">
            <main-nav></main-nav>

        </header>

        <main id="content-container">
            <div id="chat-room-toggle" :class="{'is-open': chatRoomOpen}" @click.prevent="toggleChatRoom">
                <i class="far fa-comment-alt"></i>
            </div>

            <sub-nav></sub-nav>

            <article id="content">
                <router-view></router-view>
                <layout-footer></layout-footer>
            </article>

            <chat-companion></chat-companion>
        </main>

    </div>
</template>

<script>
    import MainNav from '../Layouts/MainNav.vue'
    import SubNav from '../Layouts/SubNav.vue'
    import Chatroom from './ChatCompanion.vue';
    import layoutFooter from '../Layouts/LayoutFooter.vue'

    export default {
        name: 'layoutFullWithChat',
        components: {
            'main-nav': MainNav,
            'sub-nav': SubNav,
            'chat-companion': Chatroom,
            'layout-footer': layoutFooter
        },
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data() {
            return {
                chatRoomOpen: false
            }
        },

        methods: {
            toggleChatRoom(){
                this.chatRoomOpen = !this.chatRoomOpen;
            }
        }
    }
</script>