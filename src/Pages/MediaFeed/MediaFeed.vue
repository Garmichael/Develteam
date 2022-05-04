<template>
    <div id="home-feed">

        <article id="feed-posts-page" v-if="gotInitialLoggedUserInfo">
            <!--<div class="post-view-selector" v-if="isLoggedIn">
                <button :class="{selected: layout === 'masonry'}" @click.prevent="changeLayout('masonry')">Masonry Layout</button>
                <button :class="{selected: layout === 'double'}" @click.prevent="changeLayout('double')">Double Column</button>
                <button :class="{selected: layout === 'single'}" @click.prevent="changeLayout('single')">Single Column</button>
            </div>-->

            <div id="feed-post-collection">
                <vue-masonry :min-width="450" :horizontal-gutter="40" :vertical-gutter="40" v-if="layout === 'masonry'">
                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <template v-for="feedPost in feedPosts">

                            <feed-status-post v-if="feedPost.type==='singlePost'" :data="feedPost.post" :key="feedPost.post.id"></feed-status-post>

                            <group-post v-if="feedPost.type==='groupPost'" :posts="feedPost.posts"></group-post>

                        </template>
                    </template>
                </vue-masonry>

                <div class="single-column-container" v-if="layout === 'single'">
                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <template v-for="feedPost in feedPosts">
                            <feed-status-post v-if="feedPost.type==='singlePost'" :data="feedPost.post" :key="feedPost.id"></feed-status-post>

                            <group-post v-if="feedPost.type==='groupPost'" :posts="feedPost.posts"></group-post>
                        </template>
                    </template>
                </div>

                <div class="double-column-container" v-if="layout === 'double'">
                    <vue-masonry :min-width="500" :horizontal-gutter="40" :vertical-gutter="40">
                        <template v-if="Object.keys(feedPosts || {}).length > 0">
                            <template v-for="feedPost in feedPosts">
                                <feed-status-post v-if="feedPost.type==='singlePost'" :data="feedPost.post" :key="feedPost.id"></feed-status-post>

                                <group-post v-if="feedPost.type==='groupPost'" :posts="feedPost.posts"></group-post>
                            </template>
                        </template>
                    </vue-masonry>
                </div>


                <div class="load-more-button-container">
                    <button v-if="fetchingStatus === 'fetched' && Object.keys(feedPosts || {}).length > 0 && !hasFetchedAll" id="feed-fetch-more" @click="getPosts">Load more posts</button>
                    <loader-large v-if="fetchingStatus === 'fetching'"></loader-large>
                </div>
            </div>
        </article>
    </div>
</template>


<script>
    import axios from 'axios';
    import _ from 'lodash';
    import GroupPost from '../../Common/FeedPosts/FeedGroupPost.vue';

    export default {
        name: 'HomeFeedPage',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data(){
            return {
                feedPostsId: 'mediaFeed'
            }
        },

        components: {
            'group-post': GroupPost
        },

        mounted() {
            if (Object.keys(this.feedPosts).length === 0) {
                this.getPosts();
            }

            this.$store.dispatch('loggedUserModel/CatchUpOnMedia');
        },

        computed: {
            layout(){
                return 'masonry';

                if (!this.isLoggedIn) {
                    return 'masonry';
                }

                return this.$store.state.loggedUserModel.options.feedLayoutStyle;
            },

            feedPosts(){
                let feedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId],
                    feedPostArray,
                    outputArray = [];

                if (!feedData) {
                    return [];
                }

                feedPostArray = _.values(feedData.posts).sort(function (a, b) {
                    let aDate = new Date(a.postDate),
                        bDate = new Date(b.postDate);

                    return bDate - aDate;
                });

                for (let i = 0; i < feedPostArray.length; i++) {
                    let streakCount = 0,
                        j = i,
                        groupPost = [];

                    if (!feedPostArray[j].subPosterDetails) {
                        feedPostArray[j].subPosterDetails = {};
                    }

                    while (
                    j < feedPostArray.length - 1 &&
                    feedPostArray[j].subPosterType === feedPostArray[j + 1].subPosterType &&
                    feedPostArray[j].type === 'media' &&
                    feedPostArray[j + 1].type === 'media' &&
                    ((feedPostArray[j].subPosterType === 'developer' && feedPostArray[j].posterDetails.id === feedPostArray[j + 1].posterDetails.id) ||
                    (feedPostArray[j].subPosterType !== 'developer' && feedPostArray[j].subPosterDetails.id === feedPostArray[j + 1].subPosterDetails.id))) {
                        streakCount++;
                        j++;
                    }

                    if (streakCount > 0) {
                        streakCount++;
                        groupPost = {
                            type: 'groupPost',
                            posts: []
                        };

                        for (let k = 0; k < streakCount; k++) {
                            groupPost.posts.push(feedPostArray[k + i]);
                        }

                        outputArray.push(groupPost);
                        i += streakCount;
                        i--;
                    } else {
                        outputArray.push({type: 'singlePost', post: feedPostArray[i]});
                    }


                }

                return outputArray;
            },

            fetchingStatus(){
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return developerFeedData ? developerFeedData.fetchingStatus : 'fetching'
            },

            gotInitialLoggedUserInfo(){
                return this.$store.state.loggedUserModel.gotInitialLoggedUserInfo;
            },

            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            hasFetchedAll(){
                let developerFeedData = this.$store.state.feedPostsModel.feedPosts[this.feedPostsId];
                return developerFeedData ? developerFeedData.hasFetchedAll : true
            },

            hasLoginCookies(){
                let cookieEntries = document.cookie.split(';');
                let cookies = {};

                cookieEntries.forEach((cookie) => {
                    let cookieSegments = cookie.split('=');
                    if (cookieSegments.length === 2 && cookieSegments[1].trim() !== '') {
                        cookies[cookieSegments[0].trim()] = cookieSegments[1].trim();
                    }
                });

                return cookies.userid !== undefined && cookies.password !== undefined;
            }
        },

        methods: {
            getPosts(){
                this.$store.dispatch('feedPosts/getMediaFeedPosts', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'home',
                    limit: 20
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
        }
    }
</script>