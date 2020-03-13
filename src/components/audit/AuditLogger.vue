<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/auditLogger' }") 节点执行记录    
    div.atom-content
        div.work-content
            el-row.row-container(type="flex" justify="start")
                el-col(:span="24")
                    el-row(type="flex" justify="space-between")
                        el-col(:span="4")                        
                            el-input(v-model="taskName" clearable placeholder="请输入节点名称" size="small")
                        //- 原子作业平台ATOMFLOWAT-271(审计日志页面中的查询条件字段跟列表中的字段无法对应)
                        el-col(:span="4")                        
                            el-input(v-model="owner" clearable placeholder="请输入执行人名称" size="small")
                        el-col(:span="4")                        
                            el-input(v-model="target" clearable placeholder="请输入执行目标" size="small")
                        el-col(:span="8")                        
                            el-date-picker(
                                v-model="timeRange" 
                                type="datetimerange" 
                                range-separator="-" 
                                start-placeholder="请选择执行开始时间" 
                                end-placeholder="请选择执行结束时间" 
                                size="small" 
                                :default-time="['00:00:00', '23:59:59']"
                            )
                        el-col(:span="2")   
                            el-button(type="primary" size="small" @click="filterList") 查询
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
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'runStartTime'||column.prop === 'runEndTime'") {{formatter(scope.row[column.prop])}}
                            span.theme-color.column-name(v-else-if="column.prop === 'taskName'&&(scope.row.operator==='AnsibleOperator'||scope.row.operator==='AgentOperator'||scope.row.operator==='SimpleHttpOperator'||scope.row.operator==='JdbcOperator')" @click="toLinkDetail(scope.row)") {{scope.row[column.prop]}}
                            span(v-else-if="column.prop === 'operator'") {{transform[scope.row[column.prop]]}}
                            div(v-else-if="column.prop === 'event'") 
                                label.tag.success-text(v-if="scope.row[column.prop] === 'success'") 成功
                                label.tag.failed-text(v-if="scope.row[column.prop] === 'failed'") 失败
                                label.tag.running-text(v-if="scope.row[column.prop] === 'running'") 运行
                            span(v-else) {{scope.row[column.prop]}}
                    el-table-column(label="操作" width="150")
                        template(slot-scope="scope")
                            Atom-Icon-Button(type="atom-icon-start" :disabled="scope.row.event==='success'||scope.row.event==='running'" v-if="scope.row.operator==='AgentOperator'" @iconClick="toLinkDetail(scope.row,'run')" :args="{row: scope.row}" text="再次执行")
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
</template>
<script>
import columns from '@mock/audit/auditLogger.js'
import paginationMixins from '@mixins/pagination.mixins.js'
import DateUtils from '@server/date-utils'
import AtomIconButton from '@lib/AtomIconButton'
import TableFilterHeader from '@lib/TableFilterHeader'
import Api from '@api'

export default {
  mixins: [paginationMixins],
  data () {
    return {
        tableData: [],
        columns: columns,
        target: null,
        taskName: null,
        name: '',
        owner: '',
        timeRange: [],
        searchParams: {},
        event: ''
    }
  },
  methods: {
    handleHeaderCommand (filterParam) {
        this.searchParams = {...this.searchParams, ...filterParam}
        this.event = this.searchParams.event
        this.pagination.index = 1
        this.filterDagDetail('page', true)
    },
      toLinkDetail (obj, status) {
        //   this.$router.push('/AuditLoggerDetail/' + obj.taskId)
        let param = {...obj, ...{iSagain: status}}
        if (status) {
            this.$confirm('确定重试吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // this.$router.push(`/AuditLoggerDetail/${param.taskId}`)
                this.$router.push({ name: 'AuditLoggerDetail', query: param })
            }).catch(() => { 
            })
        } else {
            this.$router.push({ name: 'AuditLoggerDetail', query: param })
        }
      },
      formatter (time) {
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
        Api.get('getAuditLogger', {
                consumeIp: this.target,
                dateStart: this.timeRange ? Date.parse(new Date(this.timeRange[0])) / 1000 : '',
                dateEnd: this.timeRange ? Date.parse(new Date(this.timeRange[1])) / 1000 : '',
                taskName: this.taskName,
                owner: this.owner,
                event: this.event,
                offset: this.pagination.index,
                limit: this.pagination.size
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.logs
                        this.pagination.count = res.data.pageCount
                    } 
                }, () => {
                }
            )
      },
      filterList () {
          this.pagination.index = 1
          this.event = ''
          this.filterDagDetail()
      }
  },
  computed: {
        transform () {
            const config = {
                'BranchPythonMapOperator': '分支',
                'JoinOperator': '合流',
                'AgentOperator': '脚本',
                'SimpleHttpOperator': 'HTTP',
                'JdbcOperator': 'sql',
                'AnsibleOperator': 'Ansible'
            }
            return config
        }
  },
  components: {AtomIconButton, TableFilterHeader},
  created () {
      this.filterDagDetail()
  }
}
</script>
<style lang="scss" scoped>
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
.el-date-editor--datetimerange.el-input, .el-date-editor--datetimerange.el-input__inner {
    width: 100%!important;
}
</style>
