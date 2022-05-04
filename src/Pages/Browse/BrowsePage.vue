<template>
    <article id="browse-page">
        <div class="option-row" v-if="pageId==='games' && isLoggedIn">
            <router-link to="/CreateNewGameProject" class="button">Create a Game Project</router-link>
        </div>

        <section id="browse-results">

            <section v-if="filterControls" id="browse-filter-controls">

                <div v-if="filterControls.showOptions.length > 0" class="filter-control">
                    <label>Show</label>
                    <ul>
                        <li v-for="option in filterControls.showOptions" @click="setOption(option.id)"
                            :class="{selected: option.selected}">
                            {{option.label}}
                        </li>
                    </ul>
                </div>

                <div v-if="filterControls.filterOptions.length > 0" class="filter-control">
                    <label>Filter By</label>
                    <ul>
                        <li v-for="option in filterControls.filterOptions" @click="setOption(option.id)"
                            :class="{selected: option.selected}">
                            {{option.label}}
                        </li>
                    </ul>
                </div>

                <div v-if="showRecruitingOptions && filterControls.recruitingOptions.length > 0" class="filter-control">
                    <label>Recruiting</label>
                    <ul>
                        <li v-for="option in filterControls.recruitingOptions" @click="setOption(option.id)"
                            :class="{selected: option.selected}">
                            {{option.label}}
                        </li>
                    </ul>
                </div>

                <div v-if="filterControls.sortOptions.length > 0" class="filter-control">
                    <label>Sort By</label>
                    <ul>
                        <li v-for="option in filterControls.sortOptions" @click="setOption(option.id)"
                            :class="{selected: option.selected}">
                            {{option.label}}
                        </li>
                    </ul>
                </div>

                <template v-if="filterControls.showSkills">
                    <template v-if="skillFilterId === 0">
                        <div class="filter-control">
                            <label>Skill</label>
                            <input type="text" placeholder="Search for Skill Tags..." v-model="enteredSkill"/>
                            <button class="button" v-if="enteredSkill.length > 0" @click="enteredSkill=''">X</button>
                        </div>

                        <div class="filter-control">
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
                        <div class="filter-control">
                            <label>Skill</label>

                            <ul class="skills">

                                <li class="selected" @click="setSkillId(0)">
                                    <i class="fas fa-minus-circle"></i>{{skillList[skillFilterId].skill}}
                                </li>
                            </ul>
                        </div>
                    </template>
                </template>

            </section>

            <section id="browse-pagination-top" class="pagination" v-if="browseResults.length > 0 && !isFetching">
                <label>page</label>
                <pagination :max-page="resultsPageTotal" :current-page="resultsPageCurrent" :spread="5"
                            @switchToPage="switchToResultsPage"></pagination>
            </section>

            <section id="browse-items">

                <div v-if="isFetching">
                    <loader-large></loader-large>
                </div>

                <div v-if="!isFetching">
                    <template v-if="browseResults.length > 0">
                        <browsePageDeveloperItem v-if="pageId==='developers'"
                                                 v-for="result in browseResults"
                                                 :details="result">
                        </browsePageDeveloperItem>

                        <browsePageGameItem v-if="pageId==='games'"
                                            v-for="result in browseResults"
                                            :details="result">
                        </browsePageGameItem>
                    </template>

                    <template v-if="browseResults.length === 0">
                        <div class="validation-messages friendly">
                            Sorry, no matching results were found.
                            <template v-if="pageId==='games'">Skill tags are still new for Game Projects. Try removing the
                                Skill filter.
                            </template>
                        </div>
                    </template>
                </div>

            </section>

            <section id="browse-pagination-bottom" class="pagination" v-if="browseResults.length > 0 && !isFetching">
                <label>page</label>
                <pagination :max-page="resultsPageTotal" :current-page="resultsPageCurrent" :spread="5"
                            @switchToPage="switchToResultsPage"></pagination>
            </section>

        </section>

    </article>
</template>


<script>
    import BrowsePageDeveloperItem from '../Browse/BrowsePageDeveloperItem.vue'
    import BrowsePageGameItem from '../Browse/BrowsePageGameItem.vue'

    export default {
        name: 'BrowsePage',
        metaInfo: {
            title: 'Develteam | Game Developer Community | Game dev team up'
        },

        data() {
            return {
                enteredSkill: '',
                skillFilterId: 0
            }
        },

        components: {
            'browsePageDeveloperItem': BrowsePageDeveloperItem,
            'browsePageGameItem': BrowsePageGameItem
        },

        mounted() {
            this.setInitialFilters();
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            pageId() {
                return this.$store.state.browsePageModel.pageId;
            },

            browseResults() {
                return this.$store.state.browsePageModel.browseResults;
            },

            filterControls() {
                return this.$store.state.browsePageModel.filterControls[this.pageId];
            },

            resultsPageCurrent() {
                return this.$store.state.browsePageModel.resultsPageCurrent;
            },

            resultsPageTotal() {
                return this.$store.state.browsePageModel.resultsPageTotal;
            },

            isFetching() {
                return this.$store.state.browsePageModel.isFetching;
            },

            showRecruitingOptions() {
                let isSeeking = false;

                this.$store.state.browsePageModel.filterControls[this.pageId].filterOptions.forEach(function (option) {
                    if (option.id === 'filter|seeking' && option.selected === true) {
                        isSeeking = true;
                    }
                });

                return isSeeking;
            },

            matchingSkills() {
                let matchingSkills = [];

                if (this.enteredSkill.length >= 1) {
                    for (let skillId in this.skillList) {
                        let skill = this.skillList[skillId];
                        let skillName = skill.category.toLowerCase() + ' ' + skill.skill.toLowerCase();

                        if (skillName.toLowerCase().includes(this.enteredSkill.toLowerCase())
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

        watch: {
            '$route': function () {
                this.setInitialFilters();
            }
        },

        methods: {
            setInitialFilters() {
                let seeking = this.$route.query.seeking,
                    showRole = this.$route.query.showRole,
                    seekingRole = this.$route.query.seekingRole,
                    seekingSkill = this.$route.query.seekingSkill;

                this.$store.dispatch('browsePage/updatePageId', {blockPopulateResults: true});

                if (seeking) {
                    this.$store.dispatch('browsePage/initializeFilterOption', 'filter|seeking');
                }

                if (showRole) {
                    this.$store.dispatch('browsePage/initializeFilterOption', 'show|' + showRole);
                }

                if (seekingRole) {
                    this.$store.dispatch('browsePage/initializeFilterOption', 'recruiting|' + seekingRole);
                }

                if (seekingSkill) {
                    this.skillFilterId = seekingSkill;
                    this.$store.dispatch('browsePage/initializeFilterOption', 'skill|' + seekingSkill);
                }

                this.$store.dispatch('browsePage/populateResults');
            },

            setSkillId(skillId) {
                this.skillFilterId = skillId;
                this.enteredSkill = '';
                this.setOption('skill|' + skillId);
            },

            setOption(id) {
                this.$store.dispatch('browsePage/updateFilterOptions', id);
            },

            switchToResultsPage(newPage) {
                this.$store.dispatch('browsePage/updateResultsPage', newPage)
            }
        }
    }
</script>