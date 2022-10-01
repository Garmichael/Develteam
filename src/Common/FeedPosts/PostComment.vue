<template>
    <li>
        <div class="avatar-container">
            <avatar v-if="comment.subPosterType === 'developer'" :profile-data="comment.poster" profile-type="developer" size="small" :show-xp-info="true"></avatar>
            <avatar v-if="comment.subPosterType === 'game'" :profile-data="comment.subPoster" profile-type="game" size="small" :show-xp-info="true"></avatar>
        </div>

        <div class="comment-details">
            <span v-if="comment.subPosterType === 'developer'" class="comment-from">
                <router-link :to="'/Developer/' + comment.poster.stringUrl">{{comment.poster.alias}}</router-link>
            </span>

            <span v-if="comment.subPosterType === 'game'" class="comment-from">
                <router-link :to="'/Game/' + comment.subPoster.stringUrl">{{comment.subPoster.alias}}</router-link> by
                <router-link :to="'/Developer/' + comment.poster.stringUrl">{{comment.poster.alias}}</router-link>
            </span>

            <span class="comment-date">{{comment.timestamp | formatDateCondensed}}</span>

            <span v-if="!editMode && !deleteMode && canEdit" class="comment-options"><span @click="enterEditMode">Edit</span> | <span @click="enterDeleteMode">Delete</span></span>

            <markdown-content v-if="!editMode && !deleteMode" classes="comment-content" :content="comment.content"></markdown-content>

            <div v-if="editMode && canEdit" class="edit-mode">
                <markdown-editor classes="comment-content" v-model="editedContent"></markdown-editor>
                <button class="button minor" @click="exitEditMode">Cancel</button>
                <button class="button" @click="saveEditedComment">Save</button>
            </div>

            <div v-if="deleteMode && canEdit" class="delete-mode">
                <div class="validation-messages friendly">Are you sure you want to delete this comment?</div>
                <button class="button minor" @click="exitDeleteMode">Cancel</button>
                <button class="button" @click="deleteComment">Delete</button>
            </div>

            <voting-widget v-if="!editMode && !deleteMode" parent-type="post" :parent-id="comment.id" initial-points="0"></voting-widget>
        </div>
    </li>
</template>

<script>
    export default {
        name: 'PostComment',
        props: ['comment'],
        data(){
            return {
                editMode: false,
                deleteMode: false,
                editedContent: this.comment.content
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            canEdit(){
                if (!this.$store.state.loggedUserModel.isLoggedIn) {
                    return;
                }

                return this.comment.poster.id == this.$store.state.loggedUserModel.info.id;
            }
        },

        methods: {
            enterEditMode(){
                this.editMode = true;
            },

            exitEditMode(){
                this.editMode = false;
            },

            enterDeleteMode(){
                this.deleteMode = true;
            },

            exitDeleteMode(){
                this.deleteMode = false;
            },

            deleteComment(){
                this.exitDeleteMode();
                this.$store.dispatch('feedPosts/deleteComment', this.comment);
            },

            saveEditedComment(){
                if (this.comment.content !== this.editedContent) {
                    this.comment.content = this.editedContent;
                    this.$store.dispatch('feedPosts/editCommentContent', this.comment);
                }

                this.editMode = false;
            }
        }
    }
</script>