<template>
    <div class="media-item-audio">
        <div v-if="data.previewImageUrl" class="image-wrapper"><a :href="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" target="_blank">
            <img :src="`https://www.develteam.com/userdata/media/${data.previewImageUrl}`" :alt="data.title + ' preview image'" :title="data.title + ' preview image'"/>
        </a></div>

        <audio controls>
            <source :src="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" type="audio/mpeg">
            Your browser does not support the video tag.
        </audio>
    </div>
</template>


<script>
    export default {
        name: 'MediaItemAudio',
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
    }
</script>