<template>
    <div>
        <div class="post-selector">
            <div :class="['item', {'selected': n - 1 === selectedPost}]"
                 v-for="n in posts.length"
                 @click="selectPost(n)">

                <div v-if="posts[n-1].mediaData.mediaType === 'Image'"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.mediaUrl}');`">
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Video'" class="icon-button">
                    <i class="fas fa-video-camera"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Youtube'"
                     class="icon-button"
                     :style="generateYoutubeBackgroundImageStyle(posts[n-1].mediaData.mediaUrl)">
                    <i class="fab fa-youtube"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'External' && !posts[n-1].mediaData.previewImageUrl"
                     class="icon-button">
                    <i class="fas fa-link xo"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Archive' && !posts[n-1].mediaData.previewImageUrl"
                     class="icon-button">
                    <i class="fas fa-archive xo"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Audio' && !posts[n-1].mediaData.previewImageUrl"
                     class="icon-button">
                    <i class="fas fa-volume-up xo"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Flash' && !posts[n-1].mediaData.previewImageUrl"
                     class="icon-button">
                    <i class="fas fa-rocket xo"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Text' && !posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"><i class="fas fa-book xo"></i></div>

                <div v-if="posts[n-1].mediaData.mediaType === 'External' && posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.previewImageUrl}');`">
                    <i class="fas fa-link"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Archive' && posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.previewImageUrl}');`">
                    <i class="fas fa-archive"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Audio' && posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.previewImageUrl}');`">
                    <i class="fas fa-volume-up xy"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Flash' && posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.previewImageUrl}');`">
                    <i class="fas fa-rocket"></i>
                </div>

                <div v-if="posts[n-1].mediaData.mediaType === 'Text' && posts[n-1].mediaData.previewImageUrl"
                     class="icon-button"
                     :style="`background-image:url('https://www.develteam.com/userdata/mediaThumbs/${posts[n-1].mediaData.previewImageUrl}');`">
                    <i class="fas fa-book"></i>
                </div>

            </div>
        </div>

        <feed-status-post :data="posts[selectedPost]" :key="posts[selectedPost].id"></feed-status-post>
    </div>
</template>


<script>
    export default {
        name: 'FeedGroupPost',
        props: ['posts'],

        data() {
            return {
                selectedPost: 0
            }
        },

        computed: {
            prop() {
                return {};
            }
        },

        methods: {
            selectPost(id) {
                this.selectedPost = id - 1;
            },

            pieceType(type) {
                if (type === 'Image') {
                    return 'image';
                }

                if (type === 'Video' || type === 'Youtube') {
                    return 'video';
                }

                if (type === 'Audio') {
                    return 'audio';
                }

                return 'link';
            },

            generateYoutubeBackgroundImageStyle(src) {
                if (!src) {
                    return '';
                }

                let matched = src.match("v=([a-zA-Z0-9\_\-]+)&?");
                let code;

                if (matched && matched.length > 1) {
                    code = matched[1];
                } else {
                    code = src.split('/')[src.split('/').length - 1];
                }

                return `background-image: url('https://img.youtube.com/vi/` + code + `/0.jpg');`;
            }
        }
    }
</script>