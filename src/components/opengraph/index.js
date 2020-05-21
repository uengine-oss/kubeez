const Opengraph = {
  install (Vue, opts = {}) {

    const files = require.context('.', true, /\.vue$/);
    const OGComponents = {}
    files.keys().forEach((key) => {
      if (key === './index.js') {
        return;
      }
      OGComponents[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
    });
    for (var key in OGComponents) {
      Vue.component(OGComponents[key].default.name, OGComponents[key].default);
      // console.log("installed : " + OGComponents[key].default.name)
    }

    //opengraph 컴포넌트 검색용
    Vue.OGComponents = OGComponents;

    //opengraph 용 이벤트 버스
    Vue.OGBus = new Vue();

    //opengraph 활성 컴포넌트 저장소
    Vue.OGLiveComponents = {};

    //윈도우 전역변수 등록 (다른 인스톨 플러그인에서 거진 하긴 해주지만 혹시 모르니...)
    if (window && !window.Vue) {
      window.Vue = Vue;
    }
  }
}

export default Opengraph


