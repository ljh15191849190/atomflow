import { URL, PORTAL_URL_V2 } from '../url.config'

export default {
    getWorkCycleList: `${URL}v1/workflow/list_cycle`,
    getWorkCycleTaskInfo: `${URL}v1/workflow/task_info`,
    getWorkCycleAgentLog: `${URL}v1/workflow/agent_log`,
    getWorkCycleRun: `${URL}v1/workflow/task/run`,
    WorkCyclePaused: `${URL}v1/workflow/paused`,
    getWorkTaskRunLog: `${URL}v1/workflow/task/retry`,
    getTaskRelation: `${URL}v1/workflow/tasks_relation`,
    getWorkCycleOnce: `${URL}v1/workflow/list_once`,
    queryWorkByName: `${URL}v1/workflow/check/name`,
    queryWorkList: `${URL}v1/workflow/list`,
    queryWorkrunList: `${URL}v1/workflow/execution_list`,
    sqlDownload: `${URL}v1/sql/download`,
    CreateWork: `${URL}v1/workflow/create`,
    getAllTargetByDagId: `${URL}v1/workflow/targethost/list`,
    getTaskRunInfo: `${URL}v1/workflow/show_task_run_info`,
    getWorkLog: `${URL}v1/workflow/task/logs`,
    getDateListForRelation: `${URL}v1/workflow/datelist`,
    // 分批
    getBatchWorkList: `${URL}v1/workflow/batch/list`,
    delBatchWork: `${URL}v1/workflow/del/batch`,
    pausedBatchWork: `${URL}v1/workflow/batch/paused`,
    getBatchDetailList: `${URL}v1/workflow/batch/work_list`,
    // 邮件发送
    getUserListWithPagination: `${PORTAL_URL_V2}/user/lists`
}
