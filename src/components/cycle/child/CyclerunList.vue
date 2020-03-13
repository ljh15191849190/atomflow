<template lang="pug">
    div.container-flud
        div.atom-content-info
            el-row.tab-content
                el-table(:data="tableData" stripe size="small")
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'execution_time'") {{formatter(scope.row[column.prop])}}
                            span(v-else-if="column.prop === 'status'") {{transStatus[scope.row[column.prop]]}}
                            span(v-else) {{scope.row[column.prop]}}
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
 * @description Cycle执行列表
 */
import Api from '@api'
import DateUtils from '@server/date-utils'

const CONFIG = {
    'success': '成功',
    'running': '执行中',
    'failed': '失败',
    'skipped': '跳过',
    'no-status': '无状态'
}
export default {
    name: 'CyclerunList',
    data () {
        return {
            transStatus: CONFIG,
            tableData: [],
            columns: [
                {
                    prop: 'num',
                    label: '序号'
                },
                {
                    prop: 'status',
                    label: '结果'
                },
                    {
                    prop: 'execution_time',
                    label: '执行开始时间'
                },
                {
                    prop: 'time_consuming',
                    label: '作业耗时（s）'
                }
            
            ],
            pagination: {
                index: 1,
                count: 1,
                size: 10
            }
        }
    },
    methods: {
        //时间格式化
        formatter (time) {
            if (time) {
                return DateUtils.formate(time, 'zone')
            }
        },
        getCycleList () {
            let paramId = this.$route.params.id
            Api.get('queryWorkrunList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                id: paramId
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.dagList
                        this.pagination.count = res.data.pageCount
                    } 
                }, () => {
                }
            )
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getCycleList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCycleList()
        }
    },
    created () {
        this.getCycleList()
    }
}
</script>
<style lang="scss" scoped>
    .atom-content-info{
        height: calc(100% - 20px);
        padding: 16px;
        background: #fff;
        margin-left: 16px;
        margin-right: 16px;
    }
</style>

