<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item 连接列表        
    div.atom-content
        div.work-content
            el-row.margin-bottom 
                el-col(:span="16")
                    el-button(type="primary" size="small" @click="toAddConnect") 新增连接
                el-col(:span="8")      
                    el-input(placeholder="请输入连接名称" v-model="name" size="small" @change="queryConnectList")
                        i.el-input__icon.el-icon-search(slot="suffix" @click="queryConnectList")
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
                            span {{scope.row[column.prop]}}
                    el-table-column(label="操作" width="150")
                        template(slot-scope="scope")
                            Atom-Icon-Button(v-for="operation in operations" :key="operation.id" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
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
import ConnectApi from '@api/connect.api.js'
import columns from '@mock/connect/tableColumns'
import operations from '@mock/connect/tableOprations'
import paginationMixins from '@mixins/pagination.mixins.js'
import AtomIconButton from '@lib/AtomIconButton'

export default {
    name: 'ConnectList',
    mixins: [paginationMixins],
    data () {
      return {
          name: '',
          type: '',
          tableData: [],
          columns: [],
          operations: []
      }
    },
    methods: {
        /**
         * @description 新建连接
         */
        toAddConnect () {
            this.$router.push('/editConnect/add')
        },
        /**
         * @description 分页size改变事件
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.queryConnectList('page', true)
        },
        /**
         * @description 分页index改变事件
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.queryConnectList('page', true)
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            if (obj.id === 'edit') {
                this.$router.push('/editConnect/' + obj.row.connectName)
            }
            if (obj.id === 'delete') {
                this.deleteConnect(obj.row.connectName)
            }
        },
        /**
         * @description 删除连接
         */
        deleteConnect (connectName) {
            let vm = this
            let msg = '确定要删除 ' + connectName + '的连接吗?'
            vm.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ConnectApi.deleteConnect(connectName).then(
                    (data) => {
                        if (data.rst === 'ok') {
                            //清除刷选条件
                            this.name = ''
                            this.type = ''
                            this.queryConnectList()
                            vm.$notify({
                                title: '通知',
                                type: 'success',
                                message: '删除连接成功!'
                            })
                        } else {
                            vm.$notify({
                                title: '通知',
                                type: 'error',
                                message: '删除连接失败, 请稍后重试!'
                            })
                        }   
                    }
                )
            }).catch(() => { 
            })
        },
        /**
         * @description 查询连接列表
         */
        queryConnectList (target, isPageChange) {
            if (!isPageChange) {
                this.pagination.index = 1 
            }

            ConnectApi.queryConnectList(this.name, this.type, this.pagination).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.connectList
                        this.pagination.count = res.data.pageCount
                    }
                }, (err) => {
                    console.log(err)
                }
            )
        }
    },
    created () {
        this.columns = columns
        this.operations = operations
        this.queryConnectList()
    },
    components: {
        AtomIconButton
    }
}
</script>
<style lang="scss" scoped>
</style>
