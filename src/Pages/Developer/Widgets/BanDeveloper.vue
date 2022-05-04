<template>
    <section id="ban-developer">
        <div class="ban-developer-form">

            <label v-if="formData.isBanned">Un-Ban this developer?</label>
            <label v-if="!formData.isBanned">Ban this developer?</label>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" v-if="!formData.isBanned" @click.prevent="submitBan">Yes, Ban</button>
                <button class="button" v-if="formData.isBanned" @click.prevent="submitUnBan">Un-Ban</button>
            </div>
        </div>

    </section>
</template>


<script>
    export default {
        name: 'BanDeveloper',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
            }
        },

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitBan() {
                this.$store.dispatch('developerPage/banDeveloper', {
                    developerId: this.formData.id
                });
            },

            submitUnBan() {
                this.$store.dispatch('developerPage/unBanDeveloper', {
                    developerId: this.formData.id
                });
            }
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