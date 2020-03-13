<template lang="pug">
    div.container-flud
        el-row.mb10
            el-col(:span="8")
                el-date-picker(
                    v-model="timeRange" 
                    clearable
                    type="daterange" 
                    :picker-options="pickerOptions"
                    range-separator="-" 
                    start-placeholder="请选择执行开始时间" 
                    end-placeholder="请选择执行结束时间" 
                    size="small" 
                    :default-time="['00:00:00', '23:59:59']"
                    @change="getTaskRelation"
                )
            el-col(:span="4" :offset="1" v-if="cycleWorkType!=='complex'")
                el-select.target-list(v-model="target" clearable placeholder="执行目标" size="small" @change="getTaskRelation")
                    el-option(
                    v-for="(item, index) in targets"
                    :key="index"
                    :label="item"
                    :value="item"
                    )    
        div.dash-chart-container.border
            div.chart-header.chart-header-gray 节点耗时统计
            div.chart-container(v-loading="isLoading")
                LineChart(:options="alarmOptions")
</template>
<script>
import LineChart from '@lib/LineCharts'
import Api from '@api'
import {mapGetters} from 'vuex'

export default {
    components: { LineChart },
    data () {
        return {
            target: '',
            timeRange: [new Date().getTime() - 3600 * 1000 * 24 * 7, new Date().getTime()],
            targets: [],
            pickerOptions: {
            shortcuts: [{
                text: '最近一周',
                onClick (picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', [start, end])
                }
            }, {
                text: '最近一个月',
                onClick (picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
                }
            }, {
                text: '最近三个月',
                onClick (picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                picker.$emit('pick', [start, end])
                }
            }]
            },
            isLoading: false,
            alarmOptions: {
                colors: ['#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B', '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD', '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'],
                legend: {
                    enabled: true
                },
                yAxis: {
                    title: {
                        text: '节点耗时（s）'
                    },
                    lineWidth: 1,
                    lineColor: '#000'
                },
                tooltip: {
                    pointFormat: '{series.name}: {point.y}<br>{point.x: %m-%d}'
                },
                series: []
            }
        }
    },
    computed: {
        ...mapGetters([
            'cycleWorkType'
        ])
    },
    methods: {
        getTaskRelation () {
            let paramId = this.$route.params.id
            Api.get('getTaskRunInfo', {
                dagId: paramId,
                consumeIp: this.target,
                startTime: this.timeRange ? Date.parse(new Date(this.timeRange[0])) / 1000 : '',
                endTime: this.timeRange ? Date.parse(new Date(this.timeRange[1])) / 1000 : ''
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        let arr = []
                        res.data.forEach(element => {
                            let obj = {}
                            obj.name = element.task_name
                            obj.data = []
                            element.items.forEach(e => {
                                let localUtc = new Date().getTimezoneOffset() * 60 //（时区-方法是获取分钟）
                                e.execution_date = (e.execution_date - localUtc) * 1000
                                e.duration = e.duration ? Math.floor(e.duration * 100) / 100 : null
                                // e.duration = e.duration ? e.duration.toFixed(2) : null
                                obj.data.push(Object.values(e))
                            })
                            arr.push(obj)
                        })
                        this.alarmOptions.series = arr
                    } 
                }
            )
        }
    },
    created () {
        let paramId = this.$route.params.id
        Api.get('getAllTargetByDagId', {
                dagId: paramId
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.targets = res.data
                        this.target = res.data[0]
                        this.getTaskRelation()
                    } 
                }
            )
        }
    }
</script>
<style lang="scss" scoped>
.dash-chart-container {
    box-shadow: none !important;
    height: 480px;
    width: 100%;
    &:nth-child(1) {
        margin-right: 10px;
    }
}
.chart-header.chart-header-gray {
    background: #f9f9f9;
}
.chart-header {
    cursor: all-scroll;
    white-space: nowrap;
    height: 50px;
    line-height: 50px;
    padding: 0 15px 0 30px;
    font-size: 14px;
    text-align: left;
}
.border {
    border: 1px solid #dee2e6!important;
}
.mb10{
    margin: 0 0 10px 10px;
}
</style>