<template>
    <div id="media-add-album">
        <h2>Add an Album</h2>
        <form v-if="!savingAlbum">
            <label><input type="text" placeholder="Album Name" v-model="albumName"/></label>

            <label>
                Album Cover Art <input type="file" name="avatar" @change="updateUploadedAlbumName" accept="image/jpeg, image/png"/>
                <div v-if="uploadedImageSrc" class="albumPreview" :style="`background-image: url('${uploadedImageSrc}')`"></div>
                <div v-if="albumImageTooBig" class="validation-messages error">Maximum filesize of an Album Icon is 10Mb</div>
            </label>

            <button class="button minor" @click.prevent="cancel">Cancel</button>
            <button class="button" @click.prevent="addAlbum" :disabled="!isValidated()">Create</button>
        </form>

        <saver-large v-else></saver-large>
    </div>
</template>


<script>
    export default {
        name: 'FormNewMediaAlbum',
        props: ['pageType', 'pageId'],
        data(){
            return {
                albumName: '',
                albumFile: undefined,
                uploadedAlbumName: '',
                uploadedImageSrc: '',
                savingAlbum: false,
                albumImageTooBig: false
            }
        },

        mounted() {

        },

        computed: {},

        methods: {
            isValidated(){
                return !this.albumImageTooBig && this.albumName.trim() !== '';
            },

            addAlbum(){
                if (!this.isValidated()) {
                    return;
                }

                this.albumName = this.albumName.trim();
                this.savingAlbum = true;

                this.$store.dispatch('medias/addAlbum', {
                    pageType: this.pageType,
                    pageId: this.pageId,
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

            cancel(){
                this.$emit('doneEditing');
            }
        }
    }
</script>