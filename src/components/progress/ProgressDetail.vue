<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 流程详情    
        div.atom-content-info
            el-row
                el-col(:span="8")
                    span.read-only 流程名称:
                    span.read-only.value {{sheetDetail.flowName}}              
                el-col(:span="8")
                    span.read-only 类型:
                    span.read-only.value {{sheetDetail.shared===0?"私有":"共享"}}      
                el-col(:span="8")
                    span.read-only 创建者:
                    span.read-only.value {{sheetDetail.owner}}  
            el-row.margin-top  
                el-col(:span="8")  
                    span.read-only 创建时间:
                    span.read-only.value {{formatter(sheetDetail.createTime)}}
                el-col(:span="8")  
                    span.read-only 流程类型:
                    span.read-only.value {{sheetDetail.flowType==='normal'?"简单流程":"复杂流程"}} 
            el-row.margin-top  
                el-col(:span="20")  
                    span 说明:
                    span.read-only.value {{sheetDetail.description}}
            div.graph-container
                Dagre-Graph(:nodes="sheetDetail.nodes" :edges="sheetDetail.edges" :height="graphHeight" :width="graphWidth")
</template>
<script>
/**
 * @description Cycle详情
 */
import Api from '@api'
import DagreGraph from '@lib/DagreGraph'
import DateUtils from '@server/date-utils'

export default {
    name: 'ProgressDetail',
    data () {
        return {
            sheetDetail: {
                flowName: '',
                shared: '',
                owner: '',
                createTime: '',
                flowType: '',
                nodes: [],
                edges: []
            },
            graphHeight: 716,
            graphWidth: 640
        }
    },
    methods: {
        //时间格式化
        formatter (time) {
            if (time) {
                return DateUtils.formate(time)
            }
        },
        getFlowDetail () {
            Api.get('getTemplateRelation', {
                id: this.$route.query.id
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        // this.nodes = res.data.nodes
                        // this.edges = res.data.edges
                        this.sheetDetail = res.data
                    } 
                }, () => {
                }
            )
        }
    },
    created () {
        this.getFlowDetail()  //流程详情
    },
    computed: {
                
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
        height:calc(100% - 178px);
    }
</style>

