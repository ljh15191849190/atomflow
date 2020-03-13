<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item 作业执行记录      
    div.atom-content
        div.work-content
            el-row.row-container(type="flex" justify="start")
                el-col(:span="24")
                    el-row(type="flex" justify="space-between")
                        el-col(:span="4")  
                            el-input(v-model="name" size="small" clearable placeholder="请输入作业名称")    
                        el-col(:span="9")                        
                            el-date-picker(
                                clearable
                                v-model="timeRange" 
                                type="datetimerange" 
                                range-separator="-" 
                                start-placeholder="请选择执行开始时间" 
                                end-placeholder="请选择执行结束时间" 
                                size="small" 
                                :default-time="['00:00:00', '23:59:59']"
                            )
                        el-col(:span="4")                     
                            el-input(v-model="owner" clearable placeholder="请输入执行人" size="small")
                        el-col(:span="4")                  
                            el-input(v-model="target" clearable placeholder="请输入执行目标" size="small")
                        el-col(:span="2")   
                            el-button(type="primary" size="small" @click="filterList") 查询
            el-row.tab-content
                el-table(
                    :data="tableData"
                    stripe
                    size="small"
                )
                    el-table-column(label="作业名称")
                        template(slot-scope="scope")
                            span.theme-color.column-name(@click="toLink(scope.row)") {{scope.row.dagName}}
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width")
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'executionDate' || column.prop === 'startDate' || column.prop === 'endDate'") {{formatter(scope.row[column.prop])}}
                            span(v-else-if="column.prop === 'scheduler_type'") {{transform[scope.row[column.prop]]}}
                            span(v-else-if="column.prop === 'type'") {{scope.row[column.prop]===1 ? '复杂作业' : '简单作业'}}
                            div(v-else-if="column.prop === 'state'") 
                                label.tag.success-text(v-if="scope.row[column.prop] === 'success'") 成功
                                label.tag.failed-text(v-if="scope.row[column.prop] === 'failed'") 失败
                                label.tag.running-text(v-if="scope.row[column.prop] === 'running'") 运行         
                            span(v-else) {{scope.row[column.prop]}}
            el-row
                div.flex-end.pagefooter
                    el-pagination(
                        @size-change="sizeChange"
                        @current-change="currentChange"
                        :current-page.sync="pagination.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pagination.size"
                        layout="sizes, prev, pager, next"
                        :page-count="pagination.count")
            el-dialog(
                title="目标IP"
                width="30%"
                :visible.sync="dialogVisible")
                span {{consumeIpData}}
                div.dialog-footer(slot="footer")
                    el-button(@click="dialogVisible = false") 关闭
</template>
<script>
// import workflowApi from '@api/work.api'
import columns from '@mock/workflow/workRunLogger.js'
import paginationMixins from '@mixins/pagination.mixins.js'
import AtomIconButton from '@lib/AtomIconButton'
import DateUtils from '@server/date-utils'
import TableFilterHeader from '@lib/TableFilterHeader'
import Api from '@api'

export default {
  mixins: [paginationMixins],
  data () {
    return {
        dialogVisible: false,
        consumeIpData: '',
        tableData: [],
        columns: columns,
        target: null,
        owner: '',
        states: [
            {prop: 'success', label: '成功'},
            {prop: 'failed', label: '失败'},
            {prop: 'running', label: '运行'}            
        ],
        state: null,
        name: '',
        timeRange: [],
        searchParams: {}
    }
  },
  methods: {
    openConsumeIp (obj) {
        this.consumeIpData = obj.consumeIp.join(',')
        this.dialogVisible = true
    },
    handleHeaderCommand (filterParam) {
        this.searchParams = {...this.searchParams, ...filterParam}
        this.osType = this.searchParams.osType
        this.state = this.searchParams.state
        this.pagination.index = 1
        this.filterDagDetail()
    },
    toLink (row) {
        //原子作业平台ATOMFLOWAT-236(需求变更，跳转到依赖关系中)
        this.$router.push('/flowDetails/' + row.dagId + '?executionDate=' + row.executionDate + '&target=' + row.consumeIp)
    },
    formatter (time) {
        if (!time) return ''
        return DateUtils.formate(time ? time : 0, 'zone')
    },
    sizeChange (size) {
        this.pagination.size = size
        this.filterDagDetail('page', true)
    },
    currentChange (index) {
        this.pagination.index = index
        this.filterDagDetail('page', true)
    },
    filterDagDetail () {
        let startTime = ''
        let endTime = ''
        if (this.timeRange && this.timeRange.length > 0) {
            startTime = Date.parse(new Date(this.timeRange[0])) / 1000
            endTime = Date.parse(new Date(this.timeRange[1])) / 1000
        }
        Api.get('getRunLogger', {
                consumeIp: this.target,
                exeDateStart: startTime,
                exeDateEnd: endTime,
                state: this.state,
                dagName: this.name,
                owner: this.owner,
                offset: this.pagination.index,
                limit: this.pagination.size
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.dagRuns
                        this.pagination.count = res.data.pageCount
                    } 
                }, () => {
                }
            )
    },
    filterList () {
        this.pagination.index = 1
        this.state = ''
        this.filterDagDetail()
    }
  },
   computed: {
        transform () {
            const config = {
                1: '单次',
                2: '周期'
            }
            return config
        }
  },
  created () {
      this.filterDagDetail()
  },
  components: {
    AtomIconButton, TableFilterHeader
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
.row-container {
    padding-bottom: 16px;
}
.success-text {
    color: #61b2e4;
}
.failed-text {
    color: #f77d6b;
}
.running-text {
    color: #87d86f;
}
.normal-widget-width {
    width: 185px;
    margin-right: 20px;
}
</style>
<style lang="scss">
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%!important;
}
</style>

