import Vue from 'vue'
import Router from 'vue-router'



Vue.use(Router)

import KubeModeler from './components/designer/k8s-modeling/KubeModeler'

Vue.component('kube-modeler', KubeModeler)



export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        // {
        //     path: '/',
        //     name: 'Introduce',
        //     component: Introduce
        // },
        {
            path: '/',
            name: 'EventStormingCanvas',
            component: KubeModeler
        },
        {
            path: '/dash',
            name: 'EventStormingCanvas',
            component: KubeModeler
        },
        // {
        //     path: '/view',
        //     name: 'ViewModelingDesigner',
        //     component: ViewModelingDesigner
        // },
        // {
        //     path: '/storming/:userUid/:projectType/:projectId/:projectVersion',
        //     name: 'EventStormingCanvas',
        //     component: EventModeler
        // }
        // {
        //     path: '/',
        //     name: 'EventStorming',
        //     component: EventModeler
        // },
        // {
        //   path: '/about',
        //   name: 'about',
        //   // route level code-splitting
        //   // this generates a separate chunk (about.[hash].js) for this route
        //   // which is lazy-loaded when the route is visited.
        //   component: function () {
        //     return import(/* webpackChunkName: "about" */ './views/About.vue')
        //   }
        // }
    ]
})
