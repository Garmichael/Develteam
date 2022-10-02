<template>
    <section id="developer-companion-content" ref="echo" v-if="$store.state.developerPageModel.retrievedInformation">

        <div class="main-details">
            <div class="avatar-container">
                <avatar :profile-data="developer" profile-type="developer" size="super-large"
                        :show-xp-info="true"></avatar>
            </div>

            <div class="details-container">

                <div class="special-developer-banners"
                     v-if="developer.siteModCanBan || developer.donatedAmount > 0 || developer.isBanned">
                    <div class="special-developer-banner" v-if="developer.siteModCanBan">
                        <i class="fas fa-crown mod-icon"></i> Site Moderator
                    </div>

                    <div class="special-developer-banner" v-if="developer.donatedAmount > 0 && developer.donatedAmount < 40">
                        <i class="fas fa-heartbeat donor-icon"></i> Develteam Supporter
                    </div>

                    <div class="special-developer-banner" v-if="developer.donatedAmount >= 40">
                        <i class="fas fa-heartbeat donor-icon  gold"></i> Develteam Supporter
                    </div>

                    <div class="special-developer-banner" v-if="developer.isBanned">
                        <i class="fas fa-skull banned-icon"></i> BANNED
                    </div>
                </div>

                <h1 class="dev-alias">
                    <i :class="[{'fas fa-user': true, 'online': developerIsOnline}]"></i>{{developer.alias}}
                </h1>

                <div v-if="developerIsOnline" class="last-online"><i class="fa fa-circle online"></i> Online</div>
                <div v-if="!developerIsOnline" class="last-online"><i class="fa fa-circle"></i> Offline ({{developer.lastOnline| formatDate}})</div>

                <ul v-if="showBasicInfo" class="basic-info">
                    <li v-if="developerFullName!==''">{{developerFullName}}</li>
                    <li v-if="developerBasicDetails !== ''">{{developerBasicDetails}}</li>
                    <li v-if="developer.location">{{developer.location}}</li>
                    <li v-if="developer.role">{{developer.role}}</li>
                </ul>

                <div v-if="showContactOptions" class="connect-options">
                    <span @click="sendMail"><i class="far fa-envelope"></i> Mail</span>
                    <span @click="openConversation"><i class="far fa-comment-alt"></i> Chat</span>
                    <span @click="sendInvite" v-if="showInviteOption"><i class="fas fa-gamepad"></i> Invite</span>
                    <span @click="updateFollowStatus" v-if="!isFollowing && showFollowOption && !savingFollowingChange"><i
                            class="far fa-paper-plane"></i> Follow</span>
                    <span @click="updateFollowStatus"
                          v-if="isFollowing && showFollowOption && !savingFollowingChange"><i
                            class="far fa-times-circle"></i> Un follow</span>
                    <span v-if="savingFollowingChange"><i class="fas fa-sync fa-spin"></i></span>
                </div>

                <div v-if="developer.lookingForGame" class="wants-to-collab">
                    <div class="badge">Wants to join a Game Project</div>
                    <div class="description" v-if="developer.lookingForDescription">
                        <h3>What I'm looking for in a team</h3>
                        {{developer.lookingForDescription}}
                    </div>
                </div>

                <div class="roles" v-if="showRoleTags && roleSkillListMode==='display'">
                    <h3>
                        Roles
                        <i v-if="isSelf" class="fas fa-pencil-alt edit-icon" @click="toggleEditRolesSkills()"></i>
                    </h3>

                    <div class="role-list">
                        <router-link v-if="developer.isProducer" :to="'/Browse/Developers?seekingRole=producers'" class="role-tag">
                            <span>Producer</span>
                        </router-link>

                        <router-link v-if="developer.isDesigner" :to="'/Browse/Developers?seekingRole=designers'" class="role-tag">
                            <span>Designer</span>
                        </router-link>

                        <router-link v-if="developer.isArtist" :to="'/Browse/Developers?seekingRole=artists'" class="role-tag">
                            <span>Artist</span>
                        </router-link>

                        <router-link v-if="developer.isProgrammer" :to="'/Browse/Developers?seekingRole=programmers'" class="role-tag">
                            <span>Programmer</span>
                        </router-link>

                        <router-link v-if="developer.isWriter" :to="'/Browse/Developers?seekingRole=writers'" class="role-tag">
                            <span>Writer</span>
                        </router-link>

                        <router-link v-if="developer.isMusician" :to="'/Browse/Developers?seekingRole=musicians'" class="role-tag">
                            <span>Musician</span>
                        </router-link>

                        <router-link v-if="developer.isSfxArtist" :to="'/Browse/Developers?seekingRole=sfx'" class="role-tag">
                            <span>SFX Artist</span>
                        </router-link>

                        <router-link v-if="developer.isTester" :to="'/Browse/Developers?seekingRole=testers'" class="role-tag">
                            <span>Tester</span>
                        </router-link>
                    </div>
                </div>

                <div class="skills" v-if="showSkillTags && roleSkillListMode==='display'">
                    <h3>
                        Skills
                        <i v-if="isSelf" class="fas fa-pencil-alt edit-icon" @click="toggleEditRolesSkills()"></i>
                    </h3>

                    <div v-if="roleSkillListMode==='display' && developer.skills" class="skill-list">
                        <router-link :to="'/Browse/Developers?seekingSkill=' + skillId"
                                     v-for="skillId in developer.skills" class="skill-tag">
                            {{getSkill(skillId)}}
                        </router-link>
                    </div>
                </div>

                <edit-roles-and-skills v-if="roleSkillListMode === 'edit'" v-on:doneEditing="roleSkillListMode = 'display'"></edit-roles-and-skills>

                <div v-if="showGames || isSelf" class="game-projects companion-content-subsection">
                    <h3>{{developer.alias}}'s Game Projects</h3>

                    <router-link v-for="game in developer.games"
                                 :to=" `/Game/${game.stringUrl}`"
                                 class="avatar-container"
                    >
                        <avatar :profile-data="game"
                                profile-type="game"
                                size="large"
                                :show-xp-info="false">
                        </avatar>

                        {{game.alias}}

                    </router-link>

                    <router-link v-if="isSelf"
                                 to="/CreateNewGameProject"
                                 class="avatar-container"
                    >
                        <div class="icon-container"><i class="fas fa-fw fa-plus"></i></div>
                        <span>Create a New Game</span>
                    </router-link>

                </div>

                <div v-if="showWebsites" class="websites companion-content-subsection">
                    <h3>
                        Websites
                        <i v-if="isSelf && websiteListMode==='display'" class="fas fa-pencil-alt edit-icon" @click="toggleEditWebsites()"></i>
                    </h3>

                    <template v-if="websiteListMode==='display'">
                        <ul class="website-list">
                            <li v-for="website in developer.personalWebsites">
                                <a :href="website.url" target="_blank">
                                    <i :class="['fa-fw', getLinkIcon(website.url)]"></i> {{website.name}}
                                </a>
                            </li>
                        </ul>
                    </template>

                    <edit-websites v-if="websiteListMode==='edit'" v-on:doneEditing="websiteListMode = 'display'"></edit-websites>
                </div>

                <div v-if="isSelf || Object.keys(developer.workHistory || []).length > 0" class="work-history">
                    <h3>
                        Work History
                        <i v-if="isSelf && workHistoryMode === 'display'" class="fas fa-pencil-alt edit-icon" @click="toggleEditWorkHistory()"></i>
                    </h3>

                    <ul v-if="workHistoryMode === 'display'" v-for="workItem in developer.workHistory">
                        <li>{{workItem.place}}</li>
                        <li v-if="workItem.title">{{workItem.title}}</li>
                        <li v-if="workItem.start">{{workItem.start}} <template v-if="workItem.end">- {{workItem.end}}</template></li>
                    </ul>

                    <edit-work-history v-if="workHistoryMode === 'edit'" v-on:doneEditing="workHistoryMode = 'display'"></edit-work-history>
                </div>

                <div v-if="isSelf || Object.keys(developer.educationHistory || {}).length > 0" class="education-history">
                    <h3>
                        Education History
                        <i v-if="isSelf && educationMode === 'display'" class="fas fa-pencil-alt edit-icon" @click="toggleEditEducation()"></i>
                    </h3>

                    <ul v-if="educationMode === 'display'" v-for="educationItem in developer.educationHistory">
                        <li>{{educationItem.place}}</li>
                        <li v-if="educationItem.title">{{educationItem.title}}</li>
                        <li v-if="educationItem.start">{{educationItem.start}} <template v-if="educationItem.end">- {{educationItem.end}}</template></li>
                    </ul>

                    <edit-education-history v-if="educationMode === 'edit'" v-on:doneEditing="educationMode = 'display'"></edit-education-history>
                </div>
            </div>

            <div class="edit-options" v-if="isSelf">

                <template v-if="displayMode === 'normal'">
                    <div class="upload-avatar">
                        <input type="file" name="avatar" @change="updateUploadedAvatarName"
                               accept="image/jpeg, image/png"/>
                    </div>

                    <button @click="displayMode = 'editAccountInformation'">Edit Account Settings</button>
                    <button @click="displayMode = 'editBasicDetails'">Edit Bio Details</button>
                    <button @click="displayMode = 'editNetworking'">Edit Networking Details</button>
                </template>
            </div>

            <edit-account-info v-if="displayMode === 'editAccountInformation'"
                               v-on:doneEditing="displayMode = 'normal'"></edit-account-info>
            <edit-basic-details v-if="displayMode === 'editBasicDetails'"
                                v-on:doneEditing="displayMode = 'normal'"></edit-basic-details>
            <edit-networking v-if="displayMode === 'editNetworking'"
                             v-on:doneEditing="displayMode = 'normal'"></edit-networking>


            <template v-if="displayMode !== 'banDeveloper'">
                <button class="ban-button" v-if="canBan && !developer.isBanned" @click="displayMode = 'banDeveloper'">
                    Ban {{developer.alias}}
                </button>
                <button class="ban-button" v-if="canBan && developer.isBanned" @click="displayMode = 'banDeveloper'">
                    Un-Ban {{developer.alias}}
                </button>
            </template>

            <ban-developer v-if="displayMode === 'banDeveloper'" v-on:doneEditing="displayMode = 'normal'">
            </ban-developer>
        </div>

    </section>
