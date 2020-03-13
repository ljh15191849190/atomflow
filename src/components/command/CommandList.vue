<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 关键命令管理    
        div.atom-content
            div.work-content
                el-button.breadcrumb-btn(type="primary" size="small" @click="addTask()" icon="el-icon-plus") 新增关键命令
                el-row.margin-bottom
                    el-col(:span="4")
                        el-input(v-model="command" clearable placeholder="请输入关键命令" size="small")
                    el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="filterList") 查询
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
                                span(v-if="column.prop === 'level'") {{typeLeave[scope.row[column.prop]]}}
                                el-tag(v-else-if="column.prop === 'enable'" :color="typeEnable[scope.row.enable].color" size="mini") {{ typeEnable[scope.row.enable].label }}
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
        CommandDetail(v-if="operationVisible" :title="title" :selectRowsId="selectRowsId" :visible="operationVisible" @closeDialog="closeModal" @updataCommand="updataCommand")
</template>
<script>
/**
 * @description 命令管理
 */
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'
import AtomIconButton from '@lib/AtomIconButton'
import CommandDetail from './CommandDetail'

const TypeEnable = [
    {value: 1, label: '启用'},
    {value: 0, label: '禁用'} 
]
export default {
    name: 'CommandList',
    data () {
        return {
            searchParams: {},
            command: '',
            enable: '',
            isLoading: false,
            tableData: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            operationVisible: false,
            selectRowsId: '',
            title: '',
            columns: [
                {
                    prop: 'command',
                    label: '命令'
                },
                {
                    prop: 'command_type',
                    label: '命令类别'
                },
                {
                    prop: 'level',
                    label: '控制级别'
                },
                {
                    prop: 'enable',
                    label: '状态',
                    filters: TypeEnable
                },
                {
                    prop: 'common',
                    label: '备注'
                }
            ]
        }
    },
    methods: {
        addTask (param) {
            if (param) {
                this.operationVisible = true
                this.selectRowsId = param.id
                this.title = '关键命令修改'
            } else {
                this.operationVisible = true
                this.selectRowsId = null
                this.title = '关键命令新增'
            }
        },
        closeModal () {
            this.operationVisible = false
        },
        updataCommand () {
            this.operationVisible = false
            this.getCommandList()
        },
        // 删除
        deleteTask (param) {
            this.$confirm('确定要删除该命令吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
            }).then(() => {
                Api.delete('CommandDel', {id: param.row.id}, true).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '命令' + param.row.command + '删除成功'
                    })
                    this.getCommandList()
                })
            })
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.enable = this.searchParams.enable
            this.pagination.index = 1
            this.getCommandList()
        },
        /**
         * @description 搜索查询
         */
        filterList () {
            this.pagination.index = 1
            this.enable = ''
            this.getCommandList()
        },

        getCommandList () {
            this.isLoading = true
            Api.get('getCommandList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                enable: this.enable,
                command: this.command
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.isLoading = false
                        this.tableData = res.data.com_list
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
            this.getCommandList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCommandList()
        }
    },
    created () {
        this.getCommandList()
    },
    computed: {
        typeLeave () {
            return {
                    1: '禁止使用',
                    0: '危险提示'
                }
        },

        typeEnable () {
            let configIcon = [
                {color: '#F97569', prop: 0, label: '禁用'},
                {color: '#67C239', prop: 1, label: '启用'}]
            let rst = {}
            configIcon.forEach(item => {
                rst[item.prop] = {
                    color: item.color,
                    label: item.label
                }
            })
            return rst
        }  
    },
    components: {
        TableFilterHeader, AtomIconButton, CommandDetail
    }
}
</script>
<style lang="scss" scoped>
.el-tag{
    color: #fff
}
</style>

