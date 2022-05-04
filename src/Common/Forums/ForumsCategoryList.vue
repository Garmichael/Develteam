<template>
    <div>
        <loader-large v-if="board.fetchingStatus === 'fetching'"></loader-large>

        <template v-else>
            <div v-if="Object.keys(orderedCategories || {}).length === 0" class="no-forums">This Group doesn't have any forums set up</div>

            <category-item v-else v-for="category in orderedCategories" :category="category" :is-moderator="isModerator" :board-id="boardId" :root="root"></category-item>

            <section v-if="isModerator && !showAddCategoryForm" class="add-category" @click="showAddCategoryForm = true">
                <i class="fas fa-plus"></i> Add a Category
            </section>

            <saver-large v-if="isModerator && showAddCategoryForm && savingAddCategory"></saver-large>

            <section v-if="isModerator && showAddCategoryForm && !savingAddCategory" class="add-category-form">
                <h2>Add Category</h2>
                <div v-if="addCategoryError" class="validation-messages error">{{addCategoryError}}</div>
                <input type="text" placeholder="Category Title" v-model="newCategoryTitle" @focus="addCategoryError = ''"/>
                <label><input type="checkbox" v-model="isPrivate"/> Members Only Category</label>
                <button class="button" @click.prevent="addCategory">Add Category</button>
            </section>
        </template>

    </div>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';
    import ForumsCategoryItem from './ForumsCategoryItem.vue';

    export default {
        name: 'ForumsCategoryList',
        props: ['boardId', 'board', 'root', 'isModerator', 'canPost'],

        data(){
            return {
                showAddCategoryForm: false,
                newCategoryTitle: '',
                addCategoryError: '',
                isPrivate: false,
                savingAddCategory: false
            }
        },

        components: {
            'category-item': ForumsCategoryItem
        },

        mounted() {

        },

        computed: {
            orderedCategories(){
                return _.sortBy(this.board.categories, 'rank');
            }
        },

        methods: {
            addCategory(){
                if (this.newCategoryTitle.trim() === '') {
                    this.addCategoryError = 'Please Enter a Title for your Category';
                    return;
                }

                axios.post('/api/forumsActions/addCategory', {
                    title: this.newCategoryTitle,
                    isPrivate: this.isPrivate,
                    boardId: this.boardId
                });

                this.savingAddCategory = true;
            }
        },

        sockets: {
            'forumsNewCategory'(data){
                if (data.boardId === this.boardId) {
                    this.savingAddCategory = false;
                    this.showAddCategoryForm = false;
                    this.newCategoryTitle = '';
                }
            }
        }
    }
</script>