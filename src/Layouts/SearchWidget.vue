<template>
    <div id="search-widget">
        <input type="text" placeholder="Search for Developers & Games" v-model="searchString" class="search-box" @blur="hide" @focus="show">

        <div class="search-results" v-if="!isHidden && (devMatches.length > 0 || gameMatches.length > 0 || searchMessage)">
            <span v-if="searchMessage">{{searchMessage}}</span>
            <h3 v-if="devMatches.length > 0 ">Developers</h3>
            <router-link v-for="developer in devMatches" :to="`/Developer/${developer.stringUrl}`" class="match">
                <div class="avatar-container">
                    <avatar :profile-data="developer" profile-type="developer" size="small" :show-xp-info="false"></avatar>
                </div>
                <span>{{developer.alias}}</span>
            </router-link>

            <h3 v-if="gameMatches.length > 0 ">Games</h3>
            <router-link v-for="game in gameMatches" :to="`/Game/${game.stringUrl}`" class="match">
                <div class="avatar-container">
                    <avatar :profile-data="game" profile-type="game" size="small" :show-xp-info="false"></avatar>
                </div>
                <span>{{game.alias}}</span>
            </router-link>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'SearchWidget',
        data(){
            return {
                searchString: '',
                searchMessage: '',
                devMatches: [],
                gameMatches: [],
                isHidden: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {
            getMatchingDevs: _.debounce(
                    function () {
                        this.getMatches();
                        this.searchMessage = ''
                    },
                    500
            ),

            getMatches(){
                axios.get('/api/searchDevelopersAndGamesByAlias', {
                    params: {
                        search: this.searchString
                    }
                }).then(
                        (response) => {
                            this.devMatches = response.data.developers;
                            this.gameMatches = response.data.games;
                        },
                        (response) => {
                            console.log(response);
                        }
                );
            },

            hide(){
                setTimeout(function(){
                    this.isHidden = true;
                }.bind(this), 500)
            },

            show(){
                this.isHidden = false;
            }
        },

        watch: {
            searchString(){
                if (this.searchString.length >= 3) {
                    this.searchMessage = 'Searching for matching developers...';
                    this.getMatchingDevs();
                } else {
                    this.searchMessage = 'Enter three or more characters';
                    this.devMatches = [];
                    this.gameMatches = [];
                }
            }
        }
    }
</script>