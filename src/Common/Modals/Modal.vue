<template>
    <div id="modal" v-if="showModal">
        <div class="wrapper" @click="closeModal">
            <div class="content" v-html="modalContent"></div>
        </div>
    </div>
</template>

<script>
    import bus from '../../vueGlobalEventBus';

    export default {
        name: 'Modal',
        data(){
            return {
                showModal: false,
                modalContent: undefined
            }
        },

        created() {
            bus.$on('openModal', (content) => {
                this.modalContent = content;
                this.showModal = true;
            });
        },

        methods: {
            closeModal(){
                this.showModal = false;
            }
        }
    }
</script>