<template lang="pug">
    div.full-container(v-if="sheetDetail")
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right" v-if="$route.query.IsTools")
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/tools' }") 常用工具列表
                el-breadcrumb-item 工具详情
            el-breadcrumb(separator-class="el-icon-arrow-right" v-else)
                el-breadcrumb-item 原子作业平台
                el-breadcrumb-item(:to="{ path: '/sheetList/tableview' }") 自定义工具列表
                el-breadcrumb-item 工具详情
        div.sheet-content
            div.container-flud
                div.atom-content
                    el-row
                        el-col(:span="8")
                            span.read-only 工具名称:
                            span.read-only.value {{sheetDetail.name}}              
                        el-col(:span="8")
                            span.read-only 类型:
                            span.read-only.value {{sheetDetail.shareType === 1 ?'共享' : '私有'}}      
                        el-col(:span="8")
                            span.read-only 脚本语言:
                            span.read-only.value {{sheetDetail.type}}  
                    //- AT-221 脚本管理页面，点击查看脚本，有脚本返回码的脚本，查看信息页面没有显示
                    el-row.margin-top  
                        el-col(:span="8")  
                            span.read-only 脚本标签:
                            span.read-only.value(v-for="item in sheetDetail.tags") {{item.name}}
                        el-col(:span="8")  
                            span.read-only 版本:
                            i.atom-icon-sheet-down.theme-color.download-icon(@click="downLoadSheetFile")
                        el-col(:span="8")  
                            span.read-only 最后修改时间:
                            span.read-only.value {{sheetDetail.updateDate | time}} 
                    el-row.margin-top(v-if="sheetDetail.type==='sql'")  
                        el-col(:span="8")  
                            span.read-only 数据库连接:
                            span.read-only.value {{sheetDetail.description}}
                    el-row.margin-top(v-if="sheetDetail.type==='ansible'")  
                        el-col(:span="8")  
                            span.read-only 入口文件名:
                            span.read-only.value {{sheetDetail.book_name}}
                        el-col(:span="16")  
                            span.read-only 入口文件说明:
                            span.read-only.value {{sheetDetail.remark}}
                    el-row.margin-top  
                        el-col(:span="24")  
                            span.read-only 说明:
                            span.read-only.value {{sheetDetail.description}} 
                    el-row
                        highlight-editor.margin-top(
                            v-if="sheetDetail.type!=='ansible'"
                            :lang="sheetDetail.type"
                            :langs="langs"
                            :theme= "theme"
                            :editorValue.sync="shellContent"
                            :readOnly="true"
                            mode="read")
                        div.pad-left.mt20(v-else)
                            span 
                    template(v-if="sheetDetail.type!=='sql' && sheetDetail.type!=='ansible'")
                        el-row.return-code-pane
                            span.read-only 脚本返回码:
                            div.return-code
                                TableInput(:tableInputConfig="returnConfig" :tableData="version.rstCode")
                        div.variable
                            span.read-only 脚本变量:
                            div.variables-pane
                                TableInput(:tableInputConfig="variableConfig" :tableData="version.params")
                        el-row
                            span.read-only 自定义样式参数:
                            el-input(v-model="version.customParamsAttrs" :autosize="{ minRows: 4}" type="textarea" :readonly="true")    
        div.sheet-footer
            el-button(size="small" @click="goBack") 返回
            el-button.run-btn(size="small" @click="runWork" type="primary") 执行
            el-button(v-if="sheetDetail.type!=='sql' && sheetDetail.type!=='ansible'" size="small" @click="showSriptTest" type="primary") 脚本测试
            el-button(size="small" @click="showVersionHistory" type="primary" plain) 版本历史
        el-dialog.version-history-dialog(v-if="isShowVersionHistory" title="版本历史" :visible.sync="isShowVersionHistory" :before-close="closeVersionHistoryDialog" width="600px")
            div.dialog-body
                Version-History(:versions="versions" :sheetDetail="sheetDetail")
            div.dialog-footer(slot="footer")
                span.tip
                    span 提醒: 
                    span 默认显示最近20条版本记录
                el-button(type="primary" size="small" @click="closeVersionHistoryDialog") 确定
