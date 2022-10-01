<template>
    <div id="media-reorder-album">
        <h2>Reorder Albums</h2>
        <form v-if="!isSaving">
            <ul>
                <li v-for="(album, index) in albums">
                    <div class="reorder-buttons">
                        <button v-if="index > 0" class="button" @click.prevent="moveUp(index)">
                            <i class="fas fa-arrow-up"></i>
                        </button>

                        <button v-if="index < albums.length - 1" class="button" @click.prevent="moveDown(index)">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>

                    <div class="avatar-container">
                        <img v-if="album.hasAvatar"
                             :src="`https://www.develteam.com/userdata/avatars/media_${album.id}.jpg`"
                             class="media-avatar"
                             :alt="album.title + ' album'" :title="album.title + ' album'"/>
                        <img v-else :src="`https://www.develteam.com/userdata/avatar_blank_100.jpg`"
                             class="media-avatar"
                             :alt="album.title + ' album'" :title="album.title + ' album'"/>
                    </div>

                    <div class="title-container">
                        <span class="title">{{album.title}}</span>
                    </div>
                </li>
            </ul>

            <button class="button minor" @click.prevent="cancel">Cancel</button>
            <button class="button" @click.prevent="save">Save</button>
        </form>

        <saver-large v-if="isSaving"></saver-large>
    </div>
</template>


<script>
    import Vue from 'vue';

    export default {
        name: 'FormReorderMediaAlbum',
        props: ['pageType', 'pageId'],
        data() {
            return {
                isSaving: false,
                albums: []
            }
        },

        mounted() {
            let portfolioData = this.$store.state.mediasModel.medias[this.pageType + '.' + this.pageId];

            if (portfolioData) {
                this.albums = [];

                Object.keys(portfolioData.albums).forEach(key => {
                    this.albums.push(portfolioData.albums[key]);

                });

                this.albums.sort((a, b) => (a.rank > b.rank) ? 1 : -1);
            }
        },

        computed: {},

        methods: {
            moveUp(index) {
                let temp = this.albums[index];
                Vue.set(this.albums, index, this.albums[index - 1]);
                Vue.set(this.albums, index - 1, temp);
            },

            moveDown(index) {
                let temp = this.albums[index];
                Vue.set(this.albums, index, this.albums[index + 1]);
                Vue.set(this.albums, index + 1, temp);
            },

            cancel() {
                this.$emit('doneEditing');
            },

            save() {
                let albumIds = [];
                this.albums.forEach((album) => {
                    albumIds.push(album.id);
                });

                this.$store.dispatch('medias/reorderAlbums', {
                    albums: albumIds,
                    pageType: this.pageType,
                    pageId: this.pageId
                });
            }
        }
    }
</script>