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
        namespace: {'width': 100, 'height': 100},
        persistenceVolume: {'width': 100, 'height': 100},
        persistenceVolumeClaim: {'width': 100, 'height': 100},
        pod: {'width': 100, 'height': 100},
        replicaSet: {'width': 100, 'height': 100},
        service: {'width': 100, 'height': 100},
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
