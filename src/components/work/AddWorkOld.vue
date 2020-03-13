<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/workList' }") 作业列表
            el-breadcrumb-item 新增作业
    el-form.atom-content(ref="workForm" :model="workForm" :rules="rules" label-width="80px")
        el-form-item(label="作业名称" prop="name")
            el-input.normal-widget-width(v-model.trim="workForm.name" v-loading="loading" size="small" :maxlength="20")
        el-form-item(label="作业内容")
            el-radio-group(v-model="workForm.category" @change="categoryChange")
                el-radio(:label="1") 选择模板
                el-radio(:label="2") 选择脚本
        el-row
            el-col(:span="workForm.category === 2 ? 16 : 12")
                Select-Sheet.add-work(v-if="workForm.category === 2" @checkedSheet="checkedSheet" :checkedSheet="copiedNode")
                Select-Sheet.add-work(v-if="workForm.category === 1" :contentType="'template'" @checkedSheet="checkedSheet" :checkedSheet="copiedNode")
            el-col.atom-detail(:span="12" v-if="workForm.category === 1")
                Dagre-Graph(v-if="workForm.category === 1 && checkedTemplate.id" :nodes="network.nodes" :edges="network.edges" :height="graphHeight" :width="graphWidth" :nodeClick="nodeClick" :hideDirectionCrtl="'sss'")
        el-form-item(label="脚本版本" v-if="workForm.category === 2")
            el-select.normal-widget-width(v-model="version" value-key="name"  placeholder="请选择版本" size="small")
                el-option(v-for="version in versions" :key="version.name" :label="version.name" :value="version")
        el-form-item(label="脚本变量" v-if="workForm.category === 2 && version && version.params && version.params.length > 0")
            Varibles.variable-content(:variables="version.params")
        el-form-item(prop="params")
            el-input.hidden(v-model="workForm.params") 
        el-form-item(v-if="this.copiedNode" label="开始时间" prop="startTime")
            el-date-picker(v-model="workForm.startTime" type="datetime" placeholder="选择开始时间" size="small" @change="startTimeChange")
        el-form-item(v-if="this.copiedNode" label="结束时间" prop="endTime")
            el-date-picker(v-model="workForm.endTime" type="datetime" placeholder="选择结束时间" size="small" :picker-options="pickerOptEnd" default-time="23:59:59" @change="endTimeChange")
        el-form-item(v-if="this.copiedNode" label="执行方式" prop="schdulerType")
            el-radio-group(v-model="workForm.schdulerType")
                el-radio(v-for="item in schdulers" :key="item.id" :label="item.label" border size="small") {{item.name}}
        el-form-item(v-if="this.copiedNode && workForm.schdulerType === 2" label="定期方式")
            el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式")
        el-form-item(v-if="this.copiedNode && isNormal" label="目标机器" prop="target")
            el-select.normal-widget-width(
                size="small"
                v-model="workForm.target"
                :multiple="isNormal"
                filterable
                allow-create)
                el-option(
                    v-for="(item, index) in targets"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                )
        el-form-item(v-if="this.copiedNode")
            el-button(size="small" @click="reset") 返回
            el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定
            
</template>
<script>
/** 
 * @description 该组件在作业列表组件中【添加作业】功能使用
 * @author xinghua.wen
 */
