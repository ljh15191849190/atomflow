
<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
      el-breadcrumb(separator-class="el-icon-arrow-right")
        el-breadcrumb-item 原子作业平台
        el-breadcrumb-item Agent管理    
    el-tabs.atom-content.sheet-tab(v-model="tabActive" type="border-card")
        el-tab-pane.tabHeight(:label="item.label" :name="item.prop" v-for="item in tabItems" :key="item.prop")
            component(:is="tabActive")
</template>
<script>
    import AgentList from './AgentList'
    import AgentDownList from './AgentDownList'

    export default {
        name: 'AgentConfig',
        data () {
            return {
                tabActive: 'up',
                tabItems: [
                    {prop: 'up', label: '在线', key: 'up'},
                    {prop: 'down', label: '历史在线', key: 'down'}
                ]
            }
        },
        components: {
            up: AgentList,
            down: AgentDownList
        }
    }
</script>

<style lang="scss" scoped>
.tabHeight{
    height: 100%;
}
</style>



