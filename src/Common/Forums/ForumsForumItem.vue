<template>
    <section class="forum-container">
        <template v-if="!editMode">
            <router-link :to="`/${root}/${category.stringUrl}/${forum.stringUrl}`" class="forum">
                <div class="details">
                    <h3>
                        {{forum.title}}
                    </h3>
                    <p>{{forum.description}}</p>
                </div>

                <div v-if="forum.lastReply" class="last-reply">
                    <h4>Last Reply</h4>
                    <span>{{forum.lastReply | formatDate}}</span>
                </div>

                <div class="data">
                    <h4>{{forum.views}} Views</h4>
                    <span>{{forum.totalThreads}} Threads - {{forum.totalPosts}} Posts</span>
                </div>
            </router-link>

            <div class="moderator-controls">
                <div class="control" @click="editMode = true"><i class="fas fa-pencil-alt"></i></div>
            </div>
        </template>

        <template v-if="editMode">
            <div class="edit-forum-form">
                <div v-if="editForumErrorMessage" class="validation-messages error">{{editForumErrorMessage}}</div>
                <input type="text" placeholder="Forum Title" v-model="editForumTitle" @input="editForumErrorMessage = ''"/>
                <textarea v-model="editForumDescription"></textarea>
                <button class="button minor" @click="editMode = false">Cancel</button>
                <button class="button" @click="saveForum">Save</button>
            </div>
        </template>
    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'ForumsForumItem',
        props: ['category', 'forum', 'isModerator', 'boardId', 'root'],

        data(){
            return {
                editMode: false,
                editForumTitle: this.forum.title,
                editForumDescription: this.forum.description,
                editForumErrorMessage: ''
            }
        },

        components: {},

        mounted() {
        },

        computed: {},

        methods: {
            saveForum(){
                if (this.editForumTitle.trim() === '') {
                    this.editForumErrorMessage = 'Please Enter a Title for the Forum'
                    return;
                }

                axios.post('/api/forumsActions/editForum', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    forumId: this.forum.id,
                    title: this.editForumTitle,
                    description: this.editForumDescription
                })
            }
        }
    }
</script>