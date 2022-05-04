<template>
    <article id="home-dashboard">

        <!--
        <div class="wrapper">
                    <announcements></announcements>

                    <forums></forums>
                </div>
        -->

        <div class="teamup-upsell">
            <h1>Are you looking for a game development team?</h1>

            <div class="button-container">
                <router-link class="button" to="/Browse/Developers?seeking=true">View Available Developers</router-link>
                <router-link class="button" to="/Browse/Games?seeking=true">View Recruiting Game Projects</router-link>
            </div>
        </div>


        <top-content></top-content>


        <pitch v-if="(!isLoggedIn && gotInitialLoggedUserInfo) || !hasLoginCookies" depth="both"></pitch>
    </article>
</template>


<script>
    //    import ConnectWidget from '../../CompanionContent/Widgets/ConnectWidget.vue'
    import Pitches from './Pitches.vue'
    import Announcements from './Announcements.vue'
    import Forums from './RecentlyOnForums.vue'
    import TopContent from './TopContent.vue'

    export default {
        name: 'HomeDashboard',

        components: {
//            'connect-widget': ConnectWidget,
            'pitch': Pitches,
            'announcements': Announcements,
            'forums': Forums,
            'top-content': TopContent
        },

        data() {
            return {}
        },

        computed: {
            gotInitialLoggedUserInfo() {
                return this.$store.state.loggedUserModel.gotInitialLoggedUserInfo;
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            hasLoginCookies() {
                let cookieEntries = document.cookie.split(';');
                let cookies = {};

                cookieEntries.forEach((cookie) => {
                    let cookieSegments = cookie.split('=');
                    if (cookieSegments.length === 2 && cookieSegments[1].trim() !== '') {
                        cookies[cookieSegments[0].trim()] = cookieSegments[1].trim();
                    }
                });

                return cookies.userid !== undefined && cookies.password !== undefined;
            }
        },

        mounted() {

        },

        methods: {}
    }
</script>