</template>
<script>
import Api from '@api'
import HighlightEditor from '@lib/HighlightEditor'
import defaultLangs from '@/mock/sheet/defaultLangs'
import TableInput from '@lib/TableInput'
import DateUtil from '@server/date-utils'
import VersionHistory from './VersionHistory'
import SheetTest from './SheetTest'
import FileSaver from 'file-saver'

export default {
    data () {
        return {
            sheetDetail: null,
            theme: 'mdn-like',
            langs: defaultLangs,
            version: {},
            versions: [],
            shellContent: '',
            returnConfig: {
                columns: [
                    { prop: 'code', label: '返回码' },
                    { prop: 'desc', label: '含义' }
                ]
            },
            variableConfig: {
                columns: [
                    { prop: 'key', label: '变量' },
                    { prop: 'name', label: '变量名称' },
                    { prop: 'default', label: '默认值' }
                ]
            },
            isShowVersionHistory: false
        }
    },
    watch: {
        sheetId () {
            this.refreshData()
        }
    },
    methods: {
        refreshData () {
          Api.get('getSheetById', {fileId: this.sheetId}, true).then(
                data => {
                    this.sheetDetail = data.data
                    this.versions = data.data.versions
                    if (this.versions.length > 0) {
                        this.version = this.versions[0]
                        if (this.version.extInfo) {
                            this.sheetDetail.book_name = this.version.extInfo.book_name
                            this.sheetDetail.remark = this.version.extInfo.remark
                        }
                        this.setShellContent(this.version.gitOid)   
                    }
                }
            ) 
        },
        /** 
         * @description  设置脚本内容
         * @param {gitOid} gitOid
         * */
        setShellContent (gitOid) {
            Api.get('getShellContent', {fileId: this.sheetId, version: gitOid}, true).then(
                data => {
                    if (data.rst === 'ok') {
                        this.shellContent = data.data
                    }
                }
            )
        },
        /** 
         * @description  立即执行
         * */
        runWork () {
            // this.$router.push('/sheetdetail/' + this.sheetId + '/run')   
            if (this.sheetDetail.type === 'sql') {
                this.$router.push({path: '/addsql', query: {fileId: this.sheetDetail.id}})
            } else if (this.sheetDetail.type === 'ansible') {
                this.$router.push({path: '/addansible', query: {fileId: this.sheetDetail.id}})
            } else {
                this.$router.push({path: '/addwork', query: {fileId: this.sheetDetail.id}}) 
            }
        },
        /**
         * @description 返回
         */
        goBack () {
            if (this.$route.query.IsTools) {
                this.$router.push('/tools')
            } else {
                this.$router.push('/sheetList/tableview')
            }
        },
        /**
         * @description 查看历史版本
         */
        showVersionHistory () {
            this.isShowVersionHistory = true
        },
        closeVersionHistoryDialog () {
            this.isShowVersionHistory = false
        },
        // 脚本测试
        showSriptTest () {
            if (this.$route.query.IsTools) { //常用工具
                this.$router.push({path: '/sheettest', query: {sheetId: this.sheetId, IsTools: 'tools'}})
            } else {
                this.$router.push({path: '/sheettest', query: {sheetId: this.sheetId}})
            }
        },
        /**
         * @description 下载脚本文件
         */
        downLoadSheetFile () {
            Api.get('downLoadSheetFile', {gitOid: this.version.gitOid, type: this.sheetDetail.type, name: this.sheetDetail.name}, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, this.version.gitPath)
                }
            )
        }
    },
    created () {
        this.refreshData()
    },
    filters: {
        time: (value) => {
            return value ? DateUtil.formate(value) : ''
        }
    },
    computed: {
        sheetId () {
            return this.$route.params.id
        }
    },
    components: {
        TableInput,
        HighlightEditor,
        VersionHistory,
        SheetTest
    }
}
</script>
<style lang="scss" scoped>
    .dialog-footer{
        justify-content: flex-end;
    }
    .mt20{
        margin-top:20px;
    }
</style>
