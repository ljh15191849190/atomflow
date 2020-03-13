<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
      el-breadcrumb(separator-class="el-icon-arrow-right")
        el-breadcrumb-item 原子作业平台
        el-breadcrumb-item(:to="{ path: '/sheetList/tableView' }") 自定义工具列表
    
    div.top-button-container
      el-button.default-button(type="primary" size="small" @click="addSheet" icon="el-icon-plus") 新增工具
    el-tabs.atom-content.sheet-tab(v-model="tabActive" @tab-click="clickTab" type="border-card")
      el-tab-pane(label="扁平视图" name="tableView")
      el-tab-pane(label="结构视图" name="treeView")
      router-view
</template>
<script>
export default {
  data () {
    return {
      tabActive: 'tableView'
    }
  },
  methods: {
    clickTab () {
      if (this.tabActive === 'tableView') {
        this.$router.push('/sheetList/tableview')
      } else {
        this.$router.push('/sheetList/treeview')
      }
    },
    /**
     * 添加脚本
     */
    addSheet () {
      this.$router.push({path: '/editSheet/add', query: {from: 'list'}}) 
    }
  },
  created () {
      this.$router.push('/sheetList/tableview')
  },
  watch: {
      '$route.path' () {
        if (this.$route.path === '/sheetList/tableview') { 
            this.tabActive = 'tableView'
        }
      }
  }
}
</script>
<style lang="scss" scoped>
</style>

<style lang="scss">
.el-tabs__content {
    height: calc(100% - 23px);
}
</style>

