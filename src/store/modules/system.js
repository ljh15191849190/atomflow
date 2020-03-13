import * as types from '../mutations_types'

const state = () => {
    return {
        system: {
            showNavBar: true, // 左侧导航栏显示状态
            activedNavIndex: ''
        }
    }
}

const getters = {
    showNavBar: state => state.system.showNavBar,
    activedNavIndex: state => state.system.activedNavIndex
}

const actions = {
    setNavBarDisplay ({commit, state}, status) {
        commit(types.SET_NAVBAR_DISPLAY, status)
    },
    setActivedNavIndex ({commit, state}, list) {
        commit(types.SET_ACTIVED_NAV_INDEX, list)
    }
}

const mutations = {
    [types.SET_NAVBAR_DISPLAY] (state, status) {
        state.system.showNavBar = status
    },
    [types.SET_ACTIVED_NAV_INDEX] (state, index) {
        state.system.activedNavIndex = index
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
