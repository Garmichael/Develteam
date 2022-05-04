import Vue from 'vue'
import axios from 'axios'

export default {
    state: {
        pageId: 'developers',

        skillFilterId: 0,
        filterControls: {
            developers: {
                showOptions: [
                    {
                        id: 'show|all',
                        label: 'All',
                        selected: true,
                        filterConditions: {}
                    },
                    {
                        id: 'show|designers',
                        label: 'Designers',
                        filterConditions: [
                            {field: 'is_designer', value: 1}
                        ]
                    },
                    {
                        id: 'show|artists',
                        label: 'Artists',
                        filterConditions: [
                            {field: 'is_artist', value: 1}
                        ]
                    },
                    {
                        id: 'show|programmers',
                        label: 'Programmers',
                        filterConditions: [
                            {field: 'is_programmer', value: 1}
                        ]
                    },
                    {
                        id: 'show|musicians',
                        label: 'Musicians',
                        filterConditions: [
                            {field: 'is_musician', value: 1}
                        ]
                    },
                    {
                        id: 'show|sfx',
                        label: 'SFX Artists',
                        filterConditions: [
                            {field: 'is_sfx_artist', value: 1}
                        ]
                    },
                    {
                        id: 'show|writers',
                        label: 'Writers',
                        filterConditions: [
                            {field: 'is_writer', value: 1}
                        ]
                    },
                    {
                        id: 'show|producers',
                        label: 'Producers',
                        filterConditions: [
                            {field: 'is_producer', value: 1}
                        ]
                    },
                    {
                        id: 'show|testers',
                        label: 'Testers',
                        filterConditions: [
                            {field: 'is_tester', value: 1}
                        ]
                    }
                ],
                recruitingOptions: [],
                sortOptions: [
                    {
                        id: 'sort|lastOnilne',
                        label: 'Last Online',
                        selected: true,
                        sortCondition: 'lastOnline',
                        sortDirection: 'desc'
                    },
                    {
                        id: 'sort|proximity',
                        label: 'Proximity',
                        sortCondition: 'proximity',
                        sortDirection: 'asc'
                    },
                    {
                        id: 'sort|xp',
                        label: 'XP Level',
                        sortCondition: 'xp',
                        sortDirection: 'desc'
                    },
                    {
                        id: 'sort|name',
                        label: 'Name',
                        sortCondition: 'alias',
                        sortDirection: 'asc'
                    },
                    {
                        id: 'sort|registrationDate',
                        label: 'Registration Date',
                        sortCondition: 'registrationDate',
                        sortDirection: 'desc'
                    }
                ],
                filterOptions: [
                    {
                        id: 'filter|all',
                        selected: true,
                        label: 'All',
                        filterConditions: {}
                    },
                    {
                        id: 'filter|seeking',
                        label: 'Wants to Join a Game Project',
                        filterConditions: [
                            {field: 'looking_for_game', value: 1}
                        ]
                    }
                ],
                showSkills: true
            },

            games: {
                showOptions: [],
                recruitingOptions: [
                    {
                        id: 'recruiting|all',
                        selected: true,
                        label: 'All',
                        filterConditions: {}
                    },
                    {
                        id: 'recruiting|designers',
                        label: 'Designers',
                        filterConditions: [
                            {field: 'seeking_designers', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|artists',
                        label: 'Artists',
                        filterConditions: [
                            {field: 'seeking_artists', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|programmers',
                        label: 'Programmers',
                        filterConditions: [
                            {field: 'seeking_programmers', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|musicians',
                        label: 'Musicians',
                        filterConditions: [
                            {field: 'seeking_musicians', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|sfx',
                        label: 'SFX Artists',
                        filterConditions: [
                            {field: 'seeking_sfx_artists', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|writers',
                        label: 'Writers',
                        filterConditions: [
                            {field: 'seeking_writers', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|producers',
                        label: 'Producers',
                        filterConditions: [
                            {field: 'seeking_producers', value: 1}
                        ]
                    },
                    {
                        id: 'recruiting|testers',
                        label: 'Testers',
                        filterConditions: [
                            {field: 'seeking_testers', value: 1}
                        ]
                    }
                ],
                sortOptions: [
                    {
                        id: 'sort|lastActive',
                        label: 'Last Active',
                        selected: true,
                        sortCondition: 'lastActive',
                        sortDirection: 'desc'
                    },
                    {
                        id: 'sort|created',
                        label: 'Created',
                        sortCondition: 'created',
                        sortDirection: 'desc'
                    },
                    {
                        id: 'sort|xp',
                        label: 'XP Level',
                        sortCondition: 'xp',
                        sortDirection: 'desc'
                    },
                    {
                        id: 'sort|name',
                        label: 'Name',
                        sortCondition: 'alias',
                        sortDirection: 'asc'
                    },
                    {
                        id: 'sort|teamSize',
                        label: 'Team Size',
                        sortCondition: 'memberCount',
                        sortDirection: 'desc'
                    }
                ],
                filterOptions: [
                    {
                        id: 'filter|all',
                        selected: true,
                        label: 'All',
                        filterConditions: {}
                    },
                    {
                        id: 'filter|seeking',
                        label: 'Currently Recruiting Members',
                        filterConditions: [
                            {field: 'seeking_is', value: 1}
                        ]
                    }
                ],
                showSkills: true
            }
        },

        browseResults: [],
        totalResults: 1,
        resultsPageCurrent: 1,
        resultsPageTotal: 1,
        resultsPerPage: 20,
        isFetching: true
    },

    actions: {
        'browsePage/updatePageId': function (context, data) {
            let pathSegments = context.rootState.route.path.substring(1).split('/'),
                pageId = '';

            if (pathSegments.length <= 1 || pathSegments[1] === '') {
                pageId = 'developers'
            } else {
                pageId = pathSegments[1].toLowerCase()
            }

            context.commit('browsePage/updatePageId', pageId);

            if (data && !data.blockPopulateResults) {
                context.dispatch('browsePage/populateResults');
            }
        },

        'browsePage/initializeFilterOption': function (context, data) {
            let optionType = data.split('|')[0];
            let controls = context.state.filterControls[context.state.pageId];
            let options = [];
            let skillId = context.state.skillFilterId;

            if (optionType === 'sort') {
                options = controls.sortOptions;
            }

            if (optionType === 'filter') {
                options = controls.filterOptions;
            }

            if (optionType === 'show') {
                options = controls.showOptions;
            }

            if (optionType === 'recruiting') {
                options = controls.recruitingOptions;
            }

            if (optionType === 'skill') {
                skillId = data.split('|')[1];
            }

            options.forEach(function (option) {
                context.commit('browsePage/setFilterOption', {option: option, selected: option.id === data});
            });

            context.commit('browsePage/setSkillFilterId', skillId);
        },

        'browsePage/updateFilterOptions': function (context, data) {
            let optionType = data.split('|')[0];
            let controls = context.state.filterControls[context.state.pageId];
            let options = [];
            let skillId = context.state.skillFilterId;

            if (optionType === 'sort') {
                options = controls.sortOptions;
            }

            if (optionType === 'filter') {
                options = controls.filterOptions;
            }

            if (optionType === 'show') {
                options = controls.showOptions;
            }

            if (optionType === 'recruiting') {
                options = controls.recruitingOptions;
            }

            if (optionType === 'skill') {
                skillId = data.split('|')[1];
            }

            options.forEach(function (option) {
                context.commit('browsePage/setFilterOption', {option: option, selected: option.id === data});
            });

            context.commit('browsePage/setSkillFilterId', skillId);

            context.dispatch('browsePage/populateResults');
        },

        'browsePage/populateResults': function (context) {
            let controls = context.state.filterControls[context.state.pageId],
                sortCondition,
                sortDiection,
                filterOptions,
                showOptions,
                recruitingOptions,
                payload;

            context.state.isFetching = true;

            controls.sortOptions.forEach(function (option) {
                if (option.selected) {
                    sortCondition = option.sortCondition;
                    sortDiection = option.sortDirection;
                }
            });

            controls.filterOptions.forEach(function (option) {
                if (option.selected) {
                    filterOptions = option.filterConditions;
                }
            });

            controls.showOptions.forEach(function (option) {
                if (option.selected) {
                    showOptions = option.filterConditions;
                }
            });

            controls.recruitingOptions.forEach(function (option) {
                if (option.selected) {
                    recruitingOptions = option.filterConditions;
                }
            });

            payload = {
                filteredConditions: {
                    category: context.state.pageId,
                    sortOptions: {
                        sortCondition: sortCondition,
                        sortDirection: sortDiection
                    },
                    filterOptions: filterOptions,
                    showOptions: showOptions,
                    recruitingOptions: recruitingOptions,
                    skillFilterId: context.state.skillFilterId
                },
                pagination: {
                    page: context.state.resultsPageCurrent,
                    perPage: context.state.resultsPerPage
                }
            };

            axios.get('/api/browseResults', {
                params: payload
            }).then(
                (response) => {
                    context.commit('browsePage/populateResults', response.data)
                },
                (response) => {
                    console.log(response);
                }
            )

        },

        'browsePage/updateResultsPage': function (context, data) {
            if (data <= 0) {
                data = 1;
            }

            if (data >= context.state.resultsPageTotal) {
                data = context.state.resultsPageTotal;
            }

            context.commit('browsePage/updateResultsPage', data);
            context.dispatch('browsePage/populateResults');
        }
    },

    mutations: {
        'browsePage/updatePageId': function (state, data) {
            state.pageId = data;
            state.resultsPageCurrent = 1;
            state.resultsPageTotal = 0;
        },

        'browsePage/populateResults': function (state, data) {
            state.browseResults = data.browseResults;
            state.totalResults = data.totalResults;

            if (state.browseResults.length > 0) {
                Vue.set(state, 'isFetching', false);
                state.resultsPageTotal = Math.ceil(state.totalResults / state.resultsPerPage);
            } else {
                Vue.set(state, 'isFetching', false);
                state.resultsPageTotal = 0;
            }
        },

        'browsePage/setFilterOption': function (state, data) {
            Vue.set(data.option, 'selected', data.selected);
            state.resultsPageCurrent = 1;
            state.resultsPageTotal = 0;
        },

        'browsePage/setSkillFilterId': function (state, data) {
            Vue.set(state, 'skillFilterId', data);
        },

        'browsePage/updateResultsPage': function (state, data) {
            Vue.set(state, 'resultsPageCurrent', data);
        }
    }

}