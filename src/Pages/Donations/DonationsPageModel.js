import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        donors: []
    },

    actions: {
        'donationsPage/populateDonors': function (context) {
            axios.get('/api/donors')
                .then(
                    (response) => {
                        context.commit('donationsPage/populateDonors', response.data)
                    },
                    (response) => {
                        console.log(response);
                    }
                )

        }
    },

    mutations: {
        'donationsPage/populateDonors': function (state, data) {
            state.donors = data.donors;
        }
    }

}