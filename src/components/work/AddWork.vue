<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right" v-if="$route.query.fileId")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/sheetList/tableview' }") 脚本列表
            el-breadcrumb-item 脚本执行
        el-breadcrumb(separator-class="el-icon-arrow-right" v-else-if="$route.query.cycle")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/cycleList' }") 周期列表
            el-breadcrumb-item 新增周期任务
        el-breadcrumb(separator-class="el-icon-arrow-right" v-else-if="$route.query.batch")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/batchworkList' }") 分批作业列表
            el-breadcrumb-item 新增分批作业
        el-breadcrumb(separator-class="el-icon-arrow-right" v-else)
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/workList' }") 作业列表
            el-breadcrumb-item 新增作业
    el-form.atom-content(ref="workForm" :model="workForm" :rules="rules" label-width="150px")
        el-form-item(label="作业内容" v-if="!this.$route.query.fileId")
            el-radio-group(v-model="workForm.category" @change="categoryChange")
                el-radio(:label="2") 脚本
                el-radio(:label="1") 流程
                el-radio(:label="3" v-if="!$route.query.batch") sql
                el-radio(:label="4" v-if="!$route.query.batch") ansible
        Ansible(v-if="workForm.category === 4" :cycleFlag="$route.query.cycle?$route.query.cycle:null")
        Sql(v-else-if="workForm.category === 3" :cycleFlag="$route.query.cycle?$route.query.cycle:null")
        Progress(v-else-if="workForm.category === 1" :batchFlag="$route.query.batch?$route.query.batch:null" :cycleFlag="$route.query.cycle?$route.query.cycle:null")
        template(v-else)
            div.sheet-name(v-if="$route.query.fileId")
                span 脚本名称：
                span {{scriptData.name}}
            el-form-item(v-else label="脚本名称" prop="shell")   
                el-select.normal-width(clearable v-model="workForm.shell"  placeholder="选择脚本" size="small" @change="onChangeSheet")
                    el-option(v-for="shelldata in SheetList" :key="shelldata.id" :label="shelldata.name" :value="shelldata.id")
                el-select.normal-width(clearable v-model="workForm.tag"  placeholder="脚本标签" size="small" @change="onChangeTag")
                    el-option(v-for="tag in TagList" :key="tag.id" :label="tag.name" :value="tag.id")
            el-form-item(label="脚本变量" prop="params")
                TableEdit.normal-widget-width(:tableInputConfig="returnConfig" :tableData="ShellContent")
            el-form-item(label="脚本参数" prop="file_ex_params")
                el-input.normal-widget-width(v-model="workForm.file_ex_params"  size="small" type="text" placeholder="脚本参数") 
            el-form-item(label="执行目标" prop="consumes" v-if="flowType!=='complex'")
                el-row.normal-widget-width
                    el-col(:span="20")
                        el-input(v-model="consumesAddr" disabled size="small" type="text" placeholder="执行目标")
                    el-col(:span="1")
                        el-button(size="small" icon="el-icon-plus" @click="addFolder") 执行目标
            div.batch-consums(v-if="$route.query.batch")
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
            el-form-item(label="定时策略" prop="interval" v-if="$route.query.cycle")
                el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式") 
            el-form-item(label="开始时间" prop="startDate")
                el-date-picker.normal-widget-width(v-model="workForm.startDate" type="datetime" placeholder="选择开始时间" size="small" @change="startTimeChange")
            el-form-item(label="结束时间" prop="endDate" v-if="$route.query.cycle")
                el-date-picker.normal-widget-width(v-model="workForm.endDate" type="datetime" placeholder="选择结束时间" size="small" @change="endTimeChange")
            el-form-item(label="执行超时时间(分钟)" prop="timeout")
                el-input.normal-widget-width(v-model="workForm.timeout" size="small") 
            div.server-number
                span 失败自动重试：
                el-switch(v-model="workForm.retry")
                span(v-if="workForm.retry===true")
                    span.marginLefts 间隔
                    span.ml20
                        el-form-item(label="" prop="retryInterval")
                            el-input(v-model.number="workForm.retryInterval" size="small" type="text" style="width:80px" placeholder="1~60")
                    span 秒，重试
                    span.ml20
                        el-form-item(label="" prop="retryFrequency")
                            el-input(v-model.number="workForm.retryFrequency" size="small" type="text" style="width:80px" placeholder="1~5")
                    span 次
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
import Utils from '@server/Utils'
import WorkApi from '@api/work.api'
import TableEdit from '@lib/TableEdit'
import AddTargethost from '@lib/AddTargethost'
import Ansible from './AddAnsible'
import Sql from './AddSql'
import Progress from './AddProgress'

