<template lang="pug">
  div.full-container 
    Sheet-Query(v-if="!contentType || contentType === 'sheet'" @dataChange="dataChange" :pagination="pagination")
    Query-Template(v-else  @dataChange="dataChange" :pagination="pagination")
    div.data-content 
        div.list-pane
            div.list-group
                button.list-group-item.list-group-item-action(type="button" v-for="item in dataList" :key="item.id" @click="clickSheet(item)" :class="{'active': activedSheet && item.id === activedSheet.nodeId}") {{item.name}}
    el-pagination(
        v-if="!hidePageInfo"
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page.sync="pagination.index"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="sizes, prev, pager, next"
        :page-count="pagination.count")
</template>
<script>
import SheetQuery from '@/components/lib/SheetQuery'
import QueryTemplate from '@/components/progress/QueryTemplate'
import paginationMixins from '@mixins/pagination.mixins.js'

export default {
  mixins: [paginationMixins],
  props: ['checkedSheet', 'contentType', 'hidePageInfo'],
  data () {
      return {
        modalVisible: true,
        results: [],
        sheet: null,
        loading: false,
        dataList: [],
        computedSheet: null
      }
  },
  computed: {
      activedSheet: {
        set (sheet) {
            this.computedSheet = sheet
        },
        get () {
            return this.computedSheet
        }
      }
  },
  methods: {
    /**
     * 关闭模态框
     * @augments 
     * @author xinghua.wen
     * */
    closeModal () {
        this.modalVisible = false
    },
    /**
     * 远程搜索方法
     * @augments
     * @author xinghua.wen
     * */
    remoteMethod () {

    },
    dataChange (data) {
        this.dataList = data
    },
    /**
     * 页面列表数量发生变化触发事件
     * @augments
     * 
     */
    sizeChange (val) {
      this.pagination.size = val      
    },

    /**
     * 分页当前页码发生变化
     * @augments
     * @author xinghua.wen
     */
    currentChange (val) {
      this.pagination.index = val
    },
    clickSheet (item) {
        this.activedSheet = item
        this.activedSheet.nodeId = item.id      
        this.$emit('checkedSheet', this.activedSheet)
    }
  },
  created () {
    this.computedSheet = this.checkedSheet
  },
  components: {
    SheetQuery,
    QueryTemplate
  }
}
</script>
<style lang="scss" scoped>
.list-pane {
    max-height: 290px;
    overflow: auto;
}
.list-group-item {
    padding: 1px 7px 2px;
}
.data-content {
    padding: 10px 0;
    max-height: 300px;
}
</style>
