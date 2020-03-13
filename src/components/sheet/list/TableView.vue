<template lang="pug">
div.full-container
    el-row.margin-bottom(:gutter="20")
        el-col(:span="22")             
            Sheet-Query(@filterChange="filterChange" :pagination="pagination" ref="sheetQuery" :isSheetList="true")
        el-col(:span="2")   
            el-button(type="primary" size="small" @click="getSheetList") 查询
    el-row.tab-content
        el-table(:data="tableData" size="small" stripe)
            el-table-column(label="工具名称" width="200")
                template(slot-scope="scope")
                    span.theme-color.column-name(@click="toSheetDetail(scope.row)") {{scope.row.name}}
            //- 原子作业平台ATOMFLOWAT-283(脚本列表中的复选框可以去除，多余功能)
            el-table-column(v-for="column in columns" :key="column.prop" :type="column.type" :prop="column.prop" :label="column.label" :width="column.width")
                template(slot-scope="scope")
                    span(v-if="column.prop === 'createDate' || column.prop === 'updateDate'") {{formatter(scope.row[column.prop])}}
                    span(v-else-if="column.prop === 'shareType'") {{scope.row[column.prop] === 1 ? '是' : '否'}}
                    el-tag(v-else-if="column.prop === 'risk_level'" :color="scope.row.risk_level ? statusTypeObj[scope.row.risk_level].color : ''" size="mini") {{ scope.row.risk_level ? statusTypeObj[scope.row.risk_level].label : "" }}
                    label(v-else) {{scope.row[column.prop]}}
            el-table-column(label="操作" width="220")
                template(slot-scope="scope")
                    Atom-Icon-Button(v-for="operation in tableOperations" :key="operation.id" :type="operation.type" @iconClick="operationHandler" :args="{id: operation.prop, row: scope.row}" :text="operation.label" v-if="isShowOpr(scope.row, operation.prop)")
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
</template>
<script>
import paginationMixins from '@mixins/pagination.mixins.js'
import Api from '@api'
import tableOprations from '@mock/sheet/tableOprations'
import DateUtils from '@server/date-utils'
import tableColumns from '@mock/sheet/tableColumns'
import AtomIconButton from '@lib/AtomIconButton'
import SheetQuery from '@/components/lib/SheetQuery'
export default {
    mixins: [paginationMixins],
    data () {
        return {
            tableInfo: {},
            columns: [],
            tableOperations: [],
            workModalVisible: false,
            filterRules: {}
        }
    },
    methods: {
        /**
         * 删除脚本
         * @augments
         * @author davidPan
         */
        deleteSheet (row) {
            let vm = this
            vm.$confirm(`确定要删除脚本: ${row.name} 吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('deleteSheet', {fileId: row.id}, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            for (const key in vm.tableData) {
                                if (row.id === vm.tableData[key].id) {
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
        checkedNode (nodeId) {
            this.checkedNodeId = nodeId
        },
        /**
         * 进入详情路由控制
         * @augments row
         * @author xinghua.wen
         * */
        toSheetDetail (row) {
            this.$router.push('/sheetdetail/' + row.id)        
        },
        getSheetList () {
            let params = Object.assign({}, this.filterRules, this.pagination)

            Api.get('getSheetListByFolderId', {
                limit: params.size,
                offset: params.index,
                nodeId: params.nodeId,
                name: params.keyword,
                userName: params.userName,
                type: params.lang,
                tagIds: params.tagIds
            }, true).then(
                (data) => {
                    let rstData = data.data
                    this.tableInfo = rstData
                    this.pagination.count = rstData.pageCount
                }
            )
        },
        filterChange (filterRules) {
            this.filterRules = filterRules
        },
        /**
         * @descrition 操作事件
         * @author xinghua.wen
         * */
        operationHandler (obj) {
            switch (obj.id) {
                case 'edit':
                    this.$router.push({path: '/editSheet/' + obj.row.id, query: {edit: true}})
                    break
                case 'clone':
                    this.$router.push({path: '/editSheet/' + obj.row.id, query: {clone: true}})      
                    break
                case 'delete':
                    this.deleteSheet(obj.row)
                    break
                default:
                    this.handleShare(obj.row)
                    break
            }
        },
        /**
         * @description 处理是否共享
         */
        handleShare (row) {
            let vm = this
            let typeStr = row.shareType === 1 ? '取消共享' : '共享'
            vm.$confirm(`确定${typeStr}脚本: ${row.name}吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let shareType = row.shareType === 1 ? 0 : 1
                Api.put('shareSheet', {fileId: row.id, shareType}, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            vm.$notify({
                                title: '通知',
                                type: 'success',
                                message: `${typeStr}成功!`
                            })
                            this.getSheetList()
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
        closeWorkModal () {
            this.workModalVisible = false
        },
        formatter (value) {
            return DateUtils.formate(value)
        },
        filterDagDetail () {
            // UCMP3-4412【Atomflow-脚本管理】脚本列表点击分页翻页显示，未发送接口请求，分页翻页无响应
            this.getSheetList()
        },
        isShowOpr (rowObj, prop) {
            let users = localStorage.getItem('systemUserName')
            if (rowObj.userName !== users) {
                return prop === 'clone'
            }  
            if (rowObj.shareType === 1) {
                return prop !== 'share'
            }
                
            if (rowObj.shareType === 0) {
                return prop !== 'private'
            }
            
            return true
        }
    },
    computed: {
        tableData () {
            if (!this.tableInfo) return []
            return this.tableInfo.fileList
        },
        statusTypeObj () {
            let configIcon = [
                {type: '#61c359', prop: 0, label: '低'},
                {type: '#ffaa00', prop: 1, label: '中'},
                {type: '#e64451', prop: 2, label: '高'}]
            let rst = {}
            configIcon.forEach(
                item => {
                    rst[item.prop] = {
                        color: item.type,
                        label: item.label
                    }
                }
            )
            return rst
        }
    },
    created () {
        this.columns = tableColumns
        this.getSheetList()
        this.tableOperations = tableOprations
    },
    components: {
        AtomIconButton,
        SheetQuery
    }
}
</script>
<style lang="scss" scoped>
.tab-content {
    height: calc(100% - 90px);
    overflow: auto;
}
.el-tag{
    color: #fff
}
</style>
