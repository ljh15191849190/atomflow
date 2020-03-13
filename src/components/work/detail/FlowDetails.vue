<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(v-if="$route.query.executionDate") 作业执行记录详情
                el-breadcrumb-item(v-else) 作业详情
        div.atom-content
            div.work-content
                el-tabs.portal-content(v-model="tabActive")
                    el-tab-pane(:label="item.label" :name="item.prop" v-for="item in tabItems" :disabled='item.disabled' :key="item.prop")
                    component(:is="tabActive" @change="changedata" :params="params")
</template>
<script>
/**
 * @description Cycle管理详情
 */
import TaskRelation from './TaskRelation'
import TaskChart from './TaskChart'
import {mapGetters} from 'vuex'
export default {
    name: 'FlowDetails',
    data () {
        return {
            params: {},
            tabActive: 'taskRelation'
        }
    },
    components: {
            taskRelation: TaskRelation,
            taskChart: TaskChart

    },
    computed: {
        ...mapGetters([
            'workRelationState'
        ]),
        tabItems () {
            return [
                {prop: 'taskRelation', label: '基础信息', disabled: false},
                {prop: 'taskChart', label: '执行报表', disabled: this.workRelationState !== '' ? false : true}
            ]
        } 
    },
    methods: {
        changedata (row) {
            this.params = row
        }
    }
}
</script>
<style lang="scss" scoped>
    .portal-content{
        height:100%;
    }
</style>

