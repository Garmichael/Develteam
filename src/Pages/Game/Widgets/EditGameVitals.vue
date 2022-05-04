<template>
    <section id="edit-game-vitals">

        <div v-if="isSaving" class="companion-content-subsection">
            <saver-large></saver-large>
        </div>

        <div v-if="!isSaving" class="companion-content-subsection vitals">
            <div class="edit-alias">
                <h1>Game Title</h1>
                <input type="text" v-model="localAlias" placeholder="Game Title"/>
                <span>Note: Changing your game's title will change the URL to this page</span>
            </div>

            <div class="edit-avatar">
                <h1>Avatar Image</h1>
                <input type="file" name="avatar" @change="updateuploadedAvatarName" accept="image/jpeg, image/png"/>
                <div v-if="uploadedImageSrc" class="avatar-preview" :style="`background-image: url('${uploadedImageSrc}')`"></div>

                <div v-if="avatarTooBig" class="validation-messages error">The uploaded Avatar is too large. Please choose another that is less than 300k</div>
                <div v-if="localAlias.trim() === ''" class="validation-messages error">Set a Title for this Game</div>
            </div>

            <div class="buttons">
                <button class="button" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>
        </div>
    </section>
</template>


<script>
    export default {
        name: 'EditGameVitals',
        props: ['game'],

        data(){
            return {
                avatarFile: undefined,
                uploadedAvatarName: '',
                uploadedImageSrc: '',
                avatarTooBig: false,
                localAlias: this.game.alias,
                isSaving: false
            }
        },

        components: {},

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {
            updateuploadedAvatarName(e){
                let input = e.target;
                let reader;
                let self = this;

                if (input.files.length === 0) {
                    return;
                }

                if (input.files && input.files[0]) {
                    reader = new FileReader();

                    reader.onload = function (e) {
                        self.uploadedImageSrc = e.target.result;
                    };

                    reader.readAsDataURL(input.files[0]);
                }

                this.uploadedAvatarName = e.target.files[0].name;
                this.avatarFile = e.target.files[0];
                this.avatarTooBig = e.target.files[0].size > 300000;
            },

            cancelChanges(){
                this.$emit('doneEditing');
            },

            submitChanges(){
                if (this.avatarTooBig || this.localAlias.trim() === '') {
                    return;
                }

                this.$store.dispatch('gamePage/updateVitals', {
                    gameId: this.game.id,
                    alias: this.localAlias,
                    avatarFile: this.avatarFile
                });

                this.isSaving = true;
            }
        },

        sockets: {
            'gameVitalsWithoutAliasUpdated'(data){
                if (data.gameId == this.game.id) {
                    this.$emit('doneEditing');
                }
            }
        }
    }
</script>