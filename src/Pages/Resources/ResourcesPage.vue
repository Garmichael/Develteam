<template>
    <article id="resources-page">

        <transition name="fade" mode="out-in">
            <div v-if="resources.length === 0" key="still-loading">
                <loader-large></loader-large>
            </div>
            <div v-else key="done-loading">
                <ul v-for="resource in resources" v-if="resource.selected" id="resource-category-switcher">
                    <li v-for="section in resource.sections" :class="{selected: section.selected}">
                        <router-link v-if="!section.selected" :to="'/Resources/'+resource.id+'/'+section.id" :title="section.text">
                            <i :class="'fa ' + section.icon "></i> {{section.text}}
                        </router-link>
                        <span v-else><i :class="'fa ' + section.icon "></i> {{section.text}}</span>
                    </li>
                </ul>

                <div v-for="resource in resources" v-if="resource.selected" id="resource-list">
                    <ul v-for="section in resource.sections" v-if="section.selected" class="resource-items">
                        <li v-for="resourceItem in section.resourceItems" v-if="resourceItem.allVotes > -2" :id="'resource-item-' + resourceItem.id" class="resource-item">
                            <h4><a :href="resourceItem.url" target="_blank">{{resourceItem.text}}</a></h4>

                            <voting-widget parent-type="resource" :parent-id="resourceItem.id" :initial-points="resourceItem.allVotes"></voting-widget>

                        </li>
                    </ul>
                </div>

                <div v-if="showSubmitResourceForm" id="submit-new-resource">

                    <h2>Submit a New Resource</h2>
                    <form v-if="!$store.state.resourcesPageModel.submittedNewResource">
                        <div class="container">
                            <input type="text" id="new-resource-name" :class="{invalid: addResourceWebsiteNameInvalid}" @keyup="addResourceWebsiteNameInvalid = false" placeholder="Website Name" v-model="addResourceWebsiteName"/>
                            <input type="text" id="new-resource-url" :class="{invalid: addResourceWebsiteUrlInvalid}" @keyup="addResourceWebsiteUrlInvalid = false" placeholder="Website URL" v-model="addResourceWebsiteUrl"/>
                        </div>

                        <div class="container">
                            <select id="new-resource-category" v-model="addResourceCategory">
                                <option value="assets">Assets</option>
                                <option value="devtools">Dev Tools</option>
                            </select>

                            <select id="new-resource-section-assets" v-model="addResourceSectionAssets" v-if="addResourceCategory === 'assets'">
                                <option value="graphics">Graphics</option>
                                <option value="fonts">Fonts</option>
                                <option value="sfx">Sound Effects</option>
                                <option value="music">Music</option>
                            </select>

                            <select id="new-resource-section-devtools" v-model="addResourceSectionDevtools" v-if="addResourceCategory === 'devtools'">
                                <option value="collaboration">Collaboration</option>
                                <option value="engines">Game Engines</option>
                                <option value="programming">Programming</option>
                                <option value="graphics">Graphics</option>
                                <option value="audio">Audio</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <input type="submit" value="Submit" id="submit-form" @click="addResource"/>
                    </form>

                    <div v-else><p>Thank you for submitting a new Resource. <a @click.prevent="$store.state.resourcesPageModel.submittedNewResource = false">Submit Another</a>?</p></div>
                </div>
            </div>
        </transition>
    </article>
</template>

<script>
    import validator from 'validator'

    export default {
        name: 'ResourcesPage',
        data(){
            return {
                addResourceCategory: 'assets',
                addResourceSectionAssets: 'graphics',
                addResourceSectionDevtools: 'collaboration',
                addResourceWebsiteName: '',
                addResourceWebsiteUrl: '',
                addResourceWebsiteNameInvalid: false,
                addResourceWebsiteUrlInvalid: false
            }
        },

        mounted() {
            if (this.resources.length === 0) {
                this.$store.dispatch('resourcesPage/populateResources');
            }
        },

        computed: {
            resources(){
                let resources = this.$store.state.resourcesPageModel.resources;

                if (resources.length > 0) {
                    this.setSelected(resources);
                }

                return resources;
            },
            showSubmitResourceForm(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            }
        },

        methods: {
            addResource(e) {
                let addedResourceData = {
                    category: this.addResourceCategory,
                    websiteName: this.addResourceWebsiteName,
                    websiteUrl: this.addResourceWebsiteUrl
                };

                if (this.addResourceCategory === 'assets') {
                    addedResourceData.section = this.addResourceSectionAssets;
                } else {
                    addedResourceData.section = this.addResourceSectionDevtools;
                }

                if (this.addResourceWebsiteName.trim().length === 0) {
                    this.addResourceWebsiteNameInvalid = true;
                }

                if (this.addResourceWebsiteUrl.trim().length === 0 || !validator.isURL(this.addResourceWebsiteUrl)) {
                    this.addResourceWebsiteUrlInvalid = true;
                }

                if (!/^(?:f|ht)tps?\:\/\//.test(this.addResourceWebsiteUrl)) {
                    this.addResourceWebsiteUrl = "http://" + this.addResourceWebsiteUrl;
                }


                if (!this.addResourceWebsiteNameInvalid && !this.addResourceWebsiteUrlInvalid) {
                    this.$store.dispatch('resourcesPage/submitResource', addedResourceData);
                }

                e.preventDefault();
            },

            setSelected: function (resources) {
                let self = this,
                    path = self.$route.path.substring(1).split('/'),
                    selectedResourceIndex = -1,
                    selectedSectionIndex = -1;

                if (!path[1]) {
                    path[1] = '';
                }

                if (!path[2]) {
                    path[2] = '';
                }

                resources.forEach(function (resource, index) {
                    self.$set(resource, 'selected', path[1].toLowerCase() === resource.id.toLowerCase());

                    if (resource.selected) {
                        selectedResourceIndex = index;
                    }

                    resource.sections.forEach(function (section, index) {
                        self.$set(section, 'selected', resource.selected && path[2].toLowerCase() === section.id.toLowerCase());

                        if (section.selected) {
                            selectedSectionIndex = index;
                        }
                    });
                });

                if (selectedResourceIndex === -1) {
                    self.$set(resources[0], 'selected', true);
                    selectedResourceIndex = 0;
                }

                if (selectedSectionIndex === -1) {
                    self.$set(resources[selectedResourceIndex].sections[0], 'selected', true);
                    selectedResourceIndex = 0;
                }

            }

        }
    }
</script>