<template>
    <section id="media-piece">

        <loader-large v-if="showLoader"></loader-large>

        <template v-if="showPiece && piece">
            <div v-if="!canEdit && editMode" class="validation-messages error"><h1>You cannot edit this</h1></div>

            <template v-else>
                <edit-form v-if="editMode" :piece="piece"></edit-form>

                <media-post v-if="!editMode" :piece="piece" :medias-id="mediasId" :can-edit="canEdit" classes="centered"></media-post>
            </template>
        </template>

        <div v-if="showPiece && !piece" class="validation-messages friendly"><h1>This piece doesn't exist</h1></div>
    </section>
</template>


<script>
    import _ from 'lodash';
    import FormEditMediaPiece from './FormEditMediaPiece.vue';

    export default {
        name: 'MediaPieceSingle',
        props: ['album', 'pieces', 'mediasId', 'canEdit'],

        components: {
            'edit-form': FormEditMediaPiece
        },

        computed: {

            showLoader(){
                return this.album && this.album.fetchStatus !== 'fetched';
            },

            showPiece(){
                return this.album && this.pieces && this.album.fetchStatus === 'fetched' && Object.keys(this.pieces).length > 0;
            },

            piece(){
                let foundPiece;
                if (this.album && this.pieces && this.album.fetchStatus === 'fetched' && Object.keys(this.pieces).length > 0) {
                    _.each(this.pieces, function (piece) {
                        if (piece.stringUrl === this.$route.params.piece) {

                            foundPiece = piece;
                        }
                    }.bind(this));
                }

                return foundPiece;
            },

            editMode(){
                return this.$route.params.edit !== undefined;
            }
        },

        methods: {
            exitSinglePieceView(){
                let posterType = this.$options.filters.capitalizeFirstLetter(this.piece.posterType);
                let posterStringUrl = this.piece.posterStringUrl || this.piece.subPosterStringUrl;
                let albumStringUrl = this.piece.albumStringUrl;
                let urlPiece = posterType === 'Developer' ? 'Portfolio' : 'Media';

                this.$router.push(`/${posterType}/${posterStringUrl}/${urlPiece}/${albumStringUrl}`);
            }
        }
    }
</script>