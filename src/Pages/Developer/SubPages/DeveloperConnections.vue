<template>
    <section id="developer-content-connections" class="connections">
        <section v-if="hasData" class="panels">
            <section class="panel">
                <h3>Friends</h3>
                <ul v-if="profileConnections.friends && profileConnections.friends.length > 0" class="follows-list">
                    <li v-for="friend in profileConnections.friends">
                        <avatar :profile-data="friend" profile-type="developer" size="small" :show-xp-info="true"></avatar>
                        <router-link :to="`/Developer/${friend.stringUrl}`">{{friend.alias}}</router-link>
                    </li>
                </ul>
                <span v-else>{{profileAlias}} hasn't made any friends yet</span>
            </section>

            <section class="panel">
                <h3>Followers</h3>


                <ul v-if="profileConnections.followers && profileConnections.followers.length > 0" class="follows-list">
                    <li v-for="follower in profileConnections.followers">
                        <avatar :profile-data="follower" profile-type="developer" size="small" :show-xp-info="true"></avatar>
                        <router-link :to="`/Developer/${follower.stringUrl}`">{{follower.alias}}</router-link>
                    </li>
                </ul>
                <span v-else>No one is following {{profileAlias}} yet.</span>
            </section>

            <section class="panel">
                <h3>Following</h3>

                <nav class="switcher-options">
                    <ul>
                        <li :class="{selected: selectedFollowingCategory === 'developers'}"
                            @click="switchSelectedFollowingCategory('developers')">Developers
                        </li>
                        <li :class="{selected: selectedFollowingCategory === 'games'}"
                            @click="switchSelectedFollowingCategory('games')">Games
                        </li>
                    </ul>
                </nav>

                <section v-if="selectedFollowingCategory === 'developers'" class="switcher-panel"
                         style="display: block;">
                    <ul v-if="profileConnections.followingDevelopers && profileConnections.followingDevelopers.length > 0"
                        class="follows-list">
                        <li v-for="developer in profileConnections.followingDevelopers">
                            <avatar :profile-data="developer" profile-type="developer" size="small" :show-xp-info="true"></avatar>
                            <router-link :to="`/Developer/${developer.stringUrl}`">{{developer.alias}}</router-link>
                        </li>
                    </ul>
                    <span v-else>{{profileAlias}} is not following any other Developers yet.</span>
                </section>

                <section v-if="selectedFollowingCategory === 'games'" class="switcher-panel" style="display: block;">
                    <ul v-if="profileConnections.followingGames && profileConnections.followingGames.length > 0"
                        class="follows-list">
                        <li v-for="game in profileConnections.followingGames">
                            <avatar :profile-data="game" profile-type="game" size="small" :show-xp-info="true"></avatar>
                            <router-link :to="`/Game/${game.stringUrl}`">{{game.alias}}</router-link>
                        </li>
                    </ul>
                    <span v-else>{{profileAlias}} is not following any Game Projects yet.</span>
                </section>


            </section>
        </section>
    </section>
</template>


<script>
    export default {
        name: 'DeveloperConnections',
        data(){
            return {
                selectedFollowingCategory: 'developers'
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            hasData(){
                let model = this.$store.state.developerPageModel;
                return model.retrievedInformation && model.retrievedConnections;
            },

            profileConnections(){
                return this.$store.state.developerPageModel.developerConnections;
            },

            profileAlias(){
                let profileInformation = this.$store.state.developerPageModel.developerInformation;
                return profileInformation.alias ? profileInformation.alias : undefined;
            }
        },

        methods: {
            switchSelectedFollowingCategory(newCategory){
                this.selectedFollowingCategory = newCategory;
            }
        }
    }
</script>