<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 批次列表
        div.atom-content
            div.work-content
                el-row.tab-content
                    el-table(:data="tableData" stripe size="small")
                        el-table-column(
                            v-for="column in columns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label"
                            :width="column.width")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'startTime'") {{formatter(scope.row[column.prop])}}
                                span(v-else-if="column.prop === 'status'") {{scope.row[column.prop]}}
                                span.theme-color.column-name(v-else-if="column.prop === 'batch'" @click="toLinkDetail(scope.row)") {{`${scope.row.name} - ${scope.row[column.prop]}`}}
                                span.consume-over(v-else-if="column.prop === 'ip_addrs'" @click="openConsumeIp(scope.row)") {{String(scope.row[column.prop])}}
                                div.cell-pane(v-else-if="column.prop === 'stateDetail'") 
                                    el-tooltip(effect="dark" content="成功的机器数量" placement="top-start")
                                        el-button(type="success" round size="mini" :class="{noNum: scope.row[column.prop].success === '-'}") {{scope.row[column.prop].success}}
                                    el-tooltip(effect="dark" content="失败的机器数量" placement="top-start")                            
                                        el-button(type="danger" round size="mini" :class="{noNum: scope.row[column.prop].failed === '-'}") {{scope.row[column.prop].failed}}
                                    el-tooltip(effect="dark" content="运行的机器数量" placement="top-start")                            
                                        el-button(type="primary" round size="mini" :class="{noNum: scope.row[column.prop].running === '-'}") {{scope.row[column.prop].running}}
                                    el-tooltip(effect="dark" content="未执行的机器数量" placement="top-start")                            
                                        el-button(type="info" round size="mini" :class="{noNum: scope.row[column.prop].notRun === '-'}") {{scope.row[column.prop].notRun}}
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
        el-dialog(
                title="执行目标"
                width="30%"
                :visible.sync="dialogVisible")
                span {{consumeIpData}}
                div.dialog-footer(slot="footer")
                    el-button(@click="dialogVisible = false") 关闭
</template>
<script>
/**
 * @description batch列表
 */
import Api from '@api'
import DateUtils from '@server/date-utils'

export default {
    name: 'BatchList',
    props: ['params'],
    data () {
        return {
            dialogVisible: false,
            consumeIpData: '',
            tableData: [],
            columns: [
                {
                    prop: 'batch',
                    label: '序号'
                },
                {
                    prop: 'stateDetail',
                    label: '作业状态'
                },
                {
                    prop: 'ip_addrs',
                    label: '执行目标'
                },
                 {
                    prop: 'startTime',
                    label: '执行开始时间'
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
        openConsumeIp (obj) {
            this.consumeIpData = obj.ip_addrs.join('，')
            this.dialogVisible = true
        },
        toLinkDetail (row) {
            this.$router.push({path: '/batchDetails/' + row.id, query: {batchId: this.$route.params.dagId}}) 
        },
        //时间格式化
        formatter (time) {
            if (time) {
                return DateUtils.formate(time, 'zone')
            }
        },
        getBatchList () {
            let paramId = this.$route.params.dagId
            Api.get('getBatchDetailList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                batch_id: paramId
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.batch_dag_list
                        this.pagination.count = res.data.pageCount
                    }
                }, () => {
                }
            )
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getBatchList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getBatchList()
        }
    },
    created () {
        this.getBatchList()
    }
}
</script>
<style lang="scss" scoped>
.atom-content-info {
  height: calc(100% - 20px);
  padding: 16px;
  background: #fff;
  margin-left: 16px;
  margin-right: 16px;
}
.noNum {
    padding: 7px 16.4px !important;
}
.consume-over{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #0081f6;
}
</style>

