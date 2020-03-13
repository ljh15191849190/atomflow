import * as types from '../mutations_types'

const state = () => {
    return {
        atomTree: {
            ref: '',
            treeData: [],
            defaultProps: {
                id: 'id',
                parentId: 'parentId',
                children: 'children',
                label: 'name'
            },
            checkedKeys: [],
            filter: {
                switch: true,
                text: ''
            },
            checkboxStyle: 'checkbox',
            checkStrictly: true
        }
    }
}

const getters = {
    treeRef: state => state.atomTree.ref,
    treeData: state => state.atomTree.treeData,
    defaultProps: state => state.atomTree.defaultProps,
    checkedKeys: state => state.atomTree.checkedKeys,
    filterSwitch: state => state.atomTree.filter.switch,
    filterValue: state => state.atomTree.filter.value,
    checkBoxStyle: state => state.atomTree.checkboxStyle,
    checkStrictly: state => state.atomTree.checkStrictly
}

const actions = {
    setTreeRef ({commit, state}, ref) {
        commit(types.SET_TREE_REF, ref)
    },
    setAtomTreeData ({commit, state}, func) {
        func().then(
            (data) => {
                commit(types.SET_TREE_DATA, data)        
            }, () => {

            }
        )
    },
    setTreeDefaultProps ({commit, state}, obj) {
        commit(types.SET_TREE_DATA, { obj })    
    },
    setCheckedKeys ({commit, state}, obj) {
        commit(types.SET_TREE_CHECKED_KEYS, { obj })    
    },
    setTreeFilterSwitch ({commit, state}, obj) {
        commit(types.SET_TREE_FILTER_SWITCH, { obj })    
    },
    setTreeFilterValue ({commit, state}, obj) {
        commit(types.SET_TREE_FILTER_VALUE, obj)    
    },
    setCheckBoxStyle ({commit, state}, obj) {
        commit(types.SET_CHECKBOX_STYLE, { obj })    
    }
}

const mutations = {
    [types.SET_TREE_REF] (state, ref) {
        state.atomTree.ref = ref
    },
    [types.SET_TREE_DATA] (state, data) {
        state.atomTree.treeData = [].concat(data)
    },
    [types.SET_TREE_CHECKED_KEYS] (state, data) {
        state.atomTree.checkedKeys = data
    },
    [types.SET_TREE_FILTER_SWITCH] (state, data) {
        state.atomTree.filter.switch = data
    },
    [types.SET_TREE_FILTER_VALUE] (state, data) {
        state.atomTree.filter.value = data
    },
    [types.SET_CHECKBOX_STYLE] (state, data) {
        state.atomTree.checkboxStyle = data
    }
    // [types.SET_TREE_DATA] (state, data) {
    //     state.atomTree.data = data
    // }
}

export default {
    state,
    getters,
    actions,
    mutations
}
