<template>
    <div id="media-add-album">
        <h2>Add an Album</h2>
        <form v-if="!savingAlbum">
            <label><input type="text" placeholder="Album Name" v-model="albumName"/></label>

            <label>
                Album Cover Art <input type="file" name="avatar" @change="updateUploadedAlbumName" accept="image/jpeg, image/png"/>
                <div v-if="uploadedImageSrc" class="albumPreview" :style="`background-image: url('${uploadedImageSrc}')`"></div>
            </label>

            <button class="button" @click.prevent="cancel">Cancel</button>
            <button class="button" @click.prevent="addAlbum">Create</button>
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
                savingAlbum: false
            }
        },

        mounted() {

        },

        computed: {},

        methods: {
            addAlbum(){
                if (this.albumName.trim() === '') {
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
            },

            cancel(){
                this.$emit('doneEditing');
            }
        }
    }
</script>