import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.prototype.$http = axios
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        accessToken: null,
        kubeHost: '',
        kubeToken: '',
        username:'',
        storeAuthorized: false,
        // 기본 사이즈 지정
        deployment: {'width': 100, 'height': 100},
        ingress: {'width': 100, 'height': 100},
        namespace: {'width': 400, 'height': 400},
        persistentVolume: {'width': 100, 'height': 100},
        persistentVolumeClaim: {'width': 100, 'height': 100},
        pod: {'width': 100, 'height': 100},
        replicaSet: {'width': 100, 'height': 100},
        service: {'width': 100, 'height': 100},
        statefulSet: {'width': 100, 'height': 100},
        daemonSet: {'width': 100, 'height': 100},
        storageClass: {'width': 100, 'height': 100},
        job: {'width': 100, 'height': 100},
        cronjob: {'width': 100, 'height': 100},
        configMap: {'width': 100, 'height': 100},
        secret: {'width': 100, 'height': 100},
        role: {'width': 100, 'height': 100},
        roleBinding: {'width': 100, 'height': 100},
        clusterRole: {'width': 100, 'height': 100},
        clusterRoleBinding: {'width': 100, 'height': 100},
        hpa: {'width': 100, 'height': 100},
        serviceAccount: {'width': 100, 'height': 100},
        // istio 기본 사이즈 지정
        gateway: {'width': 100, 'height': 100},
        virtualService: {'width': 100, 'height': 100},
        destinationRule: {'width': 100, 'height': 100},
        serviceEntry: {'width': 100, 'height': 100},
        sidecar: {'width': 100, 'height': 100},
        quota: {'width': 100, 'height': 100},
        rule: {'width': 100, 'height': 100},
        quotaSpec: {'width': 100, 'height': 100},
        quotaSpecBinding: {'width': 100, 'height': 100},
        memquota: {'width': 100, 'height': 100},
        // knative 기본 사이즈 지정
        knativeService: {'width': 100, 'height': 100},
        // argo 기본 사이즈 지정
        workflow: {'width': 100, 'height': 100}
    },
    getters: {
        getAuth(state) {
            return state.storeAuthorized
        },
        getWidth: (state) => (type) => {
            return eval("state." + type.charAt(0).toLowerCase() + type.slice(1) + ".width")
        },
        getHeight: (state) => (type) => {
            return eval("state." + type.charAt(0).toLowerCase() + type.slice(1) + ".height")
        },
    },
    mutations: {
        resize(state, data) {
            eval("state." + data.type.charAt(0).toLowerCase() + data.type.slice(1) + ".width = " + data.width)
            eval("state." + data.type.charAt(0).toLowerCase() + data.type.slice(1) + ".height = " + data.height)
        },
    },
    actions: {
        resize({commit}, data) {
            commit('resize', data)
        },

    }
})
