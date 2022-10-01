<template>
    <article class="feed-post">

        <section class="header">
            <div v-if="data.subPosterType === 'developer' && data.posterDetails.hasBanner"
                 class="banner"
                 :style="`background-image:url('https://www.develteam.com/userdata/banners/${data.posterDetails.id}.png');`">
            </div>

            <div v-if="data.subPosterType === 'game' && data.subPosterDetails.hasBanner"
                 class="banner"
                 :style="`background-image:url('https://www.develteam.com/userdata/banners/${data.subPosterDetails.id}.png');`">
            </div>

            <div class="head-group">
                <div class="headline">
                    <div v-if="data.subPosterType === 'developer'" class="avatar-container">
                        <avatar :profile-data="data.posterDetails" :profile-type="data.subPosterType" size="large"
                                :show-xp-info="true"></avatar>
                    </div>

                    <div v-if="data.subPosterType === 'game'" class="avatar-container">
                        <avatar :profile-data="data.subPosterDetails" :profile-type="data.subPosterType" size="large"
                                :show-xp-info="true"></avatar>
                    </div>

                    <h1 class="title">
                        <span v-if="data.subPosterType === 'developer'">
                            <i class="fas fa-user fa-fw"></i>
                            <router-link :to="`/Developer/${data.posterDetails.stringUrl}`" data-router-link="true">{{data.posterDetails.alias}}</router-link>
                        </span>

                        <span v-if="data.subPosterType === 'game'">
                            <i class="fas fa-gamepad fa-fw"></i>
                            <router-link :to="`/Game/${data.subPosterDetails.stringUrl}`" data-router-link="true">{{data.subPosterDetails.alias}}</router-link>
                        </span>

                        <span v-if="data.subPosterType === 'game'">
                            <i class="fas fa-user fa-fw"></i>
                            <router-link :to="`/Developer/${data.posterDetails.stringUrl}`" data-router-link="true">{{data.posterDetails.alias}}</router-link>
                        </span>

                        <span v-if="data.type === 'status' || data.type === 'classifieds'" class="sub-title">
                            <router-link :to="linkToPiece">{{data.title}}</router-link>
                        </span>

                        <span v-if="data.type === 'media'" class="sub-title">
                            <router-link :to="linkToPiece">
                                <i v-if="data.mediaData.mediaType === 'Image'" class="fas fa-image fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'External'" class="fas fa-link fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Archive'" class="fas fa-archive fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Audio'" class="fas fa-volume-up fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Flash'" class="fas fa-rocket fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Text'" class="fas fa-book fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Video'" class="fas fa-video fa-fw portfolio-icon"></i>
                                <i v-if="data.mediaData.mediaType === 'Youtube'" class="fab fa-youtube fa-fw portfolio-icon"></i>
                                {{data.mediaData.title}}
                            </router-link>
                        </span>

                    </h1>
                </div>

                <div class="post-date">
                    <span>{{data.postDate | formatDateWithoutTimeRelative}}</span>
                    <span>{{data.postDate | formatDateWithJustTime}}</span>
                </div>

                <div v-if="data.isPinned" class="pinned-icon">
                    <i class="fa fas fa-thumbtack"></i>
                </div>
            </div>

        </section>

        <markdown-content v-if="!isMedia && !editMode" classes="content" :content="data.content"></markdown-content>

        <form v-if="!isMedia && editMode && !deleteMode" class="content">
            <input type="text" placeholder="Subject (optional)" v-model="editPostTitle"/>
            <markdown-editor v-model="editPostContent" placeholder="Add a new post"></markdown-editor>
            <button class="button minor" @click.prevent="cancelEditPost">Cancel</button>
            <button class="button" @click.prevent="enterDeleteMode">Delete Post</button>
            <button class="button" @click.prevent="saveEditPost">Save</button>
        </form>

        <form v-if="!isMedia && editMode && deleteMode" class="content">
            <h1>Delete this post?</h1>
            <button class="button minor" @click.prevent="exitDeleteMode">Cancel</button>
            <button class="button" @click.prevent="deletePost">Delete</button>
        </form>

        <media-item-image v-if="isMediaImage" :data="data.mediaData"></media-item-image>
        <markdown-content v-if="isMediaImage && data.mediaData.description.length > 0" classes="content"
                          :content="data.mediaData.description"></markdown-content>

        <media-item-video v-if="isMediaVideo" :data="data.mediaData"></media-item-video>
        <markdown-content v-if="isMediaVideo && data.mediaData.description.length > 0" classes="content"
                          :content="data.mediaData.description"></markdown-content>

        <media-item-link v-if="isMediaLink" :data="data.mediaData"></media-item-link>
        <markdown-content v-if="isMediaLink && data.mediaData.description.length > 0" classes="content"
                          :content="data.mediaData.description"></markdown-content>

        <media-item-audio v-if="isMediaAudio" :data="data.mediaData"></media-item-audio>
        <markdown-content v-if="isMediaAudio && data.mediaData.description.length > 0" classes="content"
                          :content="data.mediaData.description"></markdown-content>

        <footer>
            <ul>
                <li>
                    <voting-widget v-if="!isMedia" parent-type="post" :parent-id="data.id"
                                   initial-points="0"></voting-widget>
                    <voting-widget v-if="isMedia" parent-type="media" :parent-id="data.mediaData.id"
                                   initial-points="0"></voting-widget>
                </li>
                <li class="comments-link-container"><a href="#" :class="['show-comments', {selected: commentsVisible}]" @click.prevent="toggleComments">{{commentCount}}
                    comments</a></li>

                <li class="social-sharing">
                    <i class="fab fa-facebook-f" @click="socialShare('facebook')"></i>
                    <i class="fab fa-twitter" @click="socialShare('twitter')"></i>
                    <i class="fab fa-linkedin-in" @click="socialShare('linkedin')"></i>
                </li>
                <li v-if="canEdit && !editMode" @click="enterEditMode" class="edit-button-container"><i class="fas fa-pencil-alt edit-button"></i>
                </li>
                <li v-if="canEdit && !editMode" @click="togglePin" class="edit-button-container"><i :class="['fas','fa-thumbtack', 'edit-button', {tilted: data.isPinned}]"></i>
                </li>
            </ul>
        </footer>

        <section v-if="commentsVisible" class="comments">
            <ul class="post-comments" v-if="Object.keys(data.comments || {}).length > 0">
                <post-comment v-for="comment in data.comments" :comment="comment"></post-comment>
            </ul>

            <form v-if="isLoggedIn" class="new-comment">
                <markdown-editor v-model="newCommentContent" placeholder="Add a comment"></markdown-editor>

                <div class="submit-row">
                    <label v-if="postAsOptions.length > 1">
                        <span>Post as </span>
                        <span>
                            <select v-model="postAs">
                                <option v-for="postAsOption in postAsOptions" :value="postAsOption.value">{{postAsOption.text}}</option>
                            </select>
                        </span>
                    </label>

                    <span>
                        <button class="button" @click.prevent="submitComment">Submit</button>
                    </span>
                </div>
            </form>

            <div v-else>
                <h1>
                    <router-link to="/Login">Log in</router-link>
                    to reply
                </h1>
            </div>

        </section>
    </article>
