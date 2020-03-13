<template lang="pug">
    el-form(size="mini")
     el-form-item.is-required(label='分支说明')
        el-input(
            v-model="config.taskName"
            v-validate="formRules.taskName"
            :name="uniqueId + 'taskName'"
            data-vv-as="分支说明"
            :class="{'input': true, 'is-danger': errors.has(uniqueId + 'taskName')}"
        )
        span.validator-error.is-danger(v-if="errors.has(uniqueId + 'taskName')") {{ errors.first(uniqueId + 'taskName') }}  
     span.validator-error.is-danger(v-if="errors.has(uniqueId + 'rules')") {{ errors.first(uniqueId + 'rules') }}       
     BranchRule(:rules.sync="config.rules" :progressNode="progressNode" :uniqueId="uniqueId")
     el-select.hidden(
         multiple 
         v-model="config.rules"
         v-validate="formRules.rules"
         :name="uniqueId + 'rules'"
         data-vv-as="分支条件"
         :class="{'input': true, 'is-danger': errors.has(uniqueId + 'rules')}"
     )
</template>
<script>
/**
 * @description 分支节点配置表单
 */
import BranchRule from './BranchRule'

export default {
    inject: ['$validator'],
    props: {
        config: {
            type: Object,
            default: () => {}
        }, // 表单值对象
        progressNode: {
            type: Object,
            default: () => {}
        }, // 与当前分支节点有关系的流程节点(source)业务表单值   source(progressNode) --------> target
        uniqueId: {
            type: String,
            default: 'id'
        },
        canvasData: {
            type: Object,
            default: () => {}
        }, // 拓扑图数据
        updateNodeLabel: Function
    },
    data () {
        return {
            formRules: {
                taskName: {
                    required: true
                },
                rules: {
                    required: true
                }
            }
        }
    },
    methods: {
        initilizeFormData () {
            if (!this.config.hasOwnProperty('taskName')) this.$set(this.config, 'taskName', '')
            if (!this.config.hasOwnProperty('rules')) this.$set(this.config, 'rules', [])
        }
    },
    watch: {
        'config.taskName' (val) {
            this.canvasData.info.label = val
            this.updateNodeLabel(this.uniqueId, val)
        }
    },
    created () {
        this.initilizeFormData()
    },
    components: {
        BranchRule
    }
}
</script>
<style lang="scss" scoped>
.hidden {
    display: none;
}
</style>
