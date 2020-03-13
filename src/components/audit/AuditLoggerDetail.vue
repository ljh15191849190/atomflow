<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right" v-if="$route.query.isSheetExcute")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/sheetExcuteList' }") 调试历史   
                el-breadcrumb-item 调试历史详情 
            el-breadcrumb(separator-class="el-icon-arrow-right" v-else)
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/auditLogger' }") 节点执行记录   
                el-breadcrumb-item 节点执行记录详情 
        div.atom-content-info.atom-content
            el-row.normal-widget-width
                el-col.lineText(:span="12")
                    span.read-only 节点名称:
                    span.read-only.value(:title="logDetail.fileName") {{logDetail.fileName}}              
                el-col(:span="12")
                    span.read-only 执行开始时间:
                    span.read-only.value {{formatter(logDetail.runStartTime)}}      
                
            el-row.margin-top.normal-widget-width  
                el-col(:span="12")
                    span.read-only 执行人:
                    span.read-only.value {{logDetail.owner}}  
                el-col(:span="12")  
                    span.read-only 执行结束时间:
                    span.read-only.value {{formatter(logDetail.runEndTime)}}
            el-row.margin-top.normal-widget-width  
                el-col(:span="12")
                    span.read-only 节点类型:
                    span.read-only.value {{transform[$route.query.operator]}}  
                el-col(:span="12")  
                    span.read-only 结果:
                    span.read-only.value {{transStatus[logDetail.status]}}
                    i.atom-icon-sheet-down.theme-color.download-icon(v-if="$route.query.operator === 'JdbcOperator'&& logDetail.status==='success'" @click="downLoadSheetFile")
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'SimpleHttpOperator'")  
                el-col(:span="12")  
                    span.read-only 超时时间(S):
                    span.read-only.value {{logDetail.timeout}}
                el-col(:span="12")  
                    span.read-only 请求方式:
                    span.read-only.value {{logDetail.method}}
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'AnsibleOperator'")  
                el-col(:span="12")  
                    span.read-only 入口文件名:
                    span.read-only.value {{logDetail.extInfo.book_name}}
                el-col(:span="12")  
                    span.read-only 入口文件说明:
                    span.read-only.value {{logDetail.extInfo.remark}}
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'SimpleHttpOperator'")  
                el-col(:span="12")  
                    span.read-only http目标地址:
                    span.read-only.value {{logDetail.http_conn_id}}
                el-col(:span="12")  
                    span.read-only 返回值:
                    span.read-only.value {{logDetail.rst_code}}
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'AgentOperator'")
                el-col(:span="12")  
                    span.read-only 执行目标:
                    span.read-only.value {{logDetail.consumeIp}}
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'JdbcOperator'")
                el-col(:span="12")  
                    span.read-only 数据库链接:
                    span.read-only.value {{logDetail.jdbc_conn_id}}
            el-row.margin-top(v-if="$route.query.operator === 'SimpleHttpOperator' || $route.query.operator === 'AgentOperator'")  
                span 参数：
                span.clickSee(@click="handlerSee") {{isShow?"点击查看":"点击收起"}}
            template(v-if="!isShow")
                template(v-if="$route.query.operator === 'SimpleHttpOperator'")
                    el-row.margin-top  
                        span header：
                    el-row.tab-content
                            el-table.normal-widget-width(:data="headertableData" border stripe size="small")
                                el-table-column(
                                    v-for="column in headerColumns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="column.label"
                                    :width="column.width")
                                    template(slot-scope="scope")
                                        span {{scope.row[column.prop]}}
                    el-row.margin-top  
                        span body：
                    el-row.tab-content
                        el-input.normal-widget-width.pad-left(disabled v-model="logDetail.data" :rows="6" type="textarea")
                template(v-else)
                    el-row.margin-top  
                        span 脚本变量：
                    el-row.tab-content
                            el-table.normal-widget-width(:data="tableData" border stripe size="small")
                                el-table-column(
                                    v-for="column in columns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="column.label"
                                    :width="column.width")
                                    template(slot-scope="scope")
                                        span {{scope.row[column.prop]}}
                    el-row.margin-top  
                        span 脚本参数：
                    el-row.margin-top  
                        el-input.normal-widget-width(v-model="nodesParams" size="small") 
            el-row.margin-top.normal-widget-width(v-if="$route.query.operator === 'SimpleHttpOperator' || $route.query.operator === 'AgentOperator'|| $route.query.operator === 'AnsibleOperator'")    
                highlight-editor.margin-top(
                            :lang="'shell'"
                            :langs="langs"
                            :theme= "theme"
                            :editorValue.sync="shellContent"
                            :readOnly="true"
                            mode="read")
                
