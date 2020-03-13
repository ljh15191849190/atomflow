<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
      el-breadcrumb(separator-class="el-icon-arrow-right")
        el-breadcrumb-item 原子作业平台
        el-breadcrumb-item {{menuTitle}}  
    div.atom-content
      div.dict-content
        el-form(ref="dictForm" :model="dictForm" :rules="rules" label-width="80px")
          el-form-item(label="连接名称" prop="connectName")
            el-input.dict-widget-width(
                :readOnly="this.dictName !== 'add'"
                size="small" 
                v-model="dictForm.connectName" 
                :maxlength="20"
                v-loading="loading"
                placeholder="请输入连接名称")
          el-form-item(label="连接类型" prop="connectType")
            el-select.normal-widget-width(
                v-model="dictForm.connectType" 
                placeholder="请选择连接类型" 
                size="small" 
                @change="conectTypeChange"
            )
              el-option(
                  v-for="sqlType in sqlTypes" 
                  :key="sqlType.value" 
                  :label="sqlType.label" 
                  :value="sqlType.value"
              )
          el-form-item(label="连接地址" prop="connectUrl")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.connectUrl" 
              :maxlength="20"
              placeholder="请输入连接地址"
            )
          el-form-item(v-if="sqlType === 'sql'" label="端口号" prop="connectPort")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.connectPort" 
              :maxlength="20"
              placeholder="请输入端口号"
            )
          el-form-item(label="账号" prop="connectUser")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.connectUser" 
              :maxlength="20"
              placeholder="请输入账号"
            )
          el-form-item(label="密码" prop="connectPasswd")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.connectPasswd" 
              :maxlength="20"
              placeholder="请输入密码"
            )
          el-form-item(v-if="sqlType === 'sql'" label="Schema" prop="schema")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.schema" 
              :maxlength="20"
              placeholder="请输入Schema"
            )
          el-form-item(v-if="sqlType === 'jdbc'" label="驱动路径" prop="driverPath")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.driverPath" 
              :maxlength="20"
              placeholder="请输入驱动路径"
            )
          el-form-item(v-if="sqlType === 'jdbc'" label="驱动类型" prop="driverClassName")
            el-input.dict-widget-width(
              size="small" 
              v-model="dictForm.driverClassName" 
              :maxlength="20"
              placeholder="请输入驱动类型"
            )
          el-form-item(label="描述" prop="extra")
            el-input.dict-widget-width(
              type="textarea" 
              :autosize="{minRows: 2}" 
              v-model="dictForm.extra" 
              :maxlength="50"
              placeholder="请输入描述内容"
            )
          el-form-item
            el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定
            el-button(size="small" @click="cancel") 取消
</template>
<script>
import ConnectApi from '@api/connect.api.js'
export default {
    name: 'EditConnect',
    data () {
        return {
            dictName: '',
            disabled: false,
            sqlType: '',
            loading: false,
            sqlTypes: [
                {label: 'MySQL', value: 'MySQL'},
                {label: 'Oracle', value: 'Oracle'},
                {label: 'SQL Server', value: 'SQLServer'},
                {label: 'PostgreSQL', value: 'PostgreSQL'},
                {label: 'Jdbc Connection', value: 'JdbcConnection'},
                {label: 'Docker Registry', value: 'DockerRegistry'}
            ],
            dictForm: {
                connectName: '',
                connectType: '',
                connectUrl: '',
                schema: '',
                connectUser: '',
                connectPasswd: '',
                driverPath: '',
                driverClassName: '',
                connectPort: '',
                extra: ''
            },
            rules: {
                connectName: [
                    { required: true, message: '请输入连接名称', trigger: 'blur' },
                    { validator: this.isExistName, trigger: 'blur' }
                ],
                connectType: [
                    { required: true, message: '请输入连接类型', trigger: 'blur, change' }
                ],
                connectUrl: [
                    { required: true, message: '请输入主机', trigger: 'blur' }
                ],
                schema: [
                    { required: true, message: '请输入Schema', trigger: 'blur' }
                ],
                connectUser: [
                    { required: true, message: '请输入账号', trigger: 'blur' }
                ],
                connectPasswd: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                driverPath: [
                    { required: true, message: '请输入驱动路径', trigger: 'blur' }
                ],
                driverClassName: [
                    { required: true, message: '请输入驱动类型', trigger: 'blur' }
                ],
                connectPort: [
                    { required: true, message: '请输入端口号', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        /**
         *  @description 初始化
         **/
        init () {
            this.dictName = this.$route.params.id
            if (this.dictName !== 'add') {
                ConnectApi.queryCntDetailById().then(
                    res => {
                        if (res.rst === 'ok') {
                            this.dictForm = {...this.dictForm, ...res.data}
                            this.conectTypeChange()
                        }
                    }
                )
            }
        },
        /**
         *  @description 连接名称唯一性校验
         **/
        isExistName (rule, value, callback) {
            if (!value || this.dictName !== 'add') return callback() 
            this.loading = true
            ConnectApi.isExistName(this.dictForm.connectName).then(
                res => {
                    this.loading = false
                    if (res.data.exist) {
                        callback(new Error('该连接名称已经存在，请重新输入!'))
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
         *  @description 取消操作
         **/
        cancel () {
            this.$router.push('/connectList')
        },
        /**
         *  @description 连接类型改变事件
         **/
        conectTypeChange () {
            let type = this.dictForm.connectType
            if (type === 'JdbcConnection') {
                this.sqlType = 'jdbc'
            } else if (type === 'DockerRegistry') {
                this.sqlType = 'docker'
            } else {
                this.sqlType = 'sql'
            }
        },
        /**
         *  @description 保存连接
         **/
        submitForm () {
            this.$refs.dictForm.validate((valid) => {
                if (valid) {
                    if (this.dictName === 'add') {
                        ConnectApi.addConnect(this.dictForm).then(
                            res => {
                                if (res.rst === 'ok') {
                                    this.$notify({
                                        title: '通知',
                                        type: 'success',
                                        message: '创建连接成功!'
                                    })
                                    this.$router.push('/connectList')
                                } else {
                                    this.$notify({
                                        title: '通知',
                                        type: 'error',
                                        message: '创建连接失败, 请稍后重试!'
                                    })
                                }
                            }
                        )
                    } else {
                        ConnectApi.updateConnect(this.dictForm).then(
                            res => {
                                if (res.rst === 'ok') {
                                    this.$notify({
                                        title: '通知',
                                        type: 'success',
                                        message: '更新连接成功!'
                                    })
                                    this.$router.push('/connectList')
                                } else {
                                    this.$notify({
                                        title: '通知',
                                        type: 'error',
                                        message: '更新连接失败, 请稍后重试!'
                                    })
                                }
                            }
                        )
                    }
                }
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        menuTitle () {
            let title = this.dictName === 'add' ? '新建连接' : '编辑连接'
            return title
        }
    }
}
</script>
<style lang="scss" scoped>
.dict-content {
  height: 100%;
  padding-bottom: 20px;
  overflow-y: auto;
  .dict-widget-width {
    width: 600px;
  }
}
</style>

