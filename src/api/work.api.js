import axios from 'axios'
import {URL} from './url.config'
class WorkApi {
    getTaskList (name, pagination) {
        let url = URL + 'v1/workflow/list?offset=' + pagination.index + '&limit=' + pagination.size
        url = name ? url + '&dagName=' + name : url
        return axios({
            url,
            method: 'get'
        })
    }
    getDurationFlow (args) {
        return axios({
            url: URL + 'v1/workflow/cycle_list' + args,
            method: 'get'
        }) 
    }
    getRelationById (id, target, executeDate) {
        let url = URL + 'v1/workflow/tasks_relation?dagId=' + id
        if (target) {
            url += '&consumeIp=' + target
        }
        if (executeDate) {
            url += '&executeDate=' + executeDate
        }
        return axios({
            url,
            method: 'get'
        }) 
    }

    pauseOrRunDagById (id, isPaused) {
        return axios({
            url: URL + 'v1/workflow/paused?isPaused=' + isPaused + '&dagId=' + id,
            method: 'put'
        })
    }

    createWork (data) {
        return axios({
            url: URL + 'v1/workflow/create',
            method: 'post',
            data
        })
    }

    deleteWork (id) {
        return axios({
            url: URL + 'v1/workflow/del?dagId=' + id,
            method: 'delete'
        })
    }

    getTaskRunInfo (dagId, info) {
        let url = URL + 'v1/workflow/task_run_info?numRuns=' + info.numRuns + '&dagId=' + dagId
        if (info.queue) {
            url += '&consumeIp=' + info.queue
        }
        if (info.baseDate) {
            url += '&baseDate=' + info.baseDate
        }
        return axios({
            url,
            method: 'get'
        }) 
    }

    getAllTargetByDagId (dagId) {
        return axios({
            url: URL + 'v1/workflow/targethost/list?dagId=' + dagId,
            method: 'get'
        }) 
    }

    getDateListForRelation (dagId) {
        return axios({
            url: URL + 'v1/workflow/datelist?dagId=' + dagId,
            method: 'get'
        }) 
    }

    getRunLogger (obj) {
        let url = URL + 'v1/workflow/dagrun/records?v=v1'
        if (obj.dagName) {
            url += '&dagName=' + obj.dagName
        }
        if (obj.consumeIp) {
            url += '&consumeIp=' + obj.consumeIp
        }
        if (obj.state) {
            url += '&state=' + obj.state
        }
        if (obj.exeDateEnd) {
            url += '&exeDateEnd=' + obj.exeDateEnd
        }
        if (obj.exeDateStart) {
            url += '&exeDateStart=' + obj.exeDateStart
        }
        if (obj.state) {
            url += '&state=' + obj.state
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

    getHostsByDagIdAndState (dagId, exeDate, state) {
        return axios({
            url: URL + 'v1/workflow/dagrun/hosts?offset=1&limit=9999&dagId=' + dagId + '&executionDate=' + exeDate + '&state=' + state,
            method: 'get'
        }) 
    }

    reRunTask (obj) {
        return axios({
            url: URL + 'v1/workflow/task/run?dagId=' + obj.dagId + '&taskId=' + obj.taskId + '&consumeIp=' + obj.consumeIp + '&executeDate=' + obj.executeDate,
            method: 'get'
        })
    }

    markToSuccess (obj) {
        return axios({
            url: URL + 'v1/workflow/task/marksuccess?dagId=' + obj.dagId + '&taskId=' + obj.taskId + '&consumeIp=' + obj.consumeIp + '&executeDate=' + obj.executeDate,
            method: 'get'
        })
    }

    getTaskLog (obj) {
        return axios({
            url: URL + 'v1/workflow/task/logs?dagId=' + obj.dagId + '&taskId=' + obj.taskId + '&executeDate=' + obj.executeDate + '&consumeIp=' + obj.consumeIp,
            method: 'get'
        })
    }

    queryTaskByName (name) {
        return axios({
            url: URL + 'v1/workflow/check/name?name=' + name,
            method: 'get'
        }) 
    }
}

export default new WorkApi()
