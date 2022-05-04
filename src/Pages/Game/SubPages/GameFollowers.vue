<template>
    <section id="game-content-connections" class="connections">

        <section v-if="hasData" class="panels">
            <section class="panel">
                <ul v-if="profileConnections.followers && profileConnections.followers.length > 0" class="follows-list">
                    <li v-for="follower in profileConnections.followers">
                        <avatar :profile-data="follower" profile-type="developer" size="small" :show-xp-info="true"></avatar>
                        <router-link :to="`/Developer/${follower.stringUrl}`">{{follower.alias}}</router-link>
                    </li>
                </ul>
                <span v-else>No one is following {{profileAlias}} yet.</span>
            </section>
        </section>
    </section>
</template>

<script>
    export default {
        name: 'GameFollowers',
        data(){
            return {}
        },

        components: {},

        mounted() {

        },

        computed: {
            hasData(){
                let model = this.$store.state.gamePageModel;
                return model.retrievedInformation && model.retrievedConnections;
            },

            profileConnections(){
                return this.$store.state.gamePageModel.gameConnections;
            },

            profileAlias(){
                let profileInformation = this.$store.state.gamePageModel.gameInformation;
                return profileInformation.alias ? profileInformation.alias : undefined;
            }
        },

        methods: {}
    }
</script>