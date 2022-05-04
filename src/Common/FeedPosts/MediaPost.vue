<template>
    <div :class="['media-post ', classes]">

        <media-item-image v-if="pieceType(piece.mediaType) === 'image'" :data="piece"></media-item-image>
        <media-item-video v-if="pieceType(piece.mediaType) === 'video'" :data="piece"></media-item-video>
        <media-item-audio v-if="pieceType(piece.mediaType) === 'audio'" :data="piece"></media-item-audio>
        <media-item-link v-if="pieceType(piece.mediaType) === 'link'" :data="piece"></media-item-link>

        <h2>
            <router-link :to="linkToPiece">{{piece.title}}</router-link>
        </h2>

        <markdown-content v-if="piece.description.length > 0" classes="content"
                          :content="piece.description"></markdown-content>

        <footer>
            <ul>
                <li>
                    <voting-widget parent-type="media" :parent-id="piece.id" initial-points="0"></voting-widget>
                </li>
                <li><a href="#" :class="['show-comments', {selected: commentsVisible}]" @click.prevent="toggleComments">{{commentCount}}
                    comments</a></li>

                <li class="social-sharing">
                    <i class="fab fa-facebook-f" @click="socialShare('facebook')"></i>
                    <i class="fab fa-twitter" @click="socialShare('twitter')"></i>
                    <i class="fab fa-linkedin-in" @click="socialShare('linkedin')"></i>
                </li>
                <router-link tag="li" v-if="canEdit" :to="linkToPiece + '/Edit'"><i
                        class="fas fa-pencil-alt edit-button"></i></router-link>
            </ul>
        </footer>

        <section v-if="commentsVisible" class="comments">
            <ul class="post-comments" v-if="Object.keys(piece.comments || {}).length > 0">
                <post-comment v-for="comment in piece.comments" :comment="comment"></post-comment>
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
    </div>
</template>

<script>

    export default {
        name: 'MediaPost',
        props: ['piece', 'classes', 'mediasId', 'canEdit'],

        data() {
            return {
                commentsVisible: false,
                newCommentContent: '',
                postAs: 'developer'
            }
        },

        computed: {
            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn
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

            commentCount() {
                if (Object.keys(this.piece.comments || {}).length === 0) {
                    return this.piece.commentCount;
                } else {
                    return Object.keys(this.piece.comments).length;
                }
            },

            linkToPiece() {
                let posterType = this.$options.filters.capitalizeFirstLetter(this.piece.posterType),
                    posterStringUrl = this.piece.posterStringUrl || this.piece.subPosterStringUrl,
                    albumStringUrl = this.piece.albumStringUrl,
                    pieceStringUrl = this.piece.stringUrl,
                    urlPiece = posterType === 'Developer' ? 'Portfolio' : 'Media';

                return `/${posterType}/${posterStringUrl}/${urlPiece}/${albumStringUrl}/${pieceStringUrl}`;
            },

        },

        methods: {

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

            toggleComments() {
                this.commentsVisible = !this.commentsVisible;

                if (this.commentsVisible) {
                    this.$store.dispatch('medias/getPieceComments', {piece: this.piece, mediasId: this.mediasId});
                }

            },

            submitComment() {
                if (this.newCommentContent.trim !== '') {
                    this.$store.dispatch(
                        'medias/addComment',
                        {content: this.newCommentContent, piece: this.piece, postAs: this.postAs}
                    );
                    this.newCommentContent = '';
                }
            },

            socialShare(site) {
                let url,
                    link = 'https://www.develteam.com' + this.linkToPiece;

                if (site === 'facebook') {
                    url = 'https://www.facebook.com/sharer/sharer.php?u=' + link;
                } else if (site === 'twitter') {
                    url = 'https://twitter.com/intent/tweet?text=' + link + '%20%23gamedev%20%23indiegamedev';
                } else if (site === 'linkedin') {
                    url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + link + '&title=&summary=&source=';
                }

                window.open(url, '_blank');
            }
        }
    }
</script>