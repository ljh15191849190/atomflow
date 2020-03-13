<template lang="pug">
  el-row
    el-col(:span="4")
        //- el-form-item(label="脚本类型")
        el-cascader(
            :clearable="true"
            :options="treeData"
            :props="props"
            change-on-select
            v-model="sheetForm.nodeIds"
            size="small"
            placeholder="请选择工具目录"
            @change="filterChange"
        )
    el-col(:span="4" :offset="1")
        //- el-form-item(label="脚本类型")    
        el-select(
            filterable
            :clearable="true"
            placeholder="请选择标签类型"
            v-model="sheetForm.labels"
            size="small"
            @change="filterChange"
            value-key="id"
        )
            el-option(
                v-for="item in labels"
                :key="item.id"
                :value="item"
                :label="item.name"
            )
    el-col(:span="4" :offset="1")
        //- el-form-item(label="脚本语言")    
        el-select(
            :clearable="true"
            placeholder="请选择脚本语言"
            v-model="sheetForm.lang"
            size="small"
            @change="filterChange"
        )
            el-option(
                v-for="lang in langs"
                :key="lang.id"
                :value="lang.prop"
                :label="lang.prop"
            )
    el-col(:span="4" :offset="1")
        el-input(placeholder="请输入工具名称" size="small" clearable v-model="sheetForm.keyword" @change="keywordChange")
    el-col(:span="4" :offset="1")
        el-input(placeholder="请输入工具创建者" size="small" clearable v-model="sheetForm.userName" @change="keywordChange")
</template>
<script>
import Utils from '@/server/Utils'
import Api from '@api'

export default {
  props: ['pagination', 'isSheetList'],
  data () {
    return {
        sheetForm: {
            nodeIds: [],
            keyword: '',
            userName: '',
            lang: '',
            labels: null
        },
        labels: [],
        treeData: [],
        props: {
            value: 'id',
            label: 'name'
        },
        timeout: null
    }
  },
  methods: {
    getTableData (filterRule) {
        if (this.isSheetList) {
            this.$emit('filterChange', filterRule)
            return
        }

        let params = Object.assign({}, filterRule, this.this.pagination)

        Api.get('getSheetListByFolderId', {
            limit: params.size,
            offset: params.index,
            nodeId: params.nodeId,
            name: params.keyword,
            userName: params.userName,
            type: params.lang,
            tagIds: params.tagIds
        }, true).then(
            (data) => {
                this.$emit('dataChange', data.data.fileList)
                this.pagination.count = data.data.pageCount
            }
        )
    },
    filterChange () {
        this.getTableData(this.filterRule)
    },
    keywordChange () {
        this.getTableData(this.filterRule)
    }
  },
  computed: {
    filterRule () {
        let rst = {}
        if (this.sheetForm.nodeIds.length) {
            rst.nodeId = this.sheetForm.nodeIds[this.sheetForm.nodeIds.length - 1]
        }
        if (this.sheetForm.keyword) {
            rst.keyword = this.sheetForm.keyword
        }
        if (this.sheetForm.userName) {
            rst.userName = this.sheetForm.userName
        }
        if (this.sheetForm.lang) {
            rst.lang = this.sheetForm.lang
        }
        if (this.sheetForm.labels) {
            rst.tagIds = this.sheetForm.labels.id ? this.sheetForm.labels.id : ''
        }
        return rst
    },
    langs () {
        let langs = [
            {prop: 'python'},
            {prop: 'shell'}            
        ]

        if (this.isSheetList) {
            langs = [
                {prop: 'python'},
                {prop: 'shell'},
                {prop: 'powershell'},
                {prop: 'bat'},
                {prop: 'sql'},
                {prop: 'ansible'}                 
            ]
        }

        return langs
    }
  },
  created () {
    Api.get('getFolderTreeNodes', {}, true).then(
        data => {
            this.treeData = Utils.transformToTreeData(data.data, 'id', 'parentId', 'children', null)
        }
    )
    Api.get('getAllLabels', {}, true).then(
        res => {
            this.labels = res.data   
        }
    )
    this.getTableData({})
  },
  watch: {
      //修改wacth对象为watch属性，避免循环
      'pagination.index': {
            deep: true,
            handler (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.getTableData(this.filterRule)
                }
            }
      },
      'pagination.size': {
            deep: true,
            handler (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.getTableData(this.filterRule)
                }
            }
      }
  }
}
</script>
<style lang="scss" scoped>
    .el-select {
        width: 100%;
    }
    .el-cascader{
        width: 100%;
    }
</style>
