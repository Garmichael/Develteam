<template>
    <div>
        <button v-if="!expanded" class="button" @click.prevent="expanded = true">{{buttonLabel}}</button>
        <div v-if="expanded" id="feed-add-new" class="feed-post">
            <h2>{{headlineLabel}}</h2>
            <form>
                <template v-if="isOnAGameProject">
                    <label>
                        <span>Post As</span>
                        <select v-model="selectedPostAs">
                            <option value="developer">{{developerAlias}}</option>
                            <option v-for="game in gameProjects" :value="game.id">Game: {{game.alias}}</option>
                        </select>
                    </label>
                </template>
                <input type="text" placeholder="Subject (optional)" v-model="newPostSubject"/>
                <markdown-editor v-model="newPostContent" placeholder="Post Content"></markdown-editor>

                <div class="help-button" v-if="!helpShown" @click.stop="showHelpRollout()">
                    <i class="fa fa-fw fa-question-circle"></i> Help submitting a DevLog
                </div>

                <div class="help-rollout" v-else>
                    <p>
                        A Developer's Log (or <em>DevLog</em> for short) is a bit like a diary or Blog post for your game
                        development related topics. It's not a recruitment tool (that is what Classifieds are for)
                        but anything else about your game dev journey that you want to write about is fair game.
                        Some might use it to write about an interesting thing they worked on, or a gamedev challenge
                        they faced and how they solved it, or something they just learned.
                    </p>

                    <div class="help-button" @click.stop="hideHelpRollout()">Hide Help</div>
                </div>

                <button class="button" @click.prevent="submitNewPost">Submit</button>
                <button class="button minor" @click.prevent="expanded = false">Cancel</button>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'HomeFeedNewPostForm',

        data() {
            return {
                expanded: false,
                newPostContent: '',
                newPostSubject: '',
                selectedPostAs: 'developer',
                helpShown: false
            }
        },

        computed: {
            isClassifieds(){
                return this.$route.fullPath.toLowerCase() === "/classifieds";
            },

            buttonLabel(){
                return this.isClassifieds ? 'Submit a Classifieds Post' : 'Write a DevLog';
            },

            headlineLabel(){
                return this.isClassifieds ? 'Submit a Classifieds Post' : 'Submit a new Post';
            },

            isOnAGameProject() {
                return this.$store.state.loggedUserModel.games.length > 0;
            },

            gameProjects() {
                return this.$store.state.loggedUserModel.games;
            },

            developerAlias() {
                return this.$store.state.loggedUserModel.info.alias;
            }
        },

        methods: {
            showHelpRollout(){
                this.helpShown = true;
            },

            hideHelpRollout(){
                this.helpShown = false;
            },

            submitNewPost() {
                let postAs = this.selectedPostAs === 'developer' ? 'developer' : 'game';
                let postAsId = this.selectedPostAs === 'developer' ? 0 : this.selectedPostAs;

                if (this.newPostContent.trim() === '') {
                    return;
                }

                this.$store.dispatch('feedPosts/postNewPost', {
                    subject: this.newPostSubject,
                    content: this.newPostContent,
                    parentType: postAs,
                    parentId: postAsId,
                    type: this.isClassifieds ? 'classifieds' : 'status',
                });

                this.newPostContent = '';
                this.newPostSubject = '';
                this.expanded = false;
            }
        }
    }
</script>