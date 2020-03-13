<template lang="pug">
    el-dialog(title="流程信息录入" :visible.sync="visible" :before-close="closeModal" width="800px")
        el-form(ref="templateForm" label-width="120px" :model="templateForm" :rules="rules") 
            el-form-item.is-required(label="流程名称")
                el-input.normal-widget-width(
                    size="small" 
                    v-model="flowForm.flowName" 
                    v-loading="loading" 
                    v-validate="!$route.query.fromId && isEdit?rules.EditflowName:rules.flowName"
                    name="flowName"
                    placeholder="请输入流程名称"
                    data-vv-as="流程名称"
                    :class="{'input': true, 'is-danger': errors.has('flowName')}"
                )
                span.validator-error.is-danger(v-if="errors.has('flowName')") {{ errors.first('flowName') }}
            el-form-item(label="输入变量" prop="params")
                TableEdit.normal-widget-width(:tableInputConfig="returnvariable" :tableData="circuittableData")
            el-form-item(label="脚本参数" prop="file_ex_params")
                    TableEdit.normal-widget-width(:tableInputConfig="returnParam" :tableData="paramtableData")
            el-form-item(label="说明")
                el-input.normal-widget-width(v-model="flowForm.description" :autosize="{ minRows: 4}" size="small" type="textarea")   
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="reset") 取消
            el-button(type="primary" size="small" @click="submitForm") 确定
</template>
<script>
import Api from '@api'
import TableEdit from '@lib/TableEdit'
export default {
  $_veeValidate: { validator: 'new' },
  props: ['visible', 'progress', 'isEdit', 'flowForm', 'shared', 'routerLeave'],
  data () {
      return {
        returnvariable: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'key', label: '变量代码', rowEdit: false },
                { prop: 'name', label: '变量名称', rowEdit: false },
                { prop: 'default', label: '输入值', rowEdit: true }
            ],
            isShowOpr: false
        },
        circuittableData: [], //变量
        returnParam: {
            columns: [
                { prop: 'taskName', label: '流程节点', rowEdit: false },
                { prop: 'input', label: '参数', rowEdit: true }
            ],
            isShowOpr: false
        },
        paramtableData: [], //参数
        progressParams: {}, //回传数据
        loading: false,
        templateForm: {
            flowName: this.flowForm.flowName
        },
        rules: {
            flowName: {
                required: true,
                max: 50,
                customIncludes: ['queryTemplateByName']
            },
            EditflowName: {
                required: true,
                max: 50
            }
        }
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
    
    submitForm () {
        this.$validator.validateAll().then(
            valid => {
                if (valid) {
                    this.progressParams.flowName = this.flowForm.flowName
                    this.progressParams.description = this.flowForm.description
                    this.progressParams.nodes.forEach(item => {
                        if (item.config && item.config.sheet && item.config.sheet.version) {
                            // 脚本参数
                            this.paramtableData.forEach(res => {
                                if (item.taskId === res.taskId) {
                                    item.config.sheet.version.ex_prams = res.input
                                }
                            })
                        }
                    })

                    let payload = JSON.parse(JSON.stringify(this.progressParams))
                    if (this.isEdit) {
                        if (this.$route.query.fromId) {
                            Api.post('saveTemplate', payload, true).then(
                                (data) => {
                                    this.successHandler('克隆流程成功')                    
                                }
                            )
                        } else {
                            Api.put('updateTemplate', payload, true).then(
                                (data) => {
                                    this.successHandler('修改流程成功')                    
                                }
                            )
                        }
                        return
                    } else {
                        delete payload.id
                    }
                    Api.post('saveTemplate', payload, true).then(
                        (data) => {
                            this.successHandler('创建流程成功')
                        }
                    ) 
                }
            }
        )
    },
    successHandler (message) {
        this.$notify({
            type: 'success',
            message
        })
        this.$emit('update:routerLeave', true)
        this.$emit('closeDialog')
        this.$router.push('/template')
    },
    reset () {
        this.$emit('closeDialog')        
    },
    isMatchNum (rule, value, callback) {
        if (!value) callback()
        if (!/^\d+$/.test(value)) {
            callback(new Error('格式有误!'))
        } else {
            callback()
        }
    },
    isExistTemplate (rule, value, callback) {
        //原子作业平台ATOMFLOWAT-208(编辑模板信息，点击保存，提示该模板名称已存在)
        if (!this.isEdit) {
            callback()
            return 
        }
        //原子作业平台ATOMFLOWAT-133(创建模板的时候，模板名称重复，没有给出提示信息)
        this.loading = true
        Api.get('queryTemplateByName', {name: this.templateForm.flowName}, true).then(
            res => {
                this.loading = false
                if (res.data.exist) {
                    callback(new Error('该模板名称已经存在，请重新输入'))
                } else {
                    callback()                    
                }
            }, err => {
                console.log(err)
                this.loading = false                
            }
        )
    }
  },
  mounted () {
        let arr = []
        this.progressParams = this.progress
        this.progressParams.nodes.forEach(item => {
            if (item.config && item.config.sheet && item.config.sheet.version) {
                // 脚本参数
                // item.config.sheet.version.ex_prams = ''
                // this.$set(item.config.sheet.version, 'ex_prams', '')
                this.paramtableData.push(
                    {input: item.config.sheet.version.ex_prams, taskName: item.taskName, taskId: item.taskId}
                )
                
                if (item.config.sheet.version.params) {
                    item.config.sheet.version.params.forEach(val => {
                        val.taskName = item.taskName
                        arr.push(val)
                    })
                }
            }
        })
        let filterdata = arr.filter(item => {
            return item !== undefined && item !== null
        })
        this.circuittableData = filterdata
  },
components: {
    TableEdit
  }
}
</script>
<style lang="scss" scoped>
.normal-widget-width {
    width: 85%;
}

.minute {
    padding-left: 20px;
}
</style>