const CREAT_WORK_VAL = [{
    default_project_id: localStorage.getItem('tenant'),
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('systemUserName')
}]
export default {
  data () {
    return {
        returnConfig: {
            columns: [
                { prop: 'key', label: '变量代码', rowEdit: false },
                { prop: 'name', label: '变量名称', rowEdit: false },
                { prop: 'default', label: '输入值', rowEdit: true }
            ],
            isShowOpr: false
        },
        creatWorkVal: CREAT_WORK_VAL,
        userList: [],
        userLoading: false,
        isShow: true,
        operationVisible: false,
        SheetList: [],
        TagList: [],
        ShellContent: [], //脚本变量列表
        schdulerType: 1, // 1:普通作业 2:周期任务
        scriptData: {}, //脚本详情信息
        dagType: 'normal', // normal：简单流程 complex：复杂流程
        workForm: {
            notice_type: null,
            notice_user: [],
            creatWorkList: [],
            shell: '',
            tag: '',
            consumes: [],
            timeout: 60,
            dagName: '',  //作业名称
            startDate: new Date().getTime(),
            endDate: null,
            category: 2, 
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
            retryFrequency: null
        },
        flowType: '',    //complex：复杂流程 normal：简单流程
        disabled: false,
        rules: {
            shell: [
                { required: true, message: '请选择脚本名称', trigger: 'blur' }                
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
            retryInterval: [
                { required: true, message: '请输入间隔', trigger: 'blur' },
                { type: 'number', message: '请输入数字', trigger: 'blur' },
                {validator: this.iSIntervalExist, trigger: 'blur'}
            ],
            retryFrequency: [
                { required: true, message: '请输入次数', trigger: 'blur' },
                { type: 'number', message: '请输入数字', trigger: 'blur' },
                {validator: this.iSFrequency, trigger: 'blur'}
            ],
            batch_num: [
                { required: true, message: '请输入数量', trigger: 'blur' },
                { type: 'number', message: '请输入数字', trigger: 'blur' },
                {validator: this.iSBatchExist, trigger: 'blur'}
            ]
        },
        selectTargets: []
    }
  },
  methods: {
    handlerSee () {
        this.isShow = !this.isShow
    },
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
    //切换作业内容
    categoryChange () {
        this.workForm.consumes = []
        this.selectTargets = []
        this.workForm.shell = null
        this.ShellContent = []
    },
    doRequestResult (data) {
        if (data.rst === 'ok') {
            this.$notify({
                type: 'success',
                message: '创建作业成功'
            })
            if (this.$route.query.cycle) {
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
    iSIntervalExist (rule, value, callback) {
        if (value < 0 || value > 60) {
            callback(new Error('值为1~60s'))
        } else {
            callback()
        }
    },
    iSFrequency (rule, value, callback) {
        if (value < 0 || value > 5) {
            callback(new Error('值为1~5次'))
        } else {
            callback()
        }
    },
    iSBatchExist (rule, value, callback) {
        if (value > this.workForm.consumes.length) {
            callback(new Error('不能超过服务器数量'))
        } else {
            callback()
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
                    schdulerType: this.$route.query.cycle ? 2 : this.schdulerType, //普通作业
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
                let uuid = Utils.uuid()

                let obj = {}
                let file_ex = null
                let task = {}
                if (this.workForm.category === 2) {
                    //脚本
                    this.ShellContent.forEach(item => {
                        obj[item.key] = {'default': item.name, 'value': item.default}
                    })
                    file_ex = this.workForm.file_ex_params
                    task[uuid] = {params: obj, file_ex_params: file_ex}
                } 
                
                let payload = {
                    dagInfo: form,
                    tasks_params: task,
                    edges: [],
                    nodes: []
                }
                if (this.workForm.category === 2) {
                    // 选择脚本
                    payload.edges = []
                    payload.nodes = [{
                        taskName: this.scriptData.name, 
                        taskId: uuid,
                        config: {
                            'operatorType': 'AgentOperator',        //步骤类型
                            'retry': this.workForm.retry,        //是否重试
                            'retryInterval': Number(this.workForm.retryInterval),  //重试间隔时间
                            'retryFrequency': Number(this.workForm.retryFrequency),   //重试次数
                            'targetHost': '',     //目标机器(复杂流程)
                            'sheet': {
                                'fileName': this.scriptData.name,     //脚本名称
                                'id': this.scriptData.id,    //脚本id
                                'type': this.scriptData.type,    //脚本类型(python/shell/powershell/bat)
                                'version': this.scriptData.versions ? this.scriptData.versions[0] : {}
                            }
                        }
                    }]
                }
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
        if (this.$route.query.cycle) {
                this.$router.push('/cycleList')
        } else if (this.$route.query.batch) {
                this.$router.push('/batchworkList')
        } else {
            this.$router.push('/workList')
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
    //脚本列表
    querySheetList () {
        Api.get('getSheetListByFolderId', {
            limit: 50,
            offset: 1,
            tagIds: this.tag,
            scriptType: '1'
        }, true).then(
            (data) => {
                this.SheetList = data.data.fileList
            }
        )
    },
    //获取脚本详情
    onChangeSheet (value) {
        Api.get('getShellContent', {
            fileId: value
        }, true).then(
            (res) => {
                if (res.rst === 'ok' && res.data && res.data.versions.length) {
                    this.scriptData = res.data
                    this.ShellContent = res.data.versions[0].params
                }
            }
        )
    },
    //脚本标签
    queryTagList () {
        Api.get('getAllLabels', { }, true).then(
            (res) => {
                if (res.rst === 'ok') {
                    this.TagList = res.data
                }
            }
        )
    },
    onChangeTag (value) {
        this.tag = value
    }
  },
  watch: {
      'workForm.tag': {
            deep: true,
            handler (newVal, oldVal) {
                this.querySheetList()
            }
      }
  },
  computed: {
    consumesAddr () {
        let agentAddress = this.workForm.consumes.map(item => item.ip_addr)
        return agentAddress.join(',')
    }
  },
  created () {
      this.querySheetList() //获取sheet列表
      this.queryTagList()   //获取sheet tag列表
      //   脚本执行
      if (this.$route.query.fileId) {
          this.workForm.category = 2
          let file = this.$route.query.fileId
          this.onChangeSheet(file)
      }
  },
  components: {
    TableEdit,
    AddTargethost,
    Ansible,
    Sql,
    Progress
  }
}
</script>
<style lang="scss" scoped>
.ml20{
    display:inline-block;
    margin-left: -145px !important;
}
.normal-width{
    width: 280px;
}
.add-work {
    margin-top: -10px;
    margin-left: 12px;
    margin-bottom: 15px;    
    border: 1px dotted #a6a6a6;
    border-radius: 10px;
    padding: 5px;
}
.atom-content {
    overflow: auto;
}
.normal-widget-width {
    width: 560px;
}
.marginLefts{
    margin-left: 20px;
}
.server-number{
    margin-left: 50px;
    margin-bottom: 10px;
}
.batch-consums{
    margin-left:35px; 
}
.sheet-name{
    margin-left: 80px;
    margin-bottom: 20px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 305px !important;
}
.ml80{
    margin-left: 80px;
}
.mt10{
    margin-top:-15px;
}
.clickSee{
    color: #8C99FF;
    cursor: pointer;
}
.batch-required:before{
    content: "*";
    color: #f86255;
    margin-right: 4px;
}
</style>
