<template>
    <section id="edit-developer-work-history">
        <div class="work-history edit-container">
            <div class="container" v-for="(workItem, index) in formData.workHistory">
                <div class="set">
                    <input type="text" placeholder="Company" v-model="workItem.place" :class="[{invalid: workItem.place.trim() === ''}]"/>
                    <input type="text" placeholder="Position" v-model="workItem.title"/>

                    <input type="text" placeholder="Start Date" v-model="workItem.start"/>
                    <input type="text" placeholder="End Date" v-model="workItem.end"/>

                    <button class="button small-button" @click.prevent="removeWorkHistory(index)">
                        <i class="fa-trash fas"></i>
                    </button>


                    <button v-if="index > 0" class="button small-button" @click.prevent="moveWorkHistoryUp(index)">
                        <i class="fa-arrow-up fas"></i>
                    </button>

                    <button v-if="index !== formData.workHistory.length - 1" class="button small-button" @click.prevent="moveWorkHistoryDown(index)">
                        <i class="fa-arrow-down fas"></i>
                    </button>
                </div>
            </div>

            <div class="set container">
                <button class="button small-button" @click.prevent="addWorkHistory"><i class="fas fa-plus"></i></button>
            </div>

            <div class="buttons">
                <button class="button minor" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" :disabled="!allEntriesAreValid()" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    import Vue from 'vue';

    export default {
        name: 'EditDeveloperWorkHistory',

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

            allEntriesAreValid() {
                let isValid = true;
                this.formData.workHistory.forEach((workHistory) => {
                    if (workHistory.place.trim() === '') {
                        isValid = false;
                    }
                });

                return isValid;
            },

            submitChanges() {
                if(this.allEntriesAreValid()) {
                    this.$store.dispatch('developerPage/updateWorkHistory', {
                        developerId: this.formData.id,
                        workHistory: this.formData.workHistory
                    });
                }
            },

            addWorkHistory() {
                this.formData.workHistory.push({
                    place: '',
                    title: '',
                    start: '',
                    end: ''
                })
            },

            removeWorkHistory(index) {
                Vue.delete(this.formData.workHistory, index);
            },

            moveWorkHistoryUp(index) {
                const swapA = this.formData.workHistory[index];
                const swapB = this.formData.workHistory[index - 1];
                Vue.set(this.formData.workHistory, index, swapB);
                Vue.set(this.formData.workHistory, index - 1, swapA);
            },

            moveWorkHistoryDown(index) {
                const swapA = this.formData.workHistory[index];
                const swapB = this.formData.workHistory[index + 1];
                Vue.set(this.formData.workHistory, index, swapB);
                Vue.set(this.formData.workHistory, index + 1, swapA);
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