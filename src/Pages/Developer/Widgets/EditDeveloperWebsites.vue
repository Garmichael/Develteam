<template>
    <section id="edit-developer-websites">
        <div class="edit-container">
            <div class="website-list">
                <div class="set entered" v-for="(website, index) in formData.personalWebsites">
                    <span><input type="text" placeholder="Website Name" v-model="website.name"
                                 :class="[{invalid: website.name === ''}]"/></span>
                    <span><input type="text" placeholder="Website URL" v-model="website.url"
                                 :class="[{invalid: !isValidUrl(website.url)}]"/></span>

                    <button class="button small-button" @click.prevent="removePersonalWebsite(index)">
                        <i class="fa-trash fas"></i>
                    </button>

                    <button v-if="index > 0" class="button small-button" @click.prevent="moveWebsiteUp(index)">
                        <i class="fa-arrow-up fas"></i>
                    </button>

                    <button v-if="index !== formData.personalWebsites.length -1" class="button small-button" @click.prevent="moveWebsiteDown(index)">
                        <i class="fa-arrow-down fas"></i>
                    </button>
                </div>

                <div class="set entered">
                    <button class="button small-button" @click.prevent="addAnotherPersonalWebsite"><i class="fas fa-plus"></i></button>
                </div>
            </div>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges" :disabled="!allEntriesAreValid()">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    import validator from 'validator';
    import Vue from 'vue';

    export default {
        name: 'EditDeveloperWebsites',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
                newWebsiteName: '',
                newWebsiteUrl: ''
            }
        },

        computed: {},

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                let isValid = this.allEntriesAreValid();

                for(let i = 0; i < this.formData.personalWebsites.length; i++){
                    if(this.formData.personalWebsites[i].url.slice(0, 4).toLowerCase() !== 'http'){
                        Vue.set(this.formData.personalWebsites[i], 'url', 'https://' + this.formData.personalWebsites[i].url);
                    }
                }

                this.formData.personalWebsites.forEach((site) => {
                    if (site.name.trim() === '' || !this.isValidUrl(site.url)) {
                        isValid = false;
                    }
                });

                if (isValid) {
                    this.$store.dispatch('developerPage/updateWebsites', {
                        developerId: this.formData.id,
                        personalWebsites: this.formData.personalWebsites
                    });
                }
            },

            allEntriesAreValid() {
                let isValid = true;

                this.formData.personalWebsites.forEach((site) => {
                    if (site.name.trim() === '' || !this.isValidUrl(site.url)) {
                        isValid = false;
                    }
                });

                return isValid;
            },

            addAnotherPersonalWebsite() {
                this.formData.personalWebsites.push({
                    name: '',
                    url: ''
                })
            },

            removePersonalWebsite(entry) {
                Vue.delete(this.formData.personalWebsites, entry);
            },

            moveWebsiteUp(entry) {
                const swapA = this.formData.personalWebsites[entry];
                const swapB = this.formData.personalWebsites[entry - 1];
                Vue.set(this.formData.personalWebsites, entry, swapB);
                Vue.set(this.formData.personalWebsites, entry - 1, swapA);
            },

            moveWebsiteDown(entry) {
                const swapA = this.formData.personalWebsites[entry];
                const swapB = this.formData.personalWebsites[entry + 1];
                Vue.set(this.formData.personalWebsites, entry, swapB);
                Vue.set(this.formData.personalWebsites, entry + 1, swapA);
            },

            isValidUrl(url) {
                return validator.isURL(url);
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