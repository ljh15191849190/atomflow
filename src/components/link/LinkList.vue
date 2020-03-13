<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 链接管理    
        div.atom-content
            div.work-content
                el-button.breadcrumb-btn(type="primary" size="small" @click="addTask()" icon="el-icon-plus") 新增链接
                el-row.margin-bottom
                    el-col(:span="4")
                        el-input(v-model="conn_id" clearable placeholder="请输入链接名称" size="small")
                    el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="filterAgentList") 查询
                el-row.tab-content
                    el-table(:data="tableData" stripe size="small" v-loading="isLoading")
                        el-table-column(
                            v-for="column in columns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label"
                            :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'name'") {{scope.row[column.prop]}}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作" width="150")
                            template(slot-scope="scope")
                                Atom-Icon-Button(type="atom-icon-edit"  @iconClick="addTask(scope.row)" :args="{row: scope.row}" text="修改")  
                                Atom-Icon-Button(type="atom-icon-delete" @iconClick="deleteTask" :args="{row: scope.row}" text="删除")                      
                div.flex-end.pagefooter
                    el-pagination(
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="pagination.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pagination.size"
                        layout="sizes, prev, pager, next"
                        :total="pagination.total"
                        :page-count="pagination.count"
                    )
</template>
<script>
/**
 * @description Link管理
 */
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'
import AtomIconButton from '@lib/AtomIconButton'

const TypeEnable = [
    // {value: 'mysql', label: 'MYSQL'},
    {value: 'http', label: 'HTTP'}, 
    {value: 'jdbc', label: 'JDBC'}
]
export default {
    name: 'linkList',
    data () {
        return {
            searchParams: {},
            conn_id: '',
            conn_type: '',
            isLoading: false,
            tableData: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            columns: [
                {
                    prop: 'conn_id',
                    label: '链接名称'
                },
                {
                    prop: 'conn_type',
                    label: '链接类型',
                    filters: TypeEnable
                },
                {
                    prop: 'host',
                    label: '链接地址'
                },
                {
                    prop: 'port',
                    label: '端口号'
                },
                {
                    prop: 'comments',
                    label: '备注'
                }
            ]
        }
    },
    methods: {
        addTask (param) {
            if (param) {
                this.$router.push({ name: 'linkDetail', query: {conn_id: param.conn_id} })
            } else {
                this.$router.push({ name: 'linkDetail' })
            }
        },
        // 删除
        deleteTask (param) {
            this.$confirm('确定要删除该链接吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
            }).then(() => {
                Api.delete('deleteLink', {conn_id: param.row.conn_id}, true).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '链接' + param.row.conn_id + '删除成功'
                    })
                    this.getLinkList()
                })
            }).catch(() => {
            })
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.conn_type = this.searchParams.conn_type
            this.pagination.index = 1
            this.getLinkList()
        },
        /**
         * @description 搜索查询
         */
        filterAgentList () {
            this.pagination.index = 1
            this.conn_type = ''
            this.getLinkList()
        },

        getLinkList () {
            this.isLoading = true
            Api.get('getLinkList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                conn_type: this.conn_type,
                conn_id: this.conn_id
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.isLoading = false
                        this.tableData = res.data.conn_list
                        this.pagination.count = res.data.pageCount
                    } else {
                         this.isLoading = false
                     }
                }, () => {
                     this.isLoading = false
                 }
            )
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getLinkList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getLinkList()
        }
    },
    created () {
        this.getLinkList()
    },
    computed: {
        typeState () {
            return {
                    '正常': 'redTest',
                    '异常': 'blueTest'
                }
        }
                
    },
    components: {
        TableFilterHeader, AtomIconButton
    }
}
</script>
<style lang="scss" scoped>
</style>

