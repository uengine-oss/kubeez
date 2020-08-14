import Vue from 'vue'
import Router from 'vue-router'



Vue.use(Router)

import KubeModeler from './components/designer/k8s-modeling/KubeModeler'

Vue.component('kube-modeler', KubeModeler)



export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            redirect: '/dash'
            // name: 'EventStormingCanvas',
            // component: KubeModeler
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
    ]
})
