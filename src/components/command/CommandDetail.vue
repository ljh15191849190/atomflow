<template lang="pug">
    el-dialog(
        :title="title"
        width="600px"
        :visible.sync="visible"
        :before-close="handleClose")
        el-form(ref="commandForm" :model="commandForm" :rules="rules" label-width="100px")
            el-form-item(label="关键命令" prop="command")
                el-input.normal-widget-width(v-model="commandForm.command" size="small" type="text" placeholder="请输入关键命令") 
            el-form-item(label="命令类别" prop="command_type")
                el-select.normal-widget-width(
                    v-model="commandForm.command_type"
                    clearable
                    placeholder="请选择命令类别" 
                    size="small"
                    )
                    el-option(v-for="item in connTypeList" :key="item.prop" :label="item.label" :value="item.prop")
            el-form-item(label="控制级别" prop="level")
                el-radio-group(v-model="commandForm.level")
                    el-radio(v-for="type in controlTypes" :key="type.prop" :label="type.prop") {{type.label}}
            el-form-item(label="是否启用" prop="enable")
                el-radio-group(v-model="commandForm.enable")
                    el-radio(v-for="type in enableTypes" :key="type.prop" :label="type.prop") {{type.label}}
            el-form-item(label="备注" prop="common")
                el-input.normal-widget-width(v-model="commandForm.common" :autosize="{ minRows: 4}" type="textarea" maxlength="200")
        div.dialog-footer(slot="footer")
            el-button(@click="handleClose" size="small") 取消
            el-button(@click="submitForm" size="small" type="primary") 确定
    
</template>
<script>

import Api from '@api'
export default {
    props: ['title', 'visible', 'selectRowsId'],
    data () {
        return {
            commandForm: {
                command: '',
                level: 0,
                enable: 1,
                command_type: '',
                common: ''
            },
            controlTypes: [
                { prop: 1, label: '禁止使用' },
                { prop: 0, label: '危险提示' }
            ],
            enableTypes: [
                { prop: 1, label: '启用' },
                { prop: 0, label: '禁用' }
            ],
            connTypeList: [
                { prop: 'python', label: 'python' },
                { prop: 'shell', label: 'shell' },
                { prop: 'powershell', label: 'powershell' },
                { prop: 'bat', label: 'bat' },
                { prop: 'sql', label: 'sql' }
            ],
            rules: {
                command: [
                    { required: true, message: '请输入关键命令名称', trigger: 'blur' }
                ],
                command_type: [
                    { required: true, message: '请选择命令类别', trigger: 'change' }
                ]
            }
        }
    },
    methods: {
        handleClose () {
            this.$emit('closeDialog')
        },
        doRequestResult (data) {
            if (data.rst === 'ok') {
                this.$notify({
                    type: 'success',
                    message: '创建命令成功'
                })
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
                            message: '创建失败，请稍后再试!'
                        })
                        break
                }
            }
        },
        submitForm () {
            // 校验表单
            this.$refs.commandForm.validate(valid => {
                if (valid) {
                    if (this.selectRowsId) {
                        Api.put('CommandUpdate', this.commandForm, true).then(
                            (data) => {
                                this.$notify({
                                    type: 'success',
                                    message: '修改命令成功'
                                })
                                this.$emit('updataCommand')
                            }
                        )
                    } else {
                        Api.post('CommandCreate', [this.commandForm], true).then(
                            (data) => {
                                this.doRequestResult(data)
                                this.$emit('updataCommand')
                            }
                        )
                    }
                }
            })
        }

    },
    created () {
        let commandId = this.selectRowsId
        if (commandId) {
            Api.get('CommandInfo', { id: commandId }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        if (res.data && res.data.length) {
                            this.commandForm = res.data[0]
                        }
                    }
                }
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.normal-widget-width {
    width: 400px;
}
</style>
