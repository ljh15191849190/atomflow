<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/workList' }" v-if="from === 'list'") 作业列表
            el-breadcrumb-item(:to="{ path: '/dagLogger' }" v-if="from === 'logger'") 执行日志           
            el-breadcrumb-item(:to="{ path: '/' }") 作业详情
    div.main-content.atom-content
        div.left-side.position-relative.left-info-side
            div.row-content
                //- 原子作业平台ATOMFLOWAT-233
                span.el-form-item__label 基准时间
                div.el-form-item__content
                    el-date-picker(v-model="runTime" type="datetime" placeholder="选择日期时间" size="small" @change="filterDagDetail")
                span.el-form-item__label.margin-left 执行条数
                div.el-form-item__content
                    el-input-number(v-model="duration" :min="25" label="执行周期" size="small")              
                span.el-form-item__label.margin-left 目标主机
                div.el-form-item__content
                    el-select.target-list(v-model="target" placeholder="目标主机" size="mini" @change="filterDagDetail")
                        el-option(
                            v-for="(item, index) in targets"
                            :key="index"
                            :label="item"
                            :value="item"
                        )
            el-row
                div.position-absolute.graph-legend
                    div.inline-block.read-only.title(v-for="item in legends" :class="[item.class]") {{item.label}}
                Tree-Graph(:data="data")
        div.right-side.right-info-side(:span="4")  
            el-row.title
                span 基本信息
            el-row.margin-bottom
                span.read-only.title 作业名称
                span.read-only.value {{detailInfo.name}} 
            el-row.margin-bottom
                span.read-only.title 作业周期
                span.read-only.value {{detailInfo.interval}}  
            el-row.margin-bottom  
                span.read-only.title 创建人
                span.read-only.value {{detailInfo.owner}}
            el-row.margin-bottom  
                span.read-only.title 开始时间
                span.read-only.value {{formatStartDate}}
            el-row.margin-bottom  
                span.read-only.title 结束时间
                span.read-only.value {{formatEndDate}}
            el-row.margin-bottom 
                span.read-only.title 创建时间
                span.read-only.value {{formatCreateDate}}     
</template>
<script>
import DateUtils from '@server/date-utils'
import WorkApi from '@api/work.api'
import TreeGraph from '@/components/lib/TreeGraph'
// import tempRunning from '@mock/workflow/tempRunning'
import workDetailLegend from '@mock/workflow/workDetailLegend'
export default {
  data () {
    return {
        dagId: null,
        data: {},
        runTime: '',
        duration: 25,
        target: '',
        targets: [],
        legends: workDetailLegend,
        detailInfo: {},
        from: ''
    }
  },
  methods: {
    filterDagDetail () {
        let rst = {
            numRuns: this.duration
        }
        if (this.runTime) {
            rst.baseDate = new Date(this.runTime).getTime() / 1000
        }
        if (this.target) {
            rst.queue = this.target
        }
        WorkApi.getTaskRunInfo(this.dagId, rst).then(
            data => {
                this.data = data.data.dagInfo
                this.detailInfo = data.data
            }
        )
    }
  },
  watch: {
    duration () {
        this.filterDagDetail()
    }
  },
  created () {
    this.dagId = this.$route.params.id
    this.from = this.$route.query.from
    WorkApi.getAllTargetByDagId(this.dagId).then(
      res => {
        this.targets = res.data
        if (this.targets.length) {
          //原子作业平台ATOMFLOWAT-284(点击作业执行日志，进入详情页面，目标主机和执行状态显示跟列表中的信息不一致，需要手动切换目标机器才显示)
          this.target = this.from === 'logger' ? this.$route.query.target : this.targets[0]
        }
        WorkApi.getTaskRunInfo(this.dagId, {numRuns: this.duration, queue: this.target}).then(
            data => {
                this.data = data.data.dagInfo
                this.detailInfo = data.data
            }
        )
      })
  },
  computed: {
    formatStartDate () {
      if (!this.detailInfo.startDate) {
        return ''
      } else {
        return DateUtils.formate(this.detailInfo.startDate)
      }
    },
    formatEndDate () {
      if (!this.detailInfo.endDate) {
        return ''
      } else {
        return DateUtils.formate(this.detailInfo.endDate)
      }
    },
    formatCreateDate () {
      if (!this.detailInfo.createDate) {
        return ''
      } else {
        return DateUtils.formate(this.detailInfo.createDate)
      }
    }
  },
  components: {
    TreeGraph 
  }
}
</script>
<style lang="scss" scoped>
.graph-legend {
    top: 20px;
    left: 0px;
    & > div {
        margin-right: 15px;
        font-size: 14px;
    }
}
.atom-content {
    padding-top: 0;
}
.run-time-list, .target-list {
    width: 140px;
}
.row-content {
    display: flex;
    align-items: center;
}
</style>
<style lang="scss">
.el-input-number--small {
    width: 110px;
    line-height: 30px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 185px !important;
}
</style>

