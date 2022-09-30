<template>
    <section id="game-companion-content" v-if="$store.state.gamePageModel.retrievedInformation">

        <div class="main-details">
            <div class="avatar-container">
                <avatar :profile-data="game" profile-type="game" size="super-large" :show-xp-info="true"></avatar>
            </div>

            <div class="details-container">
                <h1 class="game-alias">
                    <i class="fas fa-gamepad"></i>
                    {{game.alias}}
                </h1>

                <div class="platform">
                    <h3>Platform</h3>
                    <span>{{game.platforms}}</span>
                </div>

                <div class="genre">
                    <h3>Genre</h3>
                    <span class="info">{{game.genres}}</span>
                </div>

                <div class="rating">
                    <h3>Rating</h3>
                    <span class="info">{{game.rating | capitalizeFirstLetter}}</span>
                </div>

                <div v-if="game.releaseDate" class="release-date">
                    <h3>Release Date</h3>
                    <span class="info">{{game.releaseDate}}</span>
                </div>

                <div v-if="showContactOptions" class="connect-options">
                    <span @click="sendRequestToJoin" v-if="showRequestOption"><i class="fas fa-user"></i> Request to Join</span>
                    <span @click="updateFollowStatus" v-if="!isFollowing && showFollowOption && !savingFollowingChange"><i
                            class="far fa-paper-plane"></i> Follow</span>
                    <span @click="updateFollowStatus"
                          v-if="isFollowing && showFollowOption && !savingFollowingChange"><i
                            class="far fa-times-circle"></i> Un follow</span>
                    <span v-if="savingFollowingChange"><i class="fas fa-sync fa-spin"></i></span>
                </div>

                <div v-if="isSeeking" class="currently-recruiting">
                    <div v-if="isSeeking" class="wants-to-collab">Actively Recruiting</div>

                    <h3>Roles</h3>
                    <span v-if="game.seekingRoles" class="info">{{game.seekingRoles}}</span>

                    <div class="role-list">
                        <router-link v-if="game.seekingProducers" :to="'/Browse/Developers?seekingRole=producers'" class="role-tag">
                            <span>Producers</span>
                        </router-link>

                        <router-link v-if="game.seekingDesigners" :to="'/Browse/Developers?seekingRole=designers'" class="role-tag">
                            <span>Designers</span>
                        </router-link>

                        <router-link v-if="game.seekingArtists" :to="'/Browse/Developers?seekingRole=artists'" class="role-tag">
                            <span>Artists</span>
                        </router-link>

                        <router-link v-if="game.seekingProgrammers" :to="'/Browse/Developers?seekingRole=programmers'" class="role-tag">
                            <span>Programmers</span>
                        </router-link>

                        <router-link v-if="game.seekingWriters" :to="'/Browse/Developers?seekingRole=writers'" class="role-tag">
                            <span>Writers</span>
                        </router-link>

                        <router-link v-if="game.seekingMusicians" :to="'/Browse/Developers?seekingRole=musicians'" class="role-tag">
                            <span>Musicians</span>
                        </router-link>

                        <router-link v-if="game.seekingSfxArtists" :to="'/Browse/Developers?seekingRole=sfx'" class="role-tag">
                            <span>SFX Artists</span>
                        </router-link>

                        <router-link v-if="game.seekingTesters" :to="'/Browse/Developers?seekingRole=testers'" class="role-tag">
                            <span>Testers</span>
                        </router-link>
                    </div>

                    <template v-if="game.skills.length > 0">
                        <h3>Skills</h3>
                        <div class="skills" v-if="showSkillTags">
                            <div v-if="game.skills " class="skill-list">
                                <router-link :to="'/Browse/Developers?seekingSkill=' + skillId"
                                             v-for="skillId in game.skills" class="skill-tag">
                                    {{getSkill(skillId)}}
                                </router-link>
                            </div>
                        </div>
                    </template>
                </div>

            </div>

            <div class="edit-options"
                 v-if="!editDetailsMode && !editVitalsMode && !editRecruitmentMode && !leaveGameMode">
                <button v-if="isModerator" @click.prevent="editVitalsMode = true">Edit Title and Avatar</button>
                <button v-if="isModerator" @click.prevent="editDetailsMode = true">Edit Game Details</button>
                <button v-if="isModerator" @click.prevent="editRecruitmentMode = true">Edit Recruitment Details</button>
                <button v-if="isMember" @click.prevent="leaveGameMode = true">Leave Game Project</button>
            </div>

            <edit-game-vitals v-if="editVitalsMode" :game="game"
                              v-on:doneEditing="editVitalsMode = false"></edit-game-vitals>
            <edit-game v-if="editDetailsMode" v-on:doneEditing="editDetailsMode = false"></edit-game>
            <edit-game-recruitment v-if="editRecruitmentMode" :game="game"
                                   v-on:doneEditing="editRecruitmentMode = false"></edit-game-recruitment>
            <leave-game v-if="leaveGameMode" :game="game" :is-owner="isOwner"
                        v-on:doneEditing="leaveGameMode = false"></leave-game>
        </div>

    </section>
