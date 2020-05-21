const ClassModeling = {
  install (Vue, opts = {}) {

    const files = require.context('.', true, /\.vue$/);
    const components = {}
    files.keys().forEach((key) => {
      if (key === './index.js') {
        return;
      }
      components[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
    });

    if(Vue._components==null) Vue._components = {};

    for (var key in components) {
      Vue.component(components[key].default.name, components[key].default);
      Vue._components[components[key].default.name] = components[key].default;
    }

    //bpmn 컴포넌트 검색용
    Vue.classModelingComponents = components;

    //윈도우 전역변수 등록 (다른 인스톨 플러그인에서 거진 하긴 해주지만 혹시 모르니...)
    if (window && !window.Vue) {
      window.Vue = Vue;
    }
  }
}

export default ClassModeling


