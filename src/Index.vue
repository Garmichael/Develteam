<template>
    <div id="app">

        <router-view></router-view>
        <modal></modal>
    </div>
</template>

<script>
    import bus from 'vueGlobalEventBus.js'

    export default {
        name: 'main',
        computed: {
            isLoggedIn(){
                return this.$store.state.loggedUserModel.isLoggedIn
            }
        },

        methods: {}
    }
</script>