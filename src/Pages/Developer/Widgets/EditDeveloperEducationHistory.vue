<template>
    <section id="edit-developer-education-history">
        <div class="education-history">
            <h1>Education History</h1>

            <div class="container" v-for="(educationItem, index) in formData.educationHistory">
                <div class="set">
                    <input type="text" placeholder="School" v-model="educationItem.place"/>
                    <input type="text" placeholder="Field of Study / Degree" v-model="educationItem.title"/>
                </div>
                <div class="set">
                    <input type="text" placeholder="Start Date" v-model="educationItem.start"/>
                    <input type="text" placeholder="End Date" v-model="educationItem.end"/>
                </div>
                <button class="button" @click="removeEducationHistory(index)">Remove this Degree</button>
            </div>

            <div class="container">
                <div class="set">
                    <input type="text" placeholder="School" v-model="newEducationSchool"/>
                    <input type="text" placeholder="Field of Study / Degree" v-model="newEducationMajor"/>
                </div>
                <div class="set">
                    <input type="text" placeholder="Start Date" v-model="newEducationStart"/>
                    <input type="text" placeholder="End Date" v-model="newEducationEnd"/>
                </div>

                <button class="button" @click="addEducationHistory">Add another Degree</button>
            </div>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    import Vue from 'vue';

    export default {
        name: 'EditDeveloperEducationHistory',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
                newEducationSchool: '',
                newEducationMajor: '',
                newEducationStart: '',
                newEducationEnd: ''
            }
        },

        computed: {},

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {

                if (this.newEducationSchool.trim() !== '' ||
                    this.newEducationMajor.trim() !== '' ||
                    this.newEducationStart.trim() !== '' ||
                    this.newEducationEnd.trim() !== ''
                ) {
                    this.addEducationHistory();
                }

                this.$store.dispatch('developerPage/updateEducationHistory', {
                    developerId: this.formData.id,
                    educationHistory: this.formData.educationHistory
                });
            },

            addEducationHistory() {
                let key = this.newEducationSchool;

                if (this.newEducationSchool.trim() === '' ||
                    this.newEducationMajor.trim() === '' ||
                    this.newEducationStart.trim() === '' ||
                    this.newEducationEnd.trim() === ''
                ) {
                    return;
                }

                if (!this.formData.newEducationSchool) {
                    this.formData.newEducationSchool = {}
                }

                if (this.formData.educationHistory[key]) {
                    key = key + Date.now();
                }

                Vue.set(this.formData.educationHistory, key,
                    {place: this.newEducationSchool, title: this.newEducationMajor, start: this.newEducationStart, end: this.newEducationEnd}
                );

                this.newEducationSchool = '';
                this.newEducationMajor = '';
                this.newEducationStart = '';
                this.newEducationEnd = '';
            },

            removeEducationHistory(index) {
                Vue.delete(this.formData.educationHistory, index);
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