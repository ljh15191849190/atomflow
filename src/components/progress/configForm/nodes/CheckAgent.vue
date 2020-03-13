<template lang="pug">
   div.sheet-list-container 
    div.query-input
        el-input(placeholder='根据目标机器进行过滤' size="mini" v-model="filterRules.keyword" clearable)
    ul.sheet-list
       li(v-for="agent in AgentList" :key="agent.id" :class="{'actived': checkedAgent=== agent.agentAddress}" @click="setSheetInfo(agent)") 
            span {{ `${agent.agentAddress}（${agent.osType}）` }}
    el-pagination(
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagination.index"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        :pager-count="5"
        layout="total, sizes, prev, pager, next"
        :page-count="pagination.count")
</template>
<script>
/**
 * @description 
 */
import Api from '@api'

export default {
    props: {
        checkedAgent: {
            type: String,
            default: null
        },
        checkedAgentUnid: {
            type: String,
            default: null
        }
    },

    data () {
        return {
            filterRules: {
                keyword: null
            },
            AgentList: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            }
        }
    },

    methods: {
        /**
         * @description 查询agent列表
         */
        queryAgents () {
            let params = Object.assign({}, this.filterRules, this.pagination)
            Api.get('getAgentList', {
                limit: params.size,
                offset: params.index,
                hostIp: params.keyword,
                status: 1
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.AgentList = res.data.agentList
                        this.pagination.count = res.data.pageCount
                    } 
                }
            )
        },

        setSheetInfo (agent) {
            this.computedSheet = agent.agentAddress
            this.$emit('update:checkedAgentUnid', agent.host_unique_id)
        },

        handleCurrentChange (index) {
            this.pagination.index = index
            this.queryAgents()
        },

        handleSizeChange (size) {
            this.pagination.size = size
            this.pagination.index = 1
            this.queryAgents()
        }
    },

    computed: {
        computedSheet: {
            set (val) {
                this.$emit('update:checkedAgent', val)
            },
            get () {
                return this.checkedAgent
            }
        }
    },

    watch: {
       'filterRules.keyword' () {
           this.queryAgents()
       } 
    },

    created () {
        this.queryAgents()
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
