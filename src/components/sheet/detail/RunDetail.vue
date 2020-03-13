<template lang="pug">
    div.run-detail-model-dialog
        div.run-detail-container
            div.header
                el-button.turnoff-btn(icon="el-icon-arrow-right" size="small" type="warning" @click="closeRunDetail")
                p.title 执行详情
            div.body
                el-row
                    el-col(:span="12")
                        div.left
                            el-row.row-item
                                label.key 结果:
                                div(v-loading="loading")
                                    div.result.correct(v-if="!loading &&  taskInfo && taskInfo.status === 2")
                                        span.el-icon-check
                                    div.result.error(v-else)
                                        span.el-icon-close
                            el-row.row-item
                                label.key 目标:
                                span {{ checkedTarget ? checkedTarget.targetIp : '' }}
                    el-col(:span="12")
                        div.right 
                            el-row.row-item
                                label.key 开始:
                                span  {{ createTime }}
                            el-row.row-item
                                label.key 耗时:
                                span {{ taskInfo && taskInfo.runLastSec > -1 ? taskInfo.runLastSec + '秒' : '--'}}
                el-row.row-item
                    el-col(:span="12")
                        label.key 参数:
                        a.varible(@click="changeShowParams") {{paramsTipObj.tip}}
                            i(:class="paramsTipObj.icon")
                        div.variables-pane(v-if="isShowParams")
                            pre.variables {{paramsStr}} 
                ul.nav-tabs
                    li(v-for='(item, index) in taskList' :key="index" @click="selectTarget(item)")
                        a(:class="{'active': checkedTarget === item}") {{item.targetIp}}
                div.log-pane      
                    p.log-title 执行日志 
                        span.err-msg(v-if="!loading && taskInfo && taskInfo.status === 3") {{ errMsg }}
                    pre(:class="{'multi-row': isMultiRow}" v-loading="loading") {{taskLog}}
                    el-row
                        el-checkbox(v-model="isMultiRow") 换行
            div.footer
                el-button(size="small" @click="closeRunDetail") 关闭
</template>
<script>
/**
 * @description 执行详情
 */
import Api from '@api'
import util from '@server/Utils'
export default {
    name: 'RunDetail',
    props: ['selectTargets', 'batchId', 'version'],
    data () {
        return {
            result: true,
            isMultiRow: true,
            checkedTarget: null,
            isShowParams: false,
            taskList: [],
            taskInfo: null,
            taskLog: '',
            loading: true,
            timer: null
        }
    },
    created () {
        this.getTaskList()
    },
    methods: {
        /**
         * @description 获取任务列表
         */
        getTaskList () {
            let rst = {
                offset: 1, 
                limit: this.selectTargets.length,
                batchId: this.batchId
            }

            Api.get('gitExcuteTaskList', rst, true).then(
                data => {
                    if (data.rst === 'ok') {
                        this.taskList = data.data.tasks
                        this.setTargetIp()
                        this.checkedTarget = this.taskList[0]
                        this.getTaskResults()
                    } else {
                        this.$notify({
                            title: '通知',
                            type: 'error',
                            message: '获取执行列表失败!'
                        })
                    }
                }, () => {
                    this.$notify({
                        title: '通知',
                        type: 'error',
                        message: '获取执行列表失败!'
                    })
                }
            ) 
        },
        /**
         * @description 获取执行详情
         */
        getTaskInfo () {
            Api.get('getTaskDetail', {taskId: this.checkedTarget.id}, true).then(
                taskResultInfo => {
                    if (taskResultInfo.rst === 'ok') {
                        if (taskResultInfo.data.status !== 1) {
                            clearInterval(this.timer)
                            this.taskInfo = taskResultInfo.data
                            this.getTaksLog()
                        }
                    }
                }, () => {
                    clearInterval(this.timer)
                }
            )
        },
        /**
         * @description 获取执行日志
         */
        getTaksLog () {
            Api.get('getTaskLog', {taskId: this.checkedTarget.taskUuid}, true).then(
                taskResultLog => {
                    this.loading = false
                    if (taskResultLog.rst === 'ok') {
                        this.taskLog = taskResultLog.data.content
                    }
                }, () => {
                    this.loading = false
                }
            )
        },
        /**
         * @description 获取执行结果和日志
         */
        getTaskResults () {
            this.timer = setInterval(this.getTaskInfo, 3000)
        },
        /**
         * @description 根据consumeIp获取hostIp
         */
        setTargetIp () {
            this.taskList.forEach(item => {
                if (item.consumeIp) {
                    this.$set(item, 'targetIp', item.consumeIp.split(':')[0])
                }
            })
        },
        /**
         * @description 关闭执行详情弹出
         */
        closeRunDetail () {
            this.$emit('closeRunDetail')
        },
        /**
         * @description 选中目标机器
         */
        selectTarget (target) {
            this.loading = true
            this.taskLog = ''
            this.checkedTarget = target
            this.getTaskResults()
        },
        /**
         * @description 是否显示参数
         */
        changeShowParams () {
            this.isShowParams = !this.isShowParams
        }
    },
    computed: {
        paramsTipObj () {
            let paramsTipObj = this.isShowParams ? {tip: '点击收起', icon: 'el-icon-arrow-up'} : {tip: '点击查看', icon: 'el-icon-arrow-down'}
            return paramsTipObj
        },
        paramsStr () {
            let paramsStr = this.version && this.version.params && this.version.params.length ? JSON.stringify(this.version.params) : ''
            return paramsStr
        },
        createTime () {
            let createTime = '--'
            if (this.taskInfo && this.taskInfo.createTime) {
                createTime = util.transformToDate(this.taskInfo.createTime)
            }
            return createTime
        },
        errMsg () {
            switch (this.taskInfo.rstInfoCode) {
                case 3002:
                    return '(' + '执行错误原因: ' + '文件下载失败!' + ')'
                case 5001:
                    return '(' + '执行错误原因: ' + '任务分发失败!' + ')'
                case 5002:
                    return '(' + '执行错误原因: ' + '传入了无效的参数!' + ')'
                default:
                    return '(' + '执行错误原因: ' + '未知错误!' + ')'
            }
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
