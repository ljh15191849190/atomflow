<template lang="pug">
    div.table-input-container
        el-table(:data="tableData" size="small" stripe border)
            el-table-column(:prop="column.prop" v-for="column in tableInputConfig.columns" :key="column.prop" :label="column.label" :width="column.width")
                template(slot-scope="scope")
                    div.edit-form(v-if="tableInputConfig.isEdit")
                        el-input(
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
            el-table-column(label="操作" width="60" v-if="tableInputConfig.isEdit")
                template(slot-scope="scope")
                    Icon-Button(v-if="tableInputConfig.isShowOpr" v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleDelete(scope.$index)" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
        div.add-pane(v-if="tableInputConfig.isEdit")
            Icon-Button(:key="addOperation.prop" :type="addOperation.type" @iconClick="handleAdd" :args="{id: addOperation.prop}" :text="addOperation.label")
            span.add-desc {{tableInputConfig.addDesc}}
</template>
<script>
/**
 * @description 脚本管理-TableInput组件
 */
import IconButton from '@lib/AtomIconButton'
export default {
    name: 'TableInput',
    inject: ['$validator'],
    props: {
        tableInputConfig: {
            type: Object,
            default: {
                isEdit: false,
                isShowOpr: false
            }
        },
        tableData: {
            type: Array,
            default: () => []
        },
        Isrequired: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // rules: {
            //     require: {
            //         required: true
            //     }
            // },
            operations: [
                { prop: 'delete', label: '删除', type: 'atom-icon-delete' }
            ],
            addOperation: {
                prop: 'add', label: '添加', type: 'icon-atom-add'
            }
        }
    },
    computed: {
        rules () {
            let obj = {}
            obj.require = {required: this.Isrequired}
            return obj
        },
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
            let tableItem = JSON.parse(JSON.stringify(this.tableItem))
            this.tableData.push(tableItem)
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
</style>
