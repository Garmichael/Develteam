<template>
    <section id="leave-game-widget">
        <div class="edit-container">
            <saver-large v-if="isSaving"></saver-large>

            <template v-if="!isSaving">
                <h1>Are you sure you want to leave this Game Project?</h1>

                <template v-if="members.length === 1">
                    <div class="validation-messages error">You're the only member on this project. If you leave, the Game Project and all content created by it will be Deleted.</div>
                </template>

                <template v-if="isOwner && members.length > 1">
                    <div class="validation-messages error">You're the owner of this project so you will have to choose another member to take that responsibility.</div>
                    <label>
                        <span>New Owner</span>
                        <select v-model="newOwnerId">
                            <option v-for="member in members" v-if="member.id !== myId" :value="member.id">{{member.alias}}</option>
                        </select>
                    </label>
                </template>

                <div class="validation-messages error" v-if="formErrors.length > 0">
                    <span v-for="error in formErrors">{{error}}</span>
                </div>

                <div class="button-container">
                    <span><button class="button minor" @click.prevent="cancelLeaving">Cancel</button></span>

                    <span v-if="members.length > 1"><button class="button" @click.prevent="leaveProject">Yes, leave Project</button></span>
                    <span v-if="members.length === 1"><button class="button" @click.prevent="leaveProject">Yes, Delete Project</button></span>
                </div>
            </template>
        </div>
    </section>
</template>


<script>
    import axios from 'axios'
    import _ from 'lodash'

    export default {
        name: 'LeaveGame',
        props: ['game', 'isOwner'],

        data(){
            return {
                newOwnerId: 0,
                formErrors: [],
                isSaving: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            members(){
                return _.filter(this.$store.state.gamePageModel.gameMembers, function (member) {
                    return member.status === 'Current';
                });
            },

            myId(){
                return this.$store.state.loggedUserModel.isLoggedIn ? this.$store.state.loggedUserModel.info.id : 0;
            }
        },

        methods: {
            cancelLeaving(){
                this.$emit('doneEditing');
            },

            leaveProject(){
                if (this.isOwner && this.members.length > 1 && this.newOwnerId === 0) {
                    return;
                }

                this.isSaving = true;
                axios.post('/api/members/leave', {
                    gameId: this.game.id,
                    newOwnerId: this.newOwnerId
                }).then(
                        (response) => {
                            if (response.data.errors) {
                                this.formErrors = response.data.errors;
                            } else {
                                this.$emit('doneEditing');
                            }
                        },
                        (response) => {
                            this.formErrors = ['An unknown problem occurred. Please wait a few minutes and try again.']
                        }
                )
            }
        }
    }
</script>