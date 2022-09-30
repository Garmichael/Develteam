<template>
    <article id="classifieds">

        <div class="button-container">
            <router-link to="/Classifieds/New" class="button" v-if="isLoggedIn">Submit a Classifieds Post</router-link>
        </div>

        <section :class="{'filter-controls': true, 'disabled': isFetching}">
            <div class="filter-control">
                <div class="filter-group">
                    <label>Type</label>
                    <ul>
                        <li v-for="(role, index) in postTypes"
                            :class="[{selected: index === selectedPostTypeId}]"
                            @click="setPostTypeId(index)"
                        >
                            {{role}}
                        </li>
                    </ul>
                </div>

                <div class="filter-group">
                    <label>Roles</label>
                    <ul>
                        <li v-for="(role, index) in roles"
                            :class="[{selected: index === selectedRoleId}]"
                            @click="setRoleId(index)"
                        >
                            {{role}}
                        </li>
                    </ul>
                </div>

                <template v-if="skillFilterId === 0">
                    <div class="filter-group">
                        <label>Skill</label>
                        <div class="skill-input">
                            <input type="text" v-model="skillSearchText" :disabled="isFetching"/>
                            <button class="button" v-if="skillSearchText.length > 0">X</button>
                        </div>
                    </div>

                    <div class="filter-group">
                    <span v-if="matchingSkills.length === 0">
                        No matching tags... Search by skill name, or type a category
                        to see all entries. Categories: Art, Software, Development, Engine, Writing, Production, Testing
                    </span>

                        <ul class="skills">
                            <li v-for="skill in matchingSkills" @click="setSkillId(skill.id)">
                                {{skill.skill}}
                            </li>
                        </ul>
                    </div>
                </template>

                <template v-if="skillFilterId > 0">
                    <div class="filter-group">
                        <label>Skill</label>

                        <ul class="skills">
                            <li class="selected" @click="setSkillId(0)">
                                <i class="fas fa-minus-circle"></i>{{getSkill(skillFilterId)}}
                            </li>
                        </ul>
                    </div>
                </template>
            </div>
        </section>

        <section class="loader" v-if="isFetching">
            <loader-large></loader-large>
        </section>

        <section class="no-posts" v-if="!isFetching && posts.length === 0">
            <div class="validation-messages friendly">
                No matching results!
                <template v-if="selectedPostTypeId === 0">Skill tags are still new for Game Projects. Try removing the
                    Skill filter.
                </template>
            </div>
        </section>

        <section class="classifieds-posts" v-if="!isFetching && posts.length > 0">
            <div class="classifieds-post" v-for="post in posts">
                <header>
                    <div class="avatar-container">
                        <avatar :profile-data="post.posterDetails" :profile-type="post.posterType" size="large"
                                :show-xp-info="true"></avatar>
                    </div>

                    <div class="text-container">
                        <h1 v-if="post.posterType === 'developer'" class="title">
                            <i class="fas fa-user fa-fw"></i>
                            <router-link :to="`/Developer/${post.posterDetails.stringUrl}`" data-router-link="true">
                                {{post.posterDetails.alias}}
                            </router-link>
                        </h1>

                        <h1 v-if="post.posterType === 'game'" class="title">
                            <i class="fas fa-gamepad fa-fw"></i>
                            <router-link :to="`/Game/${post.posterDetails.stringUrl}`" data-router-link="true">
                                {{post.posterDetails.alias}}
                            </router-link>
                        </h1>

                        <h1 class="title">{{post.title}}</h1>
                    </div>

                    <div class="post-date">
                        <span>{{post.postDate | formatDateWithoutTimeRelative}}</span>
                        <span>{{post.postDate | formatDateWithJustTime}}</span>
                    </div>
                </header>

                <div class="sub-header">
                    <span v-if="post.posterType === 'game'">Recruiting</span>
                    <div class="role-list">
                        <router-link v-if="post.roleDesigner" :to="'/Browse/Developers?seekingRole=designers'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Designers</template>
                            <template v-else>Designer</template>
                        </router-link>

                        <router-link v-if="post.roleArtist" :to="'/Browse/Developers?seekingRole=artists'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Artists</template>
                            <template v-else>Artist</template>
                        </router-link>

                        <router-link v-if="post.roleProgrammer" :to="'/Browse/Developers?seekingRole=programmers'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Programmers</template>
                            <template v-else>Programmer</template>
                        </router-link>

                        <router-link v-if="post.roleWriter" :to="'/Browse/Developers?seekingRole=writers'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Writers</template>
                            <template v-else>Writer</template>
                        </router-link>

                        <router-link v-if="post.roleMusician" :to="'/Browse/Developers?seekingRole=musicians'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Musicians</template>
                            <template v-else>Musician</template>
                        </router-link>

                        <router-link v-if="post.roleSfxArtist" :to="'/Browse/Developers?seekingRole=sfx'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Sfx Artists</template>
                            <template v-else>Sfx Artist</template>
                        </router-link>

                        <router-link v-if="post.roleTester" :to="'/Browse/Developers?seekingRole=testers'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Testers</template>
                            <template v-else>Tester</template>
                        </router-link>

                        <router-link v-if="post.roleProducer" :to="'/Browse/Developers?seekingRole=producers'" class="role-tag">
                            <template v-if="post.posterType === 'game'">Producers</template>
                            <template v-else>Producer</template>
                        </router-link>
                    </div>

                    <div class="skill-list">
                        <router-link v-for="skillId in post.skills"
                                     :to="'/Browse/Developers?seekingSkill=' + skillId"
                                     class="skill-tag">
                            {{getSkill(skillId)}}
                        </router-link>
                    </div>
                </div>

                <markdown-content v-if="!editMode" classes="content" :content="post.pitch"></markdown-content>

                <div class="contact-container" v-if="!canEdit(post)">
                    <span @click="sendMail(post)"><i class="far fa-envelope"></i> Mail</span>
                    <span @click="openConversation(post)"><i class="far fa-comment-alt"></i> Chat</span>
                </div>

                <div class="edit-container" v-if="canEdit(post)">
                    <router-link :to="'/Classifieds/Edit/' + post.id" class="button" v-if="isLoggedIn"><i
                            class="fas fa-pencil-alt"></i> Edit
                    </router-link>
                </div>

            </div>
        </section>
    </article>
