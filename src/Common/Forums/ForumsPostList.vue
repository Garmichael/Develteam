<template>
    <div>
        <loader-large v-if="!thread"></loader-large>

        <section v-if="thread" class="posts">

            <h2>
                <router-link :to="`/${root}`">{{category.title}}</router-link>
                <i class="fas fa-chevron-right"></i>
                <router-link :to="`/${root}/${category.stringUrl}/${forum.stringUrl}`">{{forum.title}}</router-link>
                <i class="fas fa-chevron-right"></i> <i v-if="thread.locked" class="fas fa-lock"></i> <i v-if="thread.pinned" class="fas fa-thumbtack"></i> {{thread.title}}
            </h2>

            <section v-if="(isModerator || isOriginalPoster) && !editMode && !deleteMode" class="controls">

                <div @click="enterEditMode"><i class="fas fa-pencil-alt"></i> Edit</div>

                <div v-if="isModerator && !thread.pinned" @click="savePinnedStatus"><i class="fas fa-thumbtack"></i> Pin</div>
                <div v-if="isModerator && thread.pinned" @click="savePinnedStatus"><i class="fas fa-thumbtack fa-rotate-270"></i> Unpin</div>

                <div v-if="isModerator && !thread.locked" @click="saveLockedStatus"><i class="fas fa-lock"></i> Lock</div>
                <div v-if="isModerator && thread.locked" @click="saveLockedStatus"><i class="fas fa-unlock"></i> Unlock</div>

                <div v-if="isModerator" @click="deleteMode = true"><i class="fas fa-times"></i> Delete</div>

                <div v-if="isModerator" @click="moveMode = true"><i class="fas fa-long-arrow-alt-right"></i> Move</div>
            </section>

            <section v-if="editMode" class="thread-controls-form">
                <input type="text" placeholder="Thread Subject" v-model="editThreadTitle"/>
                <button class="button minor" @click="editMode = false">Cancel</button>
                <button class="button" @click="saveEditThread">Save</button>
            </section>

            <section v-if="deleteMode" class="thread-controls-form">
                <h3>Are you sure you want to delete this thread and all the posts in it?</h3>
                <button class="button minor" @click="deleteMode = false">Cancel</button>
                <button class="button" @click="deleteThread">Delete</button>
            </section>

            <section v-if="moveMode" class="thread-controls-form">
                <h3>Move To</h3>
                <div class="validation-messages error" v-if="moveToForumErrorMessage">{{moveToForumErrorMessage}}</div>
                <select v-model="moveToForumId" @change="moveToForumErrorMessage = ''">
                    <option v-for="moveToForum in moveModeForumsList" :value="moveToForum.id" v-if="moveToForum.id !== forum.id">{{moveToForum.label}}</option>
                </select>
                <button class="button minor" @click="moveMode = false">Cancel</button>
                <button class="button" @click="moveThread">Move</button>
            </section>

            <section class="pagination">
                <label>page</label>
                <pagination :max-page="totalPages" :current-page="currentPage" :spread="5" @switchToPage="switchToResultsPage"></pagination>
            </section>

            <loader-large v-if="thread.fetchingStatus === 'fetching'"></loader-large>

            <post v-if="thread.fetchingStatus === 'fetched'" v-for="post in posts" :post="post" :board-id="boardId"></post>

            <add-post-form v-if="!thread.locked" :board-id="boardId" :category-id="category.id" :thread-id="thread.id"></add-post-form>

            <section class="pagination">
                <label>page</label>
                <pagination :max-page="totalPages" :current-page="currentPage" :spread="5" @switchToPage="switchToResultsPage"></pagination>
            </section>

        </section>
    </div>
</template>


