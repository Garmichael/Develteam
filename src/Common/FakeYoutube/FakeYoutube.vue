<template>
    <div>
        <div v-if="!expanded" class="fake-youtube-container" @click="expanded = true">
            <img :src="`https://img.youtube.com/vi/${videoCode}/0.jpg`" alt="Youtube Video" title="Youtube Video"/>
            <i class="fab fa-youtube fa-stack-1x"></i>
            <i class="fab fa-youtube fa-stack-1x"></i>
        </div>

        <div v-if="expanded" class="youtube-iframe-wrapper">
            <iframe class="real-youtube-container"
                    :src="`https://www.youtube.com/embed/${videoCode}?autoplay=1&mute=1`"
                    frameborder="0" allowfullscreen>
            </iframe>
        </div>

    </div>
</template>


<script>
    export default {
        name: 'FakeYoutube',
        props: ['src'],

        data() {
            return {
                expanded: false
            }
        },

        computed: {
            videoCode() {
                const matched = this.src.match("v=([a-zA-Z0-9\_\-]+)&?");

                if (matched && matched.length > 1) {
                    return matched[1];
                } else {
                    return this.src.split('/')[this.src.split('/').length - 1];
                }
            }
        }
    }
</script>
