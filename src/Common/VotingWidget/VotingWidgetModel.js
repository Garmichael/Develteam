import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        voteData: {}
    },

    actions: {
        'votingWidget/retrieve': function (context, data) {

            axios.get('/api/voting', {
                params: {
                    parentType: data.parentType,
                    parentId: data.parentId
                }
            }).then(
                (response) => {
                    context.commit(
                        'votingWidget/setData',
                        {
                            voteTotal: response.data.voteTotal,
                            id: data.parentType + '|' + data.parentId
                        }
                    );
                }
            )
        }
    },

    mutations: {
        'votingWidget/setData': function (state, data) {
            Vue.set(state.voteData, data.id, data.voteTotal);
        }
    }

}