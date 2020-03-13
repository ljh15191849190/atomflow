<template lang="pug">
    el-form(size="mini")
      el-row(v-for="(rule, index) in rules" :key="rule.ruleId" :class="{'margin-top': index}")
        el-select.row-form-item(
            size="mini"
            v-model="rule.validator"
            v-validate="formRules.validator"
            :name="uniqueId + index + 'validator'"
            data-vv-as="运算符"
            :class="{'input': true, 'is-danger': errors.has(uniqueId + index + 'validator')}"
        )
            el-option(
                v-for="option in validators" 
                :key="option.prop" 
                :label="option.label"
                :value="option.prop")
        el-input.row-form-item.margin-left(
            v-if="progressNode && progressNode.operatorType === 'SimpleHttpOperator'"
            v-model="rule.value"
            v-validate="formRules.value"
            :name="uniqueId + index + 'value'"
            data-vv-as="值"
            size="small" 
            type="number" 
            placeholder="请输入http状态码"
            :class="{'input': true, 'is-danger': errors.has(uniqueId + index + 'value')}"
        )
        el-select.row-form-item.margin-left(
            v-else
            size="mini"
            v-model="rule.value"
            v-validate="formRules.value"
            :name="uniqueId + index + 'value'"
            data-vv-as="值"
            :class="{'input': true, 'is-danger': errors.has(uniqueId + index + 'value')}"
        )
            el-option(
                v-for="option in values" 
                :key="option.code" 
                :label="option.desc"
                :value="option.code")
        AtomIconButton.margin-left(type="el-icon-close" @iconClick="handleOperation" :args="{index: index, rule: rule}" text="删除")
        div(v-if="errors.has(uniqueId + index + 'validator') || errors.has(uniqueId + index + 'value')")
            span.display-inline.validator-error.is-danger(v-if="errors.has(uniqueId + index + 'validator')") {{ errors.first(uniqueId + index + 'validator') }}  
            span.display-inline.validator-error.is-danger(v-if="errors.has(uniqueId + index + 'value')") {{ errors.first(uniqueId + index + 'value') }}  
      el-form-item.margin-top
        el-button(type="primary" @click="addRow") 添加条件
</template>
<script>
/**
 * @description 分支节点配置子表单-- 条件生成器
 */
import AtomIconButton from '@lib/AtomIconButton'
import Utils from '@server/Utils'

export default {
    inject: ['$validator'],
    props: {
        rules: {
            type: Array,
            default: () => []
        },
        progressNode: {
            type: Object,
            default: () => {}
        },
        uniqueId: {
            type: String,
            default: 'id'
        }
    },
    data () {
        return {
            validators: [
                { prop: '>=', label: '>=' },
                { prop: '>', label: '>' },
                { prop: '=', label: '=' },
                { prop: '<=', label: '<=' },
                { prop: '<', label: '<' }
            ],
            formRules: {
                validator: {
                    required: true
                },
                value: {
                    required: true
                }
            }
        }
    },
    methods: {
        // 添加行
        addRow () {
            let rules = JSON.parse(JSON.stringify(this.rules))
            rules.push({
                ruleId: Utils.uuid(), // 前端校验唯一性使用，不具有实际业务含义
                taskId: null,
                rstType: 'rstCode',
                validator: '',
                value: null
            })
            this.$emit('update:rules', rules)
        },

        // 删除行
        deleteRow (index) {
            let rules = JSON.parse(JSON.stringify(this.rules))
            rules.splice(index, 1)
            this.$emit('update:rules', rules)
        },

        handleOperation (obj) {
            this.deleteRow(obj.index)
        }
    },
    computed: {
        values () {
            if (!this.progressNode || !this.progressNode.sheet || !this.progressNode.sheet.version || !this.progressNode.sheet.version.rstCode) {
                return []
            }
            return this.progressNode.sheet.version.rstCode
                .map(code => {
                    code.code = parseInt(code.code)
                    return code
                })
        }
    },
    watch: {
        'progressNode.sheet.id' (val, old) {
            if (!old) return
            let rules = JSON.parse(JSON.stringify(this.rules))
            rules.forEach(rule => {
                // 更改后的sheet不存在，或者 前后sheet的下载路径不同
                rule.value = null
            })
            this.$emit('update:rules', rules)
        }
    },
    components: {
        AtomIconButton
    }
}
</script>

<style lang="scss" scoped>
.row-form-item {
    width: calc(50% - 30px);
    display: inline-block;
}
</style>
