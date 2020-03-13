<template lang="pug">
    div.target-host-container
        el-row
            el-col(:span="6")
                el-input(v-model="searchHostIp" placeholder="请输入主机IP" sise="mini" suffix-icon="el-icon-search" @change="filterAgentList")
            el-col(:span="6" :offset="1")
                el-input(v-model="searchHostName" placeholder="请输入主机名称" sise="mini" suffix-icon="el-icon-search" @change="filterAgentList")
            el-col(:span="6" :offset="1")
                el-select(
                    filterable
                    :clearable="true"
                    placeholder="请选择系统类型"
                    v-model="searchOsType"
                    @change="filterAgentList"
                    value-key="id"
                )
                    el-option(
                        v-for="(item, index) in osTypeList"
                        :key="index"
                        :value="item"
                        :label="item"
                    )
        div.margin-top
            el-table(ref="selectHostTable" :data="tableData" stripe size="small" height="440" @select-all="selectAll" @select="selectHostTargets" v-loading="isLoading")
                el-table-column(type="selection" width="55")
                el-table-column(
                    v-for="column in columns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width")
                    template(slot-scope="scope")
                        div(v-if="column.prop === 'status'").d_flex
                            div.out-status(:class="{'up-out': scope.row[column.prop] === 1, 'down-out': scope.row[column.prop] === 0}")
                                div.in-status(:class="{'up': scope.row[column.prop] === 1, 'down': scope.row[column.prop] === 0}")
                            span {{ scope.row[column.prop]  === 1 ? 'UP' : 'DOWN' }}
                        span(v-else) {{scope.row[column.prop]}}
            div.flex.pagefooter
                el-pagination(
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="pagination.index"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pagination.size"
                    layout="sizes, prev, pager, next"
                    :total="pagination.total"
                    :page-count="pagination.count"
                )
</template>

<script>
import AgentApi from '@api/agent.api'
export default {
    props: ['selectTargets', 'fileType'],
    data () {
        return {
            searchHostIp: '',
            searchHostName: '',
            searchOsType: '',
            isLoading: true,
            pagination: {
                index: 1,
                count: 1,
                size: 10
            },
            tableData: [],
            osTypeList: ['windows', 'linux', 'darwin'],
            columns: [
                {
                    prop: 'hostIp',
                    label: '主机IP'
                },
                {
                    prop: 'hostname',
                    label: '主机名称'
                },
                {
                    prop: 'port',
                    label: '端口号'
                },
                {
                    prop: 'status',
                    label: 'Agent状态'
                },
                {
                    prop: 'version',
                    label: '版本'
                }
            ]
        }
    },
    created () {
        this.setOsType()
        this.getAgentList()
    },
    methods: {
        /**
         * @description 模糊搜索agent列表
         */
        filterAgentList () {
            this.pagination.index = 1
            this.getAgentList()
        },
        /**
         * @description 设置操作系统类型
         */
        setOsType () {
            if (this.fileType) {
                if (this.fileType === 'powershell' || this.fileType === 'bat') {
                    this.searchOsType = 'windows'
                } else {
                    this.searchOsType = 'linux'
                }
            }
        },  
        /**
         * @description 获取agent列表
         */
        getAgentList () {
            AgentApi.getWindowAgentList({ offset: this.pagination.index, limit: this.pagination.size }, { hostIp: this.searchHostIp, hostname: this.searchHostName, osType: this.searchOsType }).then(
                (res) => {
                    this.isLoading = false
                    if (res.rst === 'ok') {
                        this.tableData = res.data.agents
                        this.pagination.count = res.data.pageCount
                        // 设置table选中状态
                        this.$nextTick(() => {
                            this.tableData.forEach(item => {
                                let index = this.selectTargets.findIndex(selectedItem => selectedItem.id === item.id)
                                if (index > -1) {
                                    this.$refs.selectHostTable.toggleRowSelection(item, true)
                                }
                            }) 
                        })
                    } else {
                        this.$notify({
                            title: '通知',
                            type: 'error',
                            message: '获取目标主机失败!'
                        })
                    }
                }, () => {
                    this.isLoading = false
                    this.$notify({
                        title: '通知',
                        type: 'error',
                        message: '获取目标主机失败!'
                    })
                }
            )
        },
        /**
         * @description 全选事件
         */
        selectAll (selectTargetList) {
            // 全部选中
            if (selectTargetList.length) {
                selectTargetList.forEach(item => {
                    this.selectHostTargets(selectTargetList, item)
                })
            // 全部取消选中
            } else {
                this.tableData.forEach(item => {
                    this.selectHostTargets(selectTargetList, item)
                })
            }
        },
        /**
         * @description 勾选触发事件
         */
        selectHostTargets (selectTargetList, row) {
            const isChecked = selectTargetList.indexOf(row) > -1
            let index = this.selectTargets.findIndex(seletedItem => row.id === seletedItem.id)
            // 勾选且没在选中的目标机器中, 增加
            if (isChecked && index === -1) {
                this.selectTargets.push(row)
            }

            // 反勾选且在选中的目标机器中, 清除
            if (!isChecked && index >= -1) {
                this.selectTargets.splice(index, 1)
            }

            this.$emit('selectTargetList', this.selectTargets)
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getAgentList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getAgentList()
        }
    }
}
</script>
<style lang="scss" scoped>

</style>

