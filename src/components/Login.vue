<template lang="pug">
  div.portal-container.position-relative
    div.portal-container.center-vertical.login-container
        el-form.login-form(ref="loginForm" :model="loginForm" :rules="rules")
            el-form-item.welcome
                label 欢迎登陆
            el-form-item(prop="username")
                el-input(v-model="loginForm.username" placeholder="您的账号" prefix-icon="portal-icon-user" sise="mini")
            el-form-item(prop="password")                        
                el-input(v-model="loginForm.password" type="password" placeholder="您的密码" prefix-icon="portal-icon-password" sise="mini")
            el-form-item(prop="domain_id")
                el-select.user-type(placeholder="请选择用户来源" sise="mini" v-model="loginForm.domain_id" )
                    el-option(v-for="item in domains" :key="item.id" :value="item.id" :label="item.name")
            el-form-item
                el-button.user-type(type="primary" @click="submitForm" :disabled="disabled") 登录
</template>
<script>
import LoginApi from '@api/axios.login'
export default {
  data () {
    return {
        loginForm: {
            username: null,
            password: '',
            domain_id: ''
        },
        domains: [],
        disabled: false,
        rules: {
            username: [
                {required: true, message: '请输入您的账号', trigger: 'blur'}
            ],
            password: [
                {required: true, message: '请输入您的密码', trigger: 'blur'}                
            ],
            domain_id: [
                {required: true, message: '请选择用户来源', trigger: 'change'}                
            ]
        }
    }
  },
  methods: {
    submitForm () {
        this.$refs.loginForm.validate(
            valid => {
                if (valid) {
                    LoginApi.login(this.loginForm).then(
                        res => {
                            //code 0: 用户不存在 code -1 :用户名或密码为空 code 1:密码错误,帐号被禁用 code 2: 登录成功
                            if (res.data.code === 2) {
                                this.$notify({
                                    type: 'success',
                                    message: '登录成功,欢迎进入!'
                                })
                                localStorage.setItem('domainId', this.loginForm.domain_id)
                                localStorage.setItem('systemUserName', this.loginForm.username)
                                localStorage.setItem('tenant', res.data.login_project_id)
                                localStorage.setItem('userId', res.data.user_id)
                                this.$router.push('/sheetList/tableview')
                            } else if (res.data.code === 0) {
                                this.$notify({
                                    type: 'error',
                                    message: '用户登录信息错误或者没有租户权限!'
                                })
                            } else if (res.data.code === 1) {
                                this.$notify({
                                    type: 'warning',
                                    message: '该账户被禁用,请联系管理员!'
                                })
                            } else if (res.data.code === -1) {
                                this.$notify({
                                    type: 'warning',
                                    message: '请填写账户名以及密码、域!'
                                })
                            } else {
                                this.$notify({
                                    type: 'error',
                                    message: '登录未知错误，错误码:' + res.data.code
                                })
                            }
                        }
                    )
                }
            }
        )
    }
  },
  created () {
    //   this.domains = [
    //     {id: 'default', name: '默认'}
    //   ]
      LoginApi.getDomainList().then(res => {
            this.domains = res.data.domains.map(item => {
                return {
                    id: item.id,
                    name: item.id === 'default' ? '本地' : item.name
                }
            })
            // 默认选中第一条数据
            this.loginForm.domain_id = this.domains.length ? this.domains[0].id : 'default'
        })
      this.loginForm.domain_id = this.domains[0].id
  }
}
</script>
<style lang="scss" scoped>
.login-container {
    background: #fff;
    font-size: 12px;
    border-radius: 5px;
    height: 330px;
    width: 400px;
}
.login-form {
    padding: 15px;
}
.user-type {
    width: 100%;
}
.welcome {
    text-align: center;
    label {
        font-size: 25px;
    // margin: 15px 0;
        color: #37a6ff;  
    }
}
.bg-image {
    position: absolute;
    opacity: 0.78;
}
</style>

