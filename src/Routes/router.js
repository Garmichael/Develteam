import VueRouter from 'vue-router'
import Router from './routes.js';
let router = Router({VueRouter: VueRouter});
import bus from '../vueGlobalEventBus.js'

router.afterEach((to, from) => {
    if (router.app.$store) {
        router.app.$store.dispatch('notificationsModel/markReadFromRoute', {to, from});
    }
});
module.exports = router;