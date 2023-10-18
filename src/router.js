import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

import ListPage from './components/KuberEzList/ListPage';
Vue.component('list-page', ListPage);

////////////////////////
const KubernetesModelCanvas = () =>
    import(
        /* webpackChunkName: "KubernetesModelCanvas" */ "./components/designer/k8s-modeling/KubernetesModelCanvas"
    );
////////////////////////

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        // {
        //     path: '/',
        //     name: 'KuberEzListPage',
        //     component: ListPage
        // },
        {
            path: '/',
            name: 'KubernetesModelCanvas',
            component: KubernetesModelCanvas
        },
    ]
});
