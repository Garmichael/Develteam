<template>
    <section class="add-post-form">

        <saver-large v-if="isSaving"></saver-large>

        <transition name="fade" mode="out-in">
            <div v-if="showSavedMessage" class="validation-messages friendly">Your Post has Successfully been added.</div>
        </transition>

        <template v-if="!isSaving">
            <h3>Add a Post</h3>
            <transition name="fade" mode="out-in">
                <div v-if="errorMessage" class="validation-messages error">{{errorMessage}}</div>
            </transition>
            <markdown-editor v-model="postContent" placeholder="Post Content" v-on:input="errorMessage = ''"></markdown-editor>
            <button class="button" @click="submitPost">Submit</button>
        </template>

    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'ForumsAddPost',
        props: ['boardId', 'categoryId', 'threadId'],

        data(){
            return {
                postContent: '',
                errorMessage: '',
                isSaving: false,
                showSavedMessage: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {
            submitPost(){
                if (this.postContent.trim() === '') {
                    this.errorMessage = 'Please enter some content for your post';
                    return;
                }

                this.isSaving = true;

                axios.post('/api/forumsActions/addPost', {
                    boardId: this.boardId,
                    categoryId: this.categoryId,
                    threadId: this.threadId,
                    content: this.postContent
                });
            }
        },

        sockets: {
            'forumsNewPost'(data){
                if (this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id == data.posterId) {
                    this.isSaving = false;
                    this.showSavedMessage = true;
                    this.postContent = '';

                    setTimeout(function () {
                        this.showSavedMessage = false;
                    }.bind(this), 3000)
                }
            }
        }
    }
</script>