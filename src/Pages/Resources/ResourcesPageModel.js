import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        resources: [],
        submittedNewResource: false
    },

    actions: {
        'resourcesPage/populateResources': function (context) {
            axios.get('/api/resources')
                .then(
                    (response) => {
                        context.commit('resourcesPage/populateResources', response.data)
                    },
                    (response) => {
                        console.log(response);
                    }
                )

        },

        'resourcesPage/submitResource': function (context, data) {
            axios.post('/api/resources', data)
                .then(
                    (response) => {
                        context.dispatch('resourcesPage/populateResources');
                        context.state.submittedNewResource = true;
                    },
                    (response) => {
                        console.log(response);
                    }
                )
        }
    },

    mutations: {
        'resourcesPage/populateResources': function (state, data) {
            state.resources = data.resources;
        }
    }

}