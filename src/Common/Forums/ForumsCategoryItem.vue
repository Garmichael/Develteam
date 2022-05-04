<template>
    <section class="category">
        <h2>{{category.title}} <span v-if="category.isPrivate" class="members-only">Members Only</span></h2>

        <forum-item v-if="!editMode" v-for="forum in category.forums" :root="root" :category="category" :is-moderator="isModerator" :board-id="boardId" :forum="forum"></forum-item>

        <div v-if="Object.keys(category.forums).length === 0 && !editMode" class="no-forums-message">
            <div>No Forums have been created for this Category</div>
        </div>

        <div v-if="addForumMode" class="forum add-forum-form">
            <saver-large v-if="addForumSaving"></saver-large>

            <div v-if="!addForumSaving">
                <div v-if="addForumError" class="validation-messages error">{{addForumError}}</div>
                <input type="text" placeholder="Forum Title" v-model="addForumTitle"/>
                <textarea placeholder="Forum Description" v-model="addForumDescription"></textarea>
                <button class="button" @click="addForumMode = false">Cancel</button>
                <button class="button" @click="addForum">Add Forum</button>
            </div>
        </div>

        <section v-if="editMode" class="edit-category-form">
            <div v-if="editCategoryError" class="validation-messages error">{{editCategoryError}}</div>
            <input type="text" placeholder="Category Title" v-model="newCategoryTitle" @focus="editCategoryError = ''"/>
            <label><input type="checkbox" v-model="isPrivate"/> Members Only Category</label>
            <button class="button" @click.prevent="editMode = false">Cancel</button>
            <button class="button" @click.prevent="editCategory">Edit Category</button>
        </section>

        <div v-if="isModerator && !editMode && !addForumMode" class="moderator-controls">
            <div @click="editMode = true"><i class="fas fa-pencil-alt"></i> Edit Category</div>
            <div @click="addForumMode = true"><i class="fas fa-plus"></i> Add a Forum</div>
        </div>
    </section>
</template>

<script>
    import axios from 'axios';
    import ForumsForumItem from './ForumsForumItem.vue';

    export default {
        name: 'ForumsCategoryItem',
        props: ['category', 'isModerator', 'boardId', 'root'],

        data(){
            return {
                editMode: false,
                addForumMode: false,
                newCategoryTitle: this.category.title,
                editCategoryError: '',
                isPrivate: false,
                addForumTitle: '',
                addForumDescription: '',
                addForumError: '',
                addForumSaving: false
            }
        },

        components: {
            'forum-item': ForumsForumItem
        },

        mounted() {
        },

        computed: {},

        methods: {
            editCategory(){
                if (this.newCategoryTitle.trim() === '') {
                    this.editCategoryError = 'Please Enter a Title for your Category';
                    return;
                }

                axios.post('/api/forumsActions/editCategory', {
                    title: this.newCategoryTitle,
                    isPrivate: this.isPrivate,
                    boardId: this.boardId,
                    categoryId: this.category.id
                })
            },

            addForum(){
                if (this.addForumTitle.trim() === '') {
                    this.addForumError = 'Please Enter a Title for your Forum';
                    return;
                }

                this.addForumSaving = true;

                axios.post('/api/forumsActions/addForum', {
                    title: this.addForumTitle,
                    description: this.addForumDescription,
                    boardId: this.boardId,
                    categoryId: this.category.id
                })
            }
        },

        sockets: {
            'forumsNewForum'(data){
                if (data.forum.category.id === this.category.id) {
                    this.addForumSaving = false;
                    this.addForumMode = false;
                    this.addForumTitle = '';
                    this.addForumDescription = '';
                }
            }
        }
    }
</script>