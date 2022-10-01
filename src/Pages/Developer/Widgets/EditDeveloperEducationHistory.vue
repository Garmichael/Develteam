<template>
    <section id="edit-developer-education-history">
        <div class="education-history edit-container">
            <div class="container" v-for="(educationItem, index) in formData.educationHistory">
                <div class="set">
                    <input type="text" placeholder="School" v-model="educationItem.place" :class="[{invalid: educationItem.place.trim() === ''}]"/>
                    <input type="text" placeholder="Field of Study / Degree" v-model="educationItem.title"/>
                    <input type="text" placeholder="Start Date" v-model="educationItem.start"/>
                    <input type="text" placeholder="End Date" v-model="educationItem.end"/>

                    <button class="button small-button" @click.prevent="removeEducationHistory(index)">
                        <i class="fa-trash fas"></i>
                    </button>

                    <button v-if="index > 0" class="button small-button" @click.prevent="moveEducationUp(index)">
                        <i class="fa-arrow-up fas"></i>
                    </button>

                    <button v-if="index !== formData.educationHistory.length - 1" class="button small-button" @click.prevent="moveEducationDown(index)">
                        <i class="fa-arrow-down fas"></i>
                    </button>

                </div>
            </div>

            <div class="set container">
                <button class="button small-button" @click.prevent="addEducationHistory"><i class="fas fa-plus"></i></button>
            </div>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges" :disabled="!validateAllEntries()">Save</button>
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
            }
        },

        computed: {},

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            validateAllEntries(){
                let isValid = true;

                this.formData.educationHistory.forEach((educationItem)=>{
                    if(educationItem.place.trim() === ''){
                        isValid = false;
                    }
                });

                return isValid;
            },

            submitChanges() {
                if(!this.validateAllEntries()){
                    return;
                }

                this.$store.dispatch('developerPage/updateEducationHistory', {
                    developerId: this.formData.id,
                    educationHistory: this.formData.educationHistory
                });
            },

            addEducationHistory() {
                this.formData.educationHistory.push({
                    place: '',
                    title: '',
                    start: '',
                    end: ''
                });
            },

            removeEducationHistory(index) {
                Vue.delete(this.formData.educationHistory, index);
            },

            moveEducationUp(index) {
                const swapA = this.formData.educationHistory[index];
                const swapB = this.formData.educationHistory[index - 1];
                Vue.set(this.formData.educationHistory, index, swapB);
                Vue.set(this.formData.educationHistory, index - 1, swapA);
            },

            moveEducationDown(index) {
                const swapA = this.formData.educationHistory[index];
                const swapB = this.formData.educationHistory[index + 1];
                Vue.set(this.formData.educationHistory, index, swapB);
                Vue.set(this.formData.educationHistory, index + 1, swapA);
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