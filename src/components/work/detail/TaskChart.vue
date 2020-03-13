<template lang="pug">
    div.container-flud
        el-row.mb10(v-if="!$route.query.executionDate && workRelationType!==1")
            el-col(:span="4")
                el-select.target-list(v-model="target" placeholder="执行目标" size="small" @change="getTaskRelation")
                    el-option(
                    v-for="(item, index) in targets"
                    clearable
                    :key="index"
                    :label="item"
                    :value="item"
                    )    
        el-row.tab-content
            el-table(:data="tableData" stripe size="small")
                el-table-column(
                    v-for="column in columns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width")
                    template(slot-scope="scope")    
                        span(v-if="column.prop === 'startDate'||column.prop === 'endDate'") {{formatter(scope.row[column.prop])}}
                        span(v-else-if="column.prop === 'state'")
                            el-button(size='mini' :type="scope.row[column.prop]==='success'?'success':'danger'" :icon="scope.row[column.prop]==='success'?'el-icon-check':'el-icon-close'" circle)
                        el-tooltip(v-else-if="column.prop === 'duration'" :content="scope.row[column.prop] ? String(scope.row[column.prop].toFixed(2)+'秒') : '0秒'" effect="dark" placement="top-start")
                            el-progress.progress(:percentage="formatterPro(scope.row[column.prop])" :stroke-width="14" status="success" :show-text='false')
                        span(v-else) {{scope.row[column.prop]}}
</template>
<script>
import Api from '@api'
import LineChart from '@lib/LineCharts'
import DateUtils from '@server/date-utils'
import {mapGetters} from 'vuex'
export default {
    components: { LineChart },
    props: ['params'],
    data () {
        return {
            bathDateRelation: null,
            target: '',
            targets: [],
            tableData: [],
            columns: [
                {
                    prop: 'label',
                    label: '流程节点'
                },
                {
                    prop: 'state',
                    label: '状态'
                },
                {
                    prop: 'startDate',
                    label: '开始时间'
                },
                {
                    prop: 'endDate',
                    label: '结束时间'
                },
                {
                    prop: 'hostIp',
                    label: '执行目标'
                },
                {
                    prop: 'duration',
                    label: '作业耗时（s）',
                    width: '200'
                }
            
            ]
        }
    },
    methods: {
        getTaskRelation (data) {
            let paramId = this.$route.params.dagId
            let startTime = null
            if (this.params && this.params.time) {
                startTime = this.params.time && this.params.time.prop ? this.params.time.prop : this.params.time
            } else {
                startTime = this.bathDateRelation
            }
            Api.get('getTaskRelation', {
                dagId: paramId,
                consumeIp: this.target,
                executeDate: startTime
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        res.data.nodes.forEach(item => {
                            if (item.value) {
                                item.label = item.value.label
                                item.operator = item.value.operator
                            }
                        })
                        this.tableData = res.data.nodes
                    } 
                }
            )
        },
        formatter (time) {
            if (time) {
                return DateUtils.formate(time, 'zone')
            }
        },
        formatterPro (val) {
            if (val) {
                let arr = []
                this.tableData.forEach(element => {
                    arr.push(element.duration)
                })
                let max = Math.max.apply(null, arr)
                return (val / max) * 100
            }
        },
        
        getRelationDate () {
            Api.get('getDateListForRelation', {
                dagId: this.$route.params.dagId
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        if (res.data.exeDateList && res.data.exeDateList.length > 0) {
                            this.bathDateRelation = res.data.exeDateList[0]
                            this.getTaskRelation()
                        }
                    } 
                }
            )
        },
        getTargets () {
            Api.get('getAllTargetByDagId', {
                dagId: this.$route.params.dagId
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
    },
    computed: {
        ...mapGetters([
            'workRelationType'
        ])
    },
    created () {
        this.getTargets()
        this.getRelationDate()
    }
}
</script>
<style lang="scss" scoped>
.mb10{
    margin: 0 0 10px 10px;
}
.progress{
    background-color: #fff!important;
    /deep/ .el-progress-bar__outer{
        background-color: #fff!important;
    }
}
</style>