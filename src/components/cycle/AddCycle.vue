<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/workList' }") 周期列表
            el-breadcrumb-item 新增周期任务
    el-form.atom-content(ref="workForm" :model="workForm" :rules="rules" label-width="150px")
        el-form-item(label="作业内容")
            el-radio-group(v-model="workForm.category" @change="categoryChange")
                el-radio(:label="2") 脚本
                el-radio(:label="1") 流程
        // el-row.normal-widget-width(v-if="workForm.category === 2")
        //     el-col(:span="16")
        //         el-select(v-model="version" placeholder="选择脚本" size="small")
        //            el-option(v-for="version in versions" :key="version.name" :label="version.name" :value="version")
        //     el-col(:span="8")
        //         el-select(v-model="version"  placeholder="脚本标签" size="small")
        //              el-option(v-for="version in versions" :key="version.name" :label="version.name" :value="version")
        
        el-form-item(label="脚本名称" prop="shell" v-if="workForm.category === 2")   
            el-select.normal-width(clearable v-model="workForm.shell"  placeholder="选择脚本" size="small" @change="onChangeSheet")
                el-option(v-for="shelldata in SheetList" :key="shelldata.id" :label="shelldata.name" :value="shelldata.id")
            el-select.normal-width(clearable v-model="workForm.tag"  placeholder="脚本标签" size="small" @change="onChangeTag")
                el-option(v-for="tag in TagList" :key="tag.id" :label="tag.name" :value="tag.id")
        el-form-item(label="脚本变量" prop="params" v-if="workForm.category === 2")
            TableEdit.normal-widget-width(:tableInputConfig="returnConfig" :tableData="ShellContent")
        el-form-item(label="脚本参数" prop="file_ex_params" v-if="workForm.category === 2")
            el-input.normal-widget-width(v-model="workForm.file_ex_params"  size="small" type="text" placeholder="脚本参数") 
        
        el-form-item(label="编排" v-if="workForm.category === 1")
            el-select.normal-widget-width(
                v-model="workForm.label"
                placeholder="选择编排" 
                size="small"
                @change="templateChange"
                value-key="id" 
                )
                el-option(v-for="labelItem in templateList" :key="labelItem.id" :label="labelItem.name" :value="labelItem")
        el-form-item(label="输入变量" prop="params" v-if="workForm.category === 1")
            TableEdit.normal-widget-width(:tableInputConfig="returnvariable" :tableData="circuittableData")
        el-form-item(label="脚本参数" prop="file_ex_params" v-if="workForm.category === 1")
            TableEdit.normal-widget-width(:tableInputConfig="returnParam" :tableData="paramtableData")
        el-form-item(label="执行目标" prop="consumes" v-if="flowType!=='complex'")
            el-row.normal-widget-width
                el-col(:span="20")
                    el-input(v-model="workForm.consumes+''" disabled size="small" type="text" placeholder="执行目标")
                el-col(:span="1")
                    el-button(size="small" icon="el-icon-plus" @click="addFolder") 执行目标
        el-form-item(label="任务名称" prop="dagName")
            el-input.normal-widget-width(v-model="workForm.dagName" size="small") 
        el-form-item(label="定时策略" prop="interval")
            el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式") 
        el-form-item(label="开始时间" prop="startDate")
            el-date-picker.normal-widget-width(v-model="workForm.startDate" type="datetime" placeholder="选择开始时间" size="small" @change="startTimeChange")
        el-form-item(label="结束时间" prop="endDate")
            el-date-picker.normal-widget-width(v-model="workForm.endDate" type="datetime" placeholder="选择结束时间" size="small" @change="endTimeChange")
        el-form-item(label="执行超时时间(分钟)" prop="timeout")
            el-input.normal-widget-width(v-model="workForm.timeout" size="small") 
        el-form-item(label="说明" prop="description")
            el-input.normal-widget-width(v-model="workForm.description" :autosize="{ minRows: 4}" size="small" type="textarea")   
        el-form-item()
            el-button(size="small" @click="reset") 返回
            el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定   
    AddTargethost(v-if="operationVisible" :selectTargets="selectTargets" :visible="operationVisible" @closeDialog="closeModal" @insertNode="insertNode")     
