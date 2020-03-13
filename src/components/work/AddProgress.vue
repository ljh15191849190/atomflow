<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container(v-if="$route.query.fromId")
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/template' }") 流程列表
            el-breadcrumb-item 流程执行
    el-form(ref="workForm" :class="{ 'atom-content': $route.query.fromId ? true : false }" :model="workForm" :rules="rules" label-width="150px")
        div.server-number(v-if="this.$route.query.fromId")
            span 流程名称：
            span {{workForm.flowName}}
        el-form-item(label="流程名称" prop="flowName" v-if="!this.$route.query.fromId")
            el-select.normal-widget-width(
                v-model="workForm.flowName"
                placeholder="选择流程" 
                size="small"
                @change="templateChange"
                value-key="id" 
                )
                el-option(v-for="labelItem in templateList" :key="labelItem.id" :label="labelItem.name" :value="labelItem")
        el-form-item(label="输入变量" prop="params" v-if="hasOperatorTypes('AgentOperator')")
            TableEdit.normal-widget-width(:tableInputConfig="returnvariable" :tableData="circuittableData")
        el-form-item(label="脚本参数" prop="file_ex_params" v-if="hasOperatorTypes('AgentOperator')")
            TableEdit.normal-widget-width(:tableInputConfig="returnParam" :tableData="paramtableData")
        el-form-item(label="SQL链接信息" prop="sql" v-if="hasOperatorTypes('JdbcOperator')")
            TableEdit.normal-widget-width(:tableInputConfig="sqlParam" :tableData="sqltableData")
        el-form-item(label="ansible host.ini信息" prop="hostIni" v-if="hasOperatorTypes('AnsibleOperator')")
            TableEdit.normal-widget-width(:tableInputConfig="hostiniParam" :tableData="hostinitableData")
        el-form-item(label="ansible参数信息" prop="ansibleParam" v-if="hasOperatorTypes('AnsibleOperator')")
            TableEdit.normal-widget-width(:tableInputConfig="ansibleParam" :tableData="ansibleParamtableData")
        el-form-item(label="执行目标" prop="consumes" v-if="flowType!=='complex'")
            el-row.normal-widget-width
                el-col(:span="20")
                    el-input(v-model="consumesAddr" disabled size="small" type="text" placeholder="执行目标")
                el-col(:span="1")
                    el-button(size="small" icon="el-icon-plus" @click="addFolder") 执行目标
        div.batch-consums(v-if="flowType!=='complex' && $route.query.batch")
            span.batch-required 当前服务器数量：{{workForm.consumes.length}} 台
            span
                span.marginLefts 每批
                span.ml20
                    el-form-item(label="" prop="batch_num")
                        el-input(v-model.number="workForm.batch_num" size="small" type="text" style="width:120px")
                span 台
                span.marginLefts 跳过失败批次继续执行：
                el-switch(v-model="workForm.skip_failed_batch_execute")
        el-form-item(label="作业名称" prop="dagName")
            el-input.normal-widget-width(v-model="workForm.dagName" size="small") 
        el-form-item(label="定时策略" prop="interval" v-if="cycleFlag")
                el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式") 
        el-form-item(label="开始时间" prop="startDate")
            el-date-picker.normal-widget-width(v-model="workForm.startDate" type="datetime" placeholder="选择开始时间" size="small" @change="startTimeChange")
        el-form-item(label="结束时间" prop="endDate" v-if="cycleFlag")
                el-date-picker.normal-widget-width(v-model="workForm.endDate" type="datetime" placeholder="选择结束时间" size="small" @change="endTimeChange")
        el-form-item(label="执行超时时间(分钟)" prop="timeout")
            el-input.normal-widget-width(v-model="workForm.timeout" size="small") 
        div.server-number.clickSee(@click="handlerSee") {{isShow?"通知设置":"隐藏通知设置"}}
        template(v-if="!isShow")
            div.ml80 通知人员
                el-tooltip.pos-right(content="作业执行结果（包含成功/失败）输出后会给下列人员发送消息" placement="right")
                    i.atom-icon-sheet-help.theme-color.help-icon
            el-form-item(label="作业创建者" prop="creatuser")
                el-checkbox-group(v-model="workForm.creatWorkList")
                    el-checkbox(v-for="role in creatWorkVal" :key="role.id" :label="role") 作业创建者
            el-form-item.mt10(label="通知人" prop="notice_user")
                el-select.normal-widget-width(
                    v-model="workForm.notice_user"
                    placeholder="请输入登录名/姓名搜索"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    value-key="id"
                    :remote-method="remoteUserList"
                    :loading="userLoading"
                    size="small")
                        el-option(v-for="item in userList" :key="item.id" :label="item.name" :value="item")
                            span {{item.name}}
                            span(v-if="item.org_name") ({{item.org_name}})
        el-form-item(label="说明" prop="description")
            el-input.normal-widget-width(v-model="workForm.description" :autosize="{ minRows: 4}" size="small" type="textarea")   
        el-form-item()
            el-button(size="small" @click="reset") 返回
            el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定   
    AddTargethost(v-if="operationVisible" :selectTargets="selectTargets" :visible="operationVisible" @closeDialog="closeModal" @insertNode="insertNode")     
