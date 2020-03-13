<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item SQL立即执行
        div.atom-content-info.atom-content
            el-row.margin-bottom
                el-col(:span="6")
                    el-select.rw-input(
                        v-model="sqlvalue"
                        placeholder="请选择数据库链接" 
                        clearable
                        size="small"
                        )
                        el-option(v-for="labelItem in categories" :key="labelItem.conn_id" :label="labelItem.conn_id" :value="labelItem.conn_id")
                el-col(:span="2" :offset="1")   
                    el-button(type="primary" size="small" :disabled="!sqlvalue" @click="runExecute") 立即执行
                el-col.ml10(:span="2")   
                    el-button(type="primary" size="small" :disabled="!sqlvalue" @click="runExport") 导出
            el-row.margin-top.normal-widget-width  
                highlight-editor.margin-top(
                            :lang="lang"
                            :langs="langs"
                            :theme= "theme"
                            :editorValue.sync="shellContent"
                            @docChange="docChange"
                            @langChange="langChange"
                            mode="read")
            div.margin-top.normal-widget-width(v-html="contantHtml")
                
</template>
<script>
/**
 * @description Cycle管理详情
 */
import Api from '@api'
import HighlightEditor from '@lib/HighlightEditor'
import defaultLangs from '@/mock/sheet/defaultLangs'
import FileSaver from 'file-saver'

export default {
    name: 'AuditLoggerDetail',
    data () {
        return {
            // 编辑器属性
            theme: 'mdn-like',
            lang: 'shell',
            langs: defaultLangs,
            shellContent: '',
            categories: [],
            sqlvalue: '',
            contantHtml: ''
        }
    },
    methods: {
        docChange (value) {
            this.shellContent = value
        },
        langChange (lang) {
            this.lang = lang
            this.shellContent = ''
        },
        //执行
        runExecute () {
            Api.post('runExecute', {
                conn_id: this.sqlvalue,
                sql: this.shellContent
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.contantHtml = res.data.results
                    } else if (res.err_code === 6001) {
                        this.$notify({
                            type: 'error',
                            title: '失败',
                            message: 'sql执行失败'
                        })
                    } 
                }
            )
        },
        //导出
        runExport () {
            Api.get('runExecute', {
                conn_id: this.sqlvalue,
                sql: this.shellContent,
                csv: true
            }, true, 'blob').then(
                (res) => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, 'sql.csv')
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '导出成功'
                    })
                }
            )
        },
        init () {
            Api.get('getLinkList', {
                limit: 50,
                offset: 1,
                conn_type: 'jdbc'
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.categories = res.data.conn_list
                    }
                }
            ) 
        }
    },
    created () {
        this.init()
    },
    components: {
        HighlightEditor
    }
}
</script>
<style lang="scss" scoped>
    .atom-content-info{
        height: calc(100% - 78px);
        padding: 32px 64px;
        background: #fff;
        margin-left: 16px;
        margin-right: 16px;
    }
    .normal-widget-width {
        width: 660px;
    }
    .atom-content{
        overflow: auto;
    }
    .el-select {
        width: 100%;
    }
    .ml10{
        margin-left:10px;
    }
</style>

