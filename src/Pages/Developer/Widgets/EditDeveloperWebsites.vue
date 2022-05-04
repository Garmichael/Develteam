<template>
    <section id="edit-developer-websites">
        <div class="websites">
            <h1>Websites</h1>

            <label>Facebook Url</label>
            <span><input type="text" placeholder="Facebook URL" v-model="formData.websiteFacebook"/></span>
            <div v-if="!isUrl(formData.websiteFacebook)" class="validation-messages error">The Facebook URL is not properly formatted</div>

            <label>Twitter Url</label>
            <span><input type="text" placeholder="Twitter URL" v-model="formData.websiteTwitter"/></span>
            <div v-if="!isUrl(formData.websiteTwitter)" class="validation-messages error">The Twitter URL is not properly formatted</div>

            <label>Instagram Url</label>
            <span><input type="text" placeholder="Instagram URL" v-model="formData.websiteInstagram"/></span>
            <div v-if="!isUrl(formData.websiteInstagram)" class="validation-messages error">The Instagram URL is not properly formatted</div>

            <label>LinkedIn Url</label>
            <span><input type="text" placeholder="LinkedIn URL" v-model="formData.websiteLinkedIn"/></span>
            <div v-if="!isUrl(formData.websiteLinkedIn)" class="validation-messages error">The LinkedIn URL is not properly formatted</div>

            <div class="other-websites">
                <label>Other Websites</label>
                <div class="set entered" v-for="(key, value) in formData.personalWebsites">
                    <span><input type="text" placeholder="Website Name" :value="value"/></span>
                    <span><input type="text" placeholder="Website URL" :value="key"/></span>
                    <button class="button" @click.prevent="removePersonalWebsite(value)">Remove this Website</button>
                </div>

                <div class="set entered">
                    <span><input type="text" placeholder="Website Name" v-model="newWebsiteName"/></span>
                    <span><input type="text" placeholder="Website URL" v-model="newWebsiteUrl"/></span>

                    <button class="button" @click.prevent="addAnotherPersonalWebsite">Add another Website</button>
                </div>
            </div>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
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
                if (this.newWebsiteName.trim() !== '' && validator.isURL(this.newWebsiteUrl)) {
                    this.addAnotherPersonalWebsite();
                }

                this.$store.dispatch('developerPage/updateWebsites', {
                    developerId: this.formData.id,
                    websiteFacebook: this.formData.websiteFacebook,
                    websiteTwitter: this.formData.websiteTwitter,
                    websiteInstagram: this.formData.websiteInstagram,
                    websiteLinkedIn: this.formData.websiteLinkedIn,
                    personalWebsites: this.formData.personalWebsites
                });
            },

            isUrl(content){
                return validator.isURL(content) || content.length <= 3;
            },

            addAnotherPersonalWebsite(){
                if (this.newWebsiteName.trim() === '' || this.newWebsiteUrl.trim() === '' || !validator.isURL(this.newWebsiteUrl)) {
                    return;
                }

                if (!/^(?:f|ht)tps?\:\/\//.test(this.newWebsiteUrl)) {
                    this.newWebsiteUrl = "http://" + this.newWebsiteUrl;
                }

                if (!this.formData.personalWebsites) {
                    this.formData.personalWebsites = {}
                }
                Vue.set(this.formData.personalWebsites, this.newWebsiteName, this.newWebsiteUrl);

                this.newWebsiteName = '';
                this.newWebsiteUrl = '';
            },

            removePersonalWebsite(entry){
                Vue.delete(this.formData.personalWebsites, entry);
            },
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