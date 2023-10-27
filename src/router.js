import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

import ListPage from './components/listPages/ListPage';
import ModelerImageGenerator from './components/designer/ModelerImageGenerator';

Vue.component('list-page', ListPage);
Vue.component("modeler-image-generator", ModelerImageGenerator);

////////////////////////
const KubernetesModelCanvas = () =>
    import(
        /* webpackChunkName: "KubernetesModelCanvas" */ "./components/designer/k8s-modeling/KubernetesModelCanvas"
    );
////////////////////////

export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'KubeEzListPage',
            component: ListPage
        },
        {
            path: '/kubernetes/:projectId',
            name: 'KubernetesModelCanvas',
            component: KubernetesModelCanvas
        },
    ]
});
