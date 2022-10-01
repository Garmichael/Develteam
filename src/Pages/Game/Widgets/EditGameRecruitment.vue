<template>
    <section id="edit-game-recruitment">

        <saver-large v-if="isSaving"></saver-large>

        <div v-if="!isSaving" class="recruiting-roles">
            <h1>Recruiting Role Titles</h1>
            <input type="text" v-model="roleTitles" maxlength="250"/>
        </div>

        <div v-if="!isSaving" class="recruiting-role-types">
            <h1>Recruiting Role Types</h1>
            <label><input type="checkbox" v-model="recruitingProducers"> Producers</label>
            <label><input type="checkbox" v-model="recruitingDesigners"> Designers</label>
            <label><input type="checkbox" v-model="recruitingArtists"> Artists</label>
            <label><input type="checkbox" v-model="recruitingProgrammers"> Programmers</label>
            <label><input type="checkbox" v-model="recruitingMusicians"> Musicians</label>
            <label><input type="checkbox" v-model="recruitingSfxArtists"> SFX Artists</label>
            <label><input type="checkbox" v-model="recruitingWriters"> Writers</label>
            <label><input type="checkbox" v-model="recruitingTesters"> Testers</label>
        </div>

        <label>Skills</label>
        <div class="existing-skill-list">
                <span v-if="skills && skills.length > 0"
                      v-for="skillId in skills"
                      class="matching-skill-tag"
                      @click="removeSkill(skillId)"
                >
                    <i class="fas fa-minus-circle"></i>  {{skillList[skillId].skill}}
                </span>
            <span v-if="skills && skills.length === 0">No skills entered</span>
        </div>

        <label>Add Skill</label>
        <div class="add-skill-form">
            <input type="text" placeholder="Search for Skill Tags..." v-model="enteredSkill"/>
            <button class="button" v-if="enteredSkill.length > 0" @click="enteredSkill=''">X</button>
        </div>

        <div class="matching-skill-list">
            <span v-if="matchingSkills.length === 0">No matching tags... Search by skill name, or type a category to see all entries.</span>
            <span v-if="matchingSkills.length === 0">Categories: Art, Software, Development, Engine, Writing, Production, Testing</span>
            <span v-for="skill in matchingSkills" @click="addSkill(skill.id)" class="matching-skill-tag">
                    <i class="fas fa-plus-circle"></i> {{skill.skill}}
                </span>
        </div>

        <div v-if="!isSaving" class="vitals">

            <div class="buttons">
                <button class="button minor" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>

        </div>
    </section>
</template>


<script>
    export default {
        name: 'EditGameRecruitment',
        props: ['game'],

        data() {
            return {
                roleTitles: this.game.seekingRoles,
                skills: _.clone(this.game.skills),
                enteredSkill: '',

                recruitingProducers: this.game.seekingProducers,
                recruitingDesigners: this.game.seekingDesigners,
                recruitingArtists: this.game.seekingArtists,
                recruitingProgrammers: this.game.seekingProgrammers,
                recruitingMusicians: this.game.seekingMusicians,
                recruitingSfxArtists: this.game.seekingSfxArtists,
                recruitingWriters: this.game.seekingWriters,
                recruitingTesters: this.game.seekingTesters,
                isSaving: false
            }
        },

        computed: {
            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            matchingSkills() {
                let matchingSkills = [];

                if (this.enteredSkill.length >= 1) {
                    for (let skillId in this.skillList) {
                        let skill = this.skillList[skillId];
                        let skillName = skill.category.toLowerCase() + ' ' + skill.skill.toLowerCase();

                        if (skillName.toLowerCase().includes(this.enteredSkill.toLowerCase())
                        ) {
                            if (!this.skills.includes(skill.id)) {
                                matchingSkills.push(skill);
                            }
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
            addSkill(skillId) {
                this.skills.push(skillId);
            },

            removeSkill(skillId) {
                this.skills = _.remove(this.skills, function (id) {
                    return id !== skillId;
                });
            },

            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                this.$store.dispatch('gamePage/updateRecruitment', {
                    gameId: this.game.id,
                    roleTitles: this.roleTitles,
                    skills: this.skills,
                    recruitingProducers: this.recruitingProducers,
                    recruitingDesigners: this.recruitingDesigners,
                    recruitingArtists: this.recruitingArtists,
                    recruitingProgrammers: this.recruitingProgrammers,
                    recruitingMusicians: this.recruitingMusicians,
                    recruitingSfxArtists: this.recruitingSfxArtists,
                    recruitingWriters: this.recruitingWriters,
                    recruitingTesters: this.recruitingTesters
                });

                this.isSaving = true;
            }
        },

        sockets: {
            'gameInformationUpdated'(data) {
                if (data.gameId === this.game.id) {
                    this.$emit('doneEditing');
                }
            }
        }
    }
</script>