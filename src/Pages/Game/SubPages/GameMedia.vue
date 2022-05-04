<template>
    <article id="media-page">

        <section id="media-albums" v-if="!$route.params.piece">
            <transition name="fade" mode="out-in">

                <div v-if="fetchingAlbumStatus === 'fetching'" class="loader-container">
                    <loader-large></loader-large>
                </div>

                <ul v-else class="album-list">
                    <router-link tag="li" v-for="album in albums"
                                 :to="`/Game/${$route.params.game}/Media/${album.stringUrl}`"
                                 :class="{selected: album.stringUrl == $route.params.album}">
                        <img v-if="album.hasAvatar" :src="`https://www.develteam.com/userdata/avatars/media_${album.id}.jpg`"
                             class="media-avatar" :alt="album.title + ' album'" :title="album.title + ' album'"/>
                        <img v-else :src="`https://www.develteam.com/userdata/avatar_blank_100.jpg`" class="media-avatar"
                             :alt="album.title + ' album'" :title="album.title + ' album'"/>
                        <span class="title">{{album.title}}</span>
                    </router-link>

                    <div v-if="Object.keys(albums).length === 0 && !canEdit" class="no-albums">
                        This Game Project has not Uploaded any Media
                    </div>

                    <li v-if="canEdit" @click="enterAddAlbumMode" :class="{selected: addAlbumMode}">
                        <div class="media-avatar add-album"><i class="fas fa-plus"></i></div>
                        <span class="title">Add Album</span>
                    </li>
                </ul>

            </transition>
        </section>

        <new-album-form v-if="addAlbumMode" page-type="game" :page-id="gameId"></new-album-form>

        <media-piece-list v-if="$route.params.album" page-type="game" :page-id="gameId" :medias-id="mediasId"
                          :can-edit="canEdit"></media-piece-list>

        <button class="button" v-if="$route.params.piece" @click="exitSinglePieceView">View Entire Portfolio</button>
    </article>
</template>


<script>
    import NewAlbumForm from '../../../Common/Media/FormNewMediaAlbum.vue';
    import MediaPieceList from '../../../Common/Media/MediaPieceList.vue'

    export default {
        name: 'GameMedia',
        props: ['gameId', 'isModerator', 'isMember'],

        data() {
            return {
                imageLoader: undefined,
                selectedAlbum: undefined,
                addAlbumMode: false,
                editAlbumMode: false
            }
        },

        components: {
            'new-album-form': NewAlbumForm,
            'media-piece-list': MediaPieceList
        },

        mounted() {
            if (this.gameId && this.fetchingAlbumStatus !== 'fetched') {
                this.getAlbums();
            }
        },

        computed: {
            canEdit() {
                let foundMatchingGame = false;

                if (!this.$store.state.loggedUserModel.isLoggedIn) {
                    return false;
                }

                this.$store.state.loggedUserModel.games.forEach(function (game) {
                    if (game.id === this.gameId) {
                        foundMatchingGame = true;
                    }
                }.bind(this));

                return foundMatchingGame;
            },

            mediasId() {
                return 'game.' + this.gameId;
            },

            fetchingAlbumStatus() {
                let gameMediaData = this.$store.state.mediasModel.medias[this.mediasId];
                return gameMediaData ? gameMediaData.fetchingStatus : 'fetching';
            },

            albums() {
                let gameMediaData = this.$store.state.mediasModel.medias[this.mediasId];

                if (gameMediaData) {
                    return gameMediaData.albums;
                }
            }
        },

        methods: {
            getAlbums() {
                this.$store.dispatch('medias/getAlbums', {
                    mediasId: this.mediasId
                });
            },

            enterAddAlbumMode() {
                this.addAlbumMode = true;
                this.$router.push(`/Game/${this.$route.params.game}/Media/`);
            },

            exitAddAlbumMode() {
                this.addAlbumMode = false;
            },

            exitSinglePieceView() {
                this.$router.push(`/Game/${this.$route.params.game}/Media/`);
            }
        },

        watch: {
            '$store.state.gamePageModel.gameInformation'() {
                this.getAlbums();
            },

            '$route.params.album'() {
                if (this.$route.params.album) {
                    this.exitAddAlbumMode();
                }
            }
        },

        sockets: {
            'mediaAlbumAddOrEdit'(data) {
                this.exitAddAlbumMode();
            }
        }
    }
</script>