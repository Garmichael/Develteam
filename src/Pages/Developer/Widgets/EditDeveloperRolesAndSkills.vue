<template>
    <section id="edit-developer-roles-and-skills">
        <div class="edit-container roles-and-skills">
            <h1>Developer Role</h1>

            <input type="text" placeholder="Developer Roles (e.x: Pixel Artist, Engine Programmer, 3D Modeler...)"
                   v-model="formData.role"/>

            <div class="developer-roles">
                <label><input type="checkbox" v-model="formData.isProducer"/>Producer</label>
                <label><input type="checkbox" v-model="formData.isDesigner"/>Designer</label>
                <label><input type="checkbox" v-model="formData.isArtist"/>Artist</label>
                <label><input type="checkbox" v-model="formData.isProgrammer"/>Programmer</label>
                <label><input type="checkbox" v-model="formData.isWriter"/>Writer</label>
                <label><input type="checkbox" v-model="formData.isMusician"/>Musician</label>
                <label><input type="checkbox" v-model="formData.isSfxArtist"/>SFX Artist</label>
                <label><input type="checkbox" v-model="formData.isTester"/>Tester</label>
            </div>

            <label>Skills</label>
            <div class="existing-skill-list">
                <span v-if="formData.skills && formData.skills.length > 0"
                      v-for="skillId in formData.skills"
                      class="matching-skill-tag"
                      @click="removeSkill(skillId)"
                >
                    <i class="fas fa-minus-circle"></i>  {{skillList[skillId].skill}}
                </span>
                <span v-if="formData.skills && formData.skills.length === 0">No skills entered</span>
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

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    export default {
        name: 'EditDeveloperRolesAndSkills',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
                enteredSkill: ''
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
                            if (!this.formData.skills.includes(skill.id)) {
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
                this.formData.skills.push(skillId);
            },

            removeSkill(skillId) {
                this.formData.skills = _.remove(this.formData.skills, function (id) {
                    return id !== skillId;
                });
            },

            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                let skillIds = [];

                this.formData.skills.forEach((skill) => {
                    skillIds.push(skill.id);
                });

                this.$store.dispatch('developerPage/updateRolesAndSkills', {
                    developerId: this.formData.id,
                    role: this.formData.role,
                    isProducer: this.formData.isProducer,
                    isDesigner: this.formData.isDesigner,
                    isArtist: this.formData.isArtist,
                    isProgrammer: this.formData.isProgrammer,
                    isWriter: this.formData.isWriter,
                    isMusician: this.formData.isMusician,
                    isSfxArtist: this.formData.isSfxArtist,
                    isTester: this.formData.isTester,
                    skills: this.formData.skills
                });
            }
        },

        watch: {
            '$store.state.developerPageModel.developerInformation'() {
                this.formData = _.clone(this.$store.state.developerPageModel.developerInformation);
            },
        },

        sockets: {
            'developerInformationUpdated'(data) {
                if (data.id === this.formData.id) {
                    this.$emit('doneEditing');
                }
            }
        }
    }
</script>