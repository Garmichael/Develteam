<template>
    <section id="recently-on-forums">
        <h1>Latest Forum Activity</h1>

        <div class="recent-forum-posts">
            <div v-for="forumPost in recentForumPosts" class="recent-forum-post">
                <h2>
                    <!--<template v-if="forumPost.gameAlias">
                        <router-link v-if="forumPost.gameAlias" :to="`/Game/${forumPost.gameStringUrl}/Forums`">{{forumPost.gameAlias}} Forums</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Game/${forumPost.gameStringUrl}/Forums/${forumPost.categoryStringUrl}`">{{forumPost.categoryAlias}}</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Game/${forumPost.gameStringUrl}/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}`">{{forumPost.forumAlias}}</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Game/${forumPost.gameStringUrl}/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}/${forumPost.threadStringUrl}`">{{forumPost.threadAlias}}</router-link>
                    </template>

                    <template v-if="!forumPost.gameAlias">
                        <router-link to="/Forums">Develteam Forums</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Forums/${forumPost.categoryStringUrl}`">{{forumPost.categoryAlias}}</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}`">{{forumPost.forumAlias}}</router-link>
                        <i class="fa fa-chevron-right"></i>
                        <router-link :to="`/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}/${forumPost.threadStringUrl}`">{{forumPost.threadAlias}}</router-link>
                    </template>-->

                    <router-link
                            v-if="forumPost.gameAlias"
                            :to="`/Game/${forumPost.gameStringUrl}/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}/${forumPost.threadStringUrl}`"
                    >
                        <i class="fas fa-gamepad"></i>{{forumPost.gameAlias}}
                        <!--<i class="fa fa-chevron-right"></i>
                        {{forumPost.categoryAlias}}-->
                        <!--<i class="fa fa-chevron-right"></i>
                        {{forumPost.forumAlias}}-->
                        <i class="fa fa-chevron-right"></i>
                        {{forumPost.threadAlias}}
                    </router-link>

                    <router-link
                            v-if="!forumPost.gameAlias"
                            :to="`/Forums/${forumPost.categoryStringUrl}/${forumPost.forumStringUrl}/${forumPost.threadStringUrl}`"
                    >
                        Devleteam Site Forums
                        <!--<i class="fa fa-chevron-right"></i>
                        {{forumPost.categoryAlias}}-->
                        <!--<i class="fa fa-chevron-right"></i>
                        {{forumPost.forumAlias}}-->
                        <i class="fa fa-chevron-right"></i>
                        {{forumPost.threadAlias}}
                    </router-link>
                </h2>
                <span class="posted-by">
                    <i class="fa fa-comment-o"></i>
                    Posted by <router-link :to="`/Developer/${forumPost.posterStringUrl}`">{{forumPost.posterAlias}}</router-link>,
                    <span>{{forumPost.postDate | formatDate}}</span>
                </span>
            </div>
        </div>
    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'RecentlyOnForums',
        data(){
            return {
                recentForumPosts: []
            }
        },

        methods: {
            fetchRecentForumPosts(){
                axios.get('/api/Forums/recentPosts')
                    .then(
                        (response) => {
                            if (response.data.errors) {
                                return;
                            }

                            this.recentForumPosts = response.data;
                        }
                    )
            }
        },

        mounted(){
            this.fetchRecentForumPosts();
        }
    }
</script>