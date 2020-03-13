import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import tree from './modules/tree'
import system from './modules/system'
import work from './modules/work'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    tree,
    system,
    work
  },
  strict: debug
})
