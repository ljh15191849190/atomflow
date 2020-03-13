<template lang="pug">
    el-dialog(title="创建作业" :visible.sync="visible" :before-close="closeModal" width="500px")
        el-form(ref="workForm" :rules="rules" :model="workForm" label-width="80px")
            el-form-item(label="作业名称" prop="name")
                el-input.normal-widget-width(size="small" v-model.trim="workForm.name" v-loading="loading" :maxlength="20")
            el-form-item(label="开始时间" prop="startTime")
                el-date-picker(
                    v-model="workForm.startTime" 
                    type="datetime" 
                    placeholder="选择开始时间" 
                    size="small"
                    @change="startTimeChange")
            el-form-item(label="结束时间" prop="endTime")
                el-date-picker(
                    v-model="workForm.endTime" 
                    type="datetime" 
                    placeholder="选择结束时间" 
                    size="small"
                    default-time="23:59:59" 
                    @change="endTimeChange"
                    :picker-options="pickerOptEnd")
            el-form-item(label="执行方式" prop="schdulerType")
                el-radio-group(v-model="workForm.schdulerType")
                    el-radio(v-for="item in schdulers" :key="item.id" :label="item.label" border size="small") {{item.name}}
            el-form-item(v-if="workForm.schdulerType === 2" label="定期方式" prop="interval")
                //- 原子作业平台ATOMFLOWAT-232(新增作业界面，执行方式是周期时，定期方式中默认显示不易懂，建议加个说明)
                el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式")
            el-form-item(label="目标机器" v-if="isNormal" prop="target")
                el-select.normal-widget-width(
                    size="small"
                    v-model="workForm.target"
                    :multiple="isNormal"
                    filterable
                    allow-create)
                    el-option(
                        v-for="(item, index) in targets"
                        :key="index"
                        :label="item.hostIp"
                        :value="item.hostIp"
                    )
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="reset") 取消
            el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定
</template>
<script>
/** 
 * @description 该组件在脚本列表/模板列表组件中【创建作业】快捷方式的功能使用
 * @author xinghua.wen
 */
import axios from 'axios'
import Utils from '@server/template-utils'
import WorkApi from '@api/work.api'
import Api from '@api'

