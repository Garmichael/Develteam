<template>
    <div class="media-item-image">
        <div class="image-wrapper">
            <img :src="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" @click="showInModal" :alt="altText" :title="altText"/>
        </div>
    </div>
</template>


<script>
    import bus from '../../vueGlobalEventBus';

    export default {
        name: 'MediaItemImage',
        props: ['data'],

        computed: {
            altText(){
                let altString = '';
                if (this.data.posterType === 'developer') {
                    altString += this.data.posterAlias + `'s Game Developer Portfolio Piece - `;
                } else {
                    altString += this.data.subPosterAlias + `'s Game Media Piece - `;
                }

                altString += this.data.title;

                return altString;
            }
        },

        methods: {
            showInModal(){
                bus.$emit('openModal', `<img src="https://www.develteam.com/userdata/media/${this.data.mediaUrl}"/>`)
            }
        }
    }
</script>