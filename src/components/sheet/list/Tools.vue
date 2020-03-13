<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 常用工具    
        div.atom-content
            div.work-content
                el-row.margin-bottom
                    el-col(:span="4")
                        el-input(v-model="conn_id" clearable placeholder="请输入工具名称" size="small")
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
                                span.theme-color.column-name(v-if="column.prop === 'name'" @click="toSheetDetail(scope.row)") {{scope.row[column.prop]}}
                                span(v-else-if="column.prop === 'createDate'") {{formatter(scope.row[column.prop])}}
                                el-tag(v-else-if="column.prop === 'risk_level'" :color="scope.row.risk_level ? statusTypeObj[scope.row.risk_level].color : ''" size="mini") {{ scope.row.risk_level ? statusTypeObj[scope.row.risk_level].label : "" }}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作" width="150")
                            template(slot-scope="scope")
                                Atom-Icon-Button(type="atom-icon-run" @iconClick="runTask(scope.row)" :args="{row: scope.row}" text="执行")                      
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
 * @description ToolsList管理
 */ 
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'
import AtomIconButton from '@lib/AtomIconButton'
import DateUtils from '@server/date-utils'

const TypeEnable = [
    {value: 'shell', label: 'shell'},
    {value: 'python', label: 'python'},
    {value: 'powershell', label: 'powershell'},
    {value: 'bat', label: 'bat'},
    {value: 'sql', label: 'sql'},
    {value: 'ansible', label: 'ansible'}
]
export default {
    name: 'Tools',
    data () {
        return {
            searchParams: {},
            conn_id: '',
            type: '',
            isLoading: false,
            tableData: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            columns: [
                {
                    prop: 'name',
                    label: '工具名称'
                },
                {
                    prop: 'type',
                    label: '脚本语言',
                    filters: TypeEnable
                },
                {
                    prop: 'createDate',
                    label: '创建时间'
                },
                {
                    prop: 'risk_level',
                    label: '风险等级'
                },
                {
                    prop: 'description',
                    label: '说明'
                }
            ]
        }
    },
    methods: {
        toSheetDetail (row) {
            this.$router.push({path: '/sheetdetail/' + row.id, query: {IsTools: 'tools'}})    
        },
        formatter (time) {
          return DateUtils.formate(time ? time : 0)
        },
        // 执行
        runTask (param) {
            this.$router.push({path: '/addwork', query: {fileId: param.id}}) 
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.type = this.searchParams.type
            this.pagination.index = 1
            this.getToolsList()
        },
        /**
         * @description 搜索查询
         */
        filterList () {
            this.pagination.index = 1
            this.type = ''
            this.getToolsList()
        },

        getToolsList () {
            this.isLoading = true
            Api.get('getSheetToolsList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                type: this.type,
                name: this.conn_id
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.isLoading = false
                        this.tableData = res.data.fileList
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
            this.getToolsList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getToolsList()
        }
    },
    created () {
        this.getToolsList()
    },
    computed: {
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
    components: {
        TableFilterHeader, AtomIconButton
    }
}
</script>
<style lang="scss" scoped>
.el-tag{
    color: #fff
}
</style>

