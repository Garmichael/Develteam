<template>
    <div class="voting-widget">
        <a :class="[{'logged-voted': loggedVote === 1}, 'upvote', 'vote-button', {disabled: !isLoggedIn}]" @click="vote('up')">
            <i :class="['fa', 'fa-arrow-up']"></i>
        </a>

        <a :class="[{'logged-voted': loggedVote === -1}, 'downvote', 'vote-button', {disabled: !isLoggedIn}]" @click="vote('down')">
            <i :class="['fa', 'fa-arrow-down']"></i>
        </a>

        <span class="points" @mouseenter="showTooltip = true" @click="showTooltip = true">{{points}} points</span>

        <div class="tooltip" v-if="showTooltip" @mouseleave="showTooltip = false">
            <div class="content">

                <template v-if="upVoters.length === 0">
                    No Upvotes Yet
                </template>

                <template v-if="upVoters.length > 0">
                    Upvoted by:
                    <span v-for="upVoter in upVoters">
                    <router-link :to="`/Developer/${upVoter.stringUrl}`">{{upVoter.alias}}</router-link>
                </span>
                </template>

            </div>
        </div>
    </div>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'VotingWidget',
        props: ['parentType', 'parentId', 'initialPoints'],

        data(){
            return {
                loggedVote: 0,
                points: 0,
                upVoters: [],
                downVoters: [],
                showTooltip: false
            }
        },

        components: {},

        mounted() {
            this.points = this.initialPoints;
            this.fetchPoints({parentType: this.parentType, parentId: this.parentId});
        },

        computed: {
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        },

        methods: {
            fetchPoints(){
                let self = this;

                axios.get('/api/voting', {
                    params: {
                        parentType: self.parentType,
                        parentId: self.parentId
                    }
                }).then(
                        function (response) {
                            self.loggedVote = response.data.loggedVote;
                            self.points = response.data.voteTotal;
                            self.upVoters = response.data.upVoters;
                            self.downVoters = response.data.downVoters;
                        }
                );

            },

            vote(voteDirection){
                axios.post('/api/voting', {
                    parentType: this.parentType,
                    parentId: this.parentId,
                    direction: voteDirection
                });

            }
        },

        sockets: {
            'voteWidgetUpdated'(data){
                if (data.parentType === this.parentType && data.parentId == this.parentId) {
                    this.fetchPoints();
                }
            }
        }
    }
</script>