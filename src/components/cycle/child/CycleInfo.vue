<template lang="pug">
    div.container-flud
        div.atom-content-info
            el-row
                el-col(:span="8")
                    span.read-only 周期任务名称:
                    span.read-only.value {{sheetDetail.name}}              
                el-col(:span="8")  
                    span.read-only 任务类型:
                    span.read-only.value {{typeState[sheetDetail.type]}}
                el-col(:span="8")
                    span.read-only 创建者:
                    span.read-only.value {{sheetDetail.owner}}  
            el-row.margin-top  
                el-col(:span="8")  
                    span.read-only 执行目标:
                    span.read-only.value {{sheetDetail.ip_addrs+''}}
                el-col(:span="8")  
                    span.read-only 定时策略:
                    span.read-only.value {{sheetDetail.scheduler_interval}} 
                el-col(:span="8")  
                    span.read-only 创建时间:
                    span.read-only.value {{formatter(sheetDetail.startTime)}} 
            el-row.margin-top  
                el-col(:span="8")  
                    span.read-only 超时时间(分钟):
                    span.read-only.value {{sheetDetail.dag_time_out}} 
                el-col(:span="16")  
                    span 说明：
                    span.read-only.value {{sheetDetail.description}} 
            div.graph-container
                Dagre-Graph(:nodes="nodes" :edges="edges" :height="graphHeight" :width="graphWidth")
</template>
<script>
/**
 * @description Cycle详情
 */
import Api from '@api'
import DagreGraph from '@lib/DagreGraph'
import DateUtils from '@server/date-utils'
import { mapActions } from 'vuex'

export default {
    name: 'CycleInfo',
    data () {
        return {
            sheetDetail: {},
            nodes: [],
            edges: [],
            graphHeight: 716,
            graphWidth: 640
        }
    },
    methods: {
        ...mapActions([
            'setCycleWorkType'
        ]),
        //时间格式化
        formatter (time) {
            if (time) {
                return DateUtils.formate(time, 'zone')
            }
        },
        getCycleList () {
            let paramId = this.$route.params.id
            Api.get('queryWorkList', {
                dag_id: paramId
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        if (res.data && res.data.dagList.length) {
                            this.sheetDetail = res.data.dagList[0]
                            this.setCycleWorkType(this.sheetDetail.type)
                            this.getTaskRelation(this.sheetDetail)
                        }
                    } 
                }, () => {
                }
            )
        },
        //图节点
        getTaskRelation (data) {
            let paramId = data.id
            let consumeIp = data.ip_addrs[0]
            Api.get('getTaskRelation', {
                dagId: paramId,
                consumeIp: consumeIp
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.nodes = res.data.nodes
                        this.edges = res.data.edge 
                    } 
                }, () => {
                }
            )
        }
    },
    created () {
        this.getCycleList()
    },
    computed: {
        typeState () {
            return {
                    'normal': '简单任务',
                    'complex': '复杂任务'
                }
        }
    },
    components: {
         DagreGraph  
    }
}
</script>
<style lang="scss" scoped>
    .atom-content-info{
        height: calc(100% - 78px);
        padding: 16px;
        background: #fff;
        margin-left: 16px;
        margin-right: 16px;
    }
    .graph-container {
        margin-top: 5px;
        height: calc(100% - 178px);
    }
</style>

