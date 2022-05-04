<template>
    <div>
        <loader-large v-if="fetchingStatus === 'fetching'"></loader-large>

        <feed-status-post v-if="postData && fetchingStatus === 'fetched'" :data="postData" :key="postData.id"></feed-status-post>

        <div class="validation-messages error" v-if="!postData && fetchingStatus === 'fetched'">This post doesn't exist</div>
    </div>

</template>


<script>
    export default {
        name: 'DeveloperSinglePostView',

        components: {},

        mounted() {
            if (!this.postData && this.developerId) {
                this.getPost()
            }
        },

        computed: {
            postId(){
                return this.$route.params.id;
            },

            feedPostsId(){
                return 'developer.' + this.developerId;
            },

            developerId(){
                let pageData = this.$store.state.developerPageModel.developerInformation;

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
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return developerFeedData ? developerFeedData.fetchingStatus : 'fetching'
            },
        },

        methods: {
            getPost(){
                this.$store.dispatch('feedPosts/getSingleFeedPost', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'developer',
                    feedId: this.developerId,
                    postId: this.postId
                });
            },
        },

        watch: {
            'developerId'(){
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