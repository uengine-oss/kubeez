import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import KubeModeler from './components/designer/k8s-modeling/KubeModeler';
import ListPage from './components/KuberEzList/ListPage';

Vue.component('kube-modeler', KubeModeler);
Vue.component('list-page', ListPage);

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
            name: 'KubeModelingCanvas',
            component: KubeModeler
        },
        // {
        //     path: '/kubernetes/:userUid/:projectType/:projectId/:projectVersion',
        //     name: 'KubeModelingCanvas',
        //     component: KubeModeler
        // },
    ]
});
