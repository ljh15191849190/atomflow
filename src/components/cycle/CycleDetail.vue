<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item 周期任务详情    
        div.atom-content
            div.work-content
                el-tabs.portal-content(v-model="tabActive")
                    el-tab-pane(:label="item.label" :name="item.prop" v-for="item in tabItems" :key="item.prop")
                    component(:is="tabActive")
</template>
<script>
/**
 * @description Cycle管理详情
 */
// import Api from '@api'
import CycleInfo from './child/CycleInfo'
import CyclerunList from './child/CyclerunList'
import CycleChart from './child/CycleChart'
export default {
    name: 'CycleDetail',
    data () {
        return {
            tabActive: 'cycleInfo',
            tabItems: [
                {prop: 'cycleInfo', label: '基础信息'},
                {prop: 'cyclerunList', label: '执行列表'},
                {prop: 'cycleChart', label: '执行报表'}
            ]
        }
    },
    methods: {
       
    },
    created () {
    },
    computed: {
                
    },
    components: {
            cycleInfo: CycleInfo,
            cyclerunList: CyclerunList,
            cycleChart: CycleChart

    }
}
</script>
<style lang="scss" scoped>
    .portal-content{
        height:100%;
    }
</style>

