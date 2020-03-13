<template lang="pug">
  div.full-container
    el-row(:gutter="15")
        el-col(:span="12")
            el-input.normal-widget-width(v-model="name" placeholder="请输入模板名称" size="mini" @change="filterTemList")
                i.el-input__icon.el-icon-search(slot="suffix" @click="filterTemList")
        el-col(:span="12")        
</template>
<script>
import Api from '@api'

export default {
  props: ['pagination'],
  data () {
    return {
        name: ''
    }
  },
  methods: {
    getNewData (name) {
        /* 
         *原子作业平台ATOMFLOWAT-183(新增作业页面，选择模板，在查询条件中输入模板名称，点击查询，无反应)
         */
        Api.get('getTemplateList', {limit: this.pagination.size, offset: this.pagination.index, flowName: name}, true).then(
            data => {
                this.$emit('dataChange', data.data.flowList)
                this.pagination.count = data.data.pageCount
            }, err => {
                console.log(err)
            }
        )
    },
    filterTemList () {
        this.getNewData(this.name)  
    }
  },
  watch: {
    /* 
    * 原子作业平台ATOMFLOWAT-184(作业列表页面，选择脚本，翻页按钮，每页显示多少条应该去除)
    * 解决方法：添加分页功能
    */
    pagination: {
        deep: true,
        handler () {
            this.getNewData(this.name)
        }
    }
  },
  created () {
      this.getNewData(null)      
  }
}
</script>
