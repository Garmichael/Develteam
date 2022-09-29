<template>
    <div id="media-edit-album">
        <h2>Edit Album Details</h2>
        <form v-if="!savingAlbum && !deleteMode">
            <label><input type="text" placeholder="Album Name" v-model="albumName"/></label>

            <label>
                Album Cover Art <input type="file" name="avatar" @change="updateuploadedAlbumName" accept="image/*"/>
                <div v-if="uploadedImageSrc" class="albumPreview" :style="`background-image: url('${uploadedImageSrc}')`"></div>
                <div v-if="albumImageTooBig" class="validation-messages error">The uploaded art is too large. Please choose another that is less than 300k</div>
            </label>

            <button class="button" @click.prevent="editAlbum">Cancel</button>
            <button class="button" @click.prevent="enterDeleteMode">Delete Album</button>
            <button class="button" @click.prevent="editAlbum">Save Changes</button>
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
                albumImageTooBig: false,
                uploadedAlbumName: '',
                uploadedImageSrc: '',
                savingAlbum: false,
                albumName: this.album.title,
                deleteMode: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {},

        methods: {

            editAlbum(){
                if (this.albumImageTooBig || this.albumName.trim() === '') {
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

            updateuploadedAlbumName(e){
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
                this.albumImageTooBig = e.target.files[0].size > 300000;
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