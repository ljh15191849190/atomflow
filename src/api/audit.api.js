import axios from 'axios'
import {URL} from './url.config'
class AuditApi {
    getAuditLogger (obj) {
        let url = URL + 'v1/audit/logs?'
        if (obj.dagName) {
            url += '&dagName=' + obj.dagName
        }
        if (obj.event) {
            url += '&event=' + obj.event
        }
        if (obj.consumeIp) {
            url += '&consumeIp=' + obj.consumeIp
        }
        if (obj.dateStart) {
            url += '&dateStart=' + obj.dateStart
        }
        if (obj.dateEnd) {
            url += '&dateEnd=' + obj.dateEnd
        }
        if (obj.taskName) {
            url += '&taskName=' + obj.taskName
        }
        if (obj.offset) {
            url += '&offset=' + obj.offset
        }
        if (obj.limit) {
            url += '&limit=' + obj.limit
        }
        
        return axios({
            url,
            method: 'get'
        })
    }
}

export default new AuditApi()
