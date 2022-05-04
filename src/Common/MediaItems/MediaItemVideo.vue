<template>
    <div class="media-item-video">
        <div class="video-container">
            <div v-if="data.mediaType === 'Video'" class="video-wrapper">
                <video controls onclick="this.paused?this.play():this.pause();">
                    <source :src="`https://www.develteam.com/userdata/media/${data.mediaUrl}`" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>

            <fake-youtube v-if="data.mediaType === 'Youtube'" :src="data.mediaUrl"></fake-youtube>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'MediaItemVideo',
        props: ['data']
    }
</script>