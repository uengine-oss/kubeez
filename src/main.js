import Vue from 'vue'
import './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import VueJWT from 'vuejs-jwt'
import VModal from 'vue-js-modal'
import Opengraph from './components/opengraph'
import KubeModeling from './components/designer/k8s-modeling'
import Mustache from 'mustache'
import VueFriendlyIframe from 'vue-friendly-iframe';
import CodeMirror from 'vue-codemirror'
import VueYouTubeEmbed from 'vue-youtube-embed'
import vuetify from './plugins/vuetify';
import * as VueWindow from '@hscmap/vue-window'
import TreeView from 'vue-json-tree-view'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import VueSimpleContextMenu from 'vue-simple-context-menu'
import VueSuperMethod from 'vue-super-call'


Vue.use(VueFriendlyIframe);
Vue.use(VueWindow);
Vue.use(Mustache);
Vue.use(CodeMirror);
Vue.use(Opengraph);
Vue.use(KubeModeling);
// Vue.use(i18n);
Vue.use(VModal);
Vue.use(TreeView);
Vue.use(VueJWT, options);
Vue.use(VueYouTubeEmbed, {
    global: true,
    componentId: "youtube-media"
});


// component
Vue.component('vue-context-menu', VueSimpleContextMenu)

var options = {'keyName' : 'accessToken'};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

Vue.prototype.$EventBus = new Vue();
Vue.prototype.$ModelingBus = new Vue();
Vue.prototype.$manifestsPerTemplate = {};
Vue.prototype.$innerWidth = window.innerWidth;
Vue.prototype.$innerHeight = window.innerHeight;
Vue.prototype.$super = VueSuperMethod;

Vue.config.productionTip = false;


// TrackJS.install({
//     token: "c57ef0e614dd477bb035e6a50522c4bc",
//     application: "eventstorming2code"
//     // for more configuration options, see https://docs.trackjs.com
// });

// TrackJS.track('Testing TrackJS!');

window.$Mustache = Mustache;
// window.API_HOST = "http://localhost:8080";
window.API_HOST = "http://api.kuberez.io";
window.vueFilePath = process.env.VUE_APP_FILE_PATH;


new Vue({
    router,
    store,
    vuetify,
    // i18n,
    render: function (h) { return h(App) }

}).$mount('#app')

