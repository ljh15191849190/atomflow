import axios from 'axios'
import {Notification} from 'element-ui'
import router from '@/router'
export default function () {
    /* eslint-disable */ 
    axios.interceptors.request.use(
        config => {
            // license到期控制
            let licenseAuth = localStorage.getItem('atomflow_license')
            if (licenseAuth && licenseAuth !== 'active') {
                // 允许查看 不允许操作，禁止了一切非get请求
                if (config.method !== 'get') {
                    Notification.warning({
                        title: '温馨提示：',
                        message: '证书过期, 请联系管理员!'
                    })

                    return Promise.reject(new Error('证书过期, 请联系管理员!'))
                }
            }

            // 登录接口不需要token信息 
            if (config.url !== '/gd/v2/user/login') {
                let token = localStorage.getItem('authenticationToken')
                if (token) {
                    config.headers.common['X-Subject-Token'] = token
                } else if (process.env.NODE_ENV === "development") {
                    // router.push('/login')
                    // localStorage.clear()
                    // sessionStorage.clear()
                } else {
                    console.log('production env')
                    window.parent.postMessage({status: 401}, '*')
                } 
            }          
            return config
        }, err => {
            return Promise.reject(err)
        }
    )
    
    axios.interceptors.response.use(
        response => {
            if (response.headers && response.headers['x-subject-token'] && response.headers['x-subject-token'] !== 'None') {
                localStorage.setItem('authenticationToken', response.headers['x-subject-token'])
            }
            return response.data
        }, err => {
            if (err.response.status === 401) {
                if (process.env.NODE_ENV === "development") {
                    router.push('/login')
                    localStorage.clear()
                    sessionStorage.clear()
                } else {
                    window.parent.postMessage({status: 401}, '*')
                }

                return Promise.reject(err)
            } else if (err.response.status === 403) {
                Notification.warning({
                    title: '温馨提示：',
                    message: '没有权限, 请联系管理员!'
                })
                if (!localStorage.getItem('atflowFrbRequest')) {
                    localStorage.setItem('atflowFrbRequest', 'forbRequest')
                }
                return Promise.reject(err)
            }

            let msg = '服务发生异常'
            if (err.response && err.response.data && err.response.data.message_zh_CN) {
                msg = err.response.data.message_zh_CN
            }
            Notification.error({
                title: '错误',
                message: msg
            })
            return Promise.reject(err)
        }
    )
}
