<template lang="pug">
    div.table-input-container
        el-table(:data="tableData" size="small" stripe border)
            el-table-column(:prop="column.prop" v-for="column in tableInputConfig.columns" :key="column.prop" :label="column.label" :width="column.width")
                template(slot-scope="scope")
                    div.edit-form(v-if="column.rowEdit")
                        el-input(
                            v-if="tableInputConfig.inputType==='textarea'"
                            size="small"
                            type="textarea"
                            v-model="scope.row[column.prop]"
                            v-validate="rules.require"
                            :autosize="{ minRows: 4}"
                            :name="column.prop + scope.$index"
                            :data-vv-as="column.label"
                            :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}"
                        )
                        el-select(
                            v-else-if="tableInputConfig.inputType==='select'"
                            size="mini"
                            v-model="scope.row[column.prop]"
                            :placeholder="column.label"
                            :maxlength="column.maxlength"
                            v-validate="rules.require"
                            :name="column.prop + scope.$index"
                            :data-vv-as="column.label"
                            :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}"
                        )
                            el-option(
                                v-for="option in tableInputConfig.linkList" 
                                :key="option.conn_id" 
                                :label="option.conn_id"
                                :value="option.conn_id")
                        el-input(
                            v-else
                            size="small"
                            v-model="scope.row[column.prop]"
                            :placeholder="column.label"
                            :maxlength="column.maxlength"
                            v-validate="rules.require"
                            :name="column.prop + scope.$index"
                            :data-vv-as="column.label"
                            :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}"
                        )
                        span.validator-error.is-danger(v-if="errors.has(column.prop + scope.$index)") {{ errors.first(column.prop + scope.$index) }}  
                    div.read-form(v-else)    
                        span {{scope.row[column.prop]}}
            el-table-column(label="操作" width="60" v-if="tableInputConfig.isShowOpr")
                template(slot-scope="scope")
                    Icon-Button(v-if="tableInputConfig.isShowOpr" v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleDelete(scope.$index)" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
</template>
<script>
/**
 * @description TableEdit组件
 */
import IconButton from '@lib/AtomIconButton'
export default {
    name: 'TableInput',
    inject: ['$validator'],
    props: {
        tableInputConfig: {
            type: Object,
            default: {
                isShowOpr: false,
                inputType: 'input',
                linkList: []
            }
        },
        tableData: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            rules: {
                require: {
                    required: false
                }
            },
            operations: [
                { prop: 'delete', label: '删除', type: 'atom-icon-delete' }
            ]
        }
    },
    computed: {
        tableItem () {
            let columnKeys = this.tableInputConfig.columns.map(item => {
                return item.prop
            })
            let tableItem = {}
            columnKeys.forEach(key => {
                tableItem[key] = ''
            })
            return tableItem
        }
    },
    methods: {
        /**
         * @description 删除一条记录
         */
        handleDelete (index) {
            this.tableData.splice(index, 1)
        },
        /**
         * @description 添加一条记录
         */
        handleAdd () {
            this.tableData.push(this.tableItem)
        }
    },
    components: {
        IconButton
    }
}
</script>
<style lang="scss" scoped>
.add-pane {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.el-select {
    width: 100%;
}
</style>