export default {
  props: ['visible', 'template'],
  data () {
      return {
        results: [],
        sheet: null,
        loading: false,
        workForm: {
            name: '',
            startTime: '',
            endTime: '', 
            interval: '*/5 * * * *',  
            schdulerType: 1,
            target: null,
            timeout: 60
        },
        schdulers: [
            {label: 1, name: '单次执行'},
            {label: 2, name: '周期执行'}            
        ],
        disabled: false,
        targets: [],
        rules: {
            name: [
                { required: true, message: '请输入作业名称', trigger: 'blur' },
                { validator: this.ifNameExist, trigger: 'blur' }
            ],
            startTime: [
                { required: true, message: '请选择开始时间', trigger: 'change' }                
            ],
            endTime: [
                { required: false, message: '请选择结束时间', trigger: 'change' }                
            ],
            schdulerType: [
                { required: true, message: '请选择执行方式', trigger: 'change' }                
            ],
            target: [
                { required: true, message: '请输入目标机器IP', trigger: 'change' }
                // { validator: this.checkIp, trigger: 'blur,change' }                
            ],
            interval: [
                { required: true, message: '请输入定期方式', trigger: 'change' } 
            ]
        },
        pickerOptEnd: {
            /*  原子作业平台ATOMFLOWAT-102
             *  问题原因：输入的开始时间大于结束时间，点击确定，无校验
             *  解决方法：endtime加上disaled时间
             *  回归版本：v0.1
             */
            disabledDate: (time) => {
                if (this.workForm.startTime) {
                    return time.getTime() < new Date(this.workForm.startTime).getTime() - 8.64e7
                } else {
                    return false
                }
            }
        }
      }
  },
  computed: {
    /** 
     * @description 是否简单任务 简单任务需要填写机器信息
     * @description 简单任务 所有节点均没有指定机器信息
     * @author xinghua.wen
     */
    isNormal () {
        let rst = Utils.validateType(this.template.nodes)
        return rst === 'normal'
    }
  },
  methods: {
    /**
     * 关闭模态框
     * @augments 
     * @author xinghua.wen
     * */
    closeModal () {
        this.$emit('closeDialog')
    },
    
    /** 
     * @description 提交表单
     * @author xinghua.wen
    */
    submitForm () {
        this.$refs.workForm.validate(
            (valid) => {
                if (valid) {
                    // 如果有timeout则设置
                    if (this.template.timeout) {
                        this.workForm.timeout = this.template.timeout
                    }
                    let payload = {
                        dagInfo: Utils.getDagInfo(this.workForm, this.isNormal),
                        edges: [],
                        nodes: []
                    }
                    payload.edges = JSON.parse(JSON.stringify(this.template.edges))
                    payload.nodes = JSON.parse(JSON.stringify(this.template.nodes)) 
                                   
                    if (this.isNormal) {
                        this.packageTargetInfo(payload.nodes)
                    }
                    /*
                    * 修改bug: 原子作业平台ATOMFLOWAT-129
                    * 问题原因: 只有一个节点时（目前没加分支的情况下，节点类型是脚本，没有添加连接时，默认应该有一个连接自身的eage
                    */
                    if (payload.nodes.length === 1 && !payload.edges.length) {
                        let item = { from: payload.nodes[0].id, to: payload.nodes[0].id }
                        payload.edges.push(item)
                    } 

                    payload.nodes = Utils.resetNodes(payload)
                    //处理分支的codeMapBranch
                    for (const i in payload.nodes) {
                        let branch = payload.nodes[i].codeMapBranch
                        if (branch && branch.length) {
                            branch.forEach(branchItem => {
                                for (const j in payload.edges) {
                                    let returnCode = payload.edges[j].returnCode
                                    if (returnCode && returnCode.code === branchItem.code) {
                                        branchItem.targetId = payload.edges[j].to
                                        break
                                    }
                                }
                            })
                        }
                    }

                    let savePayload = {
                        flowName: payload.dagInfo.dagName,
                        timeout: payload.dagInfo.timeout,
                        flowType: payload.dagInfo.dagType,
                        owner: payload.dagInfo.owner,
                        edges: payload.edges,
                        nodes: payload.nodes                        
                    }

                    this.disabled = true
                    //优化接口提示
                    let templatePromise = null
                    if (!this.template.id) {
                        templatePromise = Api.save('saveTemplate', savePayload, true) 
                    } else {
                        //编辑模板新建作业时，名称不能变
                        savePayload.id = this.template.id
                        savePayload.flowName = this.template.flowName
                        templatePromise = Api.put('updateTemplate', savePayload, true)
                    }

                    let workPromise = WorkApi.createWork(payload)
                    axios.all([templatePromise, workPromise]).then(axios.spread(
                        (tempRes, workRes) => {
                            if (workRes.rst === 'ok') {
                                this.$notify({
                                    type: 'success',
                                    message: '创建作业成功'
                                })
                                this.$router.push('/workList') 
                            } else {
                                let errCode = workRes.err_code
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

                            this.$emit('closeDialog')
                        })
                    )
                }
            }
        )
    },
    /** 
     * @description 简单任务 提交表单前去掉节点机器信息
     */
    packageTargetInfo (nodes) {
        nodes.forEach(
            item => {
                if (item.target) {
                    delete item.target
                }
            }
        )
    },
    reset () {
        this.$emit('closeDialog')        
    },
    ifNameExist (rule, value, callback) {
        this.loading = true 
        WorkApi.queryTaskByName(this.workForm.name).then(
            res => {
                this.loading = false
                if (res.data.exist) {
                    callback(new Error('该作业名称已经存在，请重新输入'))
                } else {
                    callback()                    
                }
            }, err => {
                console.log(err)
                this.loading = false                
            }
        )
    },
     /** 
     * @description ip格式校验
     */
    checkIp (rule, value, callback) {
        if (!value || !value.length) {
            callback()
        }

       let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

        for (const i in value) {
            if (!reg.test(value[i])) {
                callback(new Error('请输入正确的服务器地址'))
            }
        }

        callback()
    },
    startTimeChange () {
        if (this.workForm.startTime && (this.workForm.startTime > this.workForm.endTime)) {
            this.workForm.endTime = ''
        }
    },
    endTimeChange () {
        if (this.workForm.endTime && (this.workForm.endTime <= this.workForm.startTime)) {
            this.$notify({
                type: 'warning',
                message: '结束时间必须大于开始时间!'
            })
            this.workForm.endTime = ''
        }
    }
  },
  created () {
      Api.get('getAgentList', {
                limit: 50,
                offset: 1
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.targets = res.data.agentList
                    } 
                }
            )
  }
}
</script>
<style lang="scss" scoped>
</style>