</template>
<script>

import SelectSheet from '@/components/sheet/SelectSheet'
import Api from '@api'
// import Utils from '@server/template-utils'
import Utils from '@server/Utils'
import WorkApi from '@api/work.api'
// import WorkUtils from '@server/work-utils.js'
import Varibles from '@lib/EditVarible'
import TableEdit from '@lib/TableEdit'
import AddTargethost from '@lib/AddTargethost'
export default {
  data () {
    return {
        circuittableData: [], //流程变量
        returnConfig: {
            columns: [
                { prop: 'key', label: '变量代码', rowEdit: false },
                { prop: 'name', label: '变量名称', rowEdit: false },
                { prop: 'default', label: '输入值', rowEdit: true }
            ],
            isShowOpr: false
        },
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
        operationVisible: false,
        loading: false,
        SheetList: [],
        TagList: [],
        ShellContent: [], //脚本变量列表
        templateList: [], //流程编排列表
        templatework: {},
        schdulerType: 2, // 1:普通作业 2:周期任务
        scriptData: {}, //脚本详情信息
        dagType: 'normal', // normal：简单流程 complex：复杂流程
        version: null,
        versions: [],
        workForm: {
            shell: '',
            tag: '',
            consumes: [],
            timeout: 60,
            dagName: '',  //作业名称
            startDate: new Date().getTime(),
            endData: null,
            category: 2, 
            file_ex_params: '',
            interval: '',
            batch: false, //分批
            batch_sum_num: '',
            batch_num: '',
            skip_failed_batch_execute: false,
            description: ''
        },
        flowType: '',
        selectTargets: [],
        activedTemplateTotalInfo: null,
        disabled: false,
        targets: [],
        rules: {
            dagName: [
                { required: true, message: '请输入作业名称', trigger: 'blur' },
                { validator: this.ifNameExist, trigger: 'blur' }
            ],
            startDate: [
                { required: true, message: '请选择开始时间', trigger: 'change' }                
            ],
            interval: [
                { required: true, message: '请输入Crontab表达式', trigger: 'blur' }                
            ],
            endDate: [
                { required: false, message: '请选择结束时间', trigger: 'change' }                
            ],
            timeout: [
                { required: true, message: '请输入超时时间', trigger: 'blur' }                
            ],
            consumes: [
                { required: true, message: '请输入目标机器IP', trigger: 'change' }
            ]
        }
    }
  },
  methods: {
      //执行目标
    insertNode (rowdata) {
        this.workForm.consumes = []
        this.selectTargets = rowdata
        rowdata.forEach(item => {
            this.workForm.consumes.push(item.hostIp + ':' + item.port)
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
        this.templatework = null
        this.workForm.consumes = []
        this.selectTargets = []
        this.workForm.shell = null
        this.ShellContent = []
        this.circuittableData = []
        this.paramtableData = []
    },
    doRequestResult (data) {
        if (data.rst === 'ok') {
            this.$notify({
                type: 'success',
                message: '创建作业成功'
            })
            this.$router.push('/cycleList')
        } else {
            let errCode = data.err_code
            switch (errCode) {
                case 2001:
                    this.$notify({
                        type: 'error',
                        message: 'DAG不合法!'
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
                let form = {
                    consumes: this.workForm.consumes,
                    dagName: this.workForm.dagName,
                    schdulerType: this.schdulerType, //普通作业
                    interval: this.workForm.interval, //Crontab表达式
                    timeout: this.workForm.timeout,
                    dagType: this.flowType ? this.flowType : 'normal', //简单流程
                    startDate: new Date(this.workForm.startDate).getTime() / 1000,
                    endDate: new Date(this.workForm.endDate).getTime() / 1000,
                    batch: this.workForm.batch ? 1 : 0,      //是否分批  0:不分批 1:分批
                    batch_sum_num: this.workForm.consumes.length,
                    batch_num: this.workForm.batch_num,
                    skip_failed_batch_execute: this.workForm.skip_failed_batch_execute ? 1 : 0, //0：不跳过 1：跳过
                    description: this.workForm.description
                }
                // let data = this.ShellContent.map(item => {
                //     let obj = {[item.key]: item.default}
                //     return obj
                // })
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
                } else {
                    //流程
                    if (this.circuittableData.length > 0) {
                        this.circuittableData.forEach(item => {
                            obj[item.key] = {'default': item.taskName, 'value': item.default}
                            this.paramtableData.forEach(res => {
                                // if (res.taskName === item.taskName) {
                                    task[res.taskId] = {params: obj, file_ex_params: res.input}
                                // }
                            })
                        })
                    } else if (this.circuittableData.length === 0) {
                        this.paramtableData.forEach(res => {
                            task[res.taskId] = {file_ex_params: res.input}
                        })
                    }
                }
                
                // task[uuid] = {params: obj, file_ex_params: file_ex}
                let payload = {
                    dagInfo: form,
                    tasks_params: task,
                    edges: [],
                    nodes: []
                }

                // 选择模板
                if (this.workForm.category === 1) {
                    payload.edges = JSON.parse(JSON.stringify(this.templatework.edges))
                    payload.nodes = JSON.parse(JSON.stringify(this.templatework.nodes)) 
                } else {
                     // 选择脚本
                    payload.edges = []
                    payload.nodes = [{
                        taskName: this.scriptData.name, 
                        taskId: uuid,
                        config: {
                            'operatorType': 'AgentOperator',        //步骤类型
                            // 'retry': true,        //是否重试
                            // 'retryInterval': 10,   //重试间隔时间
                            // 'retryFrequency': 5,    //重试次数
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
        this.$router.push('/cycleList')
    },
    ifNameExist (rule, value, callback) {
        this.loading = true 
        Api.get('queryWorkByName', {
            name: this.workForm.dagName
        }, true).then(
            (res) => {
                this.loading = false
                if (res.data.exist) {
                    callback(new Error('该任务名称已经存在，请重新输入'))
                } else {
                    callback()                    
                }
            }, err => {
                console.log(err)
                this.loading = false                
            }
        )
    },
    startTimeChange () {
        if (this.workForm.startDate && (this.workForm.startDate > this.workForm.endDate)) {
            this.workForm.endDate = ''
        }
    },
    endTimeChange () {
        if (this.workForm.endDate && (this.workForm.endDate <= this.workForm.startDate)) {
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
            tagIds: this.tag
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
    // 获取流程列表
    getTemplateList () {
        Api.get('getTemplateList', {limit: 50, offset: 1}, true).then(
                (data) => {
                    this.templateList = data.data.flowList
                }, (err) => {
                    console.log(err)
                }
        )
    },
    onChangeTag (value) {
        this.tag = value
    },
    //选择流程编排（详细）
    templateChange (value) {
        //选择流程时清空脚本参数
        this.paramtableData = []
        Api.get('getTemplateById', {id: value.id}, true).then(
            (data) => {
                if (data.rst === 'ok' && data.data) {
                    this.templatework = data.data
                    this.flowType = data.data.flowType 
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
                        if (item.config && item.config.sheet && item.config.sheet.version) {
                            // 脚本参数
                            this.paramtableData.push(
                                {input: '', taskName: item.taskName, taskId: item.taskId}
                            )
                            if (item.config.sheet.version.params) {
                                item.config.sheet.version.params.forEach(val => {
                                    val.taskName = item.taskName
                                    arr.push(val)
                                })
                            }
                        }
                    })
                    console.log(arr)
                    let filterdata = arr.filter(item => {
                        return item !== undefined && item !== null
                    })
                    this.circuittableData = filterdata
                    console.log(filterdata)
                }
            }
      )
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
    
  },

  created () {
      this.querySheetList() //获取sheet列表
      this.queryTagList()   //获取sheet tag列表
      this.getTemplateList() //获取流程列表
  },
  components: {
    SelectSheet,
    Varibles,
    TableEdit,
    AddTargethost
  }
}
</script>
<style lang="scss" scoped>
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
    margin-bottom: 10px;
}
</style>
<style lang="scss" scoped>
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 305px !important;
}
</style>
