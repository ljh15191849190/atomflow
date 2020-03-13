<template lang="pug">
   div.sheet-list-container 
    div.query-input
        el-input(placeholder='根据脚本名称进行过滤' size="mini" v-model="filterRules.keyword" clearable)
            // el-select(slot="append" v-model="filterRules.checkedLabels")
            //     el-option(v-for="type in types" :key="type.id" :label="type.name" :value="type.id")
    ul.sheet-list
       li(v-for="sheet in sheetList" :key="sheet.id" :class="{'actived': checkedSheet && checkedSheet.id === sheet.id}" @click="setSheetInfo(sheet)") 
            span {{ sheet.name }}
    el-pagination(
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagination.index"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next"
        :page-count="pagination.count")
</template>
<script>
/**
 * @description 选择脚本, 脚本编排使用
 */
import Api from '@api'

export default {
    props: {
        checkedSheet: {
            type: [Object, null],
            default: null
        }
    },

    data () {
        return {
            filterRules: {
                keyword: null,
                sheetApi: []
            },
            types: [],
            checkedLabels: null,
            sheetList: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            }
        }
    },

    methods: {
        /**
         * @description 查询脚本列表
         */
        querySheets () {
            let params = Object.assign({}, this.filterRules, this.pagination)

            Api.get('getSheetListByFolderId', {
                limit: params.size,
                offset: params.index,
                nodeId: params.nodeId,
                name: params.keyword,
                type: params.lang,
                tagIds: params.tagIds,
                init_tag: 'init_tag',
                scriptType: '1'
            }, true).then(
                (data) => {
                    this.sheetList = data.data.fileList
                    this.pagination.count = data.data.pageCount
                }
            )
        },

        /**
         * @description 选中脚本后，设置取值内容
         */
        setSheetInfo (sheet) {
            this.computedSheet = {
                id: sheet.id,
                type: sheet.type,
                fileName: sheet.name,
                version: sheet.versions[0]
            }
        },

        handleCurrentChange (index) {
            this.pagination.index = index
            this.querySheets()
        },

        handleSizeChange (size) {
            this.pagination.size = size
            this.pagination.index = 1
            this.querySheets()
        }
    },

    computed: {
        computedSheet: {
            set (val) {
                this.$emit('update:checkedSheet', val)
            },
            get () {
                return this.checkedSheet
            }
        }
    },

    watch: {
       'filterRules.keyword' () {
           this.querySheets()
       } 
    },

    created () {
        Api.get('getAllLabels', {}, true).then(
            res => {
                this.types = res.data   
            }
        )
        this.querySheets()
    }
}
</script>
<style lang="scss" scoped>
.sheet-list-container {
    width: 100%;
    border: 1px solid #a6a6a6;
    border-radius: 5px;
    padding: 5px;
}
.query-input {
    width: 100%;
}
.sheet-list {
    width: 100%;
    height: 200px;
    list-style: none;
    padding-left: 5px;
    padding-top: 5px;
    overflow: auto;
    li {
        &:hover, &:active {
            color: #0081f6;
        }
        &.actived {
            background: #0081f6;
            color: #fff;
        }
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
    }
}
</style>
