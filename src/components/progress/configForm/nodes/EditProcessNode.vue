<template lang="pug">
   el-form(size="mini" label-width="125px")
     el-form-item.is-required(label='流程步骤类型')
        el-radio-group(v-model="config.operatorType" @change="processChange") 
            el-radio(v-for="type in types" :key="type.prop" :label="type.prop") {{ type.label }}
     Http(:config="config" v-if="flowType==='complex' && config.operatorType==='SimpleHttpOperator'")
     Sql(:config="config" v-if="flowType==='complex' && config.operatorType==='JdbcOperator'")
     Ansible(:config="config" v-if="flowType==='complex' && config.operatorType==='AnsibleOperator'")
     template(v-if="config.operatorType==='AgentOperator'")
        el-form-item.is-required(label='失败自动重试')
            el-switch(v-model="config.retry")
        el-form-item.is-required(v-if="config.retry" label='重试间隔时间')
            el-input-number(v-model="config.retryInterval" :min="1" :max="60")
        el-form-item.is-required(v-if="config.retry" label='重试频率')
            el-input-number(v-model="config.retryFrequency" :min="1" :max="5")
        el-form-item.is-required.mr10(label="脚本名称")
            CheckSheet(
                :checkedSheet.sync="config.sheet"
                :class="{'input': true, 'is-danger': errors.has(uniqueId + 'sheet')}"
            )
            el-select.hidden(
                v-model="config.sheet"
                v-validate="rules.sheet"
                :name="uniqueId + 'sheet'"
                data-vv-as="脚本"
            )
            span.validator-error.is-danger(v-if="errors.has(uniqueId + 'sheet')") {{ errors.first(uniqueId + 'sheet') }}  
        el-form-item.is-required(label="流程名称")
            el-input(
                v-model="config.taskName"
                v-validate="rules.taskName"
                :name="uniqueId + 'taskName'"
                data-vv-as="流程名称"
                :maxlength="9"
                :class="{'input': true, 'is-danger': errors.has(uniqueId + 'taskName')}"
            )
            span.validator-error.is-danger(v-if="errors.has(uniqueId + 'taskName')") {{ errors.first(uniqueId + 'taskName') }}  
        el-form-item.is-required.mr10(label="目标机器" v-if="hasTargetHost")
            CheckAgent(
                :checkedAgent.sync="config.targetHost"
                :checkedAgentUnid.sync="config.hostUniqueId"
                :class="{'input': true, 'is-danger': errors.has(uniqueId + 'targetHost')}"
            )
            el-select.hidden(
                v-model="config.targetHost"
                v-validate="rules.targetHost"
                :name="uniqueId + 'targetHost'"
                data-vv-as="目标机器"
                placeholder="选择目标机器"
            )
            span.validator-error.is-danger(v-if="errors.has(uniqueId + 'targetHost')") {{ errors.first(uniqueId + 'targetHost') }}  
</template>
<script>
import CheckSheet from './CheckSheet'
import CheckAgent from './CheckAgent'
import Http from './Http'
import Sql from './Sql'
import Ansible from './Ansible'

export default {
    inject: ['$validator'],
    props: {
        flowType: {
            type: String,
            default: ''
        },
        config: {
            type: Object,
            default: () => { }
        }, // 表单值对象
        uniqueId: {
            type: String,
            default: 'id'
        }, // nodeId，作为表单校验的唯一性校验条件
        canvasData: {
            type: Object,
            default: () => { }
        }, // 拓扑图数据
        hasTargetHost: {
            type: Boolean,
            default: false
        }, // 是否显示目标机器，只有复杂流程才为 true
        updateNodeLabel: Function
    },

    data () {
        return {
            HostList: [],
            rules: {
                taskName: {
                    required: true,
                    max: 50
                },
                sheet: {
                    required: true
                },
                targetHost: {
                    required: true
                }
            }
        }
    },
    computed: {
        types () {
            if (this.flowType === 'complex') {
                return [
                {
                    prop: 'AgentOperator',
                    label: '脚本'
                },
                {
                    prop: 'SimpleHttpOperator',
                    label: 'http'
                },
                 {
                    prop: 'JdbcOperator',
                    label: 'sql'
                },
                {
                    prop: 'AnsibleOperator',
                    label: 'ansible'
                }]
            } else {
                return [{
                    prop: 'AgentOperator',
                    label: '脚本'
                }]
            }
        }
    },
    methods: {
        initilizeFormData () {
            if (!this.config.hasOwnProperty('operatorType')) this.$set(this.config, 'operatorType', 'AgentOperator')
            if (!this.config.hasOwnProperty('retry')) this.$set(this.config, 'retry', false)
            if (!this.config.hasOwnProperty('sheet')) this.$set(this.config, 'sheet', null)
            if (!this.config.hasOwnProperty('taskName')) this.$set(this.config, 'taskName', '')
            if (this.hasTargetHost && !this.config.hasOwnProperty('targetHost')) this.$set(this.config, 'targetHost', null)
            if (!this.config.hasOwnProperty('hostUniqueId')) this.$set(this.config, 'hostUniqueId', '')
        },
        processChange (val) {
            if (val !== 'AgentOperator') { //非脚本
                delete this.config.retry
                // delete this.config.sheet
            } else if (val !== 'SimpleHttpOperator') {   //非http
                delete this.config.headers
                delete this.config.data
                delete this.config.method
                delete this.config.timeout
                delete this.config.http_conn_id
                delete this.config.endpoint
            } else if (val !== 'JdbcOperator') {   //非sql
                delete this.config.sql
                delete this.config.conn_id
                delete this.config.autocommit
                delete this.config.parameters
            }
        }
    },

    watch: {
        'config.taskName' (val) {
            this.canvasData.info.label = val
            this.updateNodeLabel(this.uniqueId, val)
        },
        hasTargetHost (val) {
            if (!val) delete this.config.targetHost
            else if (!this.config.hasOwnProperty('targetHost')) this.$set(this.config, 'targetHost', null)
        },
        'config.retry' (val) {
            if (!val) {
                delete this.config.retryInterval
                delete this.config.retryFrequency
            } else {
                this.$set(this.config, 'retryInterval', 1)
                this.$set(this.config, 'retryFrequency', 1)
            }
        },
        flowType (val) {
            if (val === 'normal') {
                this.$set(this.config, 'operatorType', 'AgentOperator')
            }
        }
    },

    components: {
        CheckSheet, Http, Sql, Ansible, CheckAgent
    },

    mounted () {
        this.initilizeFormData()
    }
}
</script>
<style lang="scss" scoped>
.hidden {
  display: none;
}
.mr10{
    margin-right: 10px;
}
</style>
