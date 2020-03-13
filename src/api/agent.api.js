import axios from 'axios'
import {URL} from './url.config'
class AgentApi {
    getAgentList (pagination, filterRule) {
        let rule = '?limit=' + pagination.limit + '&offset=' + pagination.offset
        rule += '&hostIp=' + filterRule.hostIp + '&hostname=' + filterRule.hostname + '&osType=' + filterRule.osType
        return axios({
            url: URL + 'v1/agent/status' + rule,
            method: 'get'
        })
    }

    getWindowAgentList (pagination, filterRule) {
        let rule = '?limit=' + pagination.limit + '&offset=' + pagination.offset
        rule += '&hostIp=' + filterRule.hostIp + '&hostname=' + filterRule.hostname + '&osType=' + filterRule.osType
        return axios({
            url: URL + 'v1/agent/list' + rule,
            method: 'get'
        })
    }
}

export default new AgentApi()
