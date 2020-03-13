<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
      el-breadcrumb(separator-class="el-icon-arrow-right")
          el-breadcrumb-item 原子作业平台
          el-breadcrumb-item(:to="{ path: '/workList' }") 作业列表
          el-breadcrumb-item(:to="{ path: '/flowDetails/' + $route.query.dagId }") 依赖关系
          el-breadcrumb-item 日志详情
    div.atom-content
      div.log-content(v-if="taskLogs")
        div.header 日志详情
        div.content
          div.flex.empty(v-if="taskLogs.length === 0") 
            img(src="../../../assets/icon/empty.png")
            p 暂无日志
          pre.log(v-else) {{logMsg}}
        div.flex-end.pagefooter(v-if="taskLogs.length > 0")
          el-pagination(
            @current-change="currentChange"
            :current-page.sync="currentPage"
            layout="prev, pager, next"
            :page-count="taskLogs.length")
</template>
<script>
import workflowApi from '@api/work.api'
export default {
  data () {
    return {
        logMsg: '',
        logHeight: '',
        currentPage: 1,
        taskLogs: null,
        isShowDialog: false
    }
  },
  methods: {
    init () {
      //获取日志信息
      let resObj = {dagId: this.$route.query.dagId, taskId: this.$route.query.taskId, consumeIp: this.$route.query.consumeIp, executeDate: this.$route.query.executeDate}
      workflowApi.getTaskLog(resObj).then(
        res => {
          if (res.rst === 'ok') {
            this.taskLogs = res.data.logs
            if (this.taskLogs.length > 0) {
              this.logMsg = this.taskLogs[0]
            }
          }
        }
      )
    },
    currentChange (index) {
      this.logMsg = this.taskLogs[index - 1]
    }
  },
  created () {
    this.init()
  }
}
</script>
<style lang="scss" scoped>
.log-content {
  height: calc(100% + 16px);
  .header {
    height: 40px;
    line-height: 40px;
  }
  .content {
    height: calc(100% - 90px);
    border: 1px solid #e1e6e6;
    background-color: #fbfbfb;
    .log {
      height: 100%;
      padding: 10px 20px;
      overflow: auto;
      word-wrap: normal;
      white-space: pre;
      font-size:13px;
      color: #646464;
    }
    .empty {
      flex-direction: column;
      width:100%;
      height: 100%;
      p {
        margin-top: 10px;
      }
    }
  }
}
</style>
