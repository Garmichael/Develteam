<template>
    <section id="edit-game-properties">

        <saver-large v-if="isSaving"></saver-large>

        <template v-if="!isSaving">

            <div class="edit-platforms">
                <h1 @click="togglePlatforms" class="toggleable">
                    Platform
                    <i v-if="platformsOpen" class="fas fa-chevron-circle-up"></i>
                    <i v-if="!platformsOpen" class="fas fa-chevron-circle-down"></i>
                </h1>

                <div v-for="category in platforms" v-if="platformsOpen" class="platform-group">
                    <h3>{{category.label}}</h3>
                    <div class="options">
                        <label v-for="platform in category.platforms" v-show="!platform.initiallyHidden || category.showHidden">
                            <input type="checkbox" v-model="platform.checked" @change="clearErrorMessage"/><span>{{platform.label}}</span>
                        </label>
                    </div>

                    <span class="show-all">
                    <a v-if="!category.showHidden && category.hasHidden" @click.prevent="showHidden(category)">Show All {{category.label}}</a>
                </span>
                </div>
            </div>

            <div class="edit-genres">
                <h1 @click="toggleGenres" class="toggleable">
                    Genre
                    <i v-if="genresOpen" class="fas fa-chevron-circle-up"></i>
                    <i v-if="!genresOpen" class="fas fa-chevron-circle-down"></i>
                </h1>

                <div class="options" v-if="genresOpen">
                    <label v-for="genre in genres"><input type="checkbox" v-model="genre.checked" @change="clearErrorMessage"/><span>{{genre.label}}</span></label>
                </div>
            </div>

            <div class="edit-rated">
                <h1>Rated</h1>

                <select v-model="rating">
                    <option value="everyone">Everyone</option>
                    <option value="teen">Teen</option>
                    <option value="mature">Mature</option>
                    <option value="adult">Adult</option>
                </select>
            </div>

            <div class="edit-release-date">
                <h1>Release Date</h1>

                <input type="text" v-model="releaseDate"/>
            </div>

            <div v-if="errorMessage" class="validation-messages error">{{errorMessage}}</div>

            <div class="companion-content-subsection buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="saveChanges">Save</button>
            </div>
        </template>
    </section>
</template>


<script>
    import _ from 'lodash'

    export default {
        name: 'EditGameWidget',

        data(){
            return {
                genres: {},
                platforms: {},
                rating: '',
                releaseDate: '',
                platformsOpen: false,
                genresOpen: false,
                errorMessage: '',
                isSaving: false,
                alias: ''
            }
        },

        mounted() {
            this.genres = _.cloneDeep(this.$store.state.develteamDataModel.genres);
            this.platforms = _.cloneDeep(this.$store.state.develteamDataModel.platforms);
            this.rating = this.$store.state.gamePageModel.gameInformation.rating;
            this.releaseDate = this.$store.state.gamePageModel.gameInformation.releaseDate;
            this.alias = this.$store.state.gamePageModel.gameInformation.alias;
            this.setChecked();
        },

        computed: {
            game(){
                return this.$store.state.gamePageModel.gameInformation;
            }
        },

        methods: {
            showHidden(category){
                this.$set(category, 'showHidden', true);
            },

            setChecked(){
                let gameGenres = this.game.genres ? this.game.genres.split(', ') : [];
                let gamePlatforms = this.game.platforms ? this.game.platforms.split(', ') : [];

                gamePlatforms.forEach(function (gamePlatform) {
                    _.each(this.platforms, function (platform) {
                        _.each(platform.platforms, function (p) {
                            if (gamePlatform === p.label) {
                                p.checked = true;
                            }
                        }.bind(this))
                    }.bind(this));
                }.bind(this));

                gameGenres.forEach(function (gameGenre) {
                    _.each(this.genres, function (genre) {
                        if (genre.label === gameGenre) {
                            genre.checked = true;
                        }
                    }.bind(this))
                }.bind(this))
            },

            togglePlatforms(){
                this.platformsOpen = !this.platformsOpen;
            },

            toggleGenres(){
                this.genresOpen = !this.genresOpen;
            },

            clearErrorMessage(){
                this.errorMessage = '';
            },

            cancelChanges(){
                document.getElementById('game-companion-content').scrollIntoView();
                this.$emit('doneEditing');
            },

            saveChanges(){
                let genresSelected = [];
                let platformsSelected = [];

                _.each(this.platforms, function (category) {
                    _.each(category.platforms, function (platform) {
                        if (platform.checked) {
                            platformsSelected.push(platform.id)
                        }
                    });
                });

                _.each(this.genres, function (genre) {
                    if (genre.checked) {
                        genresSelected.push(genre.id)
                    }
                });

                if (genresSelected.length === 0) {
                    this.errorMessage = 'Select at least one Genre';
                    return;
                }

                if (platformsSelected.length === 0) {
                    this.errorMessage = 'Select at least one Platform';
                    return;
                }

                this.$store.dispatch('gamePage/updateGameInformation', {
                    gameId: this.game.id,
                    platforms: platformsSelected,
                    genres: genresSelected,
                    rating: this.rating,
                    releaseDate: this.releaseDate
                });

                document.getElementById('game-companion-content').scrollIntoView();
                this.isSaving = true;
            }
        },

        watch: {
            '$store.state.develteamDataModel.genres'(){
                this.genres = _.cloneDeep(this.$store.state.develteamDataModel.genres);
                this.setChecked();
            },

            '$store.state.develteamDataModel.platforms'(){
                this.platforms = _.cloneDeep(this.$store.state.develteamDataModel.platforms);
                this.setChecked();
            }
        },

        sockets: {
            'gameInformationUpdated'(data){
                if (data.gameId === this.game.id) {
                    this.$emit('doneEditing');
                }
            }
        }
    }
</script>