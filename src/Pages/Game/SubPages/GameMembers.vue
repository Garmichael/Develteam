<template>
    <section id="game-content-members">

        <loader-large v-if="!hasData"></loader-large>

        <template v-if="!editMembersMode">
            <h2 v-if="hasCurrentMembers">
                <span class="label">Active Members</span>
                <span v-if="isOwner" class="enter-edit-mode"><a href="#" @click.prevent="editMembersMode = true">Manage Members</a></span>
            </h2>

            <div v-if="group.members.length > 0" v-for="(group, key) in organizedMembers.current" class="member-list">
                <h3>{{key}}</h3>

                <router-link :to="`/Developer/${member.stringUrl}`" v-for="member in group.members" class="member-item">
                    <div class="avatar-container">
                        <avatar :profile-data="member" profile-type="developer" size="large" :show-xp-info="true"></avatar>
                    </div>

                    <span class="details">
                    <h3>{{member.alias}}</h3>
                    <span v-if="member.modLevel === 'owner'" class="mod-status"><i class="fas fa-star"></i> Project Owner</span>
                    <span v-if="member.modLevel === 'mod'" class="mod-status"><i class="fas fa-star"></i> Project Moderator</span>
                    <span>{{member.positionTitle}}</span>
                    <span class="time">Joined {{member.joinDate | formatDateWithoutTime}}</span>
                </span>
                </router-link>
            </div>

            <template v-if="hasFormerMembers">
                <h2>Former Members</h2>

                <div v-for="(group, key) in organizedMembers.former" class="member-list" v-if="group.members.length > 0">
                    <h3>{{key}}</h3>

                    <router-link :to="`/Developer/${member.stringUrl}`" v-for="member in group.members" class="member-item">
                        <div class="avatar-container">
                            <avatar :profile-data="member" profile-type="developer" size="large" :show-xp-info="true"></avatar>
                        </div>

                        <span class="details">
                    <h3>{{member.alias}}</h3>
                    <span>{{member.positionTitle}}</span>
                    <span class="time">From {{member.joinDate | formatDateWithoutTime}}</span>
                    <span class="time">To {{member.endDate | formatDateWithoutTime}}</span>
                </span>
                    </router-link>
                </div>
            </template>
        </template>

        <edit-page v-if="editMembersMode" :members="members" :game-id="gameId" v-on:exitEditMode="editMembersMode = false"></edit-page>

    </section>
</template>

<script>
    import _ from 'lodash';
    import EditPage from './GameMembersEdit.vue';

    export default {
        name: 'GameMembers',
        props: ['gameId', 'isMember', 'isModerator', 'isOwner'],

        data(){
            return {
                hasCurrentMembers: false,
                hasFormerMembers: false,
                editMembersMode: false
            }
        },

        components: {
            'edit-page': EditPage
        },

        mounted() {

        },

        computed: {
            hasData(){
                let model = this.$store.state.gamePageModel;
                return model.retrievedInformation && model.retrievedMembers;
            },

            members(){
                return this.$store.state.gamePageModel.gameMembers;
            },

            organizedMembers(){
                this.hasCurrentMembers = false;
                this.hasFormerMembers = false;

                let organizedMembers = {
                    current: {
                        'Production': {rank: 0, members: []},
                        'Design': {rank: 1, members: []},
                        'Art': {rank: 2, members: []},
                        'Programming': {rank: 3, members: []},
                        'Music': {rank: 4, members: []},
                        'Sound Effects': {rank: 5, members: []},
                        'Writing': {rank: 6, members: []},
                        'Testing': {rank: 7, members: []},
                        'Undefined Positions': {rank: 8, members: []}
                    },
                    former: {
                        'Production': {rank: 0, members: []},
                        'Design': {rank: 1, members: []},
                        'Art': {rank: 2, members: []},
                        'Programming': {rank: 3, members: []},
                        'Music': {rank: 4, members: []},
                        'Sound Effects': {rank: 5, members: []},
                        'Writing': {rank: 6, members: []},
                        'Testing': {rank: 7, members: []},
                        'Undefined Positions': {rank: 8, members: []}
                    }
                };

                _.each(this.members, function (member) {
                    if (member.status === 'Current') {
                        this.hasCurrentMembers = true;
                        _.each(member.positions, function (position) {
                            let memberData = _.cloneDeep(member);
                            if (organizedMembers.current[position.positionType]) {
                                memberData.positionTitle = position.positionTitle;
                                organizedMembers.current[position.positionType].members.push(memberData)
                            }
                        });

                        if (Object.keys(member.positions).length === 0) {
                            organizedMembers.current['Undefined Positions'].members.push(member);
                        }
                    } else {
                        this.hasFormerMembers = true;
                        _.each(member.positions, function (position) {
                            let memberData = _.cloneDeep(member);
                            if (organizedMembers.former[position.positionType]) {
                                memberData.positionTitle = position.positionTitle;
                                organizedMembers.former[position.positionType].members.push(memberData)
                            }
                        });

                        if (Object.keys(member.positions).length === 0) {
                            organizedMembers.former['Undefined Positions'].members.push(member);
                        }
                    }
                }.bind(this));

                return organizedMembers;
            }
        },

        methods: {}
    }
</script>