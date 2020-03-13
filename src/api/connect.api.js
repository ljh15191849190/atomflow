/**
 * @description 连接管理模块接口
 */
import axios from 'axios'
import {URL} from './url.config'
class ConnectApi {
    queryConnectList (name, type, pagination) {
        let rule = '?limit=' + pagination.size + '&offset=' + pagination.index
        if (name) {
            rule += '&name=' + name
        }
        if (type) {
            rule += '&type=' + type
        }
        return axios({
            url: URL + 'v1/dict/list' + rule,
            method: 'get'
        })
    }

    isExistName (name) {
        return axios({
            url: URL + 'v1/dict/check_name?name=' + name,
            method: 'get'
        })
    }

    queryCntDetailById (name) {
        return axios({
            url: URL + 'v1/dict/detail?name=' + name,
            method: 'get'
        })
    }

    addConnect (data) {
        return axios({
            url: URL + 'v1/dict/create_connect_info',
            method: 'post',
            data
        })
    }

    updateConnect (data) {
        return axios({
            url: URL + 'v1/dict/update_connect_info',
            method: 'post',
            data
        })
    }

    deleteConnect (name) {
        return axios({
            url: URL + 'v1/dict/detail?name=' + name,
            method: 'delete'
        })
    }
}

export default new ConnectApi()
