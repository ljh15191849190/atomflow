<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item 作业列表      
    div.atom-content
        div.work-content(ref="tabContent")
            el-button.breadcrumb-btn(type="primary" size="small" @click="addTask" icon="el-icon-plus") 新增作业
            el-row.margin-bottom
                el-col(:span="4")             
                    el-input(placeholder="请输入作业名称" clearable size="small" v-model="name")
                el-col(:span="4" :offset="1")  
                    el-input(placeholder="请输入创建者" clearable size="small" v-model="owner")
                el-col(:span="8" :offset="1")                        
                    el-date-picker(
                        v-model="timeRange" 
                        clearable
                        type="datetimerange" 
                        range-separator="-" 
                        start-placeholder="请选择记录开始时间" 
                        end-placeholder="请选择记录结束时间" 
                        size="small" 
                        :default-time="['00:00:00', '23:59:59']"
                    )
                el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="query") 查询
            el-row.tab-content
                el-table(
                    :data="tableData"
                    stripe
                    size="small"
                    :max-height="tableHeight"
                )
                    el-table-column(label="作业名称" prop="name")
                        template(slot-scope="scope")
                            span.theme-color.column-name(@click="toLink(scope.row)") {{scope.row.name}}
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                        :min-width="column.minWidth")
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'startTime' || column.prop === 'endTime'") {{formatter(scope.row, column.prop)}}
                            span(v-else-if="column.prop === 'state'") {{transform[scope.row[column.prop]]}}
                            span(v-else-if="column.prop === 'type'") {{typeState[scope.row[column.prop]]}}
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
                    el-table-column(label="操作" width="100")
                        template(slot-scope="scope")
                            // Atom-Icon-Button(type="atom-icon-clone" @iconClick="checkRelation" :args="{row: scope.row}" text="依赖关系")
                            Atom-Icon-Button(type="atom-icon-work-close" v-if="!scope.row.is_pause"  @iconClick="runOrPauseWork" :args="{id: 'pause', row: scope.row}" text="关闭调度")
                            Atom-Icon-Button(type="atom-icon-work-open" v-else @iconClick="runOrPauseWork"  :args="{id: 'start', row: scope.row}" text="开启调度 ")  
                            Atom-Icon-Button(type="atom-icon-delete" @iconClick="deleteRelation" :args="{row: scope.row}" text="删除")                      
            el-row
                div.flex-end.pagefooter
                    el-pagination(
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="pagination.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pagination.size"
                        :total="pagination.total"
                        layout="sizes, prev, pager, next"
                        :page-count="pagination.count")
</template>
<script>
import workflowApi from '@api/work.api'
import columns from '@mock/workflow/onceColumns'
import paginationMixins from '@mixins/pagination.mixins.js'
import AtomIconButton from '@lib/AtomIconButton'
import DateUtils from '@server/date-utils'
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'

const CONFIG = {
    'normal': '简单任务',
    'complex': '复杂任务'
}
export default {
  mixins: [paginationMixins],
  data () {
    return {
        typeState: CONFIG,
        searchParams: {},
        state: '',
        tableData: [],
        columns: [],
        operations: [],
        name: '',
        owner: '',
        timeRange: [],
        tableHeight: null,
        pagination: {
                index: 1,
                count: 1,
                size: 20
        }
    }
  },
  methods: {
    handleHeaderCommand (filterParam) {
        this.searchParams = {...this.searchParams, ...filterParam}
        this.state = this.searchParams.state
        this.pagination.index = 1
        this.filterDagDetail()
    },
    query () {
        this.pagination.index = 1
        this.filterDagDetail()
    },
    addTask () {
        this.$router.push('/addwork')
    },
    batchDelete () {
        
    },
    toLink (row) {
        // this.$router.push('/runningFlow/' + row.id + '?from=list')
        this.$router.push('/flowDetails/' + row.id)
    },
    formatter (row, columnName) {
        /*
         *原子作业平台ATOMFLOWAT-167(缺少结束时间)
         */
        let time = ''
        if (columnName === 'startTime' && row.startTime) {
            time = row.startTime
        } else if (columnName === 'endTime' && row.endTime) {
            time = row.endTime
        }

        if (!time) {
            return ''
        }
        
        return DateUtils.formate(time, 'zone')
    },
    checkRelation (obj) {
        this.$router.push('/flowDetails/' + obj.row.id)
    },
    deleteRelation (obj) {
        let vm = this
        vm.$confirm('确定要删除该作业吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
           workflowApi.deleteWork(obj.row.id).then(
                data => {
                    if (data.rst === 'ok') {
                        for (const key in vm.tableData) {
                            if (obj.row.id === vm.tableData[key].id) {
                                vm.tableData.splice(key, 1)
                                vm.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '删除成功!'
                                })
                                break
                            }
                        }
                    } else {
                        vm.$notify({
                            title: '通知',
                            type: 'error',
                            message: '删除失败, 请稍后重试!'
                        })
                    }
                }
            )
        }).catch(() => { 
        })
    },
    runOrPauseWork (obj) {
        let vm = this
        let isPause = obj.id === 'pause' 
        let tip = isPause ? '确定要暂停该作业吗?' : '确定要启动该作业吗?'
        vm.$confirm(tip, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            Api.put('WorkCyclePaused', {
                isPaused: isPause,
                dagId: obj.row.id
            }, true).then(
                (res) => {
                    let msg = isPause ? '作业' + obj.row.name + '暂停成功' : '作业' + obj.row.name + '启动成功'
                    this.$notify({
                        title: '通知',
                        type: 'success',
                        message: msg
                    })
                    obj.row.is_pause = isPause    
                }, () => {
                    this.$notify({
                        title: '通知',
                        type: 'error',
                        message: '操作失败, 请稍后重试!'
                    })
                 }
            )
        }).catch(() => { 
        })
    },
    handleSizeChange (size) {
        this.pagination.size = size
        this.filterDagDetail()
    },
    handleCurrentChange (index) {
        this.pagination.index = index
        this.filterDagDetail()
    },
    filterDagDetail () {
        let rst = {}
        if (this.timeRange && this.timeRange.length) {
              rst.dateStart = Date.parse(new Date(this.timeRange[0])) / 1000
              rst.dateEnd = Date.parse(new Date(this.timeRange[1])) / 1000
        }
        Api.get('queryWorkList', {
                scheduleType: 1,
                dagName: this.name,
                limit: this.pagination.size,
                offset: this.pagination.index,
                owner: this.owner,
                start: rst.dateStart,
                end: rst.dateEnd,
                state: this.state
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.dagList
                        this.pagination.count = res.data.pageCount
                    } 
                }, () => {
                }
            )
    }
  },
   computed: {
        transform () {
            const config = {
                'complete': '完成',
                'running': '执行中',
                'holding': '等待中',
                'failed': '失败',
                'notRun': '未运行'
            }
            return config
        }
  },
  created () {
    this.columns = columns
    this.filterDagDetail()
  },
  mounted () {
      const vm = this
      vm.tableHeight = vm.$refs.tabContent.offsetHeight - 80
      window.onresize = () => {
          vm.$nextTick(() => {
              if (vm.$refs.tabContent) {
                  vm.tableHeight = vm.$refs.tabContent.offsetHeight - 80
              }
          })
      }
  },
  components: {
    AtomIconButton, TableFilterHeader
  }
}
</script>
<style lang="scss" scoped>
//原子作业平台ATOMFLOWAT-268(作业列表中的作业状态没有对齐显示)
.noNum {
    padding: 7px 16.4px !important;
}
.el-date-editor.el-input__inner {
    width: 100% !important;
}
</style>
