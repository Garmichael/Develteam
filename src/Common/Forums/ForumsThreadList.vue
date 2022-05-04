<template>
    <div>
        <loader-large v-if="!forum"></loader-large>

        <section v-if="forum" class="threads">
            <h2>
                <router-link :to="`/${root}`">{{category.title}}</router-link>
                <i class="fas fa-chevron-right"></i> {{forum.title}}
            </h2>

            <section class="pagination">
                <label>page</label>
                <pagination :max-page="totalPages" :current-page="currentPage" :spread="5" @switchToPage="switchToResultsPage"></pagination>
            </section>

            <section v-if="canPost && !addThreadMode" class="controls">
                <div @click="addThreadMode = true"><i class="fas fa-plus"></i> Create a new Thread</div>
            </section>

            <section v-if="addThreadMode" class="add-thread-form">
                <saver-large v-if="newThreadSaving"></saver-large>

                <template v-if="!newThreadSaving">
                    <h3>Create a Thread</h3>
                    <div v-if="newThreadErrorMessage" class="validation-messages error">{{newThreadErrorMessage}}</div>
                    <input type="text" v-model="newThreadTitle" placeholder="Thread Subject"/>
                    <markdown-editor v-model="newThreadContent" placeholder="Post Content"></markdown-editor>
                    <button class="button" @click="addThreadMode = false">Cancel</button>
                    <button class="button" @click="saveNewThread">Save</button>
                </template>
            </section>

            <section class="thread-list">
                <section class="thread-list-header">
                    <div>Subject</div>
                    <div>Last Reply</div>
                    <div>Stats</div>
                </section>

                <loader-large v-if="forum.fetchingStatus !== 'fetched'"></loader-large>

                <div v-if="forum.fetchingStatus === 'fetched' && threads.length === 0" class="no-threads">No one has posted a thread in this forum yet</div>

                <router-link v-if="forum.fetchingStatus === 'fetched'" v-for="thread in threads" :to="`/${root}/${$route.params.category}/${$route.params.forum}/${thread.stringUrl}`" class="thread">
                    <div class="title"><i v-if="thread.locked" class="fas fa-lock"></i><i v-if="thread.pinned" class="fas fa-thumbtack"></i>{{thread.title}}</div>
                    <div class="last-reply">{{thread.lastPostTime | formatDate}}</div>
                    <div class="stats"><span>{{thread.totalPosts}} posts</span><span>{{thread.views}} views</span></div>
                </router-link>
            </section>

            <section class="pagination">
                <label>page</label>
                <pagination :max-page="totalPages" :current-page="currentPage" :spread="5" @switchToPage="switchToResultsPage"></pagination>
            </section>
        </section>
    </div>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'SiteForumsThreadList',
        props: ['boardId', 'board', 'root', 'isModerator', 'canPost'],

        data(){
            return {
                threadsPerPage: 20,
                currentPage: 1,
                addThreadMode: false,
                newThreadTitle: '',
                newThreadContent: '',
                newThreadErrorMessage: '',
                newThreadSaving: false
            }
        },

        components: {},

        mounted() {
            if (this.forum) {
                this.fetchThreads();
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
                    return this.board.categories[this.$route.params.category].forums[this.$route.params.forum];
                }
            },

            threads(){
                if (this.forum) {
                    return this.forum.threads;
                }
            },

            totalPages() {
                return this.forum ? Math.ceil(this.forum.totalThreads / this.threadsPerPage) : 0;
            }
        },

        methods: {
            fetchThreads(){
                this.$store.dispatch('forums/getThreads', {
                    boardId: this.boardId,
                    forumId: this.forum.id,
                    categoryStringUrl: this.$route.params.category,
                    forumStringUrl: this.$route.params.forum,
                    page: this.currentPage,
                    perPage: this.threadsPerPage
                });
            },

            switchToResultsPage(newPage){
                this.currentPage = newPage;
                this.fetchThreads();
            },

            saveNewThread(){
                if (this.newThreadTitle.trim() === '') {
                    this.newThreadErrorMessage = 'Please Enter a Subject for the Thread';
                    return;
                }

                if (this.newThreadContent.trim() === '') {
                    this.newThreadErrorMessage = 'Please submit content for the Post';
                    return;
                }

                this.newThreadErrorMessage = '';
                this.newThreadSaving = true;

                axios.post('/api/forumsActions/addThread', {
                    boardId: this.boardId,
                    categoryId: this.category.id,
                    forumId: this.forum.id,
                    title: this.newThreadTitle,
                    content: this.newThreadContent
                }).then(function (response) {
                    this.addThreadMode = false;
                    this.newThreadSaving = false;
                    this.newThreadTitle = '';
                    this.newThreadContent = '';
                    this.newThreadErrorMessage = '';

                    if (!response.data.errors) {
                        this.$router.push(this.$route.path + '/' + response.data.stringUrl);
                    }
                }.bind(this));

            }
        },

        watch: {
            'forum'(){
                if (this.forum && this.forum.fetchingStatus !== 'fetching' && !this.forum.fetchingStatus !== 'fetched') {
                    this.fetchThreads();
                }
            }
        },

        sockets: {

            'forumsAddThread'(data){
                if (this.forum && this.forum.id === data.forumId) {
                    this.fetchThreads();
                }
            }
        }
    }
</script>