<template>
    <article id="classifieds-new">
        <div class="new-post-form">

            <template v-if="!isFetching">

                <template v-if="fetchErrors.length === 0">
                    <h1>Edit Classifieds Post</h1>

                    <input type="text" v-model="postTitle" placeholder="Post Title" :disabled="isSaving"/>
                    <markdown-editor v-model="postContent" placeholder="Post Content"
                                     :disabled="isSaving"></markdown-editor>

                    <div class="validation-messages error" v-for="error in saveErrors">{{error}}</div>

                    <button class="button minor" @click="cancelPost">Cancel</button>
                    <button class="button" @click="deletePost">Delete</button>
                    <button class="button" @click="submitPost">Submit</button>
                </template>

                <div class="validation-messages error" v-for="error in fetchErrors">{{error}}</div>

            </template>

            <loader-large v-if="isFetching"></loader-large>
        </div>

    </article>
</template>

<script>
    export default {
        name: "ClassifiedsEdit",

        data() {
            return {
                isSaving: false,
                isFetching: true,
                postTitle: '',
                postContent: '',
                selectedGameId: 0,
                fetchErrors: [],
                saveErrors: []
            }
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },
        },

        methods: {
            cancelPost() {
                this.$router.push(`/Classifieds`);
            },

            submitPost() {
                let self = this;

                self.isSaving = true;

                this.$store.dispatch('classifiedsPage/submitEditedClassifiedsPost', {
                    postId: this.$route.params.id,
                    postTitle: self.postTitle,
                    postContent: self.postContent,

                    callback: function (responseData) {
                        if (responseData.errors) {
                            self.saveErrors = responseData.errors;
                            self.isSaving = false;
                        } else {
                            self.$router.push(`/Classifieds`);
                        }
                    }
                });
            },

            deletePost() {
                let self = this;

                self.isSaving = true;

                this.$store.dispatch('classifiedsPage/deleteClassifiedsPost', {
                    postId: this.$route.params.id,
                    postTitle: self.postTitle,
                    postContent: self.postContent,

                    callback: function (responseData) {
                        if (responseData.errors) {
                            self.saveErrors = responseData.errors;
                            self.isSaving = false;
                        } else {
                            self.$router.push(`/Classifieds`);
                        }
                    }
                });
            }
        },

        mounted() {
            let self = this;

            this.$store.dispatch('classifiedsPage/getClassifiedPost', {
                postId: this.$route.params.id,

                callback: function (responseData) {
                    if (responseData.errors) {
                        self.fetchErrors = responseData.errors;
                    } else {
                        self.postContent = responseData.post.postContent;
                        self.postTitle = responseData.post.postTitle;
                    }

                    self.isFetching = false;
                }
            });
        }
    }
</script>