<script>
    import Vue from 'vue';
    import axios from 'axios';
    import _ from 'lodash';
    import AddPostForm from './ForumsAddPost.vue';
    import ForumsPost from './ForumsPost.vue';

    export default {
        name: 'SiteForumsPostList',
        props: ['boardId', 'board', 'root', 'isModerator', 'canPost'],
        data(){
            return {
                postsPerPage: 20,
                currentPage: 1,
                editMode: false,
                deleteMode: false,
                moveMode: false,
                editThreadTitle: '',
                moveToForumId: 0,
                moveToForumErrorMessage: ''
            }
        },

        components: {
            'add-post-form': AddPostForm,
            'post': ForumsPost
        },

        mounted() {
            if (this.forum) {
                if (this.thread) {
                    this.fetchPosts();
                } else {
                    this.fetchThread();
                }
            }
        },

        computed: {
            category(){
                if (this.board.categories && this.board.categories[this.$route.params.category]) {
                    return this.board.categories[this.$route.params.category];
                }
            },

            forum(){
                if (this.board.categories &&
                        this.board.categories[this.$route.params.category] &&
                        this.board.categories[this.$route.params.category].forums &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum]
                ) {
                    return this.board.categories[this.$route.params.category].forums[this.$route.params.forum]
                }
            },

            thread(){
                if (this.board.categories &&
                        this.board.categories[this.$route.params.category] &&
                        this.board.categories[this.$route.params.category].forums &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum] &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[this.$route.params.thread]
                ) {
                    return this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[this.$route.params.thread];
                }
            },

            posts(){
                if (this.board.categories &&
                        this.board.categories[this.$route.params.category] &&
                        this.board.categories[this.$route.params.category].forums &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum] &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[this.$route.params.thread] &&
                        this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[this.$route.params.thread].posts
                ) {
                    return this.board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[this.$route.params.thread].posts;
                }
            },

            totalPages() {
                return this.thread ? Math.ceil(this.thread.totalPosts / this.postsPerPage) : 0;
            },

            isOriginalPoster(){
                return this.thread && this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id === this.thread.threadStarterId;
            },

            moveModeForumsList(){
                let list = [];

                _.each(this.board.categories, function (category) {
                    _.each(category.forums, function (forum) {
                        list.push({
                            label: '[' + category.title + '] ' + forum.title,
                            id: forum.id
                        })
                    });
                });

                return list;
            }
        },

        methods: {

            fetchThread(){
                this.$store.dispatch('forums/getThread', {
                    boardId: this.boardId,
                    categoryStringUrl: this.$route.params.category,
                    forumStringUrl: this.$route.params.forum,
                    threadStringUrl: this.$route.params.thread,
                    forumId: this.forum.id
                });
            },

            fetchPosts(data){
                this.$store.dispatch('forums/getPosts', {
                    boardId: this.boardId,
                    categoryStringUrl: this.$route.params.category,
                    forumStringUrl: this.$route.params.forum,
                    threadStringUrl: this.$route.params.thread,
                    threadId: this.thread.id,
                    page: this.currentPage,
                    perPage: this.postsPerPage,
                    noLoader: data && data.noLoader
                });
            },

            switchToResultsPage(newPage){
                this.currentPage = newPage;
                this.fetchPosts();
            },

            enterEditMode(){
                this.editThreadTitle = this.thread.title;
                this.editMode = true;
            },

            saveEditThread(){
                axios.post('/api/forumsActions/editThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    threadId: this.thread.id,
                    newTitle: this.editThreadTitle
                });

                this.editMode = false;
            },

            savePinnedStatus(){
                axios.post('/api/forumsActions/pinThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    threadId: this.thread.id
                })
            },

            saveLockedStatus(){
                axios.post('/api/forumsActions/lockThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    threadId: this.thread.id
                })
            },

            deleteThread(){
                axios.post('/api/forumsActions/deleteThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    threadId: this.thread.id
                })
            },

            moveThread(){
                if (this.moveToForumId === 0) {
                    this.moveToForumErrorMessage = 'Select a destination forum';
                    return;
                }

                axios.post('/api/forumsActions/moveThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    threadId: this.thread.id,
                    moveToId: this.moveToForumId
                }).then(response => {
                    this.moveMode = false;
                })
            }
        },

        watch: {
            'forum'(){
                if (!this.thread && this.forum && this.forum.fetchingStatus !== 'fetching' && this.forum.fetchingStatus !== 'fetched') {
                    this.fetchThread();
                }
            },

            'thread'(){
                if (this.thread && this.thread.fetchingStatus !== 'fetching' && this.thread.fetchingStatus !== 'fetched') {
                    this.fetchPosts();
                }
            }
        },

        sockets: {
            'forumsNewPost'(data){
                if (data.threadId === this.thread.id) {
                    axios.get('/api/forums/thread', {
                        params: {
                            forumId: this.forum.id,
                            threadStringUrl: this.$route.params.thread
                        }
                    }).then((response) => {
                        if (!response.data.errors) {
                            Vue.set(this.$store.state.forumsModel.boards[this.boardId]
                                    .categories[this.$route.params.category]
                                    .forums[this.$route.params.forum]
                                    .threads[this.$route.params.thread], 'totalPosts', response.data.totalPosts);
                        }

                        if (this.currentPage === this.totalPages) {
                            this.fetchPosts({noLoader: true});
                        }
                    });
                }
            },

            'forumsMoveThread'(data){
                if (this.thread.id === data.threadId) {
                    this.$router.push(`/${this.root}/${data.categoryStringUrl}/${data.forumStringUrl}/${data.threadStringUrl}`);
                }
            }
        }
    }
</script>