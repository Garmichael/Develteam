<template>
    <div>
        <loader-large v-if="board.fetchingStatus === 'fetching'"></loader-large>

        <template v-else>
            <div v-if="!category" class="no-forums">This Category Doesn't Exist</div>

            <category-item v-else :category="category" :is-moderator="isModerator" :board-id="boardId" :root="root"></category-item>
        </template>

    </div>
</template>


<script>
    import ForumsCategoryItem from './ForumsCategoryItem.vue';

    export default {
        name: 'SiteForumsForumList',
        props: ['boardId', 'board', 'root', 'isModerator', 'canPost'],

        data(){
            return {}
        },

        components: {
            'category-item': ForumsCategoryItem
        },

        mounted() {

        },

        computed: {
            category(){
                return this.board.categories[this.$route.params.category];
            }
        },

        methods: {}
    }
</script>