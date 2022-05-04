<template>
    <article id="media-piece-edit-form">
        <h2>Edit Piece</h2>

        <form>
            <template v-if="!savingForm">

                <template v-if="!deleteMode">
                    <label><input type="text" placeholder="Piece Title" v-model="title"/></label>

                    <label><span v-show="selectedMediaData.usesUploadFile">You cannot edit media or preview image. Instead, delete this piece and create a new one.</span></label>

                    <label>
                        <markdown-editor placeholder="Description (Optional)" v-model="description"></markdown-editor>
                    </label>

                    <fieldset>

                        <label v-show="selectedMediaData.usesExternalUrl">
                            Media (External Url) <input type="text" name="mediaPieceText" v-model="mediaText" placeholder="http://..."/>
                        </label>

                        <label v-show="selectedMediaData.usesYoutubeLink">
                            Youtube Link <input type="text" name="mediaPieceText" v-model="mediaText" placeholder="http://..."/>
                        </label>

                    </fieldset>

                    <fieldset>
                        <button class="button" @click.prevent="exitEditMode">Cancel</button>
                        <button class="button" @click.prevent="enterDeleteMode">Delete</button>
                        <button class="button" @click.prevent="submitEditedPiece">Save</button>
                    </fieldset>

                    <fieldset v-if="formErrors.length > 0">
                        <ul class="validation-messages error">
                            <li v-for="formError in formErrors">{{formError}}</li>
                        </ul>
                    </fieldset>
                </template>

                <template v-if="deleteMode">
                    <fieldset>
                        <h1>Are you sure you want to delete this piece?</h1>
                        <button class="button" @click.prevent="exitDeleteMode">Cancel</button>
                        <button class="button" @click.prevent="deletePiece">Delete</button>
                    </fieldset>
                </template>
            </template>

            <template v-if="savingForm">
                <saver-large></saver-large>
            </template>
        </form>
    </article>
</template>


<script>

    import validator from 'validator';

    export default {
        name: 'FormEditMediaPiece',
        props: ['piece'],
        data(){
            return {
                mediaTypes: {
                    'image': {
                        id: 'image',
                        name: 'Image',
                        usesUploadFile: true,
                        acceptedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
                        usesPreviewImage: false
                    },
                    'video': {
                        id: 'video',
                        name: 'Video',
                        usesUploadFile: false,
                        acceptedTypes: [],
                        usesPreviewImage: false,
                        usesYoutubeLink: true
                    },
                    'audio': {
                        id: 'audio',
                        name: 'Audio',
                        usesUploadFile: true,
                        acceptedTypes: ['.mp3'],
                        usesPreviewImage: true
                    },
                    'flash': {
                        id: 'flash',
                        name: 'Flash',
                        usesUploadFile: true,
                        acceptedTypes: ['.swf'],
                        usesPreviewImage: true
                    },
                    'archive': {
                        id: 'archive',
                        name: 'Archive',
                        usesUploadFile: true,
                        acceptedTypes: ['.zip', '.rar'],
                        usesPreviewImage: true
                    },
                    'document': {
                        id: 'document',
                        name: 'Document',
                        usesUploadFile: true,
                        acceptedTypes: ['.txt', '.doc', '.docx', '.xsxl', '.pdf'],
                        usesPreviewImage: true
                    },
                    'url': {
                        id: 'url',
                        name: 'External Url',
                        usesUploadFile: false,
                        acceptedTypes: [],
                        usesPreviewImage: true,
                        usesExternalUrl: true
                    },

                },
                title: this.piece.title,
                description: this.piece.description,
                selectedMediaType: {'External': 'url', 'Image': 'image', 'Flash': 'flash', 'Archive': 'archive', 'Audio': 'audio', 'Text': 'document', 'Youtube': 'video'}[this.piece.mediaType],
                mediaText: this.piece.mediaUrl,
                formErrors: [],
                savingForm: false,
                deleteMode: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            selectedMediaData(){
                return this.mediaTypes[this.selectedMediaType];
            }
        },

        methods: {

            submitEditedPiece(){
                this.validateForm();

                if (this.formErrors.length > 0) {
                    return;
                }

                this.$store.dispatch('medias/editPiece', {
                    id: this.piece.id,
                    title: this.title,
                    description: this.description,
                    mediaText: this.mediaText
                });

                this.savingForm = true;
            },

            validateForm(){
                let selectedMedia = this.mediaTypes[this.selectedMediaType];

                this.formErrors = [];
                this.title = this.title.trim();

                if (this.title === '') {
                    this.formErrors.push('Give the piece a title');
                }

                if (selectedMedia.usesExternalUrl) {
                    this.mediaText = this.mediaText.trim();

                    if (this.mediaText === '') {
                        this.formErrors.push('Enter a media url')
                    } else if (!validator.isURL(this.mediaText)) {
                        this.formErrors.push('Enter a valid media url')
                    } else if (!/^(?:f|ht)tps?\:\/\//.test(this.mediaText)) {
                        this.mediaText = "http://" + this.mediaText;
                    }
                }

                if (selectedMedia.usesYoutubeLink) {
                    this.mediaText = this.mediaText.trim();

                    if (this.mediaText === '') {
                        this.formErrors.push('Enter a Youtube url')
                    } else if (!validator.isURL(this.mediaText)) {
                        this.formErrors.push('Enter a valid Youtube url')
                    }
                }
            },

            exitEditMode(){
                this.redirectToPiece(this.piece);
            },

            enterDeleteMode(){
                this.deleteMode = true;
            },

            exitDeleteMode(){
                this.deleteMode = false;
            },

            deletePiece(){
                this.$store.dispatch('medias/deletePiece', {
                    id: this.piece.id
                });

                this.savingForm = true;
            },

            redirectToPiece(data){
                if (data.id === this.piece.id) {
                    let posterType = this.$options.filters.capitalizeFirstLetter(data.posterType);
                    let posterStringUrl = data.posterStringUrl || data.subPosterStringUrl;
                    let albumStringUrl = data.albumStringUrl;
                    let pieceStringUrl = data.stringUrl;
                    let urlPiece = posterType === 'Developer' ? 'Portfolio' : 'Media';

                    this.$router.push(`/${posterType}/${posterStringUrl}/${urlPiece}/${albumStringUrl}/${pieceStringUrl}`);
                }
            }
        },

        sockets: {

            'mediaPieceAddOrEdit'(data){
                this.redirectToPiece(data);
            },

            'deletedMediaPiece'(data){
                this.redirectToPiece(data);
            }
        }
    }
</script>