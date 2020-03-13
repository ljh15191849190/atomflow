// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './store'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import axiosConfig from '@/api/axios.config'
import VeeValidate from 'vee-validate'
import { baseConfig } from './validate/validate.config'
import Validator from './validate/defined.validate.js'
import messages from './validate/zh_CN'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/iconfont.css'
// import 'bootstrap/scss/bootstrap.scss'
import '@leaptocloud/standard-ui/dist/css/standard-ui.min.css'
import './assets/scss/atomflow.scss'
Vue.config.productionTip = false
axiosConfig()
Vue.use(ElementUI).use(VeeValidate, baseConfig)
Validator.localize('zh_CN', messages)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
