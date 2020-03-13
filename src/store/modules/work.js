import * as types from '../mutations_types'

const state = () => {
    return {
        cycleWorkType: '',
        workRelationType: null,
        workRelationState: null
    }
}

const getters = {
    cycleWorkType: state => state.cycleWorkType,
    workRelationType: state => state.workRelationType,
    workRelationState: state => state.workRelationState
}

const actions = {
    setCycleWorkType ({commit, state}, type) {
        commit(types.SET_CYCLE_WORK_TYPE, type)
    },
    setWorkRelationType ({commit, state}, type) {
        commit(types.SET_WORKRELATION_TYPE, type)
    },
    setWorkRelationState ({commit, state}, type) {
        commit(types.SET_WORKRELATION_STATE, type)
    }
}

const mutations = {
    [types.SET_CYCLE_WORK_TYPE] (state, type) {
        state.cycleWorkType = type
    },
    [types.SET_WORKRELATION_TYPE] (state, type) {
        state.workRelationType = type
    },
    [types.SET_WORKRELATION_STATE] (state, type) {
        state.workRelationState = type
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
