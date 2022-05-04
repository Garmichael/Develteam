<template>
    <div class="media-item-link">
        <div v-if="data.previewImageUrl && data.mediaType !== 'External'" class="image-wrapper"><a :href="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" target="_blank">
            <img :src="`https://www.develteam.com/userdata/media/${data.previewImageUrl}`" :alt="altText" :title="altText"/>
        </a></div>

        <div v-if="data.previewImageUrl && data.mediaType === 'External'" class="image-wrapper"><a :href="data.mediaUrl" target="_blank">
            <img :src="`https://www.develteam.com/userdata/media/${data.previewImageUrl}`" :alt="altText" :title="altText"/>
        </a></div>

        <span class="download" v-if="data.mediaType === 'Archive'">
            <a :href="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" target="_blank"><i class="fas fa-download"></i>Download Archive</a>
        </span>

        <span class="download" v-if="data.mediaType === 'External'">
            <a :href="data.mediaUrl" target="_blank"><i class="fas fa-external-link-alt"></i>Visit External Link</a>
        </span>

        <span class="download" v-if="data.mediaType === 'Flash'">
            <a :href="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" target="_blank"><i class="fas fa-play-circle"></i>Play Flash Game</a>
        </span>

        <span class="download" v-if="data.mediaType === 'Text'">
            <a :href="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" target="_blank"><i class="fas fa-download"></i> Download Document</a>
        </span>

    </div>
</template>

<script>
    export default {
        name: 'MediaItemLink',
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
        }
    }
</script>