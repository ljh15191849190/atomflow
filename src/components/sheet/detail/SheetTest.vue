<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/sheetdetail/' + this.$route.query.sheetId }") 工具详情
                el-breadcrumb-item 脚本测试
        el-form.atom-content(ref="sheetForm" :model="sheetForm" :rules="rules" label-width="150px")
            div.server-number
                span 脚本名称：
                span {{sheetDetail.name}}
            el-form-item(label="执行目标" prop="consumes")
                el-row.normal-widget-width
                    el-col(:span="19")
                        el-input(v-model="consumesAddr" disabled size="small" type="text" placeholder="执行目标")
                    el-col(:span="1")
                        el-button(size="small" icon="el-icon-plus" @click="addFolder") 执行目标
            el-form-item(label="输入变量" prop="params")
                TableInput.normal-widget-width(:tableInputConfig="variableConfig" :tableData="bodyData" :Isrequired="false")
            el-form-item(label="执行超时时间(分钟)" prop="timeout")
                el-input.normal-widget-width(v-model="sheetForm.timeout" size="small") 
            el-form-item(label="脚本参数" prop="params")
                el-input.normal-widget-width(v-model="sheetForm.fileParams" size="small") 
            el-form-item
                el-button(size="small" @click="reset") 返回
                el-button(type="primary" size="small" @click="SriptTest") 确定   
        AddTargethost(v-if="operationVisible" env="1" :selectTargets="selectTargets" :visible="operationVisible" @closeDialog="closeModal" @insertNode="insertNode")     
</template>
<script>
/**
 * @description 脚本测试
 */
// import Api from '@api'
import TableInput from '@lib/TableInput'
import AddTargethost from '@lib/AddTargethost'
import Api from '@api'
export default {
    name: 'SheetTest',
    data () {
        return {
            variableConfig: {
                columns: [
                    { prop: 'key', label: '变量代码', rowEdit: false },
                    { prop: 'name', label: '变量名称', rowEdit: false },
                    { prop: 'default', label: '输入值', rowEdit: true }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加'
            },
            
            operationVisible: false,
            selectTargets: [],
            sheetForm: {
                consumes: [],
                timeout: 60,
                fileParams: ''
            },
            rules: {
                consumes: [
                    { required: true, message: '请选择执行目标', trigger: 'change' }
                ],
                timeout: [
                    { required: true, message: '请选择超时时间', trigger: 'blur' }                
                ]
            },
            sheetDetail: {},
            version: {}
        }
    },
    methods: {
        //执行目标
        insertNode (rowdata) {
            this.sheetForm.consumes = []
            this.selectTargets = rowdata
            rowdata.forEach(item => {
                this.sheetForm.consumes.push({ip_addr: item.agentAddress, host_unique_id: item.host_unique_id})
            })
        },
        // 目标机器
        addFolder () {
            this.operationVisible = true
        },
        closeModal () {
            this.operationVisible = false
        },
        // 脚本测试
        reset () {
            if (this.$route.query.IsTools) {
                this.$router.push({path: '/sheetdetail/' + this.$route.query.sheetId, query: {IsTools: 'tools'}})
            } else {
                this.$router.push('/sheetdetail/' + this.$route.query.sheetId)
            }   
        },
        SriptTest () {
            this.$refs.sheetForm.validate(valid => {
                if (valid) {
                    let params = {}
                    this.version.params.forEach(res => {
                        params[res.key] = res.default
                    })
                    Api.post('runSheelTest', {
                            fileName: this.sheetDetail.name,
                            fileType: this.sheetDetail.type,
                            version: '1.1.0',
                            fileRemoteUrl: this.version.downloadUrl,
                            consumeIps: this.sheetForm.consumes,
                            fileExParams: this.sheetForm.fileParams,
                            timeout: this.sheetForm.timeout,
                            fileParams: params,
                            taskParams: this.version.params
                        }, true).then(
                        data => {
                            if (data.rst === 'ok') {
                                this.$router.push('/sheetExcuteList')
                            }
                        }
                    )
                }
            })
        }
        
    },
    created () {
        Api.get('getSheetById', {fileId: this.$route.query.sheetId}, true).then(
            data => {
                this.sheetDetail = data.data
                let versions = data.data.versions
                if (versions.length > 0) {
                    this.version = versions[0]
                }
            }
        ) 
    },
    components: {TableInput, AddTargethost},
    computed: {
        consumesAddr () {
            let agentAddress = this.sheetForm.consumes.map(item => item.ip_addr)
            return agentAddress.join(',')
        },
        bodyData () {
            if (this.sheetDetail.versions && this.sheetDetail.versions[0] && this.sheetDetail.versions[0].params) {
                // let obj = {}
                // this.sheetDetail.versions[0].params.forEach(res => {
                //     obj[res.key] = res.default
                // })
                return this.sheetDetail.versions[0].params
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .normal-widget-width {
        width: 560px
    }
    .server-number{
        margin-left: 83px;
        margin-bottom: 10px;
    }
</style>