</template>


<script>
    import _ from 'lodash';
    import bus from '../../vueGlobalEventBus';
    import editAccountInfo from './Widgets/EditAccountInfo';
    import editBasicDetails from './Widgets/EditDeveloperBasicDetails';
    import editRolesAndSkills from './Widgets/EditDeveloperRolesAndSkills';
    import editNetworking from './Widgets/EditDeveloperNetworking'
    import editWebsites from './Widgets/EditDeveloperWebsites';
    import editWorkHistory from './Widgets/EditDeveloperWorkHistory';
    import editEducationHistory from './Widgets/EditDeveloperEducationHistory';
    import banDeveloper from "./Widgets/BanDeveloper";

    //    import AdContainer from './Widgets/AdContainer.vue'

    export default {
        name: 'DeveloperCompanionContent',
        data() {
            return {
                savingFollowingChange: false,
                displayMode: 'normal',
                websiteListMode: 'display',
                roleSkillListMode: 'display',
                workHistoryMode: 'display',
                educationMode: 'display'
            }
        },

        components: {
            'edit-account-info': editAccountInfo,
            'edit-basic-details': editBasicDetails,
            'edit-roles-and-skills': editRolesAndSkills,
            'edit-networking': editNetworking,
            'edit-websites': editWebsites,
            'edit-work-history': editWorkHistory,
            'edit-education-history': editEducationHistory,
            'ban-developer': banDeveloper
        },

        computed: {
            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            developer() {
                return this.$store.state.developerPageModel.developerInformation;
            },

            showBasicInfo() {
                return this.developerFullName !== '';
            },

            developerFullName() {
                return [this.developer.firstName, this.developer.lastName].join(' ');
            },

            developerAge() {
                let birthday = new Date(),
                    ageDate;

                if (!this.developer.useBirth) {
                    return;
                }

                birthday.setYear(this.developer.birthYear);
                birthday.setMonth(this.developer.birthMonth - 1);
                birthday.setDate(this.developer.birthDay);

                ageDate = new Date(Date.now() - birthday.getTime());
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            },

            developerBasicDetails() {
                function capitalizeFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                let details = [];
                if (this.developer.useBirth) {
                    details.push(this.developerAge);
                }

                if (['male', 'female', 'nonbinary'].indexOf(this.developer.gender) > -1) {
                    details.push(capitalizeFirstLetter(this.developer.gender));
                }

                return details.join(' / ');
            },

            showRoleTags() {
                return this.isSelf ||
                    this.developer.isProducer ||
                    this.developer.isDesigner ||
                    this.developer.isArtist ||
                    this.developer.isProgrammer ||
                    this.developer.isWriter ||
                    this.developer.isMusician ||
                    this.developer.isSfxArtist ||
                    this.developer.isTester;
            },

            showSkillTags() {
                return this.isSelf || this.developer.skills.length > 0;
            },

            showContactOptions() {
                return this.$store.state.loggedUserModel.isLoggedIn && this.$store.state.loggedUserModel.info.id !== this.developer.id;
            },

            showWebsites() {
                let developer = this.developer;

                if (!developer) {
                    return false;
                }

                return this.isSelf || Object.keys(developer.personalWebsites).length > 0;
            },

            showGames() {
                return this.developer.games.length > 0;
            },

            showFollowOption() {
                return this.$store.state.developerPageModel.retrievedConnections;
            },

            isFollowing() {
                let connections = this.$store.state.developerPageModel.developerConnections,
                    foundSelf = false;

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

            showInviteOption() {
                let gamesOwnerOf = _.filter(this.$store.state.loggedUserModel.games, function (game) {
                    return game.moderatorLevel === 'owner';
                });

                return gamesOwnerOf && gamesOwnerOf.length > 0;
            },

            isSelf() {
                return this.$store.state.loggedUserModel.isLoggedIn && this.developer && this.developer.id === this.$store.state.loggedUserModel.info.id;
            },

            canBan() {
                return this.$store.state.loggedUserModel.isLoggedIn && this.developer && !this.isSelf && this.$store.state.loggedUserModel.info.siteModCanBan;
            },

            developerIsOnline() {
                let onlineUsers = this.$store.state.onlineUsersModel.onlineUsers;
                let developerIsOnline = false;
                let developerId = this.developer.id;

                onlineUsers.forEach(function (onlineUser) {
                    if (onlineUser.id === developerId) {
                        developerIsOnline = true;
                    }
                });

                return developerIsOnline;
            }
        },

        methods: {
            getSkill(skillId) {
                return this.skillList[skillId]
                    ? this.skillList[skillId].skill
                    : '';
            },

            sendMail() {
                this.$router.push({
                    path: '/Inbox/Compose',
                    query: {toId: this.developer.id, toAlias: this.developer.alias}
                });
            },

            sendInvite() {
                this.$router.push({path: `/InviteToGame/${this.developer.stringUrl}`});
            },

            openConversation() {
                bus.$emit('privateChatOpenConversation', this.developer)
            },

            updateFollowStatus() {
                if (this.savingFollowingChange) {
                    return;
                }

                this.savingFollowingChange = true;
                this.$store.dispatch('developerPage/updateFollowStatus');
            },

            updateUploadedAvatarName(e) {
                let input = e.target,
                    reader,
                    self = this;

                if (input.files.length === 0) {
                    return;
                }

                if (input.files && input.files[0]) {
                    reader = new FileReader();

                    reader.onload = function (e) {
                        self.uploadedImageSrc = e.target.result;
                    };

                    reader.readAsDataURL(input.files[0]);
                }

                let avatarTooBig = e.target.files[0].size > 10 * 1024 * 1024;
                this.formErrors = false;

                if (avatarTooBig) {
                    alert("Maximum filesize for an Avatar is 10MB");
                } else {
                    this.$store.dispatch('developerPage/SaveAvatar', e.target.files[0]);
                }
            },

            toggleEditWebsites(){
                this.websiteListMode = this.websiteListMode === 'display'
                    ? 'edit'
                    : 'display';
            },

            toggleEditRolesSkills() {
                this.roleSkillListMode = this.roleSkillListMode === 'display'
                    ? 'edit'
                    : 'display';
            },

            toggleEditWorkHistory(){
                this.workHistoryMode = this.workHistoryMode === 'display'
                    ? 'edit'
                    : 'display';
            },

            toggleEditEducation(){
                this.educationMode = this.educationMode === 'display'
                    ? 'edit'
                    : 'display';
            },

            getLinkIcon(url){
                if(url.includes("facebook")){
                    return 'fab fa-facebook-f';
                }

                if(url.includes("twitter")){
                    return 'fab fa-twitter';
                }

                if(url.includes("discord")){
                    return 'fab fa-discord';
                }

                if(url.includes("linkedin")){
                    return 'fab fa-linkedin';
                }

                if(url.includes("instagram")){
                    return 'fab fa-instagram';
                }

                return 'fas fa-link';
            }
        },

        mounted() {

        },

        watch: {
            'isFollowing'() {
                this.savingFollowingChange = false;
            }
        }
    }
</script>