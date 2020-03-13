<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item 分批作业列表      
    div.atom-content
        div.work-content
            el-button.breadcrumb-btn(type="primary" size="small" @click="addTask" icon="el-icon-plus") 新增分批作业
            el-row.margin-bottom
                el-col(:span="4")             
                    el-input(placeholder="请输入作业名称" clearable size="small" v-model="name")
                el-col(:span="4" :offset="1")  
                    el-input(placeholder="请输入创建者" clearable size="small" v-model="owner")
                el-col(:span="8" :offset="1")                        
                    el-date-picker(
                        clearable
                        v-model="timeRange" 
                        type="datetimerange" 
                        range-separator="-" 
                        start-placeholder="请选择记录开始时间" 
                        end-placeholder="请选择记录结束时间" 
                        size="small" 
                        :default-time="['00:00:00', '23:59:59']"
                    )
                el-col(:span="2" :offset="1")   
                        el-button(type="primary" size="small" @click="query") 查询
            el-row.tab-content
                el-table(
                    :data="tableData"
                    stripe
                    size="small"
                )
                    el-table-column(label="作业名称" fixed="left" prop="name")
                        template(slot-scope="scope")
                            span.theme-color.column-name(@click="toLink(scope.row)") {{scope.row.name}}
                    el-table-column(
                        v-for="column in columns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                        :min-width="column.minWidth")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'start_time'") {{formatter(scope.row[column.prop])}}
                            span(v-else) {{scope.row[column.prop]}}
                    el-table-column(label="操作" width="150")
                        template(slot-scope="scope")
                            Atom-Icon-Button(type="atom-icon-work-close" v-if="scope.row.start_switch===0" @iconClick="runOrPauseWork" :args="{id: 'pause', row: scope.row}" text="关闭")
                            Atom-Icon-Button(type="atom-icon-work-open" v-else @iconClick="runOrPauseWork"  :args="{id: 'start', row: scope.row}" text="开启")  
                            Atom-Icon-Button(type="atom-icon-delete" @iconClick="deleteRelation" :args="{row: scope.row}" text="删除")                      
            el-row
                div.flex-end.pagefooter
                    el-pagination(
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="pagination.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pagination.size"
                        :total="pagination.total"
                        layout="sizes, prev, pager, next"
                        :page-count="pagination.count")
</template>
<script>
import AtomIconButton from '@lib/AtomIconButton'
import DateUtils from '@server/date-utils'
import Api from '@api'

export default {
    data () {
        return {
            tableData: [],
            columns: [
                {
                    prop: 'owner',
                    label: '创建者'
                },
                {
                    prop: 'start_time',
                    label: '开始时间'
                },
                {
                    prop: 'remote_host_count',
                    label: '目标机器数'
                }
            ],
            name: '',
            owner: '',
            timeRange: [],
            pagination: {
                index: 1,
                count: 1,
                size: 20
            }
        }
    },
    methods: {
        query () {
            this.pagination.index = 1
            this.filterDagDetail()
        },
        addTask () {
            this.$router.push({path: '/addwork', query: {batch: 'batch'}}) 
        },
        toLink (row) {
            this.$router.push('/batchList/' + row.id)
        },
        formatter (time) {
            if (!time) {
                return ''
            }
            return DateUtils.formate(time, 'zone')
        },
        deleteRelation (obj) {
            this.$confirm('确定要删除该作业吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('delBatchWork', { batch_id: obj.row.id }, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            this.$notify({
                                title: '通知',
                                type: 'success',
                                message: '删除成功!'
                            })
                            this.filterDagDetail()
                        } else {
                            this.$notify({
                                title: '通知',
                                type: 'error',
                                message: '删除失败, 请稍后重试!'
                            })
                        }
                    }
                )
            }).catch(() => {
            })
        },
        runOrPauseWork (obj) {
            let vm = this
            let isPause = obj.id === 'pause'
            let tip = isPause ? '确定要暂停该作业吗?' : '确定要启动该作业吗?'
            vm.$confirm(tip, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.put('pausedBatchWork', {
                    isPaused: isPause,
                    batch_id: obj.row.id
                }, true).then(
                    (res) => {
                        let msg = isPause ? '作业' + obj.row.name + '暂停成功' : '作业' + obj.row.name + '启动成功'
                        this.$notify({
                            title: '通知',
                            type: 'success',
                            message: msg
                        })
                        this.filterDagDetail()
                    }, () => {
                        this.$notify({
                            title: '通知',
                            type: 'error',
                            message: '操作失败, 请稍后重试!'
                        })
                    }
                )
            }).catch(() => {
            })
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.filterDagDetail()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.filterDagDetail()
        },
        filterDagDetail () {
            let rst = {}
            if (this.timeRange && this.timeRange.length) {
                rst.dateStart = Date.parse(new Date(this.timeRange[0])) / 1000
                rst.dateEnd = Date.parse(new Date(this.timeRange[1])) / 1000
            }
            Api.get('getBatchWorkList', {
                batch_name: this.name,
                limit: this.pagination.size,
                offset: this.pagination.index,
                owner: this.owner,
                start: rst.dateStart,
                end: rst.dateEnd
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.tableData = res.data.batch_list
                        this.pagination.count = res.data.pageCount
                    }
                }, () => {
                }
            )
        }
    },
    created () {
        this.filterDagDetail()
    },
    components: {
        AtomIconButton
    }
}
</script>
<style lang="scss" scoped>
.el-date-editor.el-input__inner {
  width: 100% !important;
}
</style>
