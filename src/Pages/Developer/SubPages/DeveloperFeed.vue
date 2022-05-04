<template>
    <article id="feed-posts-page">

        <template v-if="Object.keys(feedPosts || {}).length === 0">
            <div v-if="fetchingStatus === 'fetched'" class="content-box feed-post">This user has made no posts</div>
            <loader-large v-else></loader-large>
        </template>

        <div id="feed-post-collection">
            <vue-masonry :min-width="450" :horizontal-gutter="40" :vertical-gutter="40" v-if="layout === 'masonry'">
                <button class="button" @click="showNewPostForm = true" v-if="isOwner && !showNewPostForm">Submit a New Post</button>
                <div v-if="isOwner && showNewPostForm" id="feed-add-new" class="feed-post">
                    <h2>Submit a new Post</h2>
                    <form>
                        <input type="text" placeholder="Subject (optional)" v-model="newPostSubject"/>
                        <markdown-editor v-model="newPostContent" placeholder="Post Content"></markdown-editor>
                        <button class="button" @click.prevent="submitNewPost">Submit</button>
                        <button class="button" @click.prevent="showNewPostForm = false">Cancel</button>
                    </form>
                </div>

                <template v-if="Object.keys(feedPosts || {}).length > 0">
                    <feed-status-post v-for="feedPost in feedPosts" :data="feedPost" :key="feedPost.id"></feed-status-post>
                </template>
            </vue-masonry>

            <div class="single-column-container" v-if="layout === 'single'">
                <button class="button" @click="showNewPostForm = true" v-if="isOwner && !showNewPostForm">Submit a New Post</button>
                <div v-if="isOwner && showNewPostForm" id="feed-add-new" class="feed-post">
                    <h2>Submit a new Post</h2>
                    <form>
                        <input type="text" placeholder="Subject (optional)" v-model="newPostSubject"/>
                        <markdown-editor v-model="newPostContent" placeholder="Post Content"></markdown-editor>
                        <button class="button" @click.prevent="submitNewPost">Submit</button>
                        <button class="button" @click.prevent="showNewPostForm = false">Cancel</button>
                    </form>
                </div>

                <template v-if="Object.keys(feedPosts || {}).length > 0">
                    <feed-status-post v-for="feedPost in feedPosts" :data="feedPost" :key="feedPost.id"></feed-status-post>
                </template>
            </div>

            <div class="double-column-container" v-if="layout === 'double'">
                <vue-masonry :min-width="500" :horizontal-gutter="40" :vertical-gutter="40">
                    <button class="button" @click="showNewPostForm = true" v-if="isOwner && !showNewPostForm">Submit a New Post</button>
                    <div v-if="isOwner && showNewPostForm" id="feed-add-new" class="feed-post">
                        <h2>Submit a new Post</h2>
                        <form>
                            <input type="text" placeholder="Subject (optional)" v-model="newPostSubject"/>
                            <markdown-editor v-model="newPostContent" placeholder="Post Content"></markdown-editor>
                            <button class="button" @click.prevent="submitNewPost">Submit</button>
                            <button class="button" @click.prevent="showNewPostForm = false">Cancel</button>
                        </form>
                    </div>

                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <feed-status-post v-for="feedPost in feedPosts" :data="feedPost" :key="feedPost.id"></feed-status-post>
                    </template>
                </vue-masonry>
            </div>
        </div>

        <div class="load-more-button-container">
            <button v-if="fetchingStatus === 'fetched' && Object.keys(feedPosts || {}).length > 0 && !hasFetchedAll" id="feed-fetch-more" @click="fetchMore">Load more posts</button>
        </div>
    </article>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'DeveloperFeed',
        data(){
            return {
                showNewPostForm: false,
                postCountToFetch: 10,
                newPostSubject: '',
                newPostContent: '',
            }
        },

        mounted() {
            if (this.developerId && (this.fetchingStatus !== 'fetched' || Object.keys(this.feedPosts).length < this.postCountToFetch)) {
                this.getPosts();
            }
        },

        computed: {
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            layout(){
                return 'single';
                if (!this.isLoggedIn) {
                    return 'masonry';
                }

                return this.$store.state.loggedUserModel.options.feedLayoutStyle;
            },

            isOwner(){
                return this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id === this.developerId;
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

            feedPosts(){
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                let feedPostArray;

                if (!developerFeedData) {
                    return {};
                }

                feedPostArray = _.values(developerFeedData.posts).sort(function (a, b) {
                    let aDate = new Date(a.postDate),
                        bDate = new Date(b.postDate);

                    return bDate - aDate;
                });

                return feedPostArray;
            },

            fetchingStatus(){
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return developerFeedData ? developerFeedData.fetchingStatus : 'fetching'
            },

            hasFetchedAll(){
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return developerFeedData ? developerFeedData.hasFetchedAll : true
            }
        },

        methods: {
            getPosts(){
                this.$store.dispatch('feedPosts/getFeedPosts', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'developer',
                    feedId: this.developerId,
                    limit: this.postCountToFetch
                });
            },

            submitNewPost(){
                if (this.newPostContent.trim() !== '') {
                    this.$store.dispatch('feedPosts/postNewPost', {
                        subject: this.newPostSubject,
                        content: this.newPostContent,
                        parentType: 'developer',
                        parentId: this.developerId
                    });

                    this.newPostContent = '';
                    this.newPostSubject = '';
                    this.showNewPostForm = false;
                }
            },

            fetchMore(){
                this.$store.dispatch('feedPosts/getFeedPosts', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'developer',
                    feedId: this.developerId
                });
            },

            changeLayout(style){
                if (!this.isLoggedIn) {
                    return;
                }

                this.$set(this.$store.state.loggedUserModel.options, 'feedLayoutStyle', style);

                axios.post('/api/userOptions/updateFeedLayoutStyle', {
                    style: style
                });
            }
        },

        watch: {
            '$store.state.developerPageModel.developerInformation'(){
                this.getPosts();
            }
        }
    }
</script>