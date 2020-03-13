<template lang="pug">
  div.container-flud
    div.main-content.atom-content
      div.left-side(:span="20")
        el-row.filters.row-content         
          span.el-form-item__label(v-if="workRelationType===2") 执行目标
          div.el-form-item__content(v-if="workRelationType===2")
              el-select.target-list(v-model="target" placeholder="执行目标" size="mini" @change="getTaskRelation")
                el-option(
                  v-for="(item, index) in targets"
                  :key="index"
                  :label="item"
                  :value="item"
                )    
          span.el-form-item__label.start-time 执行时间
          div.el-form-item__content
            el-select.target-list(v-model="startTime" placeholder="执行时间" size="mini" @change="getTaskRelation")
                el-option(
                  v-for="(item, index) in startTimes"
                  :key="index"
                  :label="item.label"
                  :value="item.prop"
                )
        div.graph-legend
            div.read-only.title(v-for="item in legends" :class="[item.class]") {{item.label}}
        el-row.graph-container
          Dagre-Graph(:nodes="nodes" :edges="edges" :height="graphHeight" :width="graphWidth" :nodeClick="nodeClick")
      div.right-side(:span="4" v-if="flowInfo")  
        el-row.title
            span 基本信息
        el-row.margin-bottom
            span.read-only.title 作业名称
            span.read-only.value {{flowInfo.name}} 
        el-row.margin-bottom(v-if="$route.query.executionDate && flowInfo.scheduler_type!==1") 
            span.read-only.title 定时策略
            span.read-only.value {{flowInfo.interval}}  
        el-row.margin-bottom  
            span.read-only.title 创建者
            span.read-only.value {{flowInfo.owner}}
        el-row.margin-bottom  
            span.read-only.title 开始时间
            span.read-only.value {{formatStartDate}}  
        el-row.margin-bottom(v-if="$route.query.executionDate && flowInfo.scheduler_type!==1")
            span.read-only.title 结束时间
            span.read-only.value {{formatEndDate}} 
        el-row.margin-bottom 
            span.read-only.title 创建时间
            span.read-only.value {{formatCreateDate}}
        el-row(v-if="targets.length && startTime")
          div.title 
            span 机器信息
          el-row
            Select-Target-By-Tab(:selectedTarget="target" :date="startTime" :dagId="$route.params.dagId" :activeTarget="activeTarget")
        // el-dialog(:title="operationTitle" :visible.sync="operationVisible" width="280px") 
        //   el-row
        //     //- 原子作业平台ATOMFLOWAT-249(作业列表依赖关系页面，失败的节点，鼠标移至重新运行，此按钮禁用，无法点击)
        //     el-button(size="mini" type="primary" @click="restart" :disabled="isDisabled") 重新运行
        //     el-button.viewLog-btn(size="mini" type="primary" @click="viewLog") 查看日志   
        SideDialog.side-dialog(
            :visible.sync="operationVisible"
            placement="right"
            :title="dialogTitle"
            width="550px"
        )
            TaskInfo(slot="dialog-content" :logDetail="logDetail" :shellContent="shellContent")
