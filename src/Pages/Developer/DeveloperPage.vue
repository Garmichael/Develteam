<template>
    <article id="developer-page">
        <div id="profile-details-container">
            <dev-details v-if="!developerDoesntExist"></dev-details>
        </div>

        <section v-if="!developerDoesntExist" id="developer-page-content">
            <nav v-if="!developerDoesntExist" id="developer-page-navigation" class="switch profile-page-navigation">
                <router-link :to="'/Developer/' + $route.params.developer"
                             title="Recent Activity"
                             :class="{active: selectedSubpage === 'RecentActivity'}"
                >Recent Activity</router-link>

                <router-link :to="'/Developer/' + $route.params.developer + '/Portfolio'"
                             title="Portfolio"
                             :class="{active: selectedSubpage === 'Portfolio'}"
                >Portfolio</router-link>

                <router-link :to="'/Developer/' + $route.params.developer + '/Connections'"
                             title="Connections"
                             :class="{active: selectedSubpage === 'Connections'}"
                >Connections</router-link>
            </nav>

            <router-view></router-view>
        </section>

        <div v-if="developerDoesntExist" class="validation-messages error">This Developer Doesn't Exist</div>
    </article>

</template>


<script>
    import DeveloperDetails from './DeveloperDetails.vue'

    export default {
        name: 'Developer',

        metaInfo() {
            return {
                title: this.title
            }
        },

        components: {
            'dev-details': DeveloperDetails
        },

        data() {
            return {}
        },

        mounted() {
            this.$store.dispatch('developerPage/getDeveloperInformation', this.$route.params.developer)
        },

        computed: {
            title() {
                let pageData = this.$store.state.developerPageModel.developerInformation;

                if (pageData && pageData.alias) {
                    return 'Develteam ' + pageData.alias + ' | Game developer community | Game dev team up';
                }

                return 'Develteam | Game Developer Community | Game dev team up';
            },

            selectedSubpage() {
                let subpage = this.$route.path.substring(1).split('/')[2];
                return subpage || 'RecentActivity'
            },

            developerDoesntExist() {
                return this.$store.state.developerPageModel.fetchError !== '';
            }
        },

        watch: {
            '$route'() {
                let model = this.$store.state.developerPageModel;
                let currentDeveloper = this.$route.params.developer;
                let differentDeveloper = false;

                if (model.retrievedInformation && model.retrievedConnections) {
                    if (currentDeveloper && currentDeveloper.toLowerCase() !== model.developerInformation.stringUrl.toLowerCase()) {
                        differentDeveloper = true;
                    }
                }

                if (!model.retrievedInformation || !model.retrievedConnections || differentDeveloper) {
                    this.$store.dispatch('developerPage/getDeveloperInformation', currentDeveloper);
                }
            }
        },

        methods: {}
    }
</script>
