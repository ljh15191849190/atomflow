<template lang="pug">
    div.container-flud
        div.work-content
            el-row.margin-bottom 
                el-col(:span="!checked ? 4 : 6")
                    el-input(v-model="searchHostIp" placeholder="请输入主机IP" size="small" clearable)
                el-col(:span="!checked ? 4 : 6" :offset="1")
                    el-input(v-model="searchHostName" placeholder="请输入主机名称" size="small" clearable)
                // el-col(:span="4" :offset="1")
                //     el-input(v-model="tagType" placeholder="请输入标签类型" size="small" clearable)
                // el-col(:span="4" :offset="1")
                //     el-input(v-model="tagName" placeholder="请输入标签名称" size="small" clearable)
                el-col(:span="2" :offset="1")   
                    el-button(type="primary" size="small" @click="filterAgentList") 查询
            el-button.oper-icon-btn(v-if="!checked" @click="togoUp('multiple')" size="mini" type="primary" plain title="Agent升级" circle icon="atom-icon-agent-up" :disabled="isdisabled") 
            el-row.tab-content
                el-table(ref="selectHostTable" :data="tableData" stripe size="small" v-loading="isLoading" @select-all="selectAll" @select="selectHostTargets" @selection-change="handleSelectionChange")
                    el-table-column(type="selection" width="45")
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width")
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            div(v-if="column.prop === 'status'").d_flex
                                div.out-status(:class="{'up-out': scope.row[column.prop] === 1, 'down-out': scope.row[column.prop] === 0}")
                                    div.in-status(:class="{'up': scope.row[column.prop] === 1, 'down': scope.row[column.prop] === 0}")
                                span {{ scope.row[column.prop]  === 1 ? 'up' : 'down' }}
                            span(v-else-if="column.prop === 'env'") {{scope.row[column.prop]===0?'普通机器':'测试机器'}}
                            span(v-else) {{scope.row[column.prop]}}
                    el-table-column(label="操作" width="150" v-if="!checked")
                        template(slot-scope="scope")
                            Atom-Icon-Button(type="atom-icon-agent-plan" @iconClick="toPlan(scope.row)" :args="{row: scope.row}" text="用途")
                            Atom-Icon-Button(type="atom-icon-agent-up" :disabled="scope.row.status===0"  @iconClick="togoUp(scope.row)" :args="{row: scope.row}" text="agent升级")
            div.flex-end.pagefooter
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
/**
 * @description Agent管理
 */
import Api from '@api'
import TableFilterHeader from '@lib/TableFilterHeader'
import AtomIconButton from '@lib/AtomIconButton'

const TypeEnable = [
    {value: 'windows', label: 'Windows'},
    {value: 'linux', label: 'Linux'},
    {value: 'darwin', label: 'Darwin'}
]
const agentVersionEnable = [
    {value: '1.1', label: '1.1'},
    {value: '1.2', label: '1.2'},
    {value: '1.3', label: '1.3'}
]
export default {
    name: 'AgentList',
    props: ['checked', 'selectTargets', 'env'],
    data () {
        return {
            searchParams: {},
            searchHostIp: '',
            searchHostName: '',
            osType: '',
            // tagName: '',
            // tagType: '',
            status: '',
            version: '',        
            isLoading: true,
            osTypeList: ['windows', 'linux', 'darwin'],
            tableData: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
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
                    prop: 'osType',
                    label: '操作系统',
                    filters: TypeEnable
                },
                {
                    prop: 'agentVersion',
                    label: 'agent版本',
                    filters: agentVersionEnable
                },
                {
                    prop: 'env',
                    label: '用途'
                }
            ],
            selectedInstances: []
        }
    },
    computed: {
        isdisabled () {
            return this.selectedInstances.length < 1
        }
    },
    methods: {
        toPlan (row) {
            let confiormCon = ''
            if (row.env === 0) {
                confiormCon = '是否确定将本机设置为测试机器？测试机器在进行脚本调试时可能会对机器造成一定影响?'
            } else {
                confiormCon = '确定将本机设置为普通机器？'
            }
            this.$confirm(confiormCon, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //Api
                Api.post('AgentPlan', {env: row.env === 0 ? 1 : 0, id: row.id}, true).then(
                    (res) => {
                        if (res.rst === 'ok') {
                            this.$notify({
                                type: 'success',
                                message: '设置成功'
                            })
                            this.getAgentList()
                        } 
                    })
                })
        },
        togoUp (row) {
            // console.log(this.selectedInstances)
            let arr = this.selectedInstances.find(item => item.status === 0)
            if (arr && arr.status === 0) {
                this.$notify({
                    type: 'warning',
                    message: 'agent状态为down不能升级'
                }) 
                return
            }
            this.$confirm('是否确定将agent升级到最新版本?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //接口 Api
                let arr = this.selectedInstances.length > 0 ? this.selectedInstances : [row]
                Api.post('AgentUpdate', arr, true).then(
                    (res) => {
                        if (res.rst === 'ok') {
                            this.$notify({
                                type: 'success',
                                message: '升级成功'
                            })
                        } 
                    })
                })
        },
        handleSelectionChange (val) {
            this.selectedInstances = val
        },
        selectHostTargets (selectTargetList, row) {
            const isChecked = selectTargetList.indexOf(row) > -1
            let index = this.selectTargets.findIndex(seletedItem => row.id === seletedItem.id)
            // 增加
            if (isChecked && index === -1) {
                this.selectTargets.push(row)
            }
            // 删除
            if (!isChecked && index >= -1) {
                this.selectTargets.splice(index, 1)
            }
            this.$emit('selectRowData', this.selectTargets)
        },
        // 全选
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
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.osType = this.searchParams.osType
            this.version = this.searchParams.agentVersion
            this.pagination.index = 1
            this.getAgentList()
        },
        /**
         * @description 搜索agent
         */
        filterAgentList () {
            this.pagination.index = 1
            this.osType = ''
            this.version = ''
            this.getAgentList()
        },
        /**
         * @description 获取agent列表
         */
        getAgentList () {
            if (this.checked) {
                this.status = 1
            }
            Api.get('getAgentList', {
                limit: this.pagination.size,
                offset: this.pagination.index,
                hostIp: this.searchHostIp,
                hostname: this.searchHostName,
                osType: this.osType,
                status: this.status || 1,
                env: this.env ? this.env : '',
                version: this.version
            }, true).then(
                (res) => {
                    this.isLoading = false
                    if (res.rst === 'ok') {
                        this.tableData = res.data.agentList
                        this.pagination.count = res.data.pageCount
                        // 设置table选中状态
                        if (this.selectTargets) {
                            this.$nextTick(() => {
                                this.tableData.forEach(item => {
                                    let index = this.selectTargets.findIndex(selectedItem => selectedItem.id === item.id)
                                    if (index > -1) {
                                        this.$refs.selectHostTable.toggleRowSelection(item, true)
                                    }
                                }) 
                            })
                        }
                    } else {
                         this.isLoading = false
                     }
                }, () => {
                     this.isLoading = false
                 }
            )
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.getAgentList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getAgentList()
        }
    },
    created () {
        this.getAgentList()
    },
    components: {
        TableFilterHeader, AtomIconButton
    }
}
</script>
<style lang="scss" scoped>
    .atom-content .work-content .tab-content {
        height: calc(100% - 115px);
    }
    .oper-icon-btn{
        margin-left: 10px;
    }
</style>

