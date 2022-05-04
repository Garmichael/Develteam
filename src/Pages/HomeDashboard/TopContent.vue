<template>
    <section id="top-content">
        <h1>Top Content</h1>
        <div class="items">
            <div v-for="media in topContent" class="item">

                <!-- Images -->
                <router-link v-if="media.posterStringUrl && media.mediaType === 'Image'"
                             :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`"
                >
                    <div class="thumb" :style="`background-image: url('https://www.develteam.com/userdata/mediaThumbs/${media.mediaUrl}')`"></div>
                </router-link>

                <router-link v-if="media.subPosterStringUrl && media.mediaType === 'Image'" :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`">
                    <div class="thumb" :style="`background-image: url('https://www.develteam.com/userdata/mediaThumbs/${media.mediaUrl}')`"></div>
                </router-link>


                <!-- Non-Images with Preview -->
                <router-link
                        v-if="media.posterStringUrl && media.mediaType !== 'Image' && media.previewUrl"
                        :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`"
                >
                    <div class="thumb" :style="`background-image: url('https://www.develteam.com/userdata/mediaThumbs/${media.previewUrl}')`"></div>
                </router-link>

                <router-link
                        v-if="media.subPosterStringUrl && media.mediaType !== 'Image' && media.previewUrl"
                        :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`"
                >
                    <div class="thumb" :style="`background-image: url('https://www.develteam.com/userdata/mediaThumbs/${media.previewUrl}')`"></div>
                </router-link>


                <!-- Non-Images without Preview -->
                <router-link
                        v-if="media.posterStringUrl && media.mediaType !== 'Image' && !media.previewUrl"
                        :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`"
                >
                    <div v-if="media.mediaType === 'Audio'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-volume-up"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'External'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-link"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Flash'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-rocket"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Archive'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-download"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Text'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-download"></i></div>
                    </div>
                </router-link>

                <router-link
                        v-if="media.subPosterStringUrl && media.mediaType !== 'Image' && media.previewUrl"
                        :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`"
                >
                    <div v-if="media.mediaType === 'Audio'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-volume-up"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'External'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-link"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Flash'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-rocket"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Archive'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-download"></i></div>
                    </div>

                    <div v-if="media.mediaType === 'Text'" class="thumb icon-thumb">
                        <div class="icon-container"><i class="fas fa-download"></i></div>
                    </div>
                </router-link>


                <div v-if="media.mediaType === 'Audio'" class="audio-container thumb">
                <audio controls>
                    <source :src="`https://www.develteam.com/userdata/media/${media.mediaUrl}`" type="audio/mpeg">
                    Your browser does not support the audio tag.
                </audio>
                </div>

                <fake-youtube v-if="media.mediaType === 'Youtube'" :src="media.mediaUrl"></fake-youtube>

                <div class="details">
                    <h2 v-if="media.posterStringUrl">
                        <router-link :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            {{media.title}}
                        </router-link>
                    </h2>

                    <h2 v-if="media.subPosterStringUrl">
                        <router-link :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            {{media.title}}
                        </router-link>
                    </h2>

                    <span class="poster">

                        <template v-if="media.subPosterStringUrl">
                            <i class="fas fa-gamepad"></i>
                            <router-link :to="`/Game/${media.subPosterStringUrl}`">
                                {{media.subPosterAlias}}
                            </router-link>
                        </template>

                        <template v-if="media.posterStringUrl">
                            <i class="fas fa-user"></i>
                            <router-link :to="`/Developer/${media.posterStringUrl}`">
                                {{media.posterAlias}}
                            </router-link>
                        </template>
                    </span>

                    <div v-if="media.subPosterStringUrl" class="media-stats">
                        <router-link :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            <i class="far fa-heart"></i> {{media.voteTotal}}
                        </router-link>
                        <router-link :to="`/Game/${media.subPosterStringUrl}/Media/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            <i class="far fa-comment-alt"></i> {{media.commentCount}}
                        </router-link>
                    </div>

                    <div v-if="media.posterStringUrl" class="media-stats">
                        <router-link :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            <i class="far fa-heart"></i> {{media.voteTotal}}
                        </router-link>
                        <router-link :to="`/Developer/${media.posterStringUrl}/Portfolio/${media.albumStringUrl}/${media.pieceStringUrl}`">
                            <i class="far fa-comment-alt"></i> {{media.commentCount}}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script>
    import axios from 'axios';

    export default {
        name: 'RecentlyOnForums',
        data(){
            return {
                topContent: []
            }
        },

        methods: {
            fetchTopContent(){
                axios.get('/api/topContent')
                    .then(
                        (response) => {
                            if (response.data.errors) {
                                return;
                            }

                            this.topContent = response.data;
                        }
                    )
            }
        },

        mounted(){
            this.fetchTopContent();
        }
    }
</script>