</template>

<script>
    import bus from '../../vueGlobalEventBus';

    export default {
        name: "Classifieds",

        data() {
            return {
                postTypes: ['Game Projects', 'Developers'],
                selectedPostTypeId: 0,
                roles: ['All', 'Designers', 'Artists', 'Programmers', 'Writers', 'Musicians', 'Sfx Artists', 'Testers', 'Producers'],
                selectedRoleId: 0,
                skillSearchText: '',
                skillFilterId: 0,

                isFetching: false,
                editMode: false
            }
        },

        computed: {
            loggedUserId() {
                return this.$store.state.loggedUserModel.info.id;
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            GameIdsOwned() {
                let gameIds = [];

                if (this.isLoggedIn) {
                    let games = this.$store.state.loggedUserModel.games;
                    for (let i = 0; i < games.length; i++) {
                        gameIds.push(games[i].id);
                    }
                }

                return gameIds;
            },

            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            posts() {
                return this.$store.state.classifiedsModel.posts;
            },

            matchingSkills() {
                let matchingSkills = [];

                if (this.skillSearchText.length >= 1) {
                    for (let skillId in this.skillList) {
                        let skill = this.skillList[skillId];
                        let skillName = skill.category.toLowerCase() + ' ' + skill.skill.toLowerCase();

                        if (skillName.toLowerCase().includes(this.skillSearchText.toLowerCase())
                        ) {
                            matchingSkills.push(skill);
                        }
                    }
                }

                matchingSkills = _.sortBy(matchingSkills, function (skill) {
                    return skill.skill;
                });

                return matchingSkills;
            }
        },

        methods: {
            getSkill(skillId) {
                return this.skillList[skillId]
                    ? this.skillList[skillId].skill
                    : '';
            },

            setSkillId(skillId) {
                if (this.isFetching) {
                    return;
                }

                this.skillFilterId = skillId;
                this.skillSearchText = '';
                this.fetchNewResults();
            },

            setRoleId(roleId) {
                if (this.isFetching) {
                    return;
                }

                this.selectedRoleId = roleId;
                this.fetchNewResults();
            },

            setPostTypeId(postTypeId) {
                if (this.isFetching) {
                    return;
                }

                this.selectedPostTypeId = postTypeId;
                this.fetchNewResults();
            },

            fetchNewResults() {
                let self = this;
                this.isFetching = true;

                this.$store.dispatch('classifiedsPage/getClassifieds', {
                    postType: this.postTypes[this.selectedPostTypeId].toLowerCase(),
                    role: this.roles[this.selectedRoleId].toLowerCase(),
                    skillId: this.skillFilterId,

                    callback: function (responseData) {
                        self.isFetching = false;
                    }
                });
            },

            canEdit(post) {
                let isDevEditable = post.posterType === 'developer' && post.posterDetails.id === this.loggedUserId;
                let isGameEditable = post.posterType === 'game' && this.GameIdsOwned.includes(post.posterDetails.id);
                return isDevEditable || isGameEditable;
            },

            sendMail(post) {
                let query = {
                    toId: post.posterType === 'developer' ? post.posterDetails.id : post.posterDetails.ownerId,
                    toAlias: post.posterType === 'developer' ? post.posterDetails.alias : post.posterDetails.ownerAlias
                };

                this.$router.push({
                    path: '/Inbox/Compose',
                    query: query
                });
            },

            openConversation(post) {
                bus.$emit('privateChatOpenConversation',
                    {
                        id: post.posterType === 'developer' ? post.posterDetails.id : post.posterDetails.ownerId,
                        alias: post.posterType === 'developer' ? post.posterDetails.alias : post.posterDetails.ownerAlias
                    });
            },
        },

        mounted() {
            this.fetchNewResults();
            this.$store.dispatch('loggedUserModel/CatchUpOnClassifieds');
        }
    }
</script>