</template>
<script>
/**
 * @description Cycle管理详情
 */
import Api from '@api'
import HighlightEditor from '@lib/HighlightEditor'
import defaultLangs from '@/mock/sheet/defaultLangs'
import DateUtils from '@server/date-utils'
import FileSaver from 'file-saver'

export default {
    name: 'AuditLoggerDetail',
    data () {
        return {
            columns: [
                { prop: 'key', label: '变量代码' },
                { prop: 'name', label: '变量名称' },
                { prop: 'default', label: '输入值' }
            ],
            headerColumns: [
                { prop: 'code', label: 'key' },
                { prop: 'desc', label: 'value' }
            ],
            logDetail: {},
            nodesParams: '',
            tableData: [],
            isShow: true,
            // 编辑器属性
            sheetDetail: {},
            theme: 'base16-dark',
            langs: defaultLangs,
            shellContent: '',
            timer: null,
            taskTimer: null,
            detailTimer: null
        }
    },
    methods: {
        //时间格式化
        formatter (time) {
            if (time) {
                return DateUtils.formate(time, 'zone')
            }
        },
        handlerSee () {
            this.isShow = !this.isShow
        },
        downLoadSheetFile () {
            let obj = this.$route.query
            Api.get('sqlDownload', {
                    dag_id: obj.dagId,
                    task_id: obj.taskId,
                    execution_date: obj.executionDate
                }, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, 'sql.csv')
                }
            )
        },
        getCycleInfo () {
            let obj = this.$route.query
            this.tableData = []
            Api.get('getWorkCycleTaskInfo', {
                dagId: obj.dagId,
                taskId: obj.taskId,
                executionDate: obj.executionDate,
                queue: obj.queue,
                consumeIp: obj.consumeIp,
                operator: obj.operator
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        if (obj.operator === 'SimpleHttpOperator') {
                            this.logDetail = res.data
                            this.shellContent = res.data.rst_info
                        } else {
                            if (res.data.status === 'failed' || res.data.status === 'success') {
                                    clearInterval(this.timer)
                            }
                            this.logDetail = res.data
                            let Info = res.data.taskInfo
                            if (Info) {
                                this.nodesParams = Info.file_ex_params
                                for (let aa in Info.file_params) {
                                    let obj = {
                                        'key': aa,
                                        'name': Info.file_params[aa].default,
                                        'default': Info.file_params[aa].value
                                    }
                                    this.tableData.push(obj)
                                }
                            }
                        }
                    } else if (res.rst === 'err') {
                        clearInterval(this.timer)
                    }
                }, () => {
                }
            )
        },
        getCycleAgentLogo () {
            let obj = this.$route.query
            this.shellContent = ''
            Api.get('getWorkCycleAgentLog', {
                dagId: obj.dagId,
                taskId: obj.taskId,
                executionDate: obj.executionDate,
                queue: obj.queue,
                consumeIp: obj.consumeIp
            }, true).then(
                (res) => {
                    if (res.rst === 'ok' && JSON.stringify(res.data.content) !== '{}') {
                        for (let aa in res.data.content) {
                            this.shellContent += res.data.content[aa]
                        }
                        clearInterval(this.detailTimer)
                    } else if (res.rst === 'err') {
                        clearInterval(this.detailTimer)
                    }
                }, () => {
                    clearInterval(this.detailTimer)
                }
            )
        },
        getWorkLog () {
            let obj = this.$route.query
            this.shellContent = ''
            Api.get('getWorkLog', {
                dagId: obj.dagId,
                taskId: obj.taskId,
                executionDate: obj.executionDate,
                queue: obj.queue,
                consumeIp: obj.consumeIp
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        res.data.logs.forEach(element => {
                        this.shellContent += element
                    })
                    } 
                }
            )
        },
        //重新执行
        gettaskRunLogo () {
            let obj = this.$route.query
            Api.get('getWorkTaskRunLog', {
                dagId: obj.dagId,
                taskId: obj.taskId,
                executeDate: obj.executionDate,
                consumeIp: obj.consumeIp
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        for (let aa in res.data.content) {
                            this.shellContent += res.data.content[aa]
                        }
                    } 
                }, () => {
                 }
            )
        },
        getTaskInfo (val) {
            Api.get('getTaskDetail', {taskId: val}, true).then(
                taskResultInfo => {
                    if (taskResultInfo.rst === 'ok') {
                        this.logDetail = taskResultInfo.data
                        if (taskResultInfo.data && taskResultInfo.data.taskParams) {
                            this.tableData = taskResultInfo.data.taskParams
                        }
                        if (taskResultInfo.data && taskResultInfo.data.taskInfo) {
                            this.nodesParams = taskResultInfo.data.taskInfo.file_ex_params
                        }
                    }
                }
            )
        },
        getTaksLog (val) {
            Api.get('getTaskLog', {taskId: val}, true).then(
                taskResultLog => {
                    if (taskResultLog.rst === 'ok' && JSON.stringify(taskResultLog.data.content) !== '{}') {
                        for (let aa in taskResultLog.data.content) {
                            this.shellContent += taskResultLog.data.content[aa]
                        }
                        clearInterval(this.taskTimer)
                    } else if (taskResultLog.rst === 'err') {
                        clearInterval(this.taskTimer)
                    }
                }
            )
        }
    },
    created () {
        let obj = this.$route.query
        if (obj.iSagain) {
            this.gettaskRunLogo()   //重新执行
            this.timer = setInterval(() => {
                this.getCycleInfo()
                this.getCycleAgentLogo()
            }, 1000)   
        } else if (obj.isSheetExcute) {   // 调试历史
            this.getTaskInfo(obj.id)
            this.taskTimer = setInterval(() => {
                this.getTaksLog(obj.taskUuid)
            }, 3000)   
        } else if (obj.operator === 'AnsibleOperator') {   // ansible
            this.getCycleInfo()
            this.getWorkLog()
        } else {                                        // 查看详情
            this.getCycleInfo()
            this.detailTimer = setInterval(() => {
                this.getCycleAgentLogo()    
            }, 3000) 
        }
    },
    beforeDestroy () {
        clearInterval(this.timer)
        clearInterval(this.taskTimer)
        clearInterval(this.detailTimer)
    },
    computed: {
        headertableData () {
            let Info = this.logDetail.headers
            let arr = []
            if (Info) {
                 for (let aa in Info) {
                    let obj = {
                        'code': aa,
                        'desc': Info[aa]
                    }
                    arr.push(obj)
                }
            }
            return arr
        },
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
        },
        transStatus () {
            const config = {
                'success': '成功',
                'running': '执行中',
                'failed': '失败'
            }
            return config
        }
    },
    components: {
        HighlightEditor
    }
}
</script>
<style lang="scss" scoped>
    .atom-content-info{
        height: calc(100% - 78px);
        padding: 32px 64px;
        background: #fff;
        margin-left: 16px;
        margin-right: 16px;
    }
    .clickSee{
        color: #8C99FF;
        cursor: pointer;
    }
    .normal-widget-width {
        width: 660px;
    }
    .atom-content{
        overflow: auto;
    }
    .download-icon{
        margin-left: 10px;
        font-size: 18px;
        cursor: pointer;
    }
</style>

