// const StateEnable = [
//     {value: 'complete', label: '完成'},
//     {value: 'running', label: '执行中'},
//     {value: 'holding', label: '等待中'},
//     {value: 'failed', label: '失败'},
//     {value: 'notRun', label: '未运行'}
// ]
export default [
    {
        prop: 'owner',
        label: '创建者'
    },
    {
        prop: 'taskCount',
        label: '任务数'
    },
    {
        prop: 'type',
        label: '任务类型'
    },
    {
        prop: 'startTime',
        label: '开始时间',
        width: '180'
    },
    // {
    //     prop: 'state',
    //     label: '状态',
    //     filters: StateEnable
    // },
    {
        prop: 'targetQueueCount',
        label: '目标机器数'
    },
    {
        prop: 'stateDetail',
        label: '作业状态',
        width: '260'
    }
]
