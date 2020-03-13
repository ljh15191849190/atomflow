<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/template' }") 流程列表        
    div.atom-content
        div.work-content
            el-button.breadcrumb-btn(type="primary" size="small" @click="addTemplate" icon="el-icon-plus") 新增流程
            el-row.margin-bottom
                el-col(:span="4") 
                    //- 原子作业平台ATOMFLOWAT-254(搜索框中应将请输入脚本名称 改成 请输入模板名称)            
                    el-input(placeholder="请输入流程名称" clearable v-model="name" size="small")
                el-col(:span="4" :offset="1") 
                    el-input(placeholder="请输入创建者名称" clearable v-model="owner" size="small")
                el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="query") 查询
            el-row.tab-content
                el-table(
                    :data="tableData"
                    stripe
                    size="small"
                )
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'createTime'") {{formatter(scope.row)}}
                            span.theme-color.column-name(v-else-if="column.prop === 'name'" @click="toLinkDetail(scope.row)") {{scope.row[column.prop]}}                            
                            span(v-else-if="column.prop === 'shared'") {{scope.row[column.prop] === 1 ? '是' : '否'}}
                            span(v-else) {{scope.row[column.prop]}}
                    el-table-column(label="操作" width="250")
                        template(slot-scope="scope")
                            Atom-Icon-Button(v-for="operation in operations" :key="operation.id" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label" v-if="isShowOpr(scope.row, operation.prop)")
            el-row
                div.flex-end.pagefooter
                    el-pagination(
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="pagination.index"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pagination.size"
                    layout="sizes, prev, pager, next"
                    :page-count="pagination.count")
        Create-Work(
        :visible="workModalVisible"
        v-if="workModalVisible"
        @closeDialog="closeWorkModal"
        :template="checkedNetwork"
        )
</template>
<script>
import columns from '@mock/progress/tableColumns'
import operations from '@mock/progress/operations'
import paginationMixins from '@mixins/pagination.mixins.js'
import DateUtils from '@server/date-utils'
import Utils from '@/server/Utils'
import AtomIconButton from '@lib/AtomIconButton'
import CreateWork from '@/components/work/CreateWork'
import Api from '@api'

export default {
    mixins: [paginationMixins],
    data () {
        return {
            tableData: [],
            columns: [],
            operations: [],
            checkedNetwork: null,
            workModalVisible: false,
            name: '',
            owner: ''
        }
    },
    methods: {
        toLinkDetail (obj) {
            this.$router.push({path: '/templateDetail', query: {id: obj.id}}) 
        },
        addTemplate () {
            this.$router.push({path: '/template/add', query: {from: 'list'}}) 
        },
        formatter (row, column) {
            return DateUtils.formate(row.createTime)
        },
        handleOperation (obj) {
            switch (obj.id) {
                case 'edit':
                    this.$router.push('/template/' + obj.row.id)
                    break
                case 'run':
                    this.$router.push({path: '/addprogress', query: {fromId: obj.row.id}})    
                    break
                case 'delete':
                    this.deleteTemplate(obj.row.id)
                    break
                case 'clone':
                    this.$router.push({path: '/template/' + obj.row.id, query: {fromId: 'clone'}}) 
                    break
                default:
                    this.handleShare(obj.row)
                    break
            }
        },
        handleShare (row) {
            let vm = this
            let typeStr = row.shared === 1 ? '取消共享' : '共享'
            vm.$confirm(`确定${typeStr}脚本: ${row.name}吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let shared = row.shared === 1 ? 0 : 1
                Api.put('sharedTemplate', {id: row.id, shared_status: shared}, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            vm.$notify({
                                title: '通知',
                                type: 'success',
                                message: `${typeStr}成功!`
                            })
                            this.filterDagDetail()
                        } else {
                            vm.$notify({
                                title: '通知',
                                type: 'error',
                                message: '操作失败, 请稍后重试!'
                            })
                        }
                    }
                )
            })
        },
        deleteTemplate (id) {
            let vm = this
            vm.$confirm('确定要删除该模板吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('deleteTemplate', {id}, true).then(
                    (data) => {
                        if (data.rst === 'ok') {
                            //删除成功操作
                            let tableData = vm.tableData
                            for (const key in tableData) {
                                if (id === tableData[key].id) {
                                    vm.tableData.splice(key, 1)
                                    vm.$notify({
                                        title: '通知',
                                        type: 'success',
                                        message: '删除成功!'
                                    })
                                    break
                                }
                            }
                        } else {
                            vm.$notify({
                                title: '通知',
                                type: 'error',
                                message: '删除失败, 请稍后重试!'
                            })
                        }   
                    }
                )
            }).catch(() => { 
            })
        },
        getTemplateById (id) {
            Api.get('getTemplateById', {id}, true).then(
            (data) => {
              this.checkedNetwork = data.data
              this.initNetworkNodes()
              this.workModalVisible = true          
            }
          )
        },
        isShowOpr (rowObj, prop) {
            let users = localStorage.getItem('systemUserName')
            if (rowObj.owner !== users) {
                return prop === 'clone' || prop === 'run'
            }  
            if (rowObj.shared === 1) {
                return prop !== 'share'
            }
                
            if (rowObj.shared === 0) {
                return prop !== 'private'
            }
                
            return true
        },
        initNetworkNodes () {
          //根据节点信息显示shape和eage
          let nodes = JSON.parse(JSON.stringify(this.checkedNetwork.nodes))
          let newNodes = nodes.map(
            (item) => {
              let rst = {}
              rst.id = item.taskId
              rst.alias = item.taskName
              rst.label = item.taskName
              rst.name = item.taskName
              rst.target = item.consumeIp
              if (item.operatorType === 'BranchPythonMapOperator') {
                rst.nodeCategory = 2
                rst.shape = 'ellipse'
                rst.codeMapBranch = item.codeMapBranch
              } else if (item.operatorType === 'JoinOperator') {
                rst.nodeCategory = 3
                rst.shape = 'circle'
              } else {
                rst.nodeCategory = 1
                rst.shape = 'box'
                rst.nodeId = item.nodeId
                rst.vars = item.vars
                rst.versions = item.versions
                rst.version = item.version
                rst.type = item.operatorType === 'PythonOperator' ? 'python' : 'shell'
                rst.downloadUrl = item.fileRemotePath
              }

              return rst
            }
          )
          let edges = JSON.parse(JSON.stringify(this.checkedNetwork.edges))
          let newEdges = edges.map(
            (item) => {
              let rst = {
                id: Utils.uuid(),
                from: item.from,
                to: item.to
              }

              if (item.label) {
                rst.label = item.label
              }

              if (item.title) {
                rst.title = item.title
              }

              if (item.returnCode) {
                rst.returnCode = item.returnCode
              }
            
              return rst
            }
          )
          this.checkedNetwork.nodes = newNodes
          this.checkedNetwork.edges = newNodes.length === 1 ? [] : newEdges  
        },
        closeWorkModal () {
            this.workModalVisible = false
        },
        filterDagDetail () {
            Api.get('getTemplateList', {limit: this.pagination.size, offset: this.pagination.index, flowName: this.name, username: this.owner}, true).then(
                (data) => {
                    this.tableData = data.data.flowList
                    this.pagination.count = data.data.pageCount
                }, (err) => {
                    console.log(err)
                }
            )
        },
        query () {
            this.pagination.index = 1
            this.filterDagDetail()
        }
    },
    created () {
        this.columns = columns
        this.operations = operations
        this.filterDagDetail()
    },
    components: {
        AtomIconButton,
        CreateWork
    }
}
</script>
<style lang="scss" scoped>
</style>
