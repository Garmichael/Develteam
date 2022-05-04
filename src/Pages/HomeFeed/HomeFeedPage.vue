<template>
    <div id="home-feed">
        <div v-if="(!isLoggedIn && gotInitialLoggedUserInfo) || !hasLoginCookies" class="mission-statement">
            <h1>Indie Game Development Community</h1>

            <div class="features">
                <div class="feature">
                    <h2>About Develteam</h2>
                    <p>Develteam is a community for Indie Game Developers. Share your Gamedev portfolio, post your game projects, find help making games, chat about game design and development, post on forums, and browse a large collection of game tools and resources.
                    </p>
                </div>

                <div class="feature">
                    <h2>Game Dev Team Up!</h2>
                    <p>Whether you're a video game designer, enjoy programming games, an excellent game artist, a music composer, or a game producer, Develteam is a great hub for creating games! No matter what kind of game creator you are. Browse developers and game projects to organize a team up. Scroll through the feed to find game developers and new projects.</p>
                </div>

                <div class="feature">
                    <h2>Game Dev Tools and Assets</h2>
                    <p>Develteam hosts a user-generated and ranked list of tools and assets to help with your game development needs. There are tools to assist in Collaboration, Programming, Audio Composition, and making any kind of Art, from pixel art to 3d modeling to animation. There is also a nice collection of assets for graphics, music, sound effects, and fonts.</p>
                </div>

                <div class="feature">
                    <h2>Post Portfolios and get feedback</h2>
                    <p>Showing off your work is an important part of the gamedev process. Sometimes it's hard to tell if what you're doing is working or not, and sharing your Gamedev Portfolio with a community of like-minded hobbyists and professionals is a great way to get feedback on your progress. Don't be afraid to share!</p>
                </div>

                <div class="feature">
                    <h2>Get Help</h2>
                    <p>Designing games and Programming games are both very challenging fields of study. When you run into problems, it's nice to be able to ask for help. We have experts here in every field, whether you're looking for help with general game programming or a more specific engine like Unity Development, You'll be able to find someone who can help you figure out how best to design games.</p>
                </div>

                <div class="feature">
                    <h2>Game Project Management</h2>
                    <p>You can host your Game Projects on Develteam. By creating a Game Project, you can invite members to join. Each game developer on your team can have their role defined and can post to your feed, and share media. Each Game Project gets its own Chat Room and Forums. Forums can be private (only members can see and post) or public (anyone can join!)</p>
                </div>

                <div class="feature">
                    <h2>Help Make Develteam Better</h2>
                    <p>Develteam is an active Game Development Community, and the developers of the site go straight to you for suggestions and bugs. There's a forum set up to report bugs and request suggestions, with transparent and open progress and discussion.</p>
                </div>

                <div class="feature">
                    <h2>The future!</h2>
                    <p>Develteam is always growing, with new features and interactions in the backlog for development. We can't wait to share the future with you! Enjoy our site and this community. We hope you'll take this journey with us. :) </p>
                </div>
            </div>

            <div class="teamup-upsell">
                <h2>Are you looking for a game development team?</h2>

                <div>
                    <router-link tag="button" class="button" to="/Browse/Developers">View Developers</router-link>
                    <router-link tag="button" class="button" to="/Browse/Games">View Game Projects</router-link>
                </div>
            </div>

        </div>

        <article id="feed-posts-page" v-if="gotInitialLoggedUserInfo">
            <div class="post-view-selector" v-if="isLoggedIn">
                <button :class="{selected: layout === 'masonry'}" @click.prevent="changeLayout('masonry')">Masonry Layout</button>
                <button :class="{selected: layout === 'double'}" @click.prevent="changeLayout('double')">Double Column</button>
                <button :class="{selected: layout === 'single'}" @click.prevent="changeLayout('single')">Single Column</button>
            </div>

            <div id="feed-post-collection">
                <vue-masonry :min-width="450" :horizontal-gutter="40" :vertical-gutter="40" v-if="layout === 'masonry'">
                    <new-post-form v-if="fetchingStatus === 'fetched' && isLoggedIn"></new-post-form>

                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <template v-for="feedPost in feedPosts">

                            <feed-status-post v-if="feedPost.type==='singlePost'" :data="feedPost.post" :key="feedPost.post.id"></feed-status-post>

                            <group-post v-if="feedPost.type==='groupPost'" :posts="feedPost.posts"></group-post>

                        </template>
                    </template>
                </vue-masonry>

                <div class="single-column-container" v-if="layout === 'single'">
                    <new-post-form v-if="fetchingStatus === 'fetched' && isLoggedIn"></new-post-form>

                    <template v-if="Object.keys(feedPosts || {}).length > 0">
                        <template v-for="feedPost in feedPosts">
                            <feed-status-post v-if="feedPost.type==='singlePost'" :data="feedPost.post" :key="feedPost.id"></feed-status-post>

                            <group-post v-if="feedPost.type==='groupPost'" :posts="feedPost.posts"></group-post>
                        </template>
                    </template>
                </div>

                <div class="double-column-container" v-if="layout === 'double'">
                    <vue-masonry :min-width="500" :horizontal-gutter="40" :vertical-gutter="40">
                        <new-post-form v-if="fetchingStatus === 'fetched' && isLoggedIn"></new-post-form>

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
    import NewPostForm from './HomeFeedNewPostForm.vue';
    import GroupPost from '../../Common/FeedPosts/FeedGroupPost.vue';

    export default {
        name: 'HomeFeedPage',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data(){
            return {
                feedPostsId: 'homeFeed'
            }
        },

        components: {
            'new-post-form': NewPostForm,
            'group-post': GroupPost
        },

        mounted() {
            if (Object.keys(this.feedPosts).length === 0) {
                this.getPosts();
            }
        },

        computed: {
            layout(){
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
                this.$store.dispatch('feedPosts/getFeedPosts', {
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