const StateEnable = [
    {value: 'success', label: '成功'},
    {value: 'failed', label: '失败'},
    {value: 'running', label: '运行'}
]
export default [
    {
        prop: 'owner',
        label: '执行人'
    },
    {
        prop: 'state',
        label: '状态',
        filters: StateEnable
    },
    {
        prop: 'type',
        label: '任务类型'
    },
    {
        prop: 'startDate',
        label: '执行开始时间'
    },
    {
        prop: 'endDate',
        label: '执行结束时间'
    },
    {
        prop: 'scheduler_type',
        label: '频次'
    },
    {
        prop: 'consumeIp',
        label: '执行目标'
    }
]
