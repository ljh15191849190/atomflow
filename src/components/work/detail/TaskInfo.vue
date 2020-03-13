<template lang="pug">
    div.container-flud(v-cloak)
        div.atom-content-info
            el-row.normal-widget-width
                el-col.lineText(:span="10")
                    span.read-only 节点名称:
                    span.read-only.value(:title="logDetail.fileName") {{logDetail.fileName}}              
                el-col(:span="12")
                    span.read-only 开始时间:
                    span.read-only.value {{formatter(logDetail.runStartTime)}}      
                
            el-row.margin-top.normal-widget-width  
                el-col(:span="10")
                    span.read-only 执行用户:
                    span.read-only.value {{logDetail.owner}}  
                el-col(:span="12")  
                    span.read-only 执行结束时间:
                    span.read-only.value {{formatter(logDetail.runEndTime)}}
            el-row.margin-top.normal-widget-width  
                el-col(:span="10")
                    span.read-only 节点类型:
                    span.read-only.value {{transform[logDetail.nodeType]}}  
                el-col(:span="12")  
                    span.read-only 结果:
                    span.read-only.value {{transStatus[logDetail.status]}}
                    i.atom-icon-sheet-down.theme-color.download-icon(v-if="logDetail.nodeType === 'JdbcOperator' && logDetail.status==='success'" @click="downLoadSheetFile")
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'SimpleHttpOperator'")  
                el-col(:span="10")  
                    span.read-only 超时时间(S):
                    span.read-only.value {{logDetail.timeout}}
                el-col(:span="12")  
                    span.read-only 请求方式:
                    span.read-only.value {{logDetail.method}}
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'SimpleHttpOperator'")  
                el-col(:span="10")  
                    span.read-only http目标地址:
                    span.read-only.value {{logDetail.http_conn_id}}
                el-col(:span="12")  
                    span.read-only 返回值:
                    span.read-only.value {{logDetail.rst_code}}
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'AnsibleOperator'")  
                el-col(:span="10")  
                    span.read-only 入口文件名:
                    span.read-only.value {{logDetail.extInfo.book_name}}
                el-col(:span="12")  
                    span.read-only 入口文件说明:
                    span.read-only.value {{logDetail.extInfo.remark}}
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'AgentOperator'")
                el-col(:span="12")  
                    span.read-only 执行目标:
                    span.read-only.value {{logDetail.consumeIp}}
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'JdbcOperator'")
                el-col(:span="12")  
                    span.read-only 数据库链接:
                    span.read-only.value {{logDetail.jdbc_conn_id}}
            el-row.margin-top(v-if="logDetail.nodeType === 'SimpleHttpOperator' || logDetail.nodeType === 'AgentOperator'") 
                span 参数：
                span.clickSee(@click="handlerSee") {{isShow?"点击查看":"点击收起"}}
            template(v-if="!isShow")
                template(v-if="logDetail.nodeType === 'SimpleHttpOperator'")
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
                    el-row
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
            el-row.margin-top.normal-widget-width(v-if="logDetail.nodeType === 'SimpleHttpOperator' || logDetail.nodeType === 'AgentOperator'|| logDetail.nodeType === 'AnsibleOperator'")  
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
    name: 'TaskInfo',
    props: ['logDetail', 'shellContent'],
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
            isShow: true,
            // 编辑器属性
            sheetDetail: {},
            theme: 'base16-dark',
            langs: defaultLangs
            // shellContent: ''

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
        /**
         * @description 下载脚本文件
         */
        downLoadSheetFile () {
            Api.get('sqlDownload', {
                    dag_id: this.logDetail.dagId,
                    task_id: this.logDetail.task_id,
                    execution_date: this.logDetail.execution_date
                }, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, 'sql.csv')
                }
            )
        }
    },
    created () {
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
        },
        transStatus () {
            const config = {
                'success': '成功',
                'running': '执行中',
                'failed': '失败',
                'skipped': '跳过',
                'up_for_retry': '重试',
                'queued': '排队',
                'scheduled': '调度中',
                'no-status': '无状态'
            }
            return config
        },
        nodesParams () {
            if (this.logDetail.taskInfo) {
                return this.logDetail.taskInfo.file_ex_params
            }
        },
        tableData () {
            let Info = this.logDetail.taskInfo
            let arr = []
            if (Info) {
                 for (let aa in Info.file_params) {
                    let obj = {
                        'key': aa,
                        // 'default': Info.file_params[aa]
                        'name': Info.file_params[aa].default,
                        'default': Info.file_params[aa].value
                    }
                    arr.push(obj)
                }
            }
            return arr
        },
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
        padding: 10px 10px 0px 0px;
        background: #fff;
        margin-left: 16px;
        margin-right: 16px;
    }
    .clickSee{
        color: #8C99FF;
        cursor: pointer;
    }
    .normal-widget-width {
        width: 100%
    }
    .download-icon{
        margin-left: 10px;
        font-size: 18px;
        cursor: pointer;
    }
</style>

