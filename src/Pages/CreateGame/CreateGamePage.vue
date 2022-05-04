<template>
    <article id="create-game-page">

        <h2>Create a new Game Project</h2>

        <section class="project-field">
            <h1>Basic Info</h1>

            <div class="fields">
                <label>
                    <span>Game Project Title</span>
                    <input type="text" v-model="projectTitle" @input="formErrors = []" :disabled="isSaving"/>
                </label>

                <label>
                    <span>Maturity Rating</span>
                    <select v-model="rating" :disabled="isSaving">
                        <option value="everyone">Everyone</option>
                        <option value="teen">Teen</option>
                        <option value="mature">Mature</option>
                        <option value="adult">Adult</option>
                    </select>
                </label>
            </div>
        </section>

        <section class="project-field" v-if="Object.keys(platforms).length > 0">
            <h1>Platforms </h1>

            <div class="fields">
                <div class="platform-fields" v-for="category in platforms">
                    <h1>{{category.label}}</h1>

                    <div class="platforms">
                        <label v-for="platform in category.platforms" v-show="!platform.initiallyHidden || category.showHidden">
                            <input type="checkbox" v-model="platform.checked" @change="formErrors = []" :disabled="isSaving"/>
                            <span>{{platform.label}}</span>
                        </label>

                        <label v-if="!category.showHidden && category.hasHidden"><a @click.prevent="showHidden(category)">Show All {{category.label}}</a></label>
                        <label v-if="category.showHidden && category.hasHidden"><a @click.prevent="hideHidden(category)">Hide Extra {{category.label}}</a></label>

                    </div>
                </div>
            </div>
        </section>

        <section class="project-field genres" v-if="genres.length > 0">
            <h1>Genres</h1>

            <div class="fields">
                <label v-for="genre in genres">
                    <input type="checkbox" v-model="genre.checked" @change="formErrors = []" :disabled="isSaving"/>
                    <span>{{genre.label}}</span>
                </label>
            </div>
        </section>

        <transition name="fade" mode="out-in">
            <div class="validation-messages error" v-if="formErrors.length > 0">
                <span v-for="error in formErrors">{{error}}</span>
            </div>
        </transition>

        <saver-large v-if="isSaving"></saver-large>

        <section class="project-field" v-if="!isSaving">
            <div class="button-container">
                <button class="button" @click.prevent="createProject">Create Game Project</button>
            </div>
        </section>

    </article>
</template>


<script type="text/babel">
    import _ from 'lodash';
    import axios from 'axios';

    export default {
        name: 'CreateNewGameProject',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data(){
            return {
                isSaving: false,
                projectTitle: '',
                rating: 'everyone',
                formErrors: [],
                platforms: {},
                genres: []
            }
        },

        components: {},

        mounted() {
            this.platforms = _.cloneDeep(this.$store.state.develteamDataModel.platforms);
            this.genres = _.cloneDeep(this.$store.state.develteamDataModel.genres);
        },

        computed: {},

        methods: {
            generateCheckedGenres(){
                let checkedGenres = _.filter(this.genres, function (genre) {
                    return genre.checked;
                });

                return _.map(checkedGenres, 'id');
            },

            generateCheckedPlatforms(){
                let checkedPlatforms = [];

                _.each(this.platforms, function (platformCategory) {
                    checkedPlatforms = _.concat(checkedPlatforms, _.filter(platformCategory.platforms, function (platform) {
                        return platform.checked;
                    }));
                });

                return _.map(checkedPlatforms, 'id');
            },

            showHidden(category){
                this.$set(category, 'showHidden', true);
            },

            hideHidden(category){
                this.$set(category, 'showHidden', false);
            },

            createProject(){
                let checkedGenres = this.generateCheckedGenres();
                let checkedPlatforms = this.generateCheckedPlatforms();

                this.projectTitle = this.projectTitle.trim();

                if (this.projectTitle === '') {
                    this.formErrors.push('Enter a Project Title');
                }

                if (checkedPlatforms.length === 0) {
                    this.formErrors.push('Select at least one Platform');
                }

                if (checkedGenres.length === 0) {
                    this.formErrors.push('Select at least one Genre');
                }

                if (this.formErrors.length > 0) {
                    return;
                }

                this.isSaving = true;

                setTimeout(function () {

                    axios.post('/api/game', {
                        alias: this.projectTitle,
                        rating: this.rating,
                        platforms: checkedPlatforms,
                        genres: checkedGenres
                    }).then(
                            (response) => {
                                this.isSaving = false;

                                if (response.data.errors) {
                                    this.formErrors = response.data.errors;
                                    return;
                                }

                                this.$store.dispatch('loggedUserModel/getLoggedUserInfo');

                                this.$router.push('/Game/' + response.data.stringUrl)
                            },
                            (response) => {
                                this.isSaving = false;
                                this.formErrors = ['Something went wrong connecting to the server. Please wait a few minutes and try again'];
                            }
                    );

                }.bind(this), 2000);
            }
        },

        watch: {
            '$store.state.develteamDataModel.genres'(){
                this.genres = _.cloneDeep(this.$store.state.develteamDataModel.genres);
            },

            '$store.state.develteamDataModel.platforms'(){
                this.platforms = _.cloneDeep(this.$store.state.develteamDataModel.platforms);
            }
        }
    }
</script>