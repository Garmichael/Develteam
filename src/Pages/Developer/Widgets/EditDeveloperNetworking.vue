<template>
    <section id="edit-networking">
        <div class="networking">
            <h1>Networking</h1>
            <label><input type="checkbox" v-model="formData.lookingForGame"/>I want to join a Game Project</label>
            <textarea placeholder="What I'm looking for in a team" v-model="formData.lookingForDescription"></textarea>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    export default {
        name: 'EditDeveloperNetworking',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation)
            }
        },

        computed: {},

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                this.$store.dispatch('developerPage/updateNetworking', {
                    developerId: this.formData.id,
                    lookingForGame: this.formData.lookingForGame,
                    lookingForDescription: this.formData.lookingForDescription
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