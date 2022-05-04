<template>
    <article id="game-page">
        <div id="profile-details-container">
            <game-details v-if="!gameDoesntExist"></game-details>
        </div>

        <section v-if="!gameDoesntExist" id="game-page-content">

            <nav v-if="!gameDoesntExist" id="game-page-navigation" class="switch profile-page-navigation">
                <router-link :to="'/Game/' + $route.params.game"
                             title="Recent Activity"
                             :class="{active: selectedSubpage === 'RecentActivity'}"
                >Recent Activity</router-link>

                <router-link :to="'/Game/' + $route.params.game+ '/Media'"
                             title="Media"
                             :class="{active: selectedSubpage === 'Media'}"
                >Media</router-link>

                <router-link :to="'/Game/' + $route.params.game+ '/Members'"
                             title="Members"
                             :class="{active: selectedSubpage === 'Members'}"
                >Members</router-link>

                <router-link :to="'/Game/' + $route.params.game+ '/Forums'"
                             title="Forums"
                             :class="{active: selectedSubpage === 'Forums'}"
                >Forums</router-link>

                <router-link :to="'/Game/' + $route.params.game+ '/Followers'"
                             title="Followers"
                             :class="{active: selectedSubpage === 'Followers'}"
                >Followers</router-link>
            </nav>

            <router-view :game-id="gameId" :is-member="isMember" :is-moderator="isModerator"
                         :is-owner="isOwner"></router-view>
        </section>

        <div v-if="gameDoesntExist" class="validation-messages error">This Game Doesn't Exist</div>
    </article>

</template>


<script>
    import GameDetails from './GameDetails.vue'

    export default {
        name: 'Game',
        metaInfo() {
            return {
                title: this.title
            }
        },

        components: {
            'game-details': GameDetails
        },

        data() {
            return {}
        },

        mounted() {
            this.$store.dispatch('gamePage/getGameInformation', this.$route.params.game)
        },

        computed: {
            title() {
                let pageData = this.$store.state.gamePageModel.gameInformation;

                if (pageData && pageData.alias) {
                    return 'Develteam ' + pageData.alias + ' | Game developer community | Game dev team up';
                }

                return 'Develteam | Game Developer Community | Game dev team up';
            },

            selectedSubpage() {
                let subpage = this.$route.path.substring(1).split('/')[2];
                return subpage || 'RecentActivity'
            },

            gameId() {
                let pageData = this.$store.state.gamePageModel.gameInformation;

                if (pageData && pageData.id) {
                    return pageData.id;
                }
            },

            isMember() {
                if (!this.$store.state.loggedUserModel.isLoggedIn || Object.keys(this.$store.state.gamePageModel.gameMembers).length === 0) {
                    return false;
                }

                let isGameMember = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.status === 'Current') {
                        isGameMember = true;
                    }
                }.bind(this));

                return isGameMember;
            },

            isModerator() {
                if (!this.isMember) {
                    return false;
                }

                let isModerator = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.modLevel !== 'member' && member.status === 'Current') {
                        isModerator = true;
                    }
                }.bind(this));

                return isModerator;
            },

            isOwner() {
                if (!this.isMember) {
                    return false;
                }

                let isOwner = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.modLevel === 'owner' && member.status === 'Current') {
                        isOwner = true;
                    }
                }.bind(this));

                return isOwner;
            },

            gameDoesntExist() {
                return this.$store.state.gamePageModel.fetchError !== '';
            }
        },

        watch: {
            '$route'() {
                let model = this.$store.state.gamePageModel;
                let currentGame = this.$route.params.game;
                let differentGame = false;

                if (model.retrievedInformation && model.retrievedConnections && model.retrievedMembers) {
                    if (currentGame && currentGame.toLowerCase() !== model.gameInformation.stringUrl.toLowerCase()) {
                        differentGame = true;
                    }
                }

                if (!model.retrievedInformation || !model.retrievedConnections || !model.retrievedMembers || differentGame) {
                    this.$store.dispatch('gamePage/getGameInformation', currentGame);
                }
            }
        },

        methods: {},

        sockets: {
            'gameProjectDeleted'(data) {
                if (data.gameId == this.gameId) {
                    this.$store.dispatch('gamePage/getGameInformation', this.$route.params.game)
                }
            }
        }
    }
</script>
