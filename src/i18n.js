import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '../src/locales/en'
import ko from '../src/locales/ko'
Vue.use(VueI18n)

// setting locale
export default new VueI18n({
    locale: 'ko',
    fallbackLocale: 'en',
    messages: {en, ko}
})