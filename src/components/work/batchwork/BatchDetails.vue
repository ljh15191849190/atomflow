<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/batchList/' + $route.query.batchId }")  批次列表
                el-breadcrumb-item 分批作业详情
        div.atom-content
            div.work-content
                el-tabs.portal-content(v-model="tabActive" @tab-click="handleTabClick")
                    el-tab-pane.portal-content(:label="item.label" :name="item.prop" v-for="item in tabItems" :disabled='item.disabled' :key="item.prop")
                        router-view(:key="$route.fullPath" v-if="item.prop === tabActive")
        div.sheet-footer
            el-button(size="small" type="primary" @click="goBack") 返回
</template>
<script>
/**
 * @description batch详情
 */
import {mapGetters} from 'vuex'
export default {
    name: 'BatchDetails',
    data () {
        return {
            params: {},
            tabActive: 'taskRelation'
        }
    },
    methods: {
        goBack () {
            this.$router.push('/batchList/' + this.$route.query.batchId)
        },
        handleTabClick () {
            this.$router.push({path: '/batchDetails/' + this.$route.params.dagId + '/' + this.tabActive, query: {batchId: this.$route.query.batchId}}) 
        }
    },
    computed: {
        ...mapGetters([
            'workRelationState'
        ]),
        tabItems () {
            return [
                // {prop: 'batchList', label: '批次列表', disabled: false},
                {prop: 'taskRelation', label: '基础信息', disabled: false},
                { prop: 'taskChart', label: '执行报表', disabled: this.workRelationState !== '' ? false : true }
            ]
        } 
    },
    watch: {
        '$route.name' () {
            this.tabActive = this.$route.name
        }
    }
}
</script>
<style lang="scss" scoped>
    .portal-content {
        height: 100%;
    }
    .atom-content {
        height: calc(100% - 120px);
    }
</style>

