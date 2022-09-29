import Vue from 'vue'
import axios from 'axios'
import _ from 'lodash'

export default {
    state: {
        medias: {}
    },

    actions: {
        'medias/getAlbums': function (context, data) {
            context.commit('medias/initializeMediasData', {mediasId: data.mediasId});
            context.commit('medias/setAlbumFetchingStatus', {mediasId: data.mediasId, status: 'fetching'});

            axios.get('/api/media/albums', {
                params: {
                    pageId: data.mediasId.split('.')[1],
                    pageType: data.mediasId.split('.')[0]
                }
            }).then(
                (response) => {
                    context.commit('medias/setAlbumFetchingStatus', {mediasId: data.mediasId, status: 'fetched'});

                    context.commit('medias/setAlbums', {
                        albums: response.data,
                        mediasId: data.mediasId
                    })
                },

                (response) => {
                    console.log(response);
                }
            );
        },

        'medias/getPieces': function (context, data) {
            Vue.set(context.state.medias[data.mediasId].albums[data.albumId], 'fetchStatus', 'fetching');

            axios.get('/api/media/pieces', {
                params: {
                    albumId: data.albumId
                }
            }).then(
                (response) => {
                    context.commit('medias/setPieces', {
                        mediasId: data.mediasId,
                        albumId: data.albumId,
                        pieces: response.data
                    });
                },

                (response) => {
                    console.log(response);
                }
            );
        },

        'medias/getPieceComments': function (context, data) {
            axios.get('/api/media/pieces/comments', {
                params: {
                    pieceId: data.piece.id
                }
            }).then(
                (response) => {
                    context.commit('medias/setPieceComments', {
                        comments: response.data,
                        albumId: data.piece.albumId,
                        mediasId: data.mediasId,
                        pieceId: data.piece.id
                    });
                },

                (response) => {
                    console.log(response);
                }
            );
        },

        'medias/addComment': function (context, data) {
            let postAsType = data.postAs.split('|')[0],
                postAsId = data.postAs.split('|')[1];

            axios.post('/api/media/pieces/comments', {
                content: data.content,
                parentId: data.piece.id,
                postAsType: postAsType,
                postAsId: postAsId
            }).then(
                (response) => {
                },
                (response) => {
                    console.log(response.data);
                }
            )
        },

        'medias/addAlbum': function (context, data) {
            let formData = new FormData();
            formData.append('albumName', data.albumName);
            formData.append('albumAvatar', data.albumFile);
            formData.append('pageType', data.pageType);
            formData.append('pageId', data.pageId);

            axios.post('/api/media/album', formData).then(
                (response) => {
                },
                (response) => {
                }
            )
        },

        'medias/editAlbum': function (context, data) {
            let formData = new FormData();
            formData.append('albumId', data.albumId);
            formData.append('newName', data.albumName);
            formData.append('albumAvatar', data.albumFile);

            axios.post('/api/media/album/edit', formData).then(
                (response) => {
                },
                (response) => {
                }
            )
        },

        'medias/deleteAlbum': function (context, data) {
            axios.post('/api/media/album/delete', {
                albumId: data.albumId
            }).then(
                (response) => {
                },
                (response) => {
                }
            )
        },

        'medias/reorderAlbums': function (context, data) {
            axios.post('/api/media/albums/reorder', {
                albums: data.albums,
                pageType: data.pageType,
                pageId: data.pageId
            }).then(
                (response) => {
                },
                (response) => {
                }
            )
        },


        'medias/addPiece': function (context, data) {
            let formData = new FormData();
            formData.append('albumId', data.albumId);
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('selectedMediaType', data.selectedMediaType);
            formData.append('mediaFile', data.mediaFile);
            formData.append('previewFile', data.previewFile);
            formData.append('mediaText', data.mediaText);
            formData.append('pageType', data.pageType);
            formData.append('pageId', data.pageId);

            axios.post('/api/media/piece', formData).then(
                (response) => {
                },
                (response) => {
                }
            )
        },

        'medias/editPiece': function (context, data) {
            axios.post('/api/media/piece/edit', {
                id: data.id,
                title: data.title,
                description: data.description,
                mediaText: data.mediaText
            }).then(
                (response) => {
                },
                (response) => {
                }
            )
        },

        'medias/deletePiece': function (context, data) {
            axios.post('/api/media/piece/delete', {
                id: data.id,
            }).then(
                (response) => {
                },
                (response) => {
                }
            )
        }
    },

    mutations: {
        'medias/initializeMediasData': function (state, data) {
            if (!state.medias[data.mediasId]) {
                Vue.set(state.medias, data.mediasId, {
                    albums: {},
                    fetchingStatus: 'unfetched'
                });
            }
        },

        'medias/setAlbumFetchingStatus': function (state, data) {
            Vue.set(state.medias[data.mediasId], 'fetchingStatus', data.status);
        },

        'medias/setAlbums': function (state, data) {
            data.albums.forEach(function (album) {
                Vue.set(state.medias[data.mediasId].albums, album.id, album);
            });
        },

        'medias/setPieces': function (state, data) {
            Vue.set(state.medias[data.mediasId].albums[data.albumId], 'pieces', {});

            data.pieces.forEach(function (piece) {
                Vue.set(state.medias[data.mediasId].albums[data.albumId].pieces, piece.id, piece);
            });


            Vue.set(state.medias[data.mediasId].albums[data.albumId], 'fetchStatus', 'fetched');
        },

        'medias/setPieceComments': function (state, data) {
            Vue.set(state.medias[data.mediasId].albums[data.albumId].pieces[data.pieceId], 'comments', {});

            data.comments.forEach(function (comment) {
                Vue.set(state.medias[data.mediasId].albums[data.albumId].pieces[data.pieceId].comments, comment.id, comment);
            });
        },

        'medias/appendComment': function (state, data) {
            let mediasId;

            if (!data.parentData || !data.albumData || !data.pieceData) {
                return;
            }

            mediasId = data.parentData.parentType + '.' + data.parentData.parentId;

            if (state.medias[mediasId] &&
                state.medias[mediasId].albums &&
                state.medias[mediasId].albums[data.albumData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments
            ) {
                Vue.set(state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments, data.commentData.id, data.commentData);
            }
        },

        'medias/updateComment': function (state, data) {
            let mediasId;

            if (!data.parentData || !data.albumData || !data.pieceData) {
                return;
            }

            mediasId = data.parentData.parentType + '.' + data.parentData.parentId;

            if (state.medias[mediasId] &&
                state.medias[mediasId].albums &&
                state.medias[mediasId].albums[data.albumData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments
            ) {
                Vue.set(state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments[data.commentData.id], 'content', data.commentData.content)
            }
        },

        'medias/deleteComment': function (state, data) {
            let mediasId;

            if (!data.parentData || !data.albumData || !data.pieceData) {
                return;
            }

            mediasId = data.parentData.parentType + '.' + data.parentData.parentId;

            if (state.medias[mediasId] &&
                state.medias[mediasId].albums &&
                state.medias[mediasId].albums[data.albumData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id] &&
                state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments
            ) {
                Vue.delete(state.medias[mediasId].albums[data.albumData.id].pieces[data.pieceData.id].comments, [data.id])
            }
        },

        'medias/mediaAlbumAddOrEdit': function (state, data) {
            let mediasId = data.parentType + '.' + data.posterId;

            if (state.medias[mediasId] && state.medias[mediasId].albums) {
                Vue.set(state.medias[mediasId].albums, data.id, data)
            }
        },

        'medias/mediaAlbumDelete': function (state, data) {
            let mediasId = data.parentType + '.' + data.posterId;

            if (state.medias[mediasId] && state.medias[mediasId].albums) {
                Vue.delete(state.medias[mediasId].albums, data.id)
            }
        },

        'medias/mediaPieceAddOrEdit': function (state, data) {
            let mediasId = data.posterType + '.' + data.posterId,
                albumId = data.albumId,
                pieceId = data.id;

            if (state.medias[mediasId] &&
                state.medias[mediasId].albums &&
                state.medias[mediasId].albums[albumId] &&
                state.medias[mediasId].albums[albumId].pieces
            ) {
                Vue.set(state.medias[mediasId].albums[albumId].pieces, pieceId, data);
            }
        },

        'medias/mediaPieceDelete': function (state, data) {
            let mediasId = data.posterType + '.' + data.posterId;

            if (state.medias[mediasId] &&
                state.medias[mediasId].albums &&
                state.medias[mediasId].albums[data.albumId] &&
                state.medias[mediasId].albums[data.albumId].pieces &&
                state.medias[mediasId].albums[data.albumId].pieces[data.id]
            ) {
                Vue.delete(state.medias[mediasId].albums[data.albumId].pieces, data.id)
            }
        }
    }

}