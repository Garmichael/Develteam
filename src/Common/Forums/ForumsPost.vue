<template>
    <section class="post" v-if="!isDeleted">
        <div class="poster-details">
            <span class="poster-alias"><router-link :to="`/Developer/${post.posterData.stringUrl}`">{{post.posterData.alias}}</router-link></span>
            <div class="avatar-container">
                <avatar :profile-data="post.posterData" profile-type="developer" size="large" :show-xp-info="true"></avatar>
            </div>
        </div>

        <div class="content-details" v-if="!editPostMode && !deletePostMode">
            <markdown-content :content="post.content" classes="content"></markdown-content>

            <span class="time-stamp">Posted {{post.created | formatDate}}</span>

            <div class="post-details">
                <span><voting-widget v-if="!editPostMode && !deletePostMode" parent-type="forum" :parent-id="post.id" initial-points="0"></voting-widget></span>
                <span v-if="isPoster" class="edit-post" @click="editPostMode = true"><i class="fas fa-pencil-alt"></i> Edit Post</span>
                <span v-if="isPoster" class="delete-post" @click="deletePostMode = true"><i class="fas fa-times"></i> Delete Post</span>
            </div>

            <!--<span>Created: {{post.created | formatDate}} | Modified: {{post.modified | formatDate}}</span>-->
        </div>

        <div class="edit-post-form" v-if="editPostMode">
            <saver-large v-if="isSaving"></saver-large>

            <template v-if="!isSaving">
                <markdown-editor v-model="editPostContent"></markdown-editor>
                <button class="button minor" @click="editPostMode = false">Cancel</button>
                <button class="button" @click="saveEditedPost">Save Changes</button>
            </template>
        </div>

        <div class="delete-post-form" v-if="deletePostMode">
            <button class="button minor" @click="deletePostMode = false">Cancel</button>
            <button class="button" @click="deletePost">Delete Post</button>
        </div>
    </section>
</template>


<script>
    import Vue from 'vue';
    import axios from 'axios';

    export default {
        name: 'ForumsPost',
        props: ['boardId', 'post'],

        data(){
            return {
                editPostContent: this.post.content,
                editPostMode: false,
                deletePostMode: false,
                isSaving: false,
                isDeleted: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            isPoster(){
                return this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id === this.post.posterData.id;
            }
        },

        methods: {
            saveEditedPost(){
                if (this.editPostContent === '') {
                    this.editPostError = 'Please enter content for your Post';
                    return;
                }

                this.isSaving = true;
                axios.post('/api/forumsActions/editPost', {
                    postId: this.post.id,
                    content: this.editPostContent
                })
            },

            deletePost(){
                axios.post('/api/forumsActions/deletePost', {
                    postId: this.post.id
                })

                this.isDeleted = true;
            }
        },

        sockets: {
            'forumsEditPost'(data){
                if (data.id === this.post.id) {
                    Vue.set(this.$store.state.forumsModel.boards[this.boardId]
                            .categories[this.$route.params.category]
                            .forums[this.$route.params.forum]
                            .threads[this.$route.params.thread]
                            .posts[data.id], 'content', data.content
                    );

                    this.post.editPostContent = data.content;
                    this.isSaving = false;
                    this.editPostMode = false;
                }
            },

            'forumsDeletePost'(data){
                if (data.id === this.post.id) {
                    Vue.delete(this.$store.state.forumsModel.boards[this.boardId]
                            .categories[this.$route.params.category]
                            .forums[this.$route.params.forum]
                            .threads[this.$route.params.thread]
                            .posts, data.id
                    );
                }
            }
        }
    }
</script>