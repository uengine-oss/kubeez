import KuberEz from './App.vue'

const install = (Vue) => {
    Vue.component('KuberEz', KuberEz)
}

// auto install if used in browser
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default install