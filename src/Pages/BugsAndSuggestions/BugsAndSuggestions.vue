<template>
    <article id="bugs-and-suggestions">


        <div class="button-container">
            <button class="button" v-if="isLoggedIn && !showSubmitForm && !showThankYouForm" @click.prevent="showSubmitForm = true">Submit a Bug or Suggestion</button>
        </div>

        <section id="submit-work-item" v-if="isLoggedIn && showSubmitForm && !showThankYouForm">
            <h2>Submit a Bug or Suggestion</h2>

            <div class="validation-messages error" v-if="submitFormErrors.length > 0">
                <span v-for="error in submitFormErrors">{{error}}</span>
            </div>

            <input type="text" placeholder="Title" v-model="submitTitle" @input="submitFormErrors = []" :disable="submitIsSaving">

            <markdown-editor placeholder="Description" v-model="submitDescription" :disable="submitIsSaving"></markdown-editor>

            <select v-model="submitType" :disable="submitIsSaving">
                <option value="bug">Bug</option>
                <option value="suggestion">Suggestion</option>
            </select>

            <button class="button minor" @click.prevent="showSubmitForm = false" :disable="submitIsSaving">Cancel</button>
            <button class="button" @click.prevent="submitWorkItem" :disable="submitIsSaving">Submit</button>
        </section>

        <section id="submit-thank-you" v-if="showThankYouForm">
            <h1>Thank you for your Submission!</h1>
            <div class="button-container">
                <button class="button" @click.prevent="showSubmitForm = false; showThankYouForm = false;">Close</button>
                <button class="button" @click.prevent="showSubmitForm = true; showThankYouForm = false">Submit Another</button>
            </div>
        </section>


        <section id="task-board">
            <section id="bugs">
                <h1>Bugs</h1>
                <div v-for="item in bugs">
                    <h3>{{item.title}}</h3>
                    <markdown-content class="description" :content="item.description"></markdown-content>
                    <span>Submitted By: <router-link :to="`/Developer/${item.poster.stringUrl}`">{{item.poster.alias}}</router-link></span>

                    <template v-if="isModerator">
                        <span class="mod-controls">
                            Move to:
                            <span @click="moveTo(item, 'inProgress')">In-Progress</span>
                        </span>
                    </template>
                </div>
            </section>

            <section id="suggestions">
                <h1>Suggestions</h1>
                <div v-for="item in suggestions">
                    <h3>{{item.title}}</h3>
                    <markdown-content class="description" :content="item.description"></markdown-content>
                    <span>Submitted By: <router-link :to="`/Developer/${item.poster.stringUrl}`">{{item.poster.alias}}</router-link></span>

                    <template v-if="isModerator">
                        <span class="mod-controls">
                            Move to:
                            <span @click="moveTo(item, 'inProgress')">In-Progress</span>
                        </span>
                    </template>
                </div>
            </section>

            <section id="in-progress">
                <h1>In-Progress</h1>
                <div v-for="item in inProgress">
                    <h3>[{{item.type}}] {{item.title}}</h3>
                    <markdown-content class="description" :content="item.description"></markdown-content>
                    <span>Submitted By: <router-link :to="`/Developer/${item.poster.stringUrl}`">{{item.poster.alias}}</router-link></span>

                    <template v-if="isModerator">
                        <span class="mod-controls">
                            Move to:
                            <span @click="moveTo(item, 'done')">Done</span>
                            |
                            <span @click="moveTo(item, 'backlog')">Backlog</span>
                        </span>
                    </template>
                </div>
            </section>

            <section id="done">
                <h1>Done</h1>
                <div v-for="item in done">
                    <h3>[{{item.type}}] {{item.title}}</h3>
                    <div v-if="item.description">{{item.description}}</div>
                    <span>Submitted By: <router-link :to="`/Developer/${item.poster.stringUrl}`">{{item.poster.alias}}</router-link></span>

                    <template v-if="isModerator">
                        <span class="mod-controls">
                            Move to:
                            <span @click="moveTo(item, 'inProgress')">In-Progress</span>
                            |
                            <span @click="moveTo(item, 'backlog')">Backlog</span>
                        </span>
                    </template>
                </div>
            </section>
        </section>
    </article>
</template>


<script>
    import _ from 'lodash';
    import axios from 'axios';
    import MarkdownContent from "../../Common/MarkdownContent";

    export default {
        components: {MarkdownContent}, name: 'BugsAndSuggestions',
        data(){
            return {
                submitType: 'bug',
                submitTitle: '',
                submitDescription: '',
                submitFormErrors: [],
                submitIsSaving: false,
                showSubmitForm: false,
                showThankYouForm: false,
                items: []
            }
        },

        mounted() {
            this.fetchWorkItems();
        },

        computed: {
            isModerator(){
                return this.isLoggedIn && this.$store.state.loggedUserModel.info.id <= 2;
            },

            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            bugs(){
                return _.filter(this.items, function (item) {
                    return item.type === 'bug' && item.status === 'backlog';
                });
            },

            suggestions(){
                return _.filter(this.items, function (item) {
                    return item.type === 'suggestion' && item.status === 'backlog';
                });
            },

            inProgress(){
                return _.filter(this.items, function (item) {
                    return item.status === 'inProgress';
                });
            },

            done(){
                return _.filter(this.items, function (item) {
                    return item.status === 'done';
                });
            }
        },

        methods: {
            fetchWorkItems(){
                axios.get('/api/bugsAndSuggestions').then(
                        (response) => {
                            this.items = response.data.items;
                        },
                        (response) => {
                            console.log(response);
                        }
                );
            },

            submitWorkItem(){
                let errors = [];

                if (this.submitTitle.trim() === '') {
                    errors.push('Please Submit a Title')
                }

                if (errors.length > 0) {
                    this.submitFormErrors = errors;
                    return;
                }

                this.submitIsSaving = true;

                axios.post('/api/bugsAndSuggestions', {
                    title: this.submitTitle,
                    description: this.submitDescription,
                    type: this.submitType
                }).then(
                        response => {
                            this.submitIsSaving = false;

                            if (response.data.errors) {
                                this.submitFormErrors = response.data.errors;
                                return;
                            }

                            this.submitTitle = '';
                            this.submitDescription = '';
                            this.showThankYouForm = true;

                        },
                        response => {
                            this.submitFormErrors = ['There was a problem connecting to the server. Please Reload and try again'];
                            this.submitIsSaving = false;
                        }
                )
            },

            moveTo(item, newStatus){
                axios.post('/api/bugsAndSuggestions/moderatorMove', {
                    item: JSON.parse(JSON.stringify(item)),
                    newStatus: newStatus
                }).then(
                        response => {
                        },
                        response => {
                            console.log(response);
                        }
                )
            }
        },

        sockets: {
            'updatedBugsAndSuggestions'(){
                this.fetchWorkItems();
            }
        }
    }
</script>