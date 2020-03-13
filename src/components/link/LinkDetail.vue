<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(v-if="$route.query.conn_id") 链接修改
            el-breadcrumb-item(v-else) 链接添加
    el-form.atom-content(ref="linkForm" :model="linkForm" :rules="rules" label-width="150px")
        el-form-item(label="链接名称" prop="conn_id")
            el-input.normal-widget-width(v-model="linkForm.conn_id" :disabled="disable" size="small" type="text" placeholder="请输入链接名称") 
        el-form-item(label="链接类型" prop="conn_type")
            el-select.normal-widget-width(
                v-model="linkForm.conn_type"
                clearable
                placeholder="链接类型" 
                size="small"
                value-key="id"
                @change="connTypeChange" 
                )
                el-option(v-for="item in connTypeList" :key="item.id" :label="item.name" :value="item.id")
        el-form-item(label="链接地址" prop="host")
            el-input.normal-widget-width(v-model="linkForm.host" size="small" placeholder="请输入链接地址") 
        el-form-item(label="端口号" prop="port" v-if="linkForm.conn_type!=='jdbc'")
            el-input.normal-widget-width(v-model.number="linkForm.port" size="small") 
        el-form-item(label="数据库名称" prop="schema" v-if="linkForm.conn_type==='mysql'")
            el-input.normal-widget-width(v-model="linkForm.schema" size="small") 
        el-form-item(label="用户名" prop="user" v-if="linkForm.conn_type!=='http'")
            el-input.normal-widget-width(v-model="linkForm.user" size="small") 
        el-form-item(label="密码" prop="password" v-if="linkForm.conn_type!=='http'")
            el-input.normal-widget-width(v-model="linkForm.password" size="small" auto-complete="new-password" type="password") 
        el-form-item(label="确认密码" prop="repassword" v-if="linkForm.conn_type!=='http'")
            el-input.normal-widget-width(v-model="linkForm.repassword" size="small" auto-complete="new-password" type="password") 
        el-form-item(label="驱动路径" prop="drv_path" v-if="linkForm.conn_type==='jdbc'")
            el-input.normal-widget-width(v-model="linkForm.drv_path" size="small") 
        el-form-item(label="驱动类名" prop="drv_clsname" v-if="linkForm.conn_type==='jdbc'")
            el-input.normal-widget-width(v-model="linkForm.drv_clsname" size="small")
        el-form-item(label="认证信息" v-if="linkForm.conn_type==='http'")
            el-tooltip.pos-right(content="根据实际情况来填写认证信息，如http只要求填写账户名和密码，则在key中填写变量名，value中填写实际账号与密码即可。" placement="right")
                i.atom-icon-sheet-help.theme-color.help-icon
            TableInput.normal-widget-width.pad-left(:tableInputConfig="variableConfig" :tableData="bodyData" :Isrequired="false")
        el-form-item(label="登录地址" placeholder="请输入登录地址" prop="login_endpoint" v-if="bodyData && bodyData.length && linkForm.conn_type==='http'")
            el-input.normal-widget-width(v-model="linkForm.login_endpoint" size="small") 
        el-form-item(label="备注" prop="comments")
            el-input.normal-widget-width(v-model="linkForm.comments" :autosize="{ minRows: 4}" type="textarea" maxlength="200")
        el-form-item()
            el-button(size="small" @click="reset") 返回
            el-button(type="primary" size="small" @click="submitForm") 确定   
</template>
<script>

