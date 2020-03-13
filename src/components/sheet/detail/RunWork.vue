<template lang="pug">
div.full-container.run-sheet-container
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/sheetList/tableview' }") 脚本列表
            el-breadcrumb-item(:to="{ path: '/sheetdetail/' + sheetForm_Id }") 脚本详情
            el-breadcrumb-item 执行
    div.container-flud(v-loading="loading")
        div.atom-content
            el-form.wrok-form(ref="runWorkForm" :model="runWorkForm" :rules="rules" label-position="right" label-width="80px")
                el-form(:inline="true" label-position="right" label-width="80px")
                    el-form-item(label="脚本名称")            
                        span {{runWorkForm.fileName}}
                    el-form-item.version(label="脚本版本")            
                        el-select.normal-widget-width(v-model="version" value-key="name"  placeholder="请选择版本" size="small")
                            el-option(v-for="version in versions" :key="version.name" :label="version.name" :value="version")
                el-form-item.is-required(label="脚本变量" v-if="version &&  version.params && version.params.length")  
                    Varibles(:variables="version.params")
                el-form-item(prop="variables")
                    el-input.hidden(v-model="runWorkForm.variables") 
                el-form-item(prop="target" label="执行目标" ref="targetHost")
                    el-row
                        el-col(:span="21")
                            el-input(v-model="runWorkForm.target" placeholder="请选择执行目标" sise="mini" readonly)
                        el-col(:span="2") 
                            el-button(icon="el-icon-plus" @click="showAddTarget") 执行目标
                el-form-item
                    el-button.user-type(type="primary" @click="startRun") 开始执行
    el-dialog(v-if="visible" title="目标主机" :visible.sync="visible" :before-close="closeAddTarget" width="800px")
        div.dialog-body
            Target-Hosts(:selectTargets="selectTargets" @selectTargetList="selectTargetList" :fileType="runWorkForm.fileType")
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="closeAddTarget") 取消
            el-button(type="primary" size="small" @click="addTarget") 确定
    transition(name="zoom-in-right")
        Run-Detail(v-if="showRunDetail" @closeRunDetail="closeRunDetail" :selectTargets="selectTargets" :batchId="batchId" :version="version")
</template>
<script>
import Api from '@api'
import Varibles from '@lib/EditVarible'
import RunDetail from './RunDetail'
import TargetHosts from './TargetHosts'
export default {
    data () {
        return {
            visible: false,
            version: null,
            versions: [],
            batchId: '',
            loading: false,
            runWorkForm: {
                fileName: '',
                fileType: '',
                fileRemoteUrl: '',
                variables: 'hasParams',
                target: ''
            },
            rules: {
                variables: [
                    { required: true, message: '脚本变量不能为空', trigger: 'change' }                
                ],
                target: [
                    {required: true, message: '请选择执行目标', trigger: 'blur'}                
                ]
            },
            selectTargets: [],
            showRunDetail: false
        }
    },
    created () {
        this.initData()
    },
    methods: {
        /**
         * @description 初始化数据
         */
        initData () {
            Api.get('getSheetById', {fileId: this.sheetForm_Id}, true).then(
                data => {
                    this.runWorkForm.fileName = data.data.name
                    this.runWorkForm.fileType = data.data.type 
                    this.versions = data.data.versions
                    if (this.versions.length > 0) {
                        this.version = this.versions[this.versions.length - 1]
                        this.runWorkForm.fileRemoteUrl = this.version.downloadUrl
                    }
                }
            ) 
        },
        /**
         * @description 版本change事件
         */
        versionChange () {
            this.runWorkForm.fileRemoteUrl = this.version.downloadUrl
        },
        /**
         * @description 打开执行目标机器对话框
         */
        showAddTarget () {
            this.visible = true
        },
        closeAddTarget () {
            this.visible = false
        },
        /**
         * @description 选择目标主机
         */
        selectTargetList (targetList) {
            this.selectTargets = targetList
        },
        /**
         * @description 打开执行目标机器对话框
         */
        addTarget () {
            if (this.selectTargets.length === 0) {
                this.$notify({
                    title: '通知',
                    type: 'warning',
                    message: '至少选择1个目标主机!'
                })
                return
            } 

            if (this.selectTargets.length > 20) {
                this.$notify({
                    title: '通知',
                    type: 'warning',
                    message: '至多选择20目标主机!'
                })
                return
            } 

            let targetIps = this.selectTargets.map(item => {
                return item.hostIp
            })
            this.runWorkForm.target = targetIps.join(';')
            if (this.$refs.targetHost && this.runWorkForm.target) {
                this.$refs.targetHost.clearValidate()
            }
            this.closeAddTarget()
        },
        /**
         * @description 获取格式化的参数
         */
        getFormatParams () {
            let params = {}
            if (this.version && this.version.params) {
                this.version.params.forEach(item => {
                    params[item.key] = item.default
                })
            }

            return params
        },
        /**
         * @description 获取执行需要的机器列表
         */
        getConsumeIps () {
            let consumeIps = this.selectTargets.map(item => {
                return item.agentAddress
            })

            return consumeIps
        },
        /**
         * @description 开始执行
         */
        startRun () {
            this.$refs.runWorkForm.validate(
                valid => {
                    if (valid) {
                        this.loading = true
                        let rst = {
                            fileName: this.runWorkForm.fileName,
                            fileType: this.runWorkForm.fileType,
                            version: this.version.name,
                            fileRemoteUrl: this.runWorkForm.fileRemoteUrl,
                            consumeIps: this.getConsumeIps(),
                            params: this.getFormatParams()
                        }
                        
                        Api.post('dispatchSheet', rst, true).then(
                            data => {
                                this.loading = false
                                if (data.rst === 'ok') {
                                    this.batchId = data.data.batchId
                                    this.showRunDetail = true
                                } else {
                                    this.$notify({
                                        title: '通知',
                                        type: 'error',
                                        message: '执行脚本任务失败!'
                                    })
                                }
                            }, () => {
                                this.loading = false
                                this.$notify({
                                    title: '通知',
                                    type: 'error',
                                    message: '执行脚本任务失败!'
                                })
                            }
                        ) 
                    }   
                }
            )
        },
        /**
         * @description 关闭执行详情弹出
         */
        closeRunDetail () {
            this.showRunDetail = false
        }
    },
    computed: {
        sheetForm_Id () {
            return this.$route.params.id
        }
    },
    components: {
        RunDetail,
        Varibles,
        TargetHosts
    },
    watch: {
        version: {
            deep: true,
            handler () {
                if (this.version && this.version.params) {
                    let index = this.version.params.findIndex(item => {
                        return item.default === ''
                    })
                    
                    if (index > -1) {
                        this.runWorkForm.variables = ''
                    } else {
                        this.runWorkForm.variables = 'hasParams'
                    }
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
</style>