<template>
    <div id="home-feed">

        <article id="feed-posts-page" v-if="gotInitialLoggedUserInfo">

            <div id="feed-post-collection">

                <div class="single-column-container">
                    <new-post-form v-if="fetchingStatus === 'fetched' && isLoggedIn"></new-post-form>

                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <template v-for="feedPost in feedPosts">
                            <feed-status-post :data="feedPost.post" :key="feedPost.id"></feed-status-post>

                        </template>
                    </template>
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
    import NewPostForm from '../HomeFeed/HomeFeedNewPostForm.vue';

    export default {
        name: 'HomeFeedPage',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data(){
            return {
                feedPostsId: 'blogFeed'
            }
        },

        components: {
            'group-post': GroupPost,
            'new-post-form': NewPostForm,
        },

        mounted() {
            if (Object.keys(this.feedPosts).length === 0) {
                this.getPosts();
            }

            this.$store.dispatch('loggedUserModel/CatchUpOnDevlogs');
        },

        computed: {
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
                this.$store.dispatch('feedPosts/getBlogFeedPosts', {
                    feedPostsId: this.feedPostsId,
                    feedType: 'home',
                    limit: 20
                });
            },
        }
    }
</script>