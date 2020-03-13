import axios from 'axios'
import {PORTAL_URL_V2} from './url.config'

class MenuApi {
    getModules (projectId) {
        return axios({
            url: PORTAL_URL_V2 + '/sys/modules?project_id=' + projectId,
            method: 'get'
        })
    }

    getMenusByUser () {
        return axios({
            url: PORTAL_URL_V2 + '/sys/user/menus',
            method: 'get'
        })
    }
}

export default new MenuApi()
