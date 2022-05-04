<template>
    <article id="classifieds-new">
        <div class="new-post-form">
            <h1>Submit a new Classifieds Post</h1>

            <div v-if="GamesOwned && GamesOwned.length > 0">
                <label>Post as</label>
                <select id="selected-game" v-model="selectedGameId" :disabled="isSaving">
                    <option selected value="0">{{ownAlias}}</option>
                    <option v-for="game in GamesOwned" :value="game.id">Game Project: {{game.alias}}</option>
                </select>
            </div>

            <input type="text" v-model="newPostTitle" placeholder="Post Title" :disabled="isSaving"/>
            <markdown-editor v-model="newPostContent" placeholder="Post Content" :disabled="isSaving"></markdown-editor>

            <div class="validation-messages error" v-for="error in errors">{{error}}</div>

            <button class="button" @click="submitPost">Submit</button>
        </div>

    </article>
</template>

<script>
    export default {
        name: "ClassifiedsNew",

        data() {
            return {
                isSaving: false,
                newPostTitle: '',
                newPostContent: '',
                selectedGameId: 0,
                errors: []
            }
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            ownAlias() {
                return this.$store.state.loggedUserModel.info.alias;
            },

            GamesOwned() {
                if (this.isLoggedIn) {
                    return _.filter(this.$store.state.loggedUserModel.games, function (game) {
                        return game.moderatorLevel === 'owner'
                    });
                }
            }
        },

        methods: {
            submitPost() {
                let self = this;

                self.isSaving = true;

                this.$store.dispatch('classifiedsPage/submitNewClassifiedsPost', {
                    selectedGameId: self.selectedGameId,
                    postTitle: self.newPostTitle,
                    postContent: self.newPostContent,

                    callback: function (responseData) {
                        if (responseData.errors) {
                            self.errors = responseData.errors;
                            self.isSaving = false;
                        } else {
                            self.$router.push(`/Classifieds`);
                        }
                    }
                });
            }
        },

        mounted() {

        }
    }
</script>