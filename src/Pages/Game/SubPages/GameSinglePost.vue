<template>
    <div>
        <loader-large v-if="fetchingStatus === 'fetching'"></loader-large>

        <feed-status-post v-if="postData && fetchingStatus === 'fetched'" :data="postData" :key="postData.id"></feed-status-post>

        <div class="validation-messages error" v-if="!postData && fetchingStatus === 'fetched'">This post doesn't exist</div>
    </div>

</template>


<script>
    export default {
        name: 'GameSinglePostView',

        components: {},

        mounted() {
            if (!this.postData && this.gameId) {
                this.getPost()
            }
        },

        computed: {
            postId(){
                return this.$route.params.id;
            },

            feedPostsId(){
                return 'game.' + this.gameId;
            },

            gameId(){
                let pageData = this.$store.state.gamePageModel.gameInformation;

                if (pageData && pageData.id) {
                    return pageData.id;
                }
            },

            postData(){
                let feedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];

                if (feedData) {
                    return feedData.posts[this.postId]
                }
            },

            fetchingStatus(){
                let gameFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return gameFeedData ? gameFeedData.fetchingStatus : 'fetching'
            }
        },

        methods: {
            getPost(){
                this.$store.dispatch('feedPosts/getSingleFeedPost', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'game',
                    feedId: this.gameId,
                    postId: this.postId
                });
            }
        },

        watch: {
            'gameId'(){
                if (!this.postData) {
                    this.getPost()
                }
            },

            'postId'(){
                if (!this.postData) {
                    this.getPost()
                }
            }
        }
    }
</script>