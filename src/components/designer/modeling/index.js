const Modeling = {
  install (Vue, opts = {}) {

    const files = require.context('.', true, /\.vue$/);
    const ModelingComponents = {}
    files.keys().forEach((key) => {
      if (key === './index.js') {
        return;
      }
      ModelingComponents[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
    });

    if(Vue._components==null) Vue._components = {};

    for (var key in ModelingComponents) {
      Vue.component(ModelingComponents[key].default.name, ModelingComponents[key].default);
      // Vue._components[ModelingComponents[key].default.name] = ModelingComponents[key].default;
    }

    Vue.modelingComponents = ModelingComponents;

    if (window && !window.Vue) {
      window.Vue = Vue;
    }
  }
}

export default Modeling


