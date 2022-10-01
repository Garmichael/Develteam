<template>

    <section class="member-edit-form">

        <template v-if="!isSaving && !removeMode">
            <div class="avatar-container">
                <avatar :profile-data="member" profile-type="developer" size="large" :show-xp-info="true"></avatar>
            </div>

            <div class="member-actions">
                <span class="alias">{{member.alias}}</span>
                <label class="is-moderator" v-if="member.modLevel !== 'owner'">
                    <input type="checkbox" v-model="member.isModerator" @change="saveButtonEnabled = true"/> Is a Moderator
                </label>
                <button class="button save" :disabled="!saveButtonEnabled" @click.prevent="saveMember">Save Member Info</button>
                <button class="button remove" v-if="member.id !== myId" @click.prevent="removeMode = true">Remove from Game</button>
            </div>

            <div class="member-positions">
                <div class="position" v-for="position in positions">
                    <label><input type="checkbox" v-model="member.positions[position].checked" @change="saveButtonEnabled = true"> {{position}}</label>
                    <label><input type="text" placeholder="Role Title" v-model="member.positions[position].positionTitle" @input="saveButtonEnabled = true"/></label>
                </div>
            </div>
        </template>

        <template v-if="!isSaving && removeMode">
            <section class="remove-user">
                <h1>Remove {{member.alias}} from this game project?</h1>
                <button class="button minor" @click="removeMode = false">Cancel</button>
                <button class="button" @click="removeMember">Yes, Remove This User</button>
            </section>
        </template>

        <saver-large v-if="isSaving"></saver-large>

    </section>

</template>


<script>
    export default {
        name: 'GameMembersEditItem',
        props: ['member', 'positions', 'myId', 'gameId'],

        data(){
            return {
                saveButtonEnabled: false,
                isSaving: false,
                removeMode: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {
            saveMember(){
                this.isSaving = true;
                this.$store.dispatch('gamePage/updateMember', {
                    member: this.member,
                    gameId: this.gameId
                });
            },

            removeMember(){
                this.isSaving = true;
                this.removeMode = false;

                this.$store.dispatch('gamePage/removeMember', {
                    member: this.member,
                    gameId: this.gameId
                });
            },

            enableSaveButton(){
                this.saveButtonEnabled = true;
            }
        },

        sockets: {
            'gameMembersUpdated'(){
                setTimeout(function () {
                    this.isSaving = false;
                }.bind(this), 500)
            }
        }
    }
</script>