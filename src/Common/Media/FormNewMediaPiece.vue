<template>
    <section id="media-add-piece">
        <h2>Add a Piece</h2>

        <form v-if="!savingForm">
            <label><input type="text" placeholder="Piece Title" v-model="title"/></label>

            <fieldset>
                <label v-for="mediaType in mediaTypes"><input type="radio" name="mediaType" :value="mediaType.id" v-model="selectedMediaType"> {{mediaType.name}}</label>
            </fieldset>

            <label>
                <markdown-editor placeholder="Description (Optional)" v-model="description"></markdown-editor>
            </label>

            <fieldset>
                <label v-show="selectedMediaData.usesUploadFile">
                    Media ({{selectedMediaData.name}})
                    <input type="file" id="mediaPieceFile" name="mediaPieceFile" @change="setMediaFile" :accept="selectedMediaData.acceptedTypes.join(',')"/>
                    <span>Accepted File Types: {{selectedMediaData.acceptedTypes.join(', ')}}</span>
                </label>

                <label v-show="selectedMediaData.usesExternalUrl">
                    Media (External Url) <input type="text" name="mediaPieceText" v-model="mediaText" placeholder="http://..."/>
                </label>

                <label v-show="selectedMediaData.usesYoutubeLink">
                    Youtube Link <input type="text" name="mediaPieceText" v-model="mediaText" placeholder="http://..."/>
                </label>

                <label v-show="selectedMediaData.usesPreviewImage">
                    Preview Image (optional)
                    <input type="file" id="previewFile" name="previewFile" @change="setPreviewFile" accept=".jpg,.jpeg,.gif,.png"/>
                    <span>Accepted File Types: .jpg, .jpeg, .png, .gif</span>
                </label>

            </fieldset>

            <fieldset>
                <button class="button" @click.prevent="cancelPiece">Cancel</button>
                <button class="button" @click.prevent="submitNewPiece">Submit</button>
            </fieldset>

            <fieldset v-if="formErrors.length > 0">
                <ul class="validation-messages error">
                    <li v-for="formError in formErrors">{{formError}}</li>
                </ul>
            </fieldset>
        </form>

        <saver-large v-else></saver-large>

    </section>
</template>


<script>
    import validator from 'validator'

    export default {
        name: 'FormNewMediaPiece',
        props: ['album', 'pageType', 'pageId'],

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
                title: '',
                description: '',
                selectedMediaType: 'image',
                mediaFile: undefined,
                previewFile: undefined,
                mediaText: '',
                formErrors: [],
                savingForm: false
            }
        },

        computed: {
            selectedMediaData(){
                return this.mediaTypes[this.selectedMediaType];
            }
        },

        methods: {
            setMediaFile(e){
                this.mediaFile = e.target.files[0];
            },

            setPreviewFile(e){
                this.previewFile = e.target.files[0];
            },

            submitNewPiece(){
                this.validateForm();

                if (this.formErrors.length > 0) {
                    return;
                }

                this.$store.dispatch('medias/addPiece', {
                    title: this.title,
                    description: this.description,
                    albumId: this.album.id,
                    mediaFile: this.mediaFile,
                    previewFile: this.previewFile,
                    selectedMediaType: this.selectedMediaType,
                    mediaText: this.mediaText,
                    pageType: this.pageType,
                    pageId: this.pageId
                });

                this.savingForm = true;
            },

            validateForm(){
                let selectedMedia = this.mediaTypes[this.selectedMediaType];
                let uploadedFileExtension;

                this.formErrors = [];
                this.title = this.title.trim();

                if (this.title === '') {
                    this.formErrors.push('Give the piece a title');
                }

                if (selectedMedia.usesUploadFile) {
                    if (this.mediaFile === undefined) {
                        this.formErrors.push('Upload a file')
                    } else {
                        uploadedFileExtension = this.mediaFile.name.split('.');
                        uploadedFileExtension = '.' + uploadedFileExtension[uploadedFileExtension.length - 1];

                        if (selectedMedia.acceptedTypes.indexOf(uploadedFileExtension.toLowerCase()) === -1) {
                            this.formErrors.push('Uploaded media file is not an acceptable type');
                        }
                    }
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

                if (selectedMedia.usesPreviewImage && this.previewFile !== undefined) {
                    uploadedFileExtension = this.previewFile.name.split('.');
                    uploadedFileExtension = '.' + uploadedFileExtension[uploadedFileExtension.length - 1];

                    if (['.jpg', '.jpeg', '.png', '.gif'].indexOf(uploadedFileExtension.toLowerCase()) === -1) {
                        this.formErrors.push('Uploaded preview image is not an acceptable type');
                    }
                }
            },

            cancelPiece(){
                this.$emit('doneEditing');
            }
        },

        watch: {
            'selectedMediaType'(){
                this.mediaText = '';
            }
        }
    }
</script>