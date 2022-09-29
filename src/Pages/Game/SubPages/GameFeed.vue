<template>
    <article id="feed-posts-page">

        <template v-if="Object.keys(feedPosts || {}).length === 0">
            <div v-if="fetchingStatus === 'fetched'" class="content-box feed-post">This user has made no posts</div>
            <loader-large v-else></loader-large>
        </template>

        <div id="feed-post-collection">
            <vue-masonry :min-width="450" :horizontal-gutter="40" :vertical-gutter="40" v-if="layout === 'masonry'">
                <button class="button" @click="showNewPostForm = true" v-if="isMember && !showNewPostForm">Submit a New Post</button>
                <div v-if="isMember && showNewPostForm" id="feed-add-new" class="feed-post">
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
                <button class="button" @click="showNewPostForm = true" v-if="isMember && !showNewPostForm">Submit a New Post</button>
                <div v-if="isMember && showNewPostForm" id="feed-add-new" class="feed-post">
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
                <button class="button" @click="showNewPostForm = true" v-if="isMember && !showNewPostForm">Submit a New Post</button>
                <vue-masonry :min-width="500" :horizontal-gutter="40" :vertical-gutter="40">
                    <div v-if="isMember && showNewPostForm" id="feed-add-new" class="feed-post">
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
        props: ['gameId', 'isModerator', 'isMember'],

        data(){
            return {
                postCountToFetch: 10,
                showNewPostForm: false,
                newPostSubject: '',
                newPostContent: ''
            }
        },

        mounted() {
            if (this.gameId && (this.fetchingStatus !== 'fetched' || Object.keys(this.feedPosts).length < this.postCountToFetch)) {
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

            feedPostsId(){
                return 'game.' + this.gameId;
            },

            feedPosts(){
                let gameFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];

                if (!gameFeedData) {
                    return {};
                }

                let allPosts = [];
                let normalPosts = [];
                let pinnedPosts = [];

                Object.keys(gameFeedData.posts).forEach((key)=>{
                    if (gameFeedData.posts[key].isPinned) {
                        pinnedPosts.push(gameFeedData.posts[key]);
                    } else {
                        normalPosts.push(gameFeedData.posts[key]);
                    }
                });

                normalPosts.sort((a, b) => (new Date(a.postDate) > new Date(b.postDate)) ? -1 : 1);
                pinnedPosts.sort((a, b) => (new Date(a.postDate) > new Date(b.postDate)) ? -1 : 1);

                pinnedPosts.forEach((post)=>{
                    allPosts.push(post);
                });

                normalPosts.forEach((post)=>{
                    allPosts.push(post);
                });

                return allPosts;
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
                    feedType: 'game',
                    feedId: this.gameId,
                    limit: this.postCountToFetch
                });
            },

            submitNewPost(){
                if (this.newPostContent.trim() !== '') {
                    this.$store.dispatch('feedPosts/postNewPost', {
                        subject: this.newPostSubject,
                        content: this.newPostContent,
                        parentType: 'game',
                        parentId: this.gameId
                    });

                    this.newPostContent = '';
                    this.newPostSubject = '';
                    this.showNewPostForm = false;
                }
            },

            fetchMore(){
                this.$store.dispatch('feedPosts/getFeedPosts', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'game',
                    feedId: this.gameId
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
            '$store.state.gamePageModel.gameInformation'(){
                this.getPosts();
            }
        }
    }
</script>