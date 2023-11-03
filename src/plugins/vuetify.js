import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);
import '@mdi/font/css/materialdesignicons.css'

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});