</template>


<script>
    export default {
        name: 'NormalFeedPost',
        props: ['data'],

        data() {
            return {
                commentsVisible: false,
                newCommentContent: '',
                postAs: 'developer',
                editMode: false,
                deleteMode: false,
                editPostTitle: this.data.title,
                editPostContent: this.data.content
            }
        },

        computed: {
            canEdit() {
                if (!this.$store.state.loggedUserModel.isLoggedIn) {
                    return false;
                }

                if (this.data.subPosterType === 'developer') {
                    return this.$store.state.loggedUserModel.info.id === this.data.posterDetails.id;
                }

                if (this.data.subPosterType === 'game') {

                    let isGameMember = false;

                    this.$store.state.loggedUserModel.games.forEach(function (game) {
                        if (game.id === this.data.subPosterDetails.id) {
                            isGameMember = true;
                        }
                    }.bind(this));

                    return isGameMember;
                }
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            commentCount() {
                if (Object.keys(this.data.comments || {}).length === 0) {
                    return this.data.commentCount;
                } else {
                    return Object.keys(this.data.comments).length;
                }
            },

            postAsOptions() {
                let postAsOptions = [
                    {
                        value: 'developer',
                        text: this.$store.state.loggedUserModel.info.alias
                    }
                ];

                this.$store.state.loggedUserModel.games.forEach(function (game) {
                    postAsOptions.push({
                        value: 'game|' + game.id,
                        text: 'Game: ' + game.alias
                    })
                });

                return postAsOptions;
            },

            isMedia() {
                return this.data.type === 'media';
            },

            isMediaImage() {
                return this.isMedia && this.data.mediaData.mediaType === 'Image'
            },

            isMediaVideo() {
                return this.isMedia && (this.data.mediaData.mediaType === 'Youtube' || this.data.mediaData.mediaType === 'Video')
            },

            isMediaLink() {
                if (!this.isMedia) {
                    return;
                }

                let mediaType = this.data.mediaData.mediaType;
                return this.isMedia && (mediaType === 'Archive' || mediaType === 'Flash' || mediaType === 'External' || mediaType === 'Text');
            },

            isMediaAudio() {
                if (!this.isMedia) {
                    return;
                }

                let mediaType = this.data.mediaData.mediaType;
                return this.isMedia && mediaType === 'Audio';
            },

            linkToPiece() {
                let postUrl;

                if (this.data.type === 'media') {
                    let posterType = this.$options.filters.capitalizeFirstLetter(this.data.mediaData.posterType);
                    let posterStringUrl = this.data.subPosterType === 'developer' ? this.data.posterDetails.stringUrl : this.data.subPosterDetails.stringUrl;
                    let urlPiece = posterType === 'Developer' ? 'Portfolio' : 'Media';
                    let albumStringUrl = this.data.mediaData.albumStringUrl;
                    let pieceStringUrl = this.data.mediaData.stringUrl;

                    postUrl = `/${posterType}/${posterStringUrl}/${urlPiece}/${albumStringUrl}/${pieceStringUrl}`;
                } else {
                    if (this.data.subPosterType === 'developer') {
                        postUrl = `/Developer/${this.data.posterDetails.stringUrl}/Post/${this.data.id}`;
                    }

                    if (this.data.subPosterType === 'game') {
                        postUrl = `/Game/${this.data.subPosterDetails.stringUrl}/Post/${this.data.id}`;
                    }
                }

                return postUrl;
            }
        },

        methods: {
            toggleComments() {
                this.commentsVisible = !this.commentsVisible;

                if (this.commentsVisible) {
                    this.$store.dispatch('feedPosts/getComments', this.data);
                }
            },

            submitComment() {
                if (this.newCommentContent.trim !== '') {
                    this.$store.dispatch('feedPosts/addComment', {
                        content: this.newCommentContent,
                        post: this.data,
                        postAs: this.postAs
                    });
                    this.newCommentContent = '';
                }
            },

            enterEditMode() {
                if (this.isMedia) {
                    let posterType = this.$options.filters.capitalizeFirstLetter(this.data.mediaData.posterType);
                    let posterStringUrl = this.data.subPosterType === 'developer'
                        ? this.data.posterDetails.stringUrl
                        : this.data.subPosterDetails.stringUrl;
                    let urlPiece = posterType === 'Developer' ? 'Portfolio' : 'Media';
                    let albumStringUrl = this.data.mediaData.albumStringUrl;
                    let pieceStringUrl = this.data.mediaData.stringUrl;

                    this.$router.push(`/${posterType}/${posterStringUrl}/${urlPiece}/${albumStringUrl}/${pieceStringUrl}/Edit`);
                } else {
                    this.editMode = true;
                }
            },

            exitEditMode() {
                this.editMode = false;
            },

            cancelEditPost() {
                this.exitEditMode();
            },

            saveEditPost() {
                this.$store.dispatch('feedPosts/editPostContent', {
                    id: this.data.id,
                    title: this.editPostTitle,
                    content: this.editPostContent
                });

                this.exitEditMode();
            },

            enterDeleteMode() {
                this.deleteMode = true;
            },

            exitDeleteMode() {
                this.deleteMode = false;
            },

            deletePost() {
                this.$store.dispatch('feedPosts/deletePost', {id: this.data.id});
                this.exitDeleteMode();
                this.exitEditMode();
            },

            togglePin(){
                this.$store.dispatch('feedPosts/pinPost', {
                    id: this.data.id
                });
            },

            socialShare(site) {
                let url = '';
                let postUrl = 'https://www.develteam.com' + this.linkToPiece;

                if (site === 'facebook') {
                    url = 'https://www.facebook.com/sharer/sharer.php?u=' + postUrl;
                } else if (site === 'twitter') {
                    url = 'https://twitter.com/intent/tweet?text=' + postUrl + '%20%23gamedev%20%23indiegamedev';
                } else if (site === 'linkedin') {
                    url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + postUrl + '&title=&summary=&source=';
                }

                window.open(url, '_blank');
            }
        }
    }
</script>