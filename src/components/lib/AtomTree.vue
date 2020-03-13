<template lang="pug">
  div.container.tree-container
    el-input(v-if="filterSwitch" v-model="filterValue" size="mini")
    el-tree.filter-tree(:data="realTreeData"
        :props="defaultProps"
        :node-key="defaultProps.id"
        :default-checked-keys="computedDefaultCheckedIds"
        :current-node-key="currentNodeKey"
        show-checkbox
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        @check-change="handleCheckChange"
        @node-click="nodeClick"
        :ref="treeRef")
</template>
<script>
import Utils from '@/server/Utils'
import treeMixins from '@mixins/tree.mixins'
export default {
  mixins: [treeMixins],
  // data: 数据 (require)
  // treeRef: ref (require)
  // defaultProps: 区分节点的唯一id和显示label (require)
  // checkedNodeKeys: 选中的节点id (require)
  // node: 数据中节点id、parentId字段名称 (require)
  // filter: show: 显示搜索框；radio: 是否多选
  props: ['treeRef', 'treeData', 'defaultProps', 'checkedKeys', 'filterSwitch', 'filterValue', 'checkBoxStyle', 'checkStrictly'],
  computed: {
    realTreeData () {
        let tempData = JSON.parse(JSON.stringify(this.treeData))
        return Utils.transformToTreeData(tempData, this.defaultProps.id, this.defaultProps.parentId, this.defaultProps.children, '0')
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
</style>
