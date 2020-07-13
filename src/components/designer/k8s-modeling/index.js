const KubeModeling = {
    install (Vue, opts = {}) {

        const files = require.context('.', true, /\.vue$/);
        const KubeModelingComponents = {}
        files.keys().forEach((key) => {
            if (key === './index.js') {
                return;
            }
            KubeModelingComponents[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
        });

        if(Vue._components==null) Vue._components = {};

        for (var key in KubeModelingComponents) {
            Vue.component(KubeModelingComponents[key].default.name, KubeModelingComponents[key].default);
            Vue._components[KubeModelingComponents[key].default.name] = KubeModelingComponents[key].default;
        }

        Vue.KubeModelingComponents = KubeModelingComponents;

        if (window && !window.Vue) {
            window.Vue = Vue;
        }
    }
}

export default KubeModeling


