<template>
    <section id="edit-developer-work-history">
        <div class="work-history">
            <h1>Work History</h1>

            <div class="container" v-for="(workItem, index) in formData.workHistory">
                <div class="set">
                    <input type="text" placeholder="Company" v-model="workItem.place"/>
                    <input type="text" placeholder="Position" v-model="workItem.title"/>
                </div>
                <div class="set">
                    <input type="text" placeholder="Start Date" v-model="workItem.start"/>
                    <input type="text" placeholder="End Date" v-model="workItem.end"/>
                </div>
                <button class="button" @click="removeWorkHistory(index)">Remove this Work History</button>
            </div>

            <div class="container">
                <div class="set">
                    <input type="text" placeholder="Company" v-model="newWorkCompany"/>
                    <input type="text" placeholder="Position" v-model="newWorkPosition"/>
                </div>
                <div class="set">
                    <input type="text" placeholder="Start Date" v-model="newWorkStart"/>
                    <input type="text" placeholder="End Date" v-model="newWorkEnd"/>
                </div>

                <button class="button" @click="addWorkHistory">Add another Work History</button>
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
        name: 'EditDeveloperWorkHistory',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
                newWorkCompany: '',
                newWorkPosition: '',
                newWorkStart: '',
                newWorkEnd: ''
            }
        },

        computed: {},

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                if (this.newWorkCompany.trim() !== '' &&
                    this.newWorkPosition.trim() !== '' &&
                    this.newWorkStart.trim() !== '' &&
                    this.newWorkEnd.trim() !== ''
                ) {
                    this.addWorkHistory();
                }

                this.$store.dispatch('developerPage/updateWorkHistory', {
                    developerId: this.formData.id,
                    workHistory: this.formData.workHistory
                });
            },

            addWorkHistory() {
                let key = this.newWorkCompany;

                if (this.newWorkCompany.trim() === '' ||
                    this.newWorkPosition.trim() === '' ||
                    this.newWorkStart.trim() === '' ||
                    this.newWorkEnd.trim() === ''
                ) {
                    return;
                }

                if (!this.formData.workHistory) {
                    this.formData.workHistory = {}
                }

                if (this.formData.workHistory[key]) {
                    key = key + Date.now();
                }

                Vue.set(this.formData.workHistory, key,
                    {place: this.newWorkCompany, title: this.newWorkPosition, start: this.newWorkStart, end: this.newWorkEnd}
                );

                this.newWorkCompany = '';
                this.newWorkPosition = '';
                this.newWorkStart = '';
                this.newWorkEnd = '';
            },

            removeWorkHistory(index) {
                Vue.delete(this.formData.workHistory, index);
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