import Api from '@api'
import TableInput from '@lib/TableInput'
export default {
    data () {
        return {
            linkForm: {
                conn_id: '',
                conn_type: 'http',
                host: '',
                schema: '',
                user: '',  
                password: '',
                repassword: '',
                login_endpoint: '',
                port: null,
                comments: '',
                drv_clsname: '',
                drv_path: ''
            },
            bodyData: [],
            variableConfig: {
                columns: [
                    { prop: 'key', label: 'key' },
                    { prop: 'default', label: 'value' }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加'
            },
            rules: {
                conn_id: [
                    { required: true, message: '请输入链接名称', trigger: 'blur' },
                    { validator: this.ifNameExist, trigger: 'blur' }
                ],
                conn_type: [
                    { required: true, message: '请选择链接类型', trigger: 'change' }
                ],
                host: [
                    { required: true, message: '请输入链接地址', trigger: 'blur' }
                    // { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: 'IP格式有误', trigger: 'blur' }
                ],
                repassword: [
                    { required: true, message: '请输入确认密码', trigger: 'blur' },
                    { validator: this.repassExist, trigger: 'blur' }
                ],
                port: [
                    { required: true, message: '请输入端口号', trigger: 'blur' },
                    { type: 'number', message: '请输入数字', trigger: 'blur' },
                    {validator: this.iSIntervalExist, trigger: 'blur'}
                ],
                schema: [
                    { required: true, message: '请输入数据库名称', trigger: 'blur' }
                ],
                user: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ]
            },
            connTypeList: [
                {id: 'http', name: 'HTTP'},
                // {id: 'mysql', name: 'MYSQL'},
                {id: 'jdbc', name: 'JDBC'}
             ]
        }
    },
    methods: {
        connTypeChange (val) {
            if (val === 'jdbc') {
                Api.get('sqlJdbcConf', {db_type: 'mysql'}, true).then(
                    (res) => {
                        if (res.rst === 'ok') {
                            this.linkForm.drv_clsname = res.data.drv_clsname
                            this.linkForm.drv_path = res.data.drv_path
                        } 
                    }
                )
            }
        },
        iSIntervalExist (rule, value, callback) {
            if (value < 0 || value > 65535) {
                callback(new Error('端口号范围为1~65535'))
            } else {
                callback()
            }
        },
        doRequestResult (data) {
            if (data.rst === 'ok') {
                this.$notify({
                    type: 'success',
                    message: '创建链接成功'
                })
                this.$router.push('/linkList')
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
            this.$refs.linkForm.validate(valid => {
                if (valid) {
                    if (this.$route.query.conn_id) {
                        this.linkForm.port = this.linkForm.port ? this.linkForm.port : null
                        Api.post('editLink', this.linkForm, true).then(
                            (data) => {
                                this.$notify({
                                    type: 'success',
                                    message: '修改链接成功'
                                })
                                this.$router.push('/linkList')
                            }
                        )
                    } else {
                        Api.post('createLink', this.linkForm, true).then(
                            (data) => {
                                this.doRequestResult(data)
                            }
                        )
                    }
                }
            })
        },
        reset () {
            this.$router.push('/linkList')
        },
        repassExist (rule, value, callback) {
            if (this.linkForm.password !== '' && value !== this.linkForm.password) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        },
        ifNameExist (rule, value, callback) {
            if (this.$route.query.conn_id) {    //编辑不验证
                callback()
            }
            Api.get('checkLinkName', {conn_id: value}, true).then(
                (data) => {
                    if (data.data.exist) {
                        callback(new Error('该链接名称已经存在，请重新输入'))
                    } else {
                        callback()
                    }
                }, err => {
                    console.log(err)
                }
            )
        }
        
    },
    computed: {
        disable () {
            return this.$route.query.conn_id ? true : false
        }
    },
    components: {
        TableInput
    },
    created () {
        let linkId = this.$route.query.conn_id
        if (linkId) {
            Api.get('getLinkDetail', {conn_id: linkId}, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.linkForm = JSON.parse(JSON.stringify(res.data.conn_info))
                        for (let item in res.data.conn_info.auth_info) {
                            let obj = {
                                'key': item,
                                'default': res.data.conn_info.auth_info[item]
                            }
                            this.bodyData.push(obj)
                        }
                        this.$set(this.linkForm, 'repassword', res.data.conn_info.password)
                    }
                }
            )
        }
    },
    watch: {
        bodyData: {
            deep: true,
            handler (newVal, oldVal) {
                let obj = {}
                newVal.forEach(res => {
                    obj[res.key] = res.default
                })
                this.$set(this.linkForm, 'auth_info', obj)
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.atom-content {
  overflow: auto;
}
.normal-widget-width {
  width: 560px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 305px !important;
}
</style>