</template>
<script>
import axios from 'axios'
import workflowApi from '@api/work.api'
import DagreGraph from '@lib/DagreGraph'
import workDetailLegend from '@mock/workflow/workDetailLegend'
import DateUtils from '@server/date-utils'
import SelectTargetByTab from '@lib/SelectTargetByTab'
import { SideDialog } from '@leaptocloud/standard-ui'
// import SideDialog from './Dialog'
import TaskInfo from './TaskInfo'
import Api from '@api'
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      state: '',
      nodes: [],
      edges: [],
      flowInfo: null,
      targets: [],
      target: '',
      startTimes: [],
      startTime: null,
      legends: workDetailLegend,
      graphHeight: 716,
      graphWidth: 640,
      operationVisible: false,
      activedNodeId: '',
      activedNodeName: '',
      activedhostIp: '',
      dialogTitle: '执行详情',
      logDetail: {},
      shellContent: '',
      workRelationType: '',
      timer: null
    }
  },
  methods: {
    getCycleInfo (obj) {
        let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
        Api.get('getWorkCycleTaskInfo', {
            dagId: this.$route.params.dagId,
            taskId: obj.id,
            executionDate: startTime,
            queue: obj.queue,
            consumeIp: this.target,
            operator: obj.value.operator
        }, true).then(
            (res) => {
                if (res.rst === 'ok') {
                    if (obj.value && obj.value.operator === 'SimpleHttpOperator') {
                        this.logDetail = res.data
                        this.logDetail.nodeType = 'SimpleHttpOperator'
                        this.shellContent = res.data.rst_info
                        // if (res.data.rst_info) {
                        //     for (let aa in JSON.parse(res.data.rst_info)) {
                        //         this.shellContent += (aa + ':' + JSON.parse(res.data.rst_info)[aa] + '\n')
                        //     }
                        // }
                    } else if (obj.value && obj.value.operator === 'JdbcOperator') {
                        this.logDetail = res.data
                        this.logDetail.nodeType = 'JdbcOperator'
                        this.logDetail.execution_date = startTime
                        this.logDetail.dagId = this.$route.params.dagId
                        this.logDetail.task_id = obj.id
                    } else if (obj.value && obj.value.operator === 'AnsibleOperator') {
                        this.logDetail = res.data
                        this.logDetail.nodeType = 'AnsibleOperator'
                        this.logDetail.execution_date = startTime
                        this.logDetail.dagId = this.$route.params.dagId
                        this.logDetail.task_id = obj.id
                    } else {
                        this.logDetail = res.data
                        this.logDetail.nodeType = 'AgentOperator'
                    }
                } 
            }
        )
    },
    getCycleAgentLogo (obj) {
        let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
        Api.get('getWorkCycleAgentLog', {
            dagId: this.$route.params.dagId,
            taskId: obj.id,
            executionDate: startTime,
            queue: obj.queue,
            consumeIp: obj.hostIp
        }, true).then(
            (res) => {
                if (res.rst === 'ok' && JSON.stringify(res.data.content) !== '{}') {
                    for (let aa in res.data.content) {
                        this.shellContent += res.data.content[aa]
                    }
                    clearInterval(this.timer)
                } else if (res.rst === 'err') {
                    clearInterval(this.timer)
                }
            }, () => {
                clearInterval(this.timer)
            }
        )
    },
    getWorkLog (obj) {
        let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
        Api.get('getWorkLog', {
            dagId: this.$route.params.dagId,
            taskId: obj.id,
            executionDate: startTime,
            queue: obj.queue,
            consumeIp: obj.hostIp
        }, true).then(
            (res) => {
                if (res.rst === 'ok') {
                    res.data.logs.forEach(element => {
                        this.shellContent += element
                    })
                    // this.shellContent = res.data.logs[0]
                } 
            }, () => {
            }
        )
    },
    nodeClick (d) {
      this.operationVisible = false
      this.shellContent = ''
      this.logDetail = {}
      this.activedNodeId = d
      let node = this.nodes.filter(
        item => {
          if (item.id === d) {
            return item
          }
        }
      )

      // 添加复杂作业的处理
      if ((this.target || (node[0].queue && node[0].hostIp)) && this.startTime && node[0].value && node[0].value.operator !== 'BranchPythonMapOperator' && node[0].value.operator !== 'JoinOperator') {
        this.activedNodeName = node[0].value.label
        this.activedhostIp = node[0].hostIp
        this.state = node[0].state
        this.operationVisible = true
        if (node[0].value && node[0].value.operator === 'SimpleHttpOperator') {
            this.getCycleInfo(node[0])
        } else {
            this.getCycleInfo(node[0])
            this.timer = setInterval(() => {
                this.getCycleAgentLogo(node[0])
            }, 1000)
        }
      } else if ((node[0].value && node[0].value.operator === 'JdbcOperator') || (node[0].value && node[0].value.operator === 'AnsibleOperator')) {
            this.state = node[0].state
            this.operationVisible = true
            this.getCycleInfo(node[0])
            this.getWorkLog(node[0])
      } else if (node[0].state === 'failed' && !this.target && !this.activedhostIp) {
            this.$notify({
                title: '通知',
                type: 'warning',
                message: '此任务在引擎中调度失败，无法重新执行和查看日志'
            })
        }
    },
    closeModal () {
      this.operationVisible = false 
      let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
      workflowApi.markToSuccess({dagId: this.$route.params.dagId, taskId: this.activedNodeId, consumeIp: this.target, executeDate: startTime}).then(
        res => {
          if (res.rst === 'ok') {
            this.$notify({
              title: '通知',
              type: 'success',
              message: '任务' + this.activedNodeName + '标记状态成功'
            })
          }
        }
      )
    },
    restart () {
      this.operationVisible = false
      let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime  
      let consumeIp = ''
      if (this.target) {
        //简单任务
        consumeIp = this.target
      } else if (this.activedhostIp) {
        //复杂任务
        consumeIp = this.activedhostIp
      }
      workflowApi.reRunTask({dagId: this.$route.params.dagId, taskId: this.activedNodeId, consumeIp: consumeIp, executeDate: startTime}).then(
        res => {
          if (res.rst === 'ok') {
            this.$notify({
              title: '通知',
              type: 'success',
              message: '重启任务' + this.activedNodeName + '的操作已发送至消息队列，请稍后查看执行结果'
            })
          }
        }
      )
    },
    viewLog () {
      this.operationVisible = false  
      let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
      let consumeIp = ''
      if (this.target) {
        consumeIp = this.target
      } else if (this.activedhostIp) {
        consumeIp = this.activedhostIp
      }
      let resObj = {dagId: this.$route.params.dagId, taskId: this.activedNodeId, consumeIp: consumeIp, executeDate: startTime}
      this.$router.push({ name: 'taskLog', query: resObj })
    },
    activeTarget (target) {
      this.target = target
    },
    getTaskRelation () {
      let startTime = this.startTime && this.startTime.prop ? this.startTime.prop : this.startTime
      workflowApi.getRelationById(this.$route.params.dagId, this.target, startTime).then(
        (data) => {
          if (data.rst === 'ok') {
            this.flowInfo = data.data
            this.nodes = data.data.nodes
            this.edges = data.data.edge
            this.workRelationType = data.data.type
            if (data.data.nodes && data.data.nodes.length > 0) {
                this.setWorkRelationState(data.data.nodes[0].state)
            }
            this.setWorkRelationType(this.workRelationType)
          }
        }, () => {}
      )
    },
    ...mapActions([
        'setWorkRelationType', 'setWorkRelationState'
    ])
  },
  computed: {
    operationTitle () {
      return '[ ' + this.activedNodeName + ' ] ' + '任务操作'
    },
    formatStartDate () {
      if (!this.flowInfo || !this.flowInfo.startDate) {
        return ''
      } else {
        return DateUtils.formate(this.flowInfo.startDate, 'zone')
      }
    },
    formatEndDate () {
      if (!this.flowInfo || !this.flowInfo.endDate) {
        return ''
      } else if (this.flowInfo.endDate === '-') {
        return '-'
      } else {
        return DateUtils.formate(this.flowInfo.endDate, 'zone')
      }
    },
    formatCreateDate () {
      if (!this.flowInfo || !this.flowInfo.createDate) {
        return ''
      } else {
        return DateUtils.formate(this.flowInfo.createDate)
      }
    },
    isDisabled () {
      return this.state && this.state !== 'success' && this.state !== 'failed'
    }
  },
  mounted () {
    let filterHeight = document.getElementsByClassName('filters')[0].clientHeight
    let leftSideHeight = document.getElementsByClassName('left-side')[0].clientHeight
    this.graphWidth = document.getElementsByClassName('left-side')[0].clientWidth    
    this.graphHeight = leftSideHeight - filterHeight
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  created () {
    let getTargets = workflowApi.getAllTargetByDagId(this.$route.params.dagId)
    let getDateList = workflowApi.getDateListForRelation(this.$route.params.dagId)
    axios.all([getTargets, getDateList]).then(axios.spread(
      (resTarget, rstDate) => {
        this.targets = resTarget.data
        if (this.targets.length) {
          this.target = this.$route.query.target ? this.$route.query.target : this.targets[0]
        }

        let times = rstDate.data.exeDateList
        this.startTimes = times.map(
          item => {
            return {
              prop: item,
              label: DateUtils.formate(item, 'zone')
            }
          }
        )
        
        if (this.$route.query.executionDate) {
          this.startTime = Number(this.$route.query.executionDate)
        } else {
          this.startTime = this.startTimes.length ? this.startTimes[0] : null
        }
        this.$emit('change', {time: this.startTime, target: this.target})
        this.getTaskRelation()
      })
    )
  },
  components: {
    DagreGraph,
    SelectTargetByTab,
    SideDialog,
    TaskInfo
  }
}
</script>
<style lang="scss" scoped>
.graph-legend {
  // AT-252 依赖关系页面，参考图标显示跟其他页面格式展示不一致
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  padding: 10px;
  background-color: #eef2f3;
  width: calc(100% + 26px);
  & > div {
    margin-right: 15px;
    font-size: 14px;
    line-height: 21px;
  }
}
.atom-content {
  padding-top: 0;
  border: 0;
}
.left-side {
  position: relative;
}
.direction, .target-list {
  width: 160px;
}
.graph-container {
  margin-top: 5px;
  height: calc(100% - 92px);
}
.viewLog-btn {
  background-color: #46bebc;
  border-color: #46bebc;
}
.row-content {
  display: flex;
  padding-left: 0px !important;
}
.start-time {
  margin-left: 12px;
}
.side-dialog{
    z-index: 99;
    // margin-top: 46px;
    height: calc(100% - 79px)!important;
}
</style>
