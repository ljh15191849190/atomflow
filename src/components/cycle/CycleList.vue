<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 周期任务列表   
        div.atom-content
            div.work-content
                el-button.breadcrumb-btn(type="primary" size="small" @click="addTask" icon="el-icon-plus") 新增周期任务
                el-row.margin-bottom 
                    el-col(:span="4")
                        el-input(v-model="dagName" clearable placeholder="请输入任务名称" size="small")
                    el-col(:span="4" :offset="1")
                        el-input(v-model="owner" clearable placeholder="请输入创建者" size="small")
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
                                el-switch(v-if="column.prop === 'is_pause'" v-model="!scope.row[column.prop]" @change="changeAvailable(scope.row)")
                                span.theme-color.column-name(v-else-if="column.prop === 'name'" @click="toLinkDetail(scope.row)") {{scope.row[column.prop]}}
                                span.consume-over(v-else-if="column.prop === 'ip_addrs'" @click="openConsumeIp(scope.row)") {{String(scope.row[column.prop])}}
                                span(v-else-if="column.prop === 'startTime'") {{formatter(scope.row[column.prop])}}
                                span(v-else-if="column.prop === 'type'") {{typeState[scope.row[column.prop]]}}
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
                title="目标IP"
                width="30%"
                :visible.sync="dialogVisible")
                span {{consumeIpData}}
                div.dialog-footer(slot="footer")
                    el-button(@click="dialogVisible = false") 关闭
</template>
<script>
/**
 * @description Cycle管理
 */
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'
import DateUtils from '@server/date-utils'
const AgentEnable = [
    {value: '0', label: '打开'},
    {value: '1', label: '关闭'}
]
const TypeEnable = [
    {value: 'normal', label: '简单任务'},
    {value: 'complex', label: '复杂任务'}
]
export default {
    name: 'CycleList',
    data () {
        return {
            dialogVisible: false,
            consumeIpData: '',
            searchParams: {},
            ip_addrs: '',
            type: '',
            dagName: '',
            owner: '',
            is_pause: '',
            isLoading: true,
            tableData: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            columns: [
                {
                    prop: 'name',
                    label: '任务名称'
                },
                {
                    prop: 'type',
                    label: '任务类型',
                    filters: TypeEnable
                },
                {
                    prop: 'ip_addrs',
                    label: '执行目标'
                },
                {
                    prop: 'scheduler_interval',
                    label: '定时策略'
                },
                {
                    prop: 'owner',
                    label: '创建者'
                },
                {
                    prop: 'startTime',
                    label: '创建时间'
                },
                // {
                //     prop: 'dag_status',
                //     label: '状态',
                //     filters: TypeEnable
                // },
                {
                    prop: 'is_pause',
                    label: '操作',
                    filters: AgentEnable
                }
            ]
        }
    },
    methods: {
        openConsumeIp (obj) {
            this.consumeIpData = obj.ip_addrs.join('，')
            this.dialogVisible = true
        },
        addTask () {
            // this.$router.push('/addcycle')
            this.$router.push({path: '/addwork', query: {cycle: 'cycle'}}) 
        },
        changeAvailable (row) {
            Api.put('WorkCyclePaused', {
                isPaused: !row.is_pause,
                dagId: row.id
            }, true).then(
                (res) => {
                    this.$notify({
                        title: '通知',
                        type: 'success',
                        message: `操作成功!`
                    })
                    this.getCycleList()
                }, () => {
                    this.$notify({
                        title: '通知',
                        type: 'error',
                        message: '操作失败, 请稍后重试!'
                    })
                 }
            )
        },
        //时间格式化
        formatter (time) {
            return DateUtils.formate(time, 'zone')
        },
        //查看详情
        toLinkDetail (row) {
            this.$router.push('/cycleDetail/' + row.id)
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.is_pause = this.searchParams.is_pause
            this.type = this.searchParams.type
            this.pagination.index = 1
            this.getCycleList()
        },
        /**
         * @description 搜索agent
         */
        filterAgentList () {
            this.pagination.index = 1
            this.getCycleList()
        },
        /**
         * @description 获取agent列表
         */
        getCycleList () {
            Api.get('queryWorkList', {
                scheduleType: 2,
                limit: this.pagination.size,
                offset: this.pagination.index,
                type: this.type,
                owner: this.owner,
                dagName: this.dagName,
                is_paused: this.is_pause
            }, true).then(
                (res) => {
                    this.isLoading = false
                    if (res.rst === 'ok') {
                        this.tableData = res.data.dagList
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
            this.getCycleList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCycleList()
        }
    },
    created () {
        this.getCycleList()
    },
    computed: {
        typeState () {
            return {
                    'normal': '简单任务',
                    'complex': '复杂任务'
                }
        }
    },
    components: {
        TableFilterHeader
    }
}
</script>
<style lang="scss" scoped>
    .consume-over{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        color: #0081f6;
    }
    .redTest{
        color:blue
    }
    .blueTest{
        color:red
    }
</style>

