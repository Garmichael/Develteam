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

            <div class="help-button" v-if="!helpShown" @click.stop="showHelpRollout()">
                <i class="fa fa-fw fa-question-circle"></i> Help submitting a Classifieds Post
            </div>

            <div class="help-rollout" v-else>
                <p>
                    <em>Classifieds</em> are like adverts in a newspaper. When you are looking for people to join you or a
                    project to join, Classifieds are an important tool at your disposal.
                </p>

                <p>There are two kinds of classifieds: <em>Game Projects</em> and <em>Developers</em>

                <p>
                    <em>Game Project</em> classifieds are for people that want to recruit others to join their project or for
                    people that are looking for an existing project to join. Anyone can see these classified posts on
                    the Classifieds page, making sure the "Game Projects" type filter is selected (which is the default
                    selection type), but in order to submit a Game Project classified post first you have to create a
                    project. Any recruitment roles shown in a Game Project classified are automatically taken from the
                    game project it is linked to.
                </p>

                <p>
                    <em>Developer</em> classifieds are for an individual developer to advertise themselves, letting others
                    know that they're available, the skills they have, what they're looking for, and any
                    conditions/requirements that may apply. Any skills tags listed at the top of a Developer classified
                    are automatically taken from those listed in the developer's profile. To browse the developer
                    classifieds, make sure the "Developers" type filter is selected on the classifieds page (by default
                    it is set to "Game Projects" and not "Developers")
                </p>

                <div class="help-button" @click.stop="hideHelpRollout()">Hide Help</div>
            </div>

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
                errors: [],
                helpShown: false
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
            showHelpRollout(){
                this.helpShown = true;
            },

            hideHelpRollout(){
                this.helpShown = false;
            },

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