import SelectSheet from '@/components/sheet/SelectSheet'
import DagreGraph from '@lib/DagreGraph'
import Api from '@api'
import Utils from '@server/template-utils'
import WorkApi from '@api/work.api'
import WorkUtils from '@server/work-utils.js'
import Varibles from '@lib/EditVarible'
export default {
  data () {
    return {
        loading: false,
        version: null,
        versions: [],
        workForm: {
            name: '',
            params: 'params',
            category: 1,
            schdulerType: 1,
            startTime: null,
            endTime: null,
            target: null,
            interval: '*/5 * * * *'
        },
        schdulers: [
            {label: 1, name: '单次执行'},
            {label: 2, name: '周期执行'} 
        ],
        copiedNode: null,
        activedTemplateTotalInfo: null,
        network: {},
        graphHeight: 200,
        graphWidth: 300,
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
            //原子作业平台ATOMFLOWAT-204(点击执行创建作业的时候，结束日期不必填，但是通过作业管理创建作业的时候，结束时间是必填的)
            endTime: [
                { required: false, message: '请选择结束时间', trigger: 'change' }                
            ],
            schdulerType: [
                { required: true, message: '请选择执行方式', trigger: 'change' }                
            ],
            interval: [
                { required: true, message: '请选择定期方式', trigger: 'change' }                
            ],
            target: [
                { required: true, message: '请输入目标机器IP', trigger: 'change' },
                { validator: this.checkIp, trigger: 'blur,change' }                
            ],
            params: [
                { required: true, message: '脚本变量不能为空', trigger: 'change' }                
            ]
        },
        pickerOptEnd: {
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
  methods: {
    checkedSheet (node) {
        this.copiedNode = node
        if (this.workForm.category === 2) {
            this.versions = node.versions
            if (this.versions.length > 0) {
                this.version = this.versions[this.versions.length - 1]
            }
        }
    },
    getVaribles (params) {
        if (!params) {
            return {}
        }
        let vars = {}
        params.forEach((item) => {
            vars[item.key] = item.default
        })

        return vars
    },
    nodeClick () {

    },
    categoryChange () {
        this.copiedNode = null
        this.activedTemplateTotalInfo = null
    },
    doRequestResult (data) {
        if (data.rst === 'ok') {
            this.$notify({
                type: 'success',
                message: '创建作业成功'
            })
            this.$router.push('/workList')
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
        if (this.workForm.category === 2 && this.version.params) {
            let index = this.version.params.findIndex(item => {
                return item.default === ''
            })
            
            if (index > -1) {
                this.workForm.params = ''
            } else {
                this.workForm.params = 'noCheck'
            }
        }

        // 校验表单是否合法
        this.$refs.workForm.validate(
            valid => {
                if (!valid) {
                    return
                }
                
                let form = {
                    name: this.workForm.name,
                    startTime: this.workForm.startTime,
                    endTime: this.workForm.endTime, 
                    interval: this.workForm.interval,
                    schdulerType: this.workForm.schdulerType,
                    target: this.workForm.target,
                    timeout: this.workForm.category === 1 && this.activedTemplateTotalInfo.timeout ? this.activedTemplateTotalInfo.timeout : 60
                }
                let payload = {
                    dagInfo: Utils.getDagInfo(form, this.isNormal),
                    edges: [],
                    nodes: []
                }

                // 选择模板
                if (this.workForm.category === 1) {
                    payload.edges = JSON.parse(JSON.stringify(this.activedTemplateTotalInfo.edges))
                    payload.nodes = JSON.parse(JSON.stringify(this.activedTemplateTotalInfo.nodes)) 
                } else {
                    this.copiedNode.downloadUrl = this.version.downloadUrl
                    this.copiedNode.vars = this.getVaribles(this.version.params)
                    let network = WorkUtils.buildNetworkData([this.copiedNode])
                    payload.nodes = network.nodes
                    payload.edges = network.edges
                    payload.nodes = Utils.resetNodes(payload)            
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
        this.$router.push('/workList')
    },
    ifNameExist (rule, value, callback) {
        //原子作业平台ATOMFLOWAT-135(新增作业管理，作业名称相同，点击保存，没有给出校验信息)
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
  computed: {
    checkedTemplate () {
        if (this.copiedNode && this.copiedNode.flowType) {
            Api.get('getTemplateById', {id: this.copiedNode.id}, true).then(
                res => {
                    this.activedTemplateTotalInfo = res.data
                    let nodes = this.activedTemplateTotalInfo.nodes.map(
                        item => {
                            return {
                                id: item.taskId,
                                state: '',
                                value: {
                                    label: item.taskName,
                                    operator: item.operatorType
                                }
                            }
                        }
                    )
                    this.$set(this.network, 'nodes', nodes)
                    this.$set(this.network, 'edges', this.activedTemplateTotalInfo.edges)                    
                }
            )
            return this.copiedNode
        }
        return {}
    },
    /** 
     * @description 是否简单任务 简单任务需要填写机器信息
     * @author xinghua.wen
     */
      isNormal () {
        if (this.workForm.category === 2 && this.copiedNode) {
            return true
        }
        if (!this.checkedTemplate.id || !this.activedTemplateTotalInfo) {
            return false
        }

        return this.copiedNode && this.copiedNode.flowType === 'normal'
    }
  },
  mounted () {
    this.graphWidth = document.getElementsByClassName('atom-detail')[0].clientWidth
  },
  components: {
    SelectSheet,
    DagreGraph,
    Varibles
  }
}
</script>
<style lang="scss" scoped>
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
    width: 460px;
}
.variable-content {
    width: 460px !important;
}
.hidden{
    display: none;
}
.atom-detail {
    height: 300px;
}
</style>
<style lang="scss">
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 205px !important;
}
</style>
