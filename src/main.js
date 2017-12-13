import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

// Import mixin
import { commonHelpers } from './helpers/mixins'

Vue.mixin(commonHelpers)

Vue.use(Vuetify)

new Vue({
  el: '#app',
  render: h => h(App)
})