</template>
<script>
/** 
 * @description 该组件在作业列表组件中【添加作业】功能使用
 * @author xinghua.wen
 */
import Api from '@api'
import WorkApi from '@api/work.api'
import TableEdit from '@lib/TableEdit'
import AddTargethost from '@lib/AddTargethost'
import Utils from '@server/Utils'

const CREAT_WORK_VAL = [{
    default_project_id: localStorage.getItem('tenant'),
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('systemUserName')
}]
export default {
  //cycleFlag周期任务，batchFlag分批任务
  props: ['cycleFlag', 'batchFlag'],
  data () {
    return {
        isShow: true,
        circuittableData: [], //流程变量
        returnvariable: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'key', label: '变量代码', rowEdit: false },
                { prop: 'name', label: '变量名称', rowEdit: false },
                { prop: 'default', label: '输入值', rowEdit: true }
            ],
            isShowOpr: false
        },
        paramtableData: [],
        returnParam: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'input', label: '参数', rowEdit: true }
            ],
            isShowOpr: false
        },
        sqltableData: [],
        sqlParam: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'input', label: '参数', rowEdit: true }
            ],
            isShowOpr: false,
            inputType: 'select',
            linkList: []
        },
        hostinitableData: [],
        hostiniParam: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'input', label: 'host.ini', rowEdit: true }
            ],
            isShowOpr: false,
            inputType: 'textarea'
        },
        ansibleParamtableData: [],
        ansibleParam: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'input', label: '参数信息', rowEdit: true }
            ],
            isShowOpr: false
        },
        
        operationVisible: false,
        templateList: [], //流程编排列表
        templatework: {},
        schdulerType: 1, // 1:普通作业 2:周期任务
        dagType: 'normal', // normal：简单流程 complex：复杂流程
        workForm: {
            consumes: [],
            timeout: 60,
            dagName: '',  //作业名称
            startDate: new Date().getTime(),
            endDate: null,
            file_ex_params: '',
            interval: '',
            batch: false, //分批
            batch_sum_num: '',
            batch_num: '',
            skip_failed_batch_execute: false,
            description: '',
            flowName: '', //流程名称
            retry: false,
            retryInterval: null,
            retryFrequency: null,
            notice_type: null,
            notice_user: [],
            creatWorkList: []
        },
        userLoading: false,
        userList: [],
        creatWorkVal: CREAT_WORK_VAL,
        flowType: '',    //complex：复杂流程 normal：简单流程
        disabled: false,
        rules: {
            flowName: [
                { required: true, message: '请选择流程名称', trigger: 'blur' }                
            ],
            dagName: [
                { required: true, message: '请输入作业名称', trigger: 'blur' },
                { validator: this.ifNameExist, trigger: 'blur' }
            ],
            startDate: [
                { required: true, message: '请选择开始时间', trigger: 'change' }                
            ],
            endDate: [
                { required: false, message: '请选择结束时间', trigger: 'change' }                
            ],
            interval: [
                { required: true, message: '请输入Crontab表达式', trigger: 'blur' }                
            ],
            timeout: [
                { required: true, message: '请选择超时时间', trigger: 'blur' }                
            ],
            consumes: [
                { required: true, message: '请输入目标机器IP', trigger: 'change' }
            ],
            batch_num: [
                { required: true, message: '请输入数量', trigger: 'blur' },
                { type: 'number', message: '请输入数字', trigger: 'blur' },
                {validator: this.iSBatchExist, trigger: 'blur'}
            ]
        },
        selectTargets: [],
        operatorTypes: []  // 节点类型
    }
  },
  methods: {
    // 用户
    remoteUserList (query) {
        if (query !== '') {
            this.userLoading = true
            let param = {
                page_idx: 1,
                limit: 99999,
                name: query
            }
            Api.get('getUserListWithPagination', param, true).then(res => {
                if (res.rst === 'ok') {
                    this.userLoading = false
                    this.userList = res.data.users
                }
            })
        } else {
            this.userList = []
        }
    },
    handlerSee () {
        this.isShow = !this.isShow
    },
      //执行目标
    insertNode (rowdata) {
        this.workForm.consumes = []
        this.selectTargets = rowdata
        rowdata.forEach(item => {
            this.workForm.consumes.push({ip_addr: item.agentAddress, host_unique_id: item.host_unique_id})
        })
    },

    addFolder () {
        this.operationVisible = true
    },
    closeModal () {
        this.operationVisible = false
    },
    doRequestResult (data) {
        if (data.rst === 'ok') {
            this.$notify({
                type: 'success',
                message: '创建作业成功'
            })
            if (this.cycleFlag) {
                this.$router.push('/cycleList')
            } else if (this.$route.query.batch) {
                this.$router.push('/batchworkList')
            } else {
                this.$router.push('/workList')
            }
        } else {
            let errCode = data.err_code
            switch (errCode) {
                case 1001:
                    this.$notify({
                        type: 'error',
                       message: '定时策略有误!'
                    })
                    break
                default:
                    this.$notify({
                        type: 'error',
                        message: '创建作业失败，请稍后再试!'
                    })
                    break
            }
        }
    },
    submitForm () {
        // 校验表单是否合法
        this.$refs.workForm.validate(
            valid => {
                if (!valid) {
                    return
                }
                let new_notice_user = [...this.workForm.notice_user, ...this.workForm.creatWorkList]
                let form = {
                    consumes: this.workForm.consumes,
                    dagName: this.workForm.dagName,
                    schdulerType: this.cycleFlag ? 2 : 1, //普通作业
                    interval: this.workForm.interval, //Crontab表达式
                    timeout: this.workForm.timeout,
                    dagType: this.flowType ? this.flowType : 'normal', //简单流程
                    startDate: new Date(this.workForm.startDate).getTime() / 1000,
                    endDate: new Date(this.workForm.endDate).getTime() / 1000,
                    batch: this.$route.query.batch ? 1 : 0,      //是否分批  0:不分批 1:分批
                    batch_sum_num: this.workForm.consumes.length,
                    batch_num: this.workForm.batch_num,
                    skip_failed_batch_execute: this.workForm.skip_failed_batch_execute ? 1 : 0, //0：不跳过 1：跳过
                    description: this.workForm.description,
                    notice_type: !this.isShow ? 0 : null,
                    notice_user: Utils.getObjArrEqual(new_notice_user, 'id')
                }

                let obj = {}
                let task = {}
                //流程
                if (this.circuittableData.length > 0) {
                    this.circuittableData.forEach(item => {
                        obj[item.key] = {'default': item.taskName, 'value': item.default}
                        this.paramtableData.forEach(res => {
                            task[res.taskId] = {params: obj, file_ex_params: res.input}
                        })
                    })
                } else if (this.circuittableData.length === 0) {  // 没有脚本变量时候
                    this.paramtableData.forEach(res => {
                        task[res.taskId] = {file_ex_params: res.input}
                    })
                }
                
                let payload = {
                    dagInfo: form,
                    tasks_params: task,
                    edges: [],
                    nodes: []
                }
                // sql参数
                this.templatework.nodes.forEach(item => {
                    this.sqltableData.forEach(res => {
                        if (item.taskId === res.taskId) {
                            item.config.conn_id = res.input
                        }
                    })
                    this.hostinitableData.forEach(res => {
                        if (item.taskId === res.taskId) {
                            item.config.extInfo.host = res.input
                        }
                    })
                    this.ansibleParamtableData.forEach(res => {
                        if (item.taskId === res.taskId) {
                            item.config.file_ex_params = res.input
                        }
                    })
                })
                payload.edges = JSON.parse(JSON.stringify(this.templatework.edges))
                payload.nodes = JSON.parse(JSON.stringify(this.templatework.nodes)) 

                this.disabled = true
                WorkApi.createWork(payload).then(
                    (data) => {
                        this.doRequestResult(data)
                        this.disabled = false
                    }
                )
            }
        )
    },
    reset () {
        if (this.cycleFlag) {
            this.$router.push('/cycleList')
        } else if (this.$route.query.batch) {
            this.$router.push('/batchworkList')
        } else {
            this.$router.push('/workList')
        }
    },
    iSBatchExist (rule, value, callback) {
        if (value > this.workForm.consumes.length) {
            callback(new Error('不能超过服务器数量'))
        } else {
            callback()
        }
    },
    ifNameExist (rule, value, callback) {
        //原子作业平台ATOMFLOWAT-135(新增作业管理，作业名称相同，点击保存，没有给出校验信息)
        Api.get('queryWorkByName', {
            name: this.workForm.dagName
        }, true).then(
            (res) => {
                if (res.data.exist) {
                    callback(new Error('该作业名称已经存在，请重新输入'))
                } else {
                    callback()                    
                }
            }, err => {
                console.log(err)
            }
        )
    },
    startTimeChange () {
        if (this.workForm.startTime && (this.workForm.startTime > this.workForm.endDate)) {
            this.workForm.endDate = ''
        }
    },
    endTimeChange () {
        if (this.workForm.endDate && (this.workForm.endDate <= this.workForm.startTime)) {
            this.$notify({
                type: 'warning',
                message: '结束时间必须大于开始时间!'
            })
            this.workForm.endDate = ''
        }
    },
    // 获取流程列表
    getTemplateList () {
        Api.get('getTemplateList', {limit: 50, offset: 1, flowType: this.batchFlag ? 'normal' : ''}, true).then(
                (data) => {
                    if (data.data) {
                        this.templateList = data.data.flowList
                    }
                }, (err) => {
                    console.log(err)
                }
        )
    },
    hasOperatorTypes (param) {
        if (this.operatorTypes && this.operatorTypes.length > 0) {
            return this.operatorTypes.find(item => item === param)
        } else {
            return true
        }
    },
    //选择流程编排（详细）
    templateChange (value) {
        //选择流程时清空脚本参数
        this.paramtableData = []
        this.ansibleParamtableData = []
        this.hostinitableData = []
        this.sqltableData = []
        this.circuittableData = []
        this.operatorTypes = []
        Api.get('getTemplateById', {id: value.id}, true).then(
            (data) => {
                if (data.rst === 'ok' && data.data) {
                    this.templatework = data.data
                    this.workForm.flowName = data.data.flowName
                    this.flowType = data.data.flowType  // 是否为复杂流程
                    // let arr = data.data.nodes.map(item => {
                    //     if (item.config && item.config.sheet && item.config.sheet.version && item.config.sheet.version.params) {
                    //         // 脚本参数
                    //         this.paramtableData.push(
                    //             {input: '', taskName: item.taskName}
                    //         )
                    //         item.config.sheet.version.params.forEach(val => {
                    //             val.taskName = item.taskName
                    //         })
                    //         return item.config.sheet.version.params
                    //     }
                    // })
                    // console.log(arr)
                    // let filterdata = arr.filter(item => {
                    //     return item !== undefined && item !== null
                    // })
                    // this.circuittableData = filterdata
                    // console.log(filterdata)
                    let arr = []
                    data.data.nodes.forEach(item => {
                        this.operatorTypes.push(item.config.operatorType)
                        if (item.config && item.config.sheet && item.config.sheet.version) {
                            // 脚本参数
                            this.paramtableData.push(
                                {input: item.config.sheet.version.ex_prams, taskName: item.taskName, taskId: item.taskId}
                            )
                            if (item.config.sheet.version.params) {
                                item.config.sheet.version.params.forEach(val => {
                                    val.taskName = item.taskName
                                    arr.push(val)
                                })
                            }
                        } else if (item.config && item.config.operatorType === 'JdbcOperator') {
                            // sql参数
                            this.sqltableData.push({input: item.config.conn_id, taskName: item.taskName, taskId: item.taskId})
                        } else if (item.config && item.config.operatorType === 'AnsibleOperator') {
                            // ansible参数
                            this.hostinitableData.push({input: item.config.extInfo.host, taskName: item.taskName, taskId: item.taskId})
                            this.ansibleParamtableData.push({input: '', taskName: item.taskName, taskId: item.taskId})
                        } 
                    })
                    let filterdata = arr.filter(item => {
                        return item !== undefined && item !== null
                    })
                    this.circuittableData = filterdata
                }
            }
      )
    },
    getLinkList () {
        Api.get('getLinkList', {
            limit: 50,
            offset: 1,
            conn_type: 'jdbc'
        }, true).then(
            (res) => {
                if (res.rst === 'ok') {
                    this.sqlParam.linkList = res.data.conn_list
                }
            }
        )
    }
    
  },
  computed: {
    consumesAddr () {
        let agentAddress = this.workForm.consumes.map(item => item.ip_addr)
        return agentAddress.join(',')
    }
  },
  created () {
      this.getTemplateList() //获取流程列表
      this.getLinkList()
        //  流程执行
      if (this.$route.query.fromId) {
          this.workForm.startDate = new Date()
          let obj = {}
          obj.id = this.$route.query.fromId
          this.templateChange(obj)
      }
  },
  components: {
    TableEdit,
    AddTargethost
  }
}
</script>
<style lang="scss" scoped>
.normal-width{
    width: 280px;
}
.atom-content {
    overflow: auto;
}
.normal-widget-width {
    width: 560px;
}
.variable-content {
    width: 560px !important;
}
.hidden{
    display: none;
}
.atom-detail {
    height: 300px;
}
.marginLefts{
    margin-left: 20px;
}
.server-number{
    margin-left: 80px;
    margin-bottom: 20px;
}
.clickSee{
    color: #8C99FF;
    cursor: pointer;
}
.ml80{
    margin-left: 80px;
}
.mt10{
    margin-top:-15px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 305px !important;
}
.batch-required:before{
    content: "*";
    color: #f86255;
    margin-right: 4px;
}
.batch-consums{
    margin-left:30px; 
}
.ml20{
    display:inline-block;
    margin-left: -145px !important;
}
</style>
