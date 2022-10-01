<template>
    <div id="media-edit-album">
        <h2>Edit Album Details</h2>
        <form v-if="!savingAlbum && !deleteMode">
            <label><input type="text" placeholder="Album Name" v-model="albumName"/></label>

            <label>
                Album Cover Art <input type="file" name="avatar" @change="updateUploadedAlbumName" accept="image/*"/>
                <div v-if="uploadedImageSrc" class="albumPreview" :style="`background-image: url('${uploadedImageSrc}')`"></div>
                <div v-if="albumImageTooBig" class="validation-messages error">Maximum filesize of an Album Icon is 10Mb</div>
            </label>

            <button class="button" @click.prevent="editAlbum">Cancel</button>
            <button class="button" @click.prevent="enterDeleteMode">Delete Album</button>
            <button class="button" @click.prevent="editAlbum" :disabled="!isValidated()">Save Changes</button>
        </form>

        <template v-if="deleteMode">
            <h1>Are you sure you want to delete this album and all the media pieces inside it?</h1>
            <button class="button" @click.prevent="exitDeleteMode">Cancel</button>
            <button class="button" @click.prevent="deleteAlbum">Delete Album</button>
        </template>

        <saver-large v-if="savingAlbum"></saver-large>
    </div>
</template>


<script>
    export default {
        name: 'FormEditMediaAlbum',
        props: ['album', 'mediasId'],

        data(){
            return {
                albumFile: undefined,
                uploadedAlbumName: '',
                uploadedImageSrc: '',
                savingAlbum: false,
                albumName: this.album.title,
                deleteMode: false,
                albumImageTooBig: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {},

        methods: {
            isValidated() {
                return !this.albumImageTooBig &&  this.albumName.trim() !== ''
            },

            editAlbum(){
                if (!this.isValidated()) {
                    return;
                }

                this.albumName = this.albumName.trim();
                this.savingAlbum = true;

                this.$store.dispatch('medias/editAlbum', {
                    albumId: this.album.id,
                    albumName: this.albumName,
                    albumFile: this.albumFile
                });
            },

            updateUploadedAlbumName(e){
                let input = e.target;
                let reader;
                let self = this;

                if (input.files.length === 0) {
                    return;
                }

                if (input.files && input.files[0]) {
                    reader = new FileReader();

                    reader.onload = function (e) {
                        self.uploadedImageSrc = e.target.result;
                    };

                    reader.readAsDataURL(input.files[0]);
                }

                this.uploadedAlbumName = e.target.files[0].name;
                this.albumFile = e.target.files[0];
                this.albumImageTooBig = e.target.files[0].size > 10 * 1024 * 1024;
            },

            enterDeleteMode(){
                this.deleteMode = true;
            },

            exitDeleteMode(){
                this.deleteMode = false;
            },

            deleteAlbum(){
                this.$store.dispatch('medias/deleteAlbum', {
                    albumId: this.album.id
                });

                this.exitDeleteMode();

                if (this.mediasId.split('.')[0] === 'developer') {
                    this.$router.push(`/Developer/${this.$route.params.developer}/Portfolio/`);
                }

                if (this.mediasId.split('.')[0] === 'game') {
                    this.$router.push(`/Game/${this.$route.params.game}/Media/`);
                }
            }
        }
    }
</script>