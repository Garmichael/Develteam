<template>
    <article id="media-page">

        <section id="media-albums" v-if="!$route.params.piece">
            <transition name="fade" mode="out-in">

                <div v-if="fetchingAlbumStatus === 'fetching'" class="loader-container">
                    <loader-large></loader-large>
                </div>

                <ul v-else class="album-list">
                    <router-link tag="li" v-for="album in albums" :to="`/Developer/${$route.params.developer}/Portfolio/${album.stringUrl}`" :class="{selected: album.stringUrl == $route.params.album}">
                        <img v-if="album.hasAvatar" :src="`https://www.develteam.com/userdata/avatars/media_${album.id}.jpg`" class="media-avatar" :alt="album.title + ' album'" :title="album.title + ' album'"/>
                        <img v-else :src="`https://www.develteam.com/userdata/avatar_blank_100.jpg`" class="media-avatar" :alt="album.title + ' album'" :title="album.title + ' album'"/>
                        <span class="title">{{album.title}}</span>
                    </router-link>

                    <div v-if="Object.keys(albums).length === 0 && !canEdit" class="no-albums">This Developer has not Uploaded any Portfolio Pieces</div>

                    <li v-if="canEdit" @click="enterAddAlbumMode" :class="[{selected: addAlbumMode}, 'add-album-container']">
                        <div class="media-avatar add-album"><i class="fas fa-plus"></i></div>
                        <span class="title">Add Album</span>
                    </li>
                </ul>

            </transition>
        </section>

        <new-album-form v-if="addAlbumMode" page-type="developer" :page-id="developerId"></new-album-form>

        <media-piece-list v-if="$route.params.album" page-type="developer" :page-id="developerId" :medias-id="mediasId" :can-edit="canEdit"></media-piece-list>


        <button class="button" v-if="$route.params.piece" @click="exitSinglePieceView">View Entire Portfolio</button>

        <!--<router-view></router-view>-->
    </article>
</template>


<script>
    import NewAlbumForm from '../../../Common/Media/FormNewMediaAlbum.vue';
    import MediaPieceList from '../../../Common/Media/MediaPieceList.vue'

    export default {
        name: 'DeveloperPortfolio',

        data(){
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
            if (this.developerId && this.fetchingAlbumStatus !== 'fetched') {
                this.getAlbums();
            }
        },

        computed: {
            canEdit(){
                return this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id === this.developerId;
            },

            developerId(){
                let pageData = this.$store.state.developerPageModel.developerInformation;

                if (pageData && pageData.id) {
                    return pageData.id;
                }
            },

            mediasId(){
                return 'developer.' + this.developerId;
            },

            fetchingAlbumStatus(){
                let developerPortfolioData = this.$store.state.mediasModel.medias[this.mediasId];
                return developerPortfolioData ? developerPortfolioData.fetchingStatus : 'fetching';
            },

            albums(){
                let developerPortfolioData = this.$store.state.mediasModel.medias[this.mediasId];

                if (developerPortfolioData) {
                    return developerPortfolioData.albums;
                }
            }
        },

        methods: {
            getAlbums(){
                this.$store.dispatch('medias/getAlbums', {
                    mediasId: this.mediasId
                });
            },

            enterAddAlbumMode(){
                this.addAlbumMode = true;
                this.$router.push(`/Developer/${this.$route.params.developer}/Portfolio/`);
            },

            exitAddAlbumMode(){
                this.addAlbumMode = false;
            },

            exitSinglePieceView(){
                this.$router.push(`/Developer/${this.$route.params.developer}/Portfolio/`);
            }
        },

        watch: {
            '$store.state.developerPageModel.developerInformation'(){
                this.getAlbums();
            },

            '$route.params.album'(){
                if (this.$route.params.album) {
                    this.exitAddAlbumMode();
                }
            }
        },

        sockets: {
            'mediaAlbumAddOrEdit'(data){
                this.exitAddAlbumMode();
            }
        }
    }
</script>