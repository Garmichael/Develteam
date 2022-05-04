<template>
    <div id="sub-nav-container">
        <nav id="sub-nav">
            <div class="container">
                <router-link v-for="link in links" :to="link.to" :class="[{selected: link.selected}, link.style]" :title="link.text">
                    <span class="label">{{link.text}}</span>
                    <span class="badge" v-if="isLoggedIn && link.showBadge && !link.selected"><i class="fas fa-circle"></i></span>
                </router-link>
            </div>
        </nav>
    </div>
</template>


<script>
    export default {
        name: 'subNav',

        computed: {
            links() {
                let selectedRoute = this.$route.meta.subNavRoute;

                return [
                    {to: '/', text: 'Home', style: 'top-content', selected: selectedRoute === 'homeDashboard'},

                    {to: '/Media', text: 'Media', style: 'posts-media', selected: selectedRoute === 'media', showBadge: !this.userInfo.caughtUpOnMedia},
                    {to: '/DevLogs', text: 'DevLogs', style: 'posts-devlogs', selected: selectedRoute === 'devlogs', showBadge: !this.userInfo.caughtUpOnDevlogs},
                    {to: '/Classifieds', text: 'Classifieds', style: 'posts-classifieds', selected: selectedRoute === 'classifieds', showBadge: !this.userInfo.caughtUpOnClassifieds},
                    {to: '/Forums/Develteam/Develteam', text: 'Forums', style: 'forums', selected: selectedRoute === 'forums', showBadge: !this.userInfo.caughtUpOnForums},

                    // {to: '/TheBoard', text: 'The Board', style: 'the-board', selected: selectedRoute === 'theBoard', showBadge: !this.userInfo.caughtUpOnMedia},

                    {to: '/Browse', text: 'Developers', style: 'browse-developers', selected: selectedRoute === 'browseDevs'},
                    {to: '/Browse/Games', text: 'Games', style: 'browse-games', selected: selectedRoute === 'browseGames'},

                    {to: '/Resources', text: 'Dev Tools', style: 'resource-devtools', selected: selectedRoute === 'resourcesDevTools'},
                    {to: '/Resources/Assets', text: 'Assets', style: 'resource-assets', selected: selectedRoute === 'resourcesAssets'},
                    {to: '/Donations', text: 'Donations', style: 'donations', selected: selectedRoute === 'donations'},
                    // {to: '/Library', text: 'Library', style: 'library', selected: selectedRoute === 'library'},
                ]
            },

            userInfo() {
                return this.$store.state.loggedUserModel.info;
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        }
    }
</script>