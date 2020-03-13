import Url from './url'
import { api } from '@leaptocloud/standard-ui'
import router from '@/router'
import { Notification } from 'element-ui'

let requestInterceptor = function (config) {
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
}

export default api({urlObjs: Url, router, requestInterceptor})
