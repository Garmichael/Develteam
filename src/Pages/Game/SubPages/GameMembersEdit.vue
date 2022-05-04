<template>
    <section id="game-content-members-edit">
        <h2>
            <span class="label">Manage Members</span>
            <span class="enter-edit-mode"><a href="#" @click.prevent="exitEditMode">Exit Manage Mode</a></span>
        </h2>

        <editable-member v-for="member in formData" v-if="member.status === 'Current'" :member="member" :positions="positions" :my-id="myId" :game-id="gameId"></editable-member>

    </section>
</template>


<script>
    import _ from 'lodash';
    import GameMembersEditItem from './GameMembersEditItem.vue'

    export default {
        name: 'GameMembersEdit',
        props: ['gameId', 'members', 'isModerator'],

        data(){
            return {
                positions: ['Production', 'Design', 'Art', 'Programming', 'Music', 'Sound Effects', 'Writing', 'Testing']
            }
        },

        components: {
            'editable-member': GameMembersEditItem
        },

        mounted() {

        },

        computed: {
            myId(){
                return this.$store.state.loggedUserModel.info.id;
            },

            formData(){
                let members = _.cloneDeep(this.members);

                _.each(members, function (member) {
                    member.isModerator = member.modLevel === 'mod';

                    _.each(this.positions, function (position) {
                        if (!member.positions[position]) {
                            member.positions[position] = {
                                positionType: position,
                                positionTitle: '',
                                checked: false
                            }
                        } else {
                            member.positions[position].checked = true;
                        }
                    }.bind(this))
                }.bind(this));

                members = _.sortBy(members, function (member) {
                    return member.id !== this.myId;
                }.bind(this));

                return members;
            }
        },

        methods: {
            exitEditMode(){
                this.$emit('exitEditMode');
            }
        }
    }
</script>