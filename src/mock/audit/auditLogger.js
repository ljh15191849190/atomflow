const StateEnable = [
    {value: 'success', label: '成功'},
    {value: 'failed', label: '失败'},
    {value: 'running', label: '运行'}
]
export default [
    {
        prop: 'taskName',
        label: '节点名称'
    },
    {
        prop: 'event',
        label: '状态',
        filters: StateEnable
    },
    {
        prop: 'runStartTime',
        label: '执行开始时间'
    },
    {
        prop: 'runEndTime',
        label: '执行结束时间'
    },
    {
        prop: 'owner',
        label: '执行人'
    },
    {
        prop: 'operator',
        label: '节点类型'
    },
    {
        prop: 'consumeIp',
        label: '执行目标'
    }
   
]
