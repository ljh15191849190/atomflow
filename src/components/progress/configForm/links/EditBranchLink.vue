<template lang="pug">
    el-form(size="mini")
        el-form-item.is-required(label="分支条件")
            el-select(
                v-model="formValue"
                value-key="ruleId"
                clearable
                v-validate="formRules.formValue"
                :name="uniqueId + 'formValue'"
                data-vv-as="分支条件"
                :class="{'input': true, 'is-danger': errors.has(uniqueId + 'formValue')}"
                @change='Rulechange'
            )
                el-option(
                    v-for="(option, index) in rules"
                    :key="index"
                    :label="beautyRule(option)"
                    :value="option"
                    :disabled="disabledRuleIds.indexOf(option.ruleId) !== -1"
                )
            span.validator-error.is-danger(v-if="errors.has(uniqueId + 'formValue')") {{ errors.first(uniqueId + 'formValue') }}              
</template>
<script>
/**
 * @description 分支连线的配置表单
 */
export default {
    inject: ['$validator'],
    props: {
        values: {
            type: Object | String,
            default: () => {}
        },
        rules: {
            type: Array,
            default: () => []
        },
        checkedBranchRules: {
            type: Array,
            default: () => []
        },
        uniqueId: {
            type: String,
            default: 'id'
        },
        updateLinkLabel: Function,
        // AT-582 当前箭头指向的流程节点id
        target: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            formRules: {
                formValue: {
                    required: true,
                    objectRequired: true // AT-615 针对object类型的字段添加校验方式
                }
            }
        }
    },
    computed: {
        formValue: {
            get () {
                return this.values
            },
            set (val) {
                this.updateLinkLabel(this.uniqueId, val ? (val.validator + '' + val.value) : '')
                this.$emit('update:values', val)
            }
        },
        disabledRuleIds () {
            return this.checkedBranchRules.map(rule => rule.ruleId)
        }
    },
    methods: {
        beautyRule (rule) {
            return (rule.rstType === 'rstCode' ? '返回码' : '') + rule.validator + rule.value
        },

        // AT-582 选择规则条件后回调事件，给规则的taskId赋值
        Rulechange (rule) {
            if (!rule) return
            rule.taskId = this.target
        }
    },
    created () {
    }
}
</script>
<style lang="scss" scoped>

</style>
