import axios from 'axios'
import {PORTAL_URL_V2} from './url.config'

class LoginClass {
    login (data) {
        return axios({
            url: PORTAL_URL_V2 + '/user/login',
            method: 'post',
            data
        })
    }

    // 获取域列表
    getDomainList () {
        return axios({
            url: PORTAL_URL_V2 + '/user/domain/list',
            method: 'get'
        })
    }
}

export default new LoginClass()