</template>


<script>
    import EditGamesWidget from './Widgets/EditGameWidget.vue'
    import EditGameVitals from './Widgets/EditGameVitals.vue'
    import EditGameRecruitment from './Widgets/EditGameRecruitment.vue'
    import LeaveGame from './Widgets/LeaveGame.vue'

    export default {
        name: 'GameCompanionContent',
        data() {
            return {
                editDetailsMode: false,
                editVitalsMode: false,
                editRecruitmentMode: false,
                leaveGameMode: false,
                savingFollowingChange: false
            }
        },

        components: {
            'edit-game': EditGamesWidget,
            'edit-game-vitals': EditGameVitals,
            'edit-game-recruitment': EditGameRecruitment,
            'leave-game': LeaveGame
        },

        mounted() {

        },

        computed: {
            game() {
                return this.$store.state.gamePageModel.gameInformation;
            },

            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            showSkillTags() {
                return this.game.skills.length > 0;
            },

            isSeeking() {
                return this.game.seekingProducers ||
                    this.game.seekingDesigners ||
                    this.game.seekingArtists ||
                    this.game.seekingProgrammers ||
                    this.game.seekingWriters ||
                    this.game.seekingMusicians ||
                    this.game.seekingSfxArtists ||
                    this.game.seekingTesters;
            },

            seekingRoles() {
                return 'some roles'
            },

            gameId() {
                if (this.game) {
                    return this.game.id;
                }
            },

            isMember() {
                if (!this.$store.state.loggedUserModel.isLoggedIn || Object.keys(this.$store.state.gamePageModel.gameMembers).length === 0) {
                    return false;
                }

                let isGameMember = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.status === 'Current') {
                        isGameMember = true;
                    }
                }.bind(this));

                return isGameMember;
            },

            isModerator() {
                if (!this.isMember) {
                    return false;
                }

                let isModerator = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.modLevel !== 'member' && member.status === 'Current') {
                        isModerator = true;
                    }
                }.bind(this));

                return isModerator;
            },

            isOwner() {
                if (!this.isMember) {
                    return false;
                }

                let isOwner = false;

                this.$store.state.gamePageModel.gameMembers.forEach(function (member) {
                    if (member.id === this.$store.state.loggedUserModel.info.id && member.modLevel === 'owner' && member.status === 'Current') {
                        isOwner = true;
                    }
                }.bind(this));

                return isOwner;
            },

            showContactOptions() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            showRequestOption() {
                return !this.isMember;
            },

            isFollowing() {
                let connections = this.$store.state.gamePageModel.gameConnections;
                let foundSelf = false;

                if (!this.$store.state.loggedUserModel.isLoggedIn) {
                    return false;
                }

                if (connections && connections.followers) {
                    connections.followers.forEach(function (follower) {
                        if (follower.id === this.$store.state.loggedUserModel.info.id) {
                            foundSelf = true;
                        }
                    }.bind(this));
                }

                return foundSelf;
            },

            showFollowOption() {
                return this.$store.state.gamePageModel.retrievedConnections;
            }
        },

        methods: {
            getSkill(skillId) {
                return this.skillList[skillId]
                    ? this.skillList[skillId].skill
                    : '';
            },

            sendRequestToJoin() {
                this.$router.push({path: `/RequestToJoin/${this.game.stringUrl}`});
            },

            updateFollowStatus() {
                if (this.savingFollowingChange) {
                    return;
                }

                this.savingFollowingChange = true;
                this.$store.dispatch('gamePage/updateFollowStatus');
            }
        },

        watch: {
            'isFollowing'() {
                this.savingFollowingChange = false;
            }
        },

        sockets: {
            'gameAliasUpdated'(data) {
                if (data.gameId == this.game.id) {
                    this.editDetailsMode = false;
                    this.editVitalsMode = false;
                    this.$router.push('/Game/' + data.stringUrl)
                }
            }
        }
    }
</script>