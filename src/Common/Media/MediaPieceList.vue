<template>
    <section id="media-pieces">

        <template v-if="!singlePieceMode">
            <vue-masonry :min-width="450" :horizontal-gutter="40" :vertical-gutter="40">
                <template v-if="canEdit && !editAlbumMode && !addPieceMode && !fetchingPieces && album">
                    <div class="media-post" id="edit-album" @click="enterEditAlbumMode"><i class="fas fa-pencil-alt"></i><span>Edit Album</span></div>
                    <div class="media-post" id="add-media" @click="enterAddPieceMode"><i class="fas fa-image"></i><span>Add a Piece</span></div>
                </template>

                <media-post v-if="!editAlbumMode && !addPieceMode && !fetchingPieces && album" v-for="piece in pieces" :piece="piece" :medias-id="mediasId" :can-edit="canEdit"></media-post>

                <div v-if="piecesCount === 0 && !editAlbumMode  && !addPieceMode && !fetchingPieces && album" class="media-post no-media-message">This Album is empty</div>

                <div v-if="fetchingPieces && album">
                    <loader-large></loader-large>
                </div>

                <edit-album-form v-if="editAlbumMode" :album="album" :mediasId="mediasId"></edit-album-form>

            </vue-masonry>

            <new-piece-form v-if="addPieceMode" v-on:doneEditing="addPieceMode = false" :album="album" :page-type="pageType" :page-id="pageId"></new-piece-form>
        </template>

        <single-piece-listing v-if="singlePieceMode" :album="album" :pieces="pieces" :medias-id="mediasId" :can-edit="canEdit"></single-piece-listing>
    </section>
</template>


<script>
    import EditAlbumForm from './FormEditMediaAlbum.vue';
    import NewPieceForm from './FormNewMediaPiece.vue';
    import MediaPieceSingle from './MediaPieceSingle.vue';

    import _ from 'lodash';

    export default {
        name: 'MediaPieceList',
        props: ['pageType', 'pageId', 'mediasId', 'canEdit'],

        data(){
            return {
                editAlbumMode: false,
                addPieceMode: false
            }
        },

        components: {
            'edit-album-form': EditAlbumForm,
            'new-piece-form': NewPieceForm,
            'single-piece-listing': MediaPieceSingle
        },

        mounted() {
            if (this.album) {
                this.getPieces();
            }
        },

        computed: {

            album(){
                let mediaData = this.$store.state.mediasModel.medias[this.mediasId];
                let foundAlbum;

                if (mediaData && mediaData.albums) {

                    _.each(mediaData.albums, function (album) {
                        if (album.stringUrl === this.$route.params.album) {
                            foundAlbum = album;
                        }
                    }.bind(this));

                    return foundAlbum;
                }
            },

            pieces(){
                let mediaData = this.$store.state.mediasModel.medias[this.mediasId];

                if (mediaData && this.album && mediaData.albums[this.album.id]) {
                    return mediaData.albums[this.album.id].pieces || {};
                }
            },

            piecesCount(){
                return Object.keys(this.pieces || {}).length;
            },

            fetchingPieces(){
                return this.album && this.album.fetchStatus === 'fetching'
            },

            singlePieceMode(){
                return this.$route.params.piece !== undefined;
            }
        },

        methods: {
            getPieces(){
                this.$store.dispatch('medias/getPieces', {
                    mediasId: this.mediasId,
                    albumId: this.album.id
                });
            },

            enterEditAlbumMode(){
                this.editAlbumMode = true;
            },

            exitEditAlbumMode(){
                this.editAlbumMode = false;
            },

            enterAddPieceMode(){
                this.addPieceMode = true;
            },

            exitAddPieceMode(){
                this.addPieceMode = false;
            }
        },

        watch: {
            'album'(){
                if (this.album && this.album.fetchStatus !== 'fetched' && this.album.fetchStatus !== 'fetching') {
                    this.getPieces();
                    this.exitEditAlbumMode();
                }
            },

            '$route.params.album'(){
                this.exitEditAlbumMode();
                this.exitAddPieceMode();
            }
        },

        sockets: {
            'mediaAlbumAddOrEdit'(data) {
                this.exitEditAlbumMode();

                if (!this.album || data.id === this.album.id) {
                    if (this.pageType === 'developer') {
                        this.$router.push(`/Developer/${this.$route.params.developer}/Portfolio/${data.stringUrl}`);
                    }

                    if (this.pageType === 'game') {
                        this.$router.push(`/Game/${this.$route.params.game}/Media/${data.stringUrl}`);
                    }
                }
            },

            'mediaPieceAddOrEdit'(data){
                this.exitAddPieceMode();
            }
        }
    }
</script>