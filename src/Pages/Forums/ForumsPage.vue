<template>

    <article id="forums">
        <template v-if="board !== undefined">

            <category-list
                    v-if="!isCategorySet"
                    :board-id="boardId"
                    :board="board"
                    root="Forums"
                    :is-moderator="isModerator"
                    :can-post="canPost">
            </category-list>

            <forum-list
                    v-if="isCategorySet && !isForumSet"
                    :board-id="boardId"
                    :board="board"
                    root="Forums"
                    :is-moderator="isModerator"
                    :can-post="canPost">
            </forum-list>

            <thread-list
                    v-if="isCategorySet && isForumSet && !isThreadSet"
                    :board-id="boardId"
                    :board="board"
                    root="Forums"
                    :is-moderator="isModerator"
                    :can-post="canPost">
            </thread-list>

            <post-list
                    v-if="isCategorySet && isForumSet && isThreadSet"
                    :board-id="boardId"
                    :board="board"
                    root="Forums"
                    :is-moderator="isModerator"
                    :can-post="canPost">
            </post-list>

        </template>
    </article>

</template>


<script>

    import Vue from 'vue';
    import ForumsCategoryList from 'Common/Forums/ForumsCategoryList.vue'
    import ForumsForumList from 'Common/Forums/ForumsForumList.vue'
    import ForumsThreadList from 'Common/Forums/ForumsThreadList.vue'
    import ForumsPostList from 'Common/Forums/ForumsPostList.vue'

    export default {
        name: 'SiteForums',
        metaInfo: {
            title: 'Develteam Forums | Game developer community | Game dev team up'
        },

        data(){
            return {
                parentType: 'site',
                parentId: 0
            }
        },

        components: {
            'category-list': ForumsCategoryList,
            'forum-list': ForumsForumList,
            'thread-list': ForumsThreadList,
            'post-list': ForumsPostList
        },

        mounted() {
            if (!this.board || this.board.fetchingStatus !== 'fetched') {
                this.$store.dispatch('forums/getCategoriesAndForums', {
                    boardId: this.boardId
                });
            }

            this.$store.dispatch('loggedUserModel/CatchUpOnForums');
        },

        computed: {
            canPost(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            isModerator(){
                return this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id <= 2;
            },

            isCategorySet(){
                return this.$route.params.category !== undefined;
            },

            isForumSet(){
                return this.$route.params.forum !== undefined;
            },

            isThreadSet(){
                return this.$route.params.thread !== undefined;
            },

            board(){
                return this.$store.state.forumsModel.boards[this.boardId];
            },

            boardId(){
                let isSite = this.parentType === 'site';

                if (isSite) {
                    return 'site';
                }

                return this.parentType + '.' + this.parentId;
            }
        },

        methods: {},

        watch: {
            'boardId'(){
                if (!this.board) {
                    this.$store.dispatch('forums/getCategoriesAndForums', {
                        boardId: this.boardId
                    });
                }
            }
        },

        sockets: {
            'forumsLockThread'(data){
                let board = this.$store.state.forumsModel.boards[this.boardId];

                if (
                        board.categories &&
                        board.categories[this.$route.params.category] &&
                        board.categories[this.$route.params.category].forums &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum] &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[data.stringUrl]
                ) {
                    Vue.set(board
                            .categories[this.$route.params.category]
                            .forums[this.$route.params.forum]
                            .threads[data.stringUrl], 'locked', data.isLocked);
                }

            },

            'forumsPinThread'(data){
                let board = this.$store.state.forumsModel.boards[this.boardId];

                if (
                        board.categories &&
                        board.categories[this.$route.params.category] &&
                        board.categories[this.$route.params.category].forums &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum] &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[data.stringUrl]
                ) {
                    Vue.set(board
                            .categories[this.$route.params.category]
                            .forums[this.$route.params.forum]
                            .threads[data.stringUrl], 'pinned', data.isPinned);
                }

            },

            'forumsDeleteThread'(data){
                let board = this.$store.state.forumsModel.boards[this.boardId];

                if (this.$route.params.thread) {
                    this.$router.push(`/Forums/${this.$route.params.category}/${this.$route.params.forum}`);
                }

                if (
                        board.categories &&
                        board.categories[this.$route.params.category] &&
                        board.categories[this.$route.params.category].forums &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum] &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads &&
                        board.categories[this.$route.params.category].forums[this.$route.params.forum].threads[data.stringUrl]
                ) {
                    Vue.delete(board
                            .categories[this.$route.params.category]
                            .forums[this.$route.params.forum]
                            .threads, data.stringUrl);
                }
            },

            'forumsEditCategory'(data){
                this.$store.dispatch('forums/getCategoriesAndForums', {
                    boardId: this.boardId
                });

                if (data.oldStringUrl === this.$route.params.category) {
                    if (this.$route.params.thread) {
                        this.$router.push(`/Forums/${data.stringUrl}/${this.$route.params.forum}/${this.$route.params.thread}`);
                    } else if (this.$route.params.forum) {
                        this.$router.push(`/Forums/${data.stringUrl}/${this.$route.params.forum}`);
                    } else if (this.$route.params.category) {
                        this.$router.push(`/Forums/${data.stringUrl}`);
                    }
                }
            },

            'forumsEditForum'(data){
                this.$store.dispatch('forums/getCategoriesAndForums', {
                    boardId: this.boardId
                });

                if (data.oldStringUrl === this.$route.params.forum) {
                    if (this.$route.params.thread) {
                        this.$router.push(`/Forums/${this.$route.params.category}/${data.stringUrl}/${this.$route.params.thread}`);
                    } else if (this.$route.params.forum) {
                        this.$router.push(`/Forums/${this.$route.params.category}/${data.stringUrl}`);
                    }
                }
            },

            'forumsEditThread'(data){
                this.$store.dispatch('forums/getCategoriesAndForums', {
                    boardId: this.boardId
                });

                if (data.oldStringUrl === this.$route.params.thread) {
                    if (this.$route.params.thread) {
                        this.$router.push(`/Forums/${this.$route.params.category}/${this.$route.params.forum}/${data.stringUrl}`);
                    }
                }
            },

            'forumsMoveThread'(data){
                this.$store.dispatch('forums/getCategoriesAndForums', {
                    boardId: this.boardId
                });
            }
        }
    }
</script>