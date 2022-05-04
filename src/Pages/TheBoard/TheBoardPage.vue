<template>

    <article id="the-board-page">
        <h1>The Board</h1>

        <div class="sort-mode-selector">
            <label class="switch">
                <button :class="[{active: 0 === sortModeIndex}]" @click="sortModeIndex = 0">Activity</button>
                <button :class="[{active: 1 === sortModeIndex}]" @click="sortModeIndex = 1">New</button>
                <button :class="[{active: 2 === sortModeIndex}]" @click="sortModeIndex = 2">Top</button>
            </label>
        </div>

        <div v-for="post in posts" class="content-box board-post">
            <section class="votes"></section>
            <header>
                <section class="post-info">Posted by
                    <router-link :to="`/Developer/${post.authorStringUrl}`"> <i class="fas fa-user"></i> {{post.authorAlias}}</router-link>
                    on {{post.created}}. Last activity at {{post.updated}}
                </section>
                <section class="title">{{post.title}}</section>
                <footer><i class="far fa-comment-alt"></i> {{post.commentCount}} Comments</footer>
            </header>
        </div>
    </article>
</template>

<script>
    export default {
        name: "TheBoardPage",

        data() {
            return {
                sortTypes: [
                    {
                        label: 'Hot',
                        icon: 'fas fa-fire'
                    },
                    {
                        label: 'New',
                        icon: 'fas fa-certificate'
                    },
                    {
                        label: 'Top',
                        icon: 'fas fa-chart-bar'
                    }
                ],
                sortModeIndex: 0,
                posts: [
                    {
                        title: 'Who likes stuff I like',
                        created: 'Jan 28, 2021',
                        updated: 'Jan 30, 2021',
                        authorStringUrl: 'Garmy',
                        authorAlias: 'Garmy',
                        commentCount: 38,
                        Votes: 38
                    }
                ]
            }
        },

        methods: {
            setSortModeIndex(index) {
                this.sortModeIndex = index;
            }
        }

    }
</script>
