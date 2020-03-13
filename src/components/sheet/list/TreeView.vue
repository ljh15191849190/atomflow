<template lang="pug">
  div.full-container 
    add-folder(v-if="modalVisible" :visible="modalVisible" :checkedNode="checkedNodeData"  @closeDialog="closeModal" @insertNode="insertNode")
    el-row.tree-container(:gutter="15")
        el-col(:span="12")
          el-input(placeholder="输入关键字进行过滤" clearable v-model="filterText" size="small")
          div.filter-container
            el-tree.filter-tree(
                :data="realTreeData"
                :props="defaultProps"
                :node-key="defaultProps.id"
                :filter-node-method="filterNode"
                :expand-on-click-node="false"
                :render-content="renderContent"
                @node-expand="nodeExpand"
                @node-collapse="nodeCollapse"
                :ref="treeRef"
                :default-expanded-keys="defaultExpkeys"
            )
</template>
<script>
import Utils from '@/server/Utils'
import treeMixins from '@mixins/tree.mixins'
import AddFolder from '../AddFolder'
import Api from '@api'

export default {
  mixins: [treeMixins],
  data () {
    return {
      treeRef: 'templateRef',
      treeData: [], 
      defaultProps: {
        id: 'id',
        parentId: 'parentId',
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      maxLevel: 3,
      modalVisible: false,
      checkedNodeData: null,
      defaultExpkeys: [],
      firstLoad: false,
      filterText: ''
    }
  },
  computed: {
      realTreeData () {
          let tempData = JSON.parse(JSON.stringify(this.treeData))
          return Utils.transformToTreeData(tempData, this.defaultProps.id, this.defaultProps.parentId, this.defaultProps.children, null)
      }
  },
  methods: {
      renderContent (h, { node, data, store }) {
          let rst = null
          if (!data.name) return
          if (!data.parentId) {
            rst = (
                <span class={node.data.userChecked ? 'render-node checked-node' : 'render-node'}>
                    <span>
                    <i class={'atom-icon-folder theme-color'}></i>
                    </span>
                    <span>
                    <span>{data.name}</span>
                    </span>
                    <span>
                    <i class="el-icon-circle-plus-outline tree-btns" type="text" title="添加子目录" on-click={ () => this.addFolder(node, data) }></i>
                    </span>
                </span>
            )
          } else if (data.leaf) {
            rst = (
                <span class={node.data.userChecked ? 'render-node checked-node' : 'render-node'}>
                    <span>
                    <i class={'atom-icon-flow-manager theme-color'}></i>
                    </span>
                    <span>
                    <span>{data.name}</span>
                    </span>
                </span>
            )
          } else if (node.level < this.maxLevel) {
              rst = (
                  <span class={node.data.userChecked ? 'render-node checked-node' : 'render-node'}>
                      <span>
                      <i class={'atom-icon-folder theme-color'}></i>
                      </span>
                      <span>
                      <span>{data.name}</span>
                      </span>
                      <span>
                      <i class="el-icon-circle-plus-outline tree-btns" type="text" title="添加目录" on-click={ () => this.addFolder(node, data) }></i>
                      <i class="atom-icon-delete tree-btns theme-color" type="text" title="删除目录" on-click={ () => this.removeFolder(node, data) }></i>
                      </span>
                  </span>
              )
          } else {
              rst = (
                  <span class={node.data.userChecked ? 'render-node checked-node' : 'render-node'}>
                      <span>
                      <i class={'atom-icon-folder theme-color'}></i>
                      </span>
                      <span>
                      <span>{data.name}</span>
                      </span>
                      <span>
                      <i class="atom-icon-delete tree-btns theme-color" type="text" title="删除目录" on-click={ () => this.removeFolder(node, data) }></i>
                      </span>
                  </span>
              )
          }

          return rst
      },
      filterNode (value, data) {
          if (!value) return data.name
          if (data.name && data.name.indexOf(value) !== -1) {
              this.nodeExpand(data)
          }
          return data.name && data.name.indexOf(value) !== -1
      },
      addFolder (node, data) {
          this.checkedNodeData = data
          this.modalVisible = true        
      },
      removeFolder (node, data) {
          let vm = this
          let msg = '确定要删除 ' + data.name + ' 目录吗?'
          vm.$confirm(msg, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
          }).then(() => {
              Api.delete('deleteFolderNode', {nodeId: data.id}, true).then(
                  (result) => {
                      if (result.rst === 'ok') {
                          //删除成功操作
                          const parent = node.parent
                          const children = parent.data.children || parent.data
                          const index = children.findIndex(d => d.id === data.id)
                          children.splice(index, 1)
                          vm.$notify({
                              title: '通知',
                              type: 'success',
                              message: '目录 ' + data.name + ' 删除成功!'
                          })
                      } else if (result.err_code === 1004) {
                          vm.$notify({
                              title: '通知',
                              type: 'warning',
                              message: '目录 ' + data.name + ' 被使用，不能删除!'
                          })
                      } else {
                          vm.$notify({
                              title: '通知',
                              type: 'error',
                              message: '删除失败,请稍后重试!'
                          })
                      }
                  }
              )
          }).catch(() => { 
          })
      },
      insertNode (node) {
          this.nodeExpand(this.checkedNodeData)
          let index = this.checkedNodeData.children.findIndex(item => item.leaf)
          if (index > -1) {
              this.checkedNodeData.children.splice(index, 0, node)
          } else {
              this.checkedNodeData.children.push(node)
          }
          this.modalVisible = false 
      },
      getFolderTreeNodes () {
          Api.get('getFolderTreeNodes', {}, true).then(
              (data) => {
                this.treeData = data.data
                this.treeData.forEach(item => {
                    this.$set(item, 'leaf', false)
                    this.$set(item, 'children', [{id: Utils.uuid()}])
                })
                this.defaultExpkeys.push('root')
                let index = this.treeData.findIndex(item => item.id === 'root')
                this.getFolderFile(this.treeData[index])
              }
          )
      },
      nodeExpand (data) {
          if (this.defaultExpkeys.findIndex(item => item === data.id) < 0) {
              this.defaultExpkeys.push(data.id)
          }

          if (!data.children && !data.leaf) {
              this.$set(data, 'children', [{id: Utils.uuid()}])
          }       
          //模拟懒加载:加载过的不在加载
          if (!data.lazyload) {
              this.getFolderFile(data)
          }
      },
      nodeCollapse (data) {
          let index = this.defaultExpkeys.findIndex(item => item === data.id)
          if (index > -1) {
              this.defaultExpkeys.splice(index, 1)
          }
          //如果去除的目录下有展开的子节点也要去除
          let tempArr = this.treeData.filter(item => item.parentId !== 'root' && (item.parentId === data.id))
          this.defaultExpkeys.forEach((id, idx) => {
              if (tempArr.find(item => item.id === id)) {
                  this.defaultExpkeys.splice(idx, 1)
              }
          }) 
      },
      getFolderFile (data) {
          Api.get('getSheetListByFolderId', {nodeId: data.id}, {offset: 1, limit: 999}, true).then(
              treeData => {
                  if (treeData.rst === 'ok') {
                      let loadData = []
                      let children = treeData.data.fileList
                      children.forEach(item => {
                          let nodeItem = {
                              id: item.id,
                              name: item.name,
                              leaf: true,
                              parentId: data.id
                          }
                          loadData.push(nodeItem)
                      })

                      if (this.firstLoad) {
                          this.firstLoad = false
                          this.$set(data, 'lazyload', true)
                          this.treeData = [...this.treeData, ...loadData]
                      } else {
                          data.children.forEach((item, index) => {
                              if (!item.name) {
                                  data.children.splice(index, 1)
                              }
                          })
                          data.children = [...data.children, ...loadData]
                          this.$set(data, 'lazyload', true)
                      }
                  }
              }
          )
      },
      closeModal () {
          this.modalVisible = false  
      }
  },
  watch: {
      filterText (val) {
        this.$refs.templateRef.filter(val)
      }
  },
  created () {
      this.firstLoad = true
      this.getFolderTreeNodes()
  },
  components: {
    AddFolder
  }
}
</script>
<style lang="scss" scoped>
.tree-container {
  position: relative;
  overflow: hidden;
  height: calc(100% - 20px);
  .filter-container {
     position: absolute;
     width: calc(100% - 10px);
     height: 100%;
     overflow: auto;
     padding-bottom: 5px;
  }
}
.tree-btns {
  margin-right: 10px;
}
</style>
