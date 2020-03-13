<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 调试历史列表          
        div.atom-content
            div.work-content
                el-row.margin-bottom(type="flex")
                    el-col(:span="4")           
                        el-input(placeholder="请输入脚本名称" clearable v-model="fileName" size="small")
                    el-col(:span="4" :offset="1")           
                        el-input(placeholder="请输入目标机器" clearable v-model="consumeIp" size="small")
                    el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="filterList") 查询
                el-row.tab-content
                    el-table(
                        :data="taskList"
                        stripe
                        size="small"
                    )
                        el-table-column(
                            v-for="column in columns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'createTime'") {{formatTime(scope.row.createTime)}}
                                span.theme-color.column-name(v-else-if="column.prop === 'fileName'" @click="toLinkDetail(scope.row)") {{scope.row[column.prop]}}
                                el-tag(v-else-if="column.prop === 'status'" :type="formatState(scope.row.status).type" size="mini") {{ formatState(scope.row.status).label }}
                                span(v-else-if="column.prop === 'runLastSec'") {{scope.row.runLastSec > 0 ? scope.row.runLastSec : '' }}
                                span(v-else) {{scope.row[column.prop]}}
                div.flex-end.pagefooter
                    el-pagination(
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="pagination.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pagination.size"
                        layout="sizes, prev, pager, next"
                        :page-count="pagination.count"
                    )

</template>
<script>
/**
 *  @description 脚本执行历史列表
 */
import Api from '@api'
import util from '@server/Utils'
const columns = [
    {
        prop: 'fileName',
        label: '脚本名称'
    },
    {
        prop: 'consumeIp',
        label: '目标机器'
    },
    {
        prop: 'status',
        label: '状态'
    },
    {
        prop: 'createTime',
        label: '开始时间'
    },
    {
        prop: 'runLastSec',
        label: '执行时长(s)'
    }
]
export default {
    data () {
        return {
            fileName: '',
            consumeIp: '',
            taskList: [],
            columns: columns,
            pagination: {
                index: 1,
                count: 1,
                size: 20
            }
        }
    },
    methods: {
        toLinkDetail (obj) {
            let param = {...obj, ...{operator: 'AgentOperator', isSheetExcute: true}}
            this.$router.push({ name: 'AuditLoggerDetail', query: param })
        },
        filterList () {
            this.pagination.index = 1
            this.getTaskList()
        },
        /**
         * @description 获取执行历史列表
         */
        getTaskList () {
            let rstObj = {
                offset: this.pagination.index, 
                limit: this.pagination.size,
                fileName: this.fileName,
                consumeIp: this.consumeIp
            }
            this.isLoading = true
            Api.get('gitExcuteTaskList', rstObj, true).then(
                data => {
                    this.isLoading = false
                    if (data.rst === 'ok') {
                        this.taskList = data.data.tasks
                        this.pagination.count = data.data.pageCount
                    } else {
                        this.$notify({
                            title: '通知',
                            type: 'error',
                            message: '获取执行列表失败!'
                        })
                    }
                }, () => {
                    this.isLoading = false
                    this.$notify({
                        title: '通知',
                        type: 'error',
                        message: '获取执行列表失败!'
                    })
                }
            ) 
        },
        /** 
         * @description 格式化日期
         */
        formatTime (createTime) {
            let formatTime = ''
            if (createTime) {
                formatTime = util.transformToDate(createTime)
            }
            return formatTime
        },
        /** 
         * @description 格式化状态
         */
        formatState (status) {
            switch (status) {
                case 1:
                    return { type: 'info', label: '执行中' }
                case 2:
                    return { type: 'success', label: '成功' }
                case 3:
                    return { type: 'error', label: '失败' }
                default:
                    return { type: 'warning', label: '未知' }
            }
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getTaskList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getTaskList()
        }
    },
    created () {
        this.getTaskList() 
    }
}
</script>
<style lang="scss" scoped>
</style>

