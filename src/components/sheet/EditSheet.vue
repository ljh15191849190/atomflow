<template lang="pug">
  div.full-container
    el-row.breadcrumb-container
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(v-if="showType !== 'add' || $route.query.from" :to="{ path: '/sheetList/tableview' }") 自定义工具列表
            el-breadcrumb-item {{showMunuTitle}}
    div.sheet-content
        div.container-flud
            div.atom-content
                el-form(ref="sheetForm" label-width="110px")
                    el-row
                        el-col(:span="9")
                            el-form-item.is-required(label="工具名称")
                                el-input.rw-input(
                                    v-model.trim="sheetForm.sheetName"
                                    v-validate="rules.sheetName"
                                    :name="'sheetName'"
                                    placeholder="请输入脚本名称"
                                    data-vv-as="脚本名称"
                                    :class="{'input': true, 'is-danger': errors.has('sheetName')}"
                                    maxlength="20"
                                    size="small"
                                )
                                span.validator-error.is-danger(v-if="errors.has('sheetName')") {{ errors.first('sheetName') }}
                        el-col(:span="10")
                            el-form-item(label="脚本标签")
                                el-select.rw-input(
                                    v-model="sheetForm.label"
                                    placeholder="请输入新标签" 
                                    size="small"
                                    multiple
                                    filterable
                                    allow-create
                                    :loading="loadingLabel"
                                    @change="labelChange"
                                    value-key="id" 
                                    )
                                    el-option(v-for="labelItem in categories" :key="labelItem.id" :label="labelItem.name" :value="labelItem")
                    el-row
                        el-col(:span="9")
                            el-form-item.is-required(label="脚本内容" v-if="!this.sheetForm.id")
                                el-radio-group(v-model="addSheetMode" @change="sheetModeChange")
                                    el-radio(label="1" value="1") 在线编辑
                                    el-radio(label="2" value="2") 本地脚本
                        el-col(:span="10")
                            el-form-item.is-required(label="存放目录")
                                el-cascader(
                                    :options="treeData"
                                    :props="props"
                                    v-model="sheetForm.nodeIds"
                                    size="small"
                                    change-on-select
                                    v-validate="rules.nodeIds"
                                    :name="'nodeIds'"
                                    data-vv-as="存放目录"
                                    :class="{'is-danger': errors.has('nodeIds')}"
                                )
                                el-button.add-btn(size="small" @click="addFolder") 新建目录
                                span.validator-error.is-danger(v-if="errors.has('nodeIds')") {{ errors.first('nodeIds') }}
                    el-row  
                        el-col(:span="17")               
                            highlight-editor.pad-left(
                                v-if="addSheetMode !== '2' && editor.lang!=='ansible'"
                                :editorValue.sync="sheetForm.editorDoc"
                                :langs="editor.langs"
                                :lang="editor.lang"
                                :theme="editor.theme"
                                :isShowThemes="editor.isShowThemes"
                                @docChange="docChange"
                                @langChange="langChange"
                             )
                            div.pad-left(v-else)
                                el-radio-group(v-model="editor.lang" size="mini")
                                    el-radio-button(v-for="langItem in editor.langs" :key="langItem.label" :label="langItem.label")
                                el-upload(
                                    :disabled="sheetForm.id ? true : false"
                                    drag
                                    :multiple="false"
                                    :limit="1"
                                    action="at/v1/script/file/upload"
                                    :on-change="handleChange"
                                    :on-remove="handleRemove"
                                    :auto-upload="false")
                                    i.el-icon-upload
                                    div.el-upload__text 将文件拖到此处，或
                                        em 点击上传
                    el-form-item
                        el-input.hidden(v-model="sheetForm.editorDoc"
                           v-validate="rules.editorDoc"
                            :name="'editorDoc'"
                            data-vv-as="脚本内容"
                            :class="{'input': true, 'is-danger': errors.has('editorDoc')}"
                        )
                        span.validator-error.is-danger(v-if="errors.has('editorDoc')") {{ errors.first('editorDoc') }}
                    div.pad-left.explanation 说明：在线编辑最大支持20000字符,   上传脚本最大支持15Kb。超过上限保存失败。
                    template(v-if="editor.lang!=='sql' && editor.lang!=='ansible'")
                        el-row
                            div#return-code
                                span.pad-left.title 脚本返回码:
                                el-tooltip.pos-right(:content="tip.returnCode" placement="right")
                                    i.atom-icon-sheet-help.theme-color.help-icon
                            el-col(:span="17") 
                                TableInput.pad-left(:tableInputConfig="returnConfig" :tableData="returnCode")
                        el-row   
                            div#variables 
                                span.pad-left.title 脚本变量:
                                el-tooltip.pos-right(:content="tip.variable" placement="right")
                                    i.atom-icon-sheet-help.theme-color.help-icon
                            el-col(:span="17") 
                                TableInput.pad-left(:tableInputConfig="variableConfig" :tableData="sheetForm.variables")
                        el-row  
                            div.pad-left.title.hight-setup(@click="showHiddenSetUp") 高级设置
                            div(v-if="isShowhightSetup")
                                div.pad-left.title 自定义样式参数
                                el-col(:span="17") 
                                    el-input.pad-left(v-model="sheetForm.customParamsAttrs" :autosize="{ minRows: 4}" type="textarea" placeholder="请输入自定义样式参数(json字符串)")   
                    template(v-if="editor.lang==='ansible'")
                        el-row
                            el-col(:span="9")
                                el-form-item.is-required(label="入口文件名")
                                    el-input.rw-input(
                                        v-model.trim="sheetForm.book_name"
                                        placeholder="请输入入口文件名"
                                        size="small"
                                        v-validate="rules.book_name"
                                        :name="'book_name'"
                                        data-vv-as="入口文件名"
                                        :class="{'input': true, 'is-danger': errors.has('book_name')}"
                                    )
                                    span.validator-error.is-danger(v-if="errors.has('book_name')") {{ errors.first('book_name') }}
                        el-row
                            el-col(:span="9")
                                el-form-item(label="入口文件说明")
                                    el-input.rw-input(
                                        v-model.trim="sheetForm.remark"
                                        placeholder="请输入入口文件说明"
                                        size="small"
                                    )
                        el-row 
                            div.pad-left.title.host-required host.ini信息：
                            el-col(:span="17")
                                el-input.pad-left(
                                    v-model="sheetForm.host"
                                    :autosize="{ minRows: 4}" 
                                    type="textarea"
                                    v-validate="rules.host"
                                    :name="'host'"
                                    data-vv-as="host.ini信息"
                                    :class="{'input': true, 'is-danger': errors.has('host')}"
                                )
                                span.validator-error.is-danger.ml40(v-if="errors.has('host')") {{ errors.first('host') }}
                    el-row  
                        div.pad-left.title 说明：
                        el-col(:span="17") 
                            el-input.pad-left(v-model="sheetForm.description" :autosize="{ minRows: 4}" type="textarea" maxlength="200")    
    Add-Folder(v-if="addFolderVisible" :visible="addFolderVisible" @closeDialog="closeModal" @insertNode="insertNode" :folders="treeData")     
    div.sheet-footer
        el-button(size="small" @click="backSheetList") 返回
        el-button(type="primary" size="small" @click="submitForm" :disabled="disabled") 确定
</template>
<script>
/**@augments 编辑/新增脚本
 * @author xinghua.wen
 */
import axios from 'axios'
import Utils from '@/server/Utils'
import defaultLangs from '@/mock/sheet/defaultLangs'
import TableInput from '@lib/TableInput'
import HighlightEditor from '@lib/HighlightEditor'
import { Validator } from 'vee-validate'
import AddFolder from './AddFolder'
import Api from '@api'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            showType: '',
            returnCode: [{code: '0', desc: '成功'}],
            sheetForm: {
                sheetName: '',
                variables: [],
                label: [],
                editorDoc: '',
                nodeIds: [],
                nodeId: '',
                customParamsAttrs: '',
                host: '',
                remark: '',
                book_name: '',
                description: ''
            },
            addSheetMode: '1',
            // 编辑器属性
            editor: {
                lang: '',
                langs: defaultLangs,
                theme: '',
                isShowThemes: false
            },
            srcEditObj: {
                lang: '',
                text: ''
            },
            loadingLabel: false,
            categories: [],
            treeData: [],
            folderData: [],
            rules: {
                sheetName: {
                    required: true, 
                    uniqueRule: true 
                },
                nodeIds: {
                    required: true
                },
                book_name: {
                    required: true
                },
                host: {
                    required: true
                },
                editorDoc: {
                    required: true
                }
            },
            props: {
                value: 'id',
                label: 'name'
            },
            uploadFile: null,
            disabled: false,
            editFileName: '',
            isShowhightSetup: false,
            returnConfig: {
                columns: [
                    { prop: 'code', label: '返回码' },
                    { prop: 'desc', label: '含义' }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加返回值'
            },
            variableConfig: {
                columns: [
                    { prop: 'key', label: '变量' },
                    { prop: 'name', label: '变量名称' },
                    { prop: 'default', label: '默认值' }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加变量'
            },
            tip: {
                returnCode: '返回码用来标识脚本执行情况，一般在编排会根据返回码来确定下一个流程应该执行什么',
                variable: '在执行脚本时通过改变变量，达到快速调整脚本的目的'
            },
            addFolderVisible: false
        }
    },
    methods: {
        docChange (value) {
            this.sheetForm.editorDoc = value
        },
        langChange (lang) {
            this.editor.lang = lang
            if (this.showType === 'edit' || this.$route.query.clone) {
                if (this.editor.lang === this.srcEditObj.lang) {
                    this.sheetForm.editorDoc = this.srcEditObj.text
                } else {
                    this.sheetForm.editorDoc = ''
                }
            } else {
                this.sheetForm.editorDoc = ''
            }
        },
        sheetModeChange () {
            if (this.addSheetMode === '1') {
                if (this.editor.lang === this.srcEditObj.lang) {
                    this.sheetForm.editorDoc = this.srcEditObj.text
                } else {
                    this.sheetForm.editorDoc = ''
                }
            }
        },
        labelChange () {
            if (!this.sheetForm.label.length) {
                return
            }
            let lastLabel = this.sheetForm.label[this.sheetForm.label.length - 1]
            if (lastLabel.id) {
                return
            }

            Api.post('saveLabel', {name: lastLabel}).then(
                res => {
                    let labelObj = {id: res.data.tagId, name: lastLabel}
                    this.categories.push(labelObj)                
                    this.$nextTick(
                        () => {
                            this.sheetForm.label.splice(this.sheetForm.label.length - 1, 1, labelObj) 
                        }
                    )
                }
            )
        },
        getFormatTagIds () {
            let tagIds = []
            this.sheetForm.label.forEach((item) => {
                let tagItem = {id: item.id}
                tagIds.push(tagItem)
            })

            return tagIds
        },
        saveSubmitForm () {
            this.disabled = true
            let nodeId = this.sheetForm.nodeIds.length ? this.sheetForm.nodeIds[this.sheetForm.nodeIds.length - 1] : ''
            let ext_info = {
                    book_name: this.sheetForm.book_name,
                    remark: this.sheetForm.remark,
                    host: this.sheetForm.host
                }
            let params = {
                nodeId: nodeId,
                name: this.sheetForm.sheetName,
                type: this.editor.lang,
                content: this.sheetForm.editorDoc,
                params: this.sheetForm.variables,
                tags: this.getFormatTagIds(),
                rstCode: this.returnCode,
                extInfo: JSON.stringify(ext_info),
                //新增自定义变量属性
                customParamsAttrs: this.sheetForm.customParamsAttrs,
                description: this.sheetForm.description
            }
            
            // 创建/克隆
            // eslint-disable-next-line
            if (!this.sheetForm.id || this.sheetForm.id && this.$route.query.clone) {
                if (this.addSheetMode === '1' && this.editor.lang !== 'ansible') {
                    Api.post('saveSheet', params).then(
                        res => {
                            if (res.rst === 'ok') {
                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '新建脚本文件成功'
                                })
                                this.$router.push('/sheetList/tableview')
                            } else {
                                if (res.err_code && res.err_code === 1001) {
                                    this.$notify({
                                        title: '提示',
                                        type: 'error',
                                        message: res.msg
                                    })
                                }
                            }
                        }, () => {
                            this.disabled = false
                        }
                    )
                } else {
                    let formData = new FormData()
                    formData.append('file', this.uploadFile)
                    formData.append('nodeId', nodeId)
                    formData.append('name', this.sheetForm.sheetName)
                    formData.append('type', this.editor.lang)
                    formData.append('params', JSON.stringify(this.sheetForm.variables))
                    //新增rstCode
                    formData.append('rstCode', JSON.stringify(this.returnCode))
                    formData.append('tags', JSON.stringify(this.getFormatTagIds()))
                    //新增自定义变量属性
                    formData.append('customParamsAttrs', this.sheetForm.customParamsAttrs)
                    formData.append('description', this.sheetForm.description)
                    formData.append('extInfo', JSON.stringify(ext_info))
                    // 改变element自有xhr方式，使用axios，与系统整体保持一致
                    // AT-495【脚本管理】创建脚本，上传本地脚本，点击确认，报错
                    Api.post('uploadSheet', formData, true, {headers: {'Content-Type': 'multipart/form-data'}}).then(
                        res => {
                            if (res.rst === 'ok') {
                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '上传脚本文件成功'
                                })
                                this.$router.push('/sheetList/tableview')
                            } else if (res.rst === 'err') {
                                if (res.err_code && res.err_code === 1001) {
                                    this.$notify({
                                        title: '提示',
                                        type: 'error',
                                        message: res.msg
                                    })
                                }
                            } else {
                                this.$notify({
                                    title: '通知',
                                    type: 'error',
                                    message: '创建脚本失败，请重新创建!'
                                })
                                this.disabled = false
                            }
                        }, () => {
                            this.disabled = false
                        }
                    )
                }
                
                return
            }

            let idParam = {fileId: this.sheetForm.id}
            let updateParams = {...idParam, ...params}
            updateParams.extInfo = JSON.parse(updateParams.extInfo)
            Api.put('updateSheet', updateParams, true).then(
                res => {
                    if (res.rst === 'ok') {
                        this.$notify({
                            type: 'success',
                            message: '更新脚本文件成功'
                        })
                        this.$router.push('/sheetList/tableview')
                    } else {
                        if (res.err_code && res.err_code === 1001) {
                            this.$notify({
                                title: '提示',
                                type: 'error',
                                message: res.msg
                            })
                        }
                    }
                }, () => {
                    this.disabled = false
                }
            )
        },
        submitForm () {
            this.$validator.validateAll().then(valid => {
                if (valid) {
                    if (this.addSheetMode === '1' && this.editor.lang !== 'ansible') {
                        let obj = {content: this.sheetForm.editorDoc, type: this.editor.lang}
                        Api.post('sheetCommandCheck', obj, true).then(
                            res => {
                                if (res.rst === 'ok') {
                                    if (res.data.ban && res.data.ban.length > 0) {
                                        this.$notify({
                                            title: '提示',
                                            type: 'error',
                                            message: `存在禁止命令: ${res.data.ban.join(',')} 不能保存`
                                        })
                                    } else if (res.data.warn && res.data.warn.length > 0) {
                                        this.$confirm(`存在危险命令:${res.data.warn.join(',')}，是否继续保存?`, '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                        }).then(() => {
                                            this.saveSubmitForm()
                                        })
                                    } else {
                                        this.saveSubmitForm()
                                    }
                                }
                            }) 
                    } else if (this.addSheetMode === '2' && this.editor.lang !== 'ansible') {
                        // 上传危险命令校验
                        let formData = new FormData()
                        formData.append('file', this.uploadFile)
                        formData.append('type', this.editor.lang)
                        Api.post('sheetUploadCheck', formData, true, {headers: {'Content-Type': 'multipart/form-data'}}).then(
                            res => {
                                if (res.rst === 'ok') {
                                    if (res.data.ban && res.data.ban.length > 0) {
                                        this.$notify({
                                            title: '提示',
                                            type: 'error',
                                            message: `存在禁止命令: ${res.data.ban.join(',')} 不能保存`
                                        })
                                    } else if (res.data.warn && res.data.warn.length > 0) {
                                        this.$confirm(`存在危险命令:${res.data.warn.join(',')}，是否继续保存?`, '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                        }).then(() => {
                                            this.saveSubmitForm()
                                        })
                                    } else {
                                        this.saveSubmitForm()
                                    }
                                }
                            }) 
                    } else {
                        this.saveSubmitForm()
                    }
                }
            })
        },
        getAncestorIds (id) {
            return Utils.getAncestorIds(this.folderData, id)
        },
        handleChange (file) {
            this.uploadFile = file.raw
            this.sheetForm.editorDoc = 'fill'
            this.$validator.validate('editorDoc')
        },
        handleRemove () {
            this.sheetForm.editorDoc = ''
            this.$validator.validate('editorDoc')
        },
        backSheetList () {
            this.$router.push('/sheetList/tableview')
        },
        /** 
         * @description  获取脚本内容
         * @param {gitOid} gitOid 
         * */
        getShellContent (gitOid) {
            Api.get('getShellContent', {fileId: this.sheetForm.id, version: gitOid}, true).then(
                data => {
                    if (data.rst === 'ok') {
                        this.srcEditObj.text = data.data
                        this.sheetForm.editorDoc = data.data
                    }
                }
            )
        },
        init () {
            this.setValideForm()
            let getFolderTreeNodes = Api.get('getFolderTreeNodes', {}, true)
            let getAllLabels = Api.get('getAllLabels', {}, true)
            this.loadingLabel = true
            axios.all([getFolderTreeNodes, getAllLabels]).then(axios.spread(
                (resNode, rstLable) => {
                    this.folderData = resNode.data
                    this.treeData = Utils.transformToTreeData(this.folderData, 'id', 'parentId', 'children', null)
                    this.loadingLabel = false  
                    this.categories = rstLable.data 
                })  
            )
              
            this.editor.lang = this.editor.langs[1].label
            this.editor.theme = 'mdn-like'
            this.disabled = true
            if (this.$route.params.id !== 'add') {
                this.showType = 'edit'
                this.sheetForm.id = this.$route.params.id

                Api.get('getSheetById', {fileId: this.sheetForm.id}, true).then(
                    data => {
                        this.sheetForm.sheetName = data.data.name
                        this.editFileName = data.data.name
                        this.editor.lang = data.data.type 
                        this.srcEditObj.lang = data.data.type 
                        this.sheetForm.label = data.data.tags
                        this.sheetForm.nodeId = data.data.nodeId
                        // 获取脚本文件所在目录的祖先元素id数组
                        
                        this.sheetForm.nodeIds = this.getAncestorIds(this.sheetForm.nodeId)
                        this.sheetForm.nodeIds.unshift(this.sheetForm.nodeId)
                        this.sheetForm.nodeIds.reverse()
                        this.sheetForm.description = data.data.description
                        //版本
                        let versions = data.data.versions
                        if (versions.length) {
                            //UCMP3-5141【原子作业平台】进入脚本详情，详情中无已添加的变量信息
                            //问题原因：接口更改最新版本： 最后一个 --> 第一个
                            let version = versions[0]
                            this.sheetForm.variables = version.params ? version.params : []
                            this.returnCode = version.rstCode
                            this.sheetForm.customParamsAttrs = version.customParamsAttrs
                            if (version.extInfo && version.extInfo.host) {
                                this.sheetForm.book_name = version.extInfo.book_name
                                this.sheetForm.remark = version.extInfo.remark
                                this.sheetForm.host = version.extInfo.host
                                this.sheetForm.editorDoc = 'fill'
                            }
                            if (version.customParamsAttrs) {
                                this.isShowhightSetup = true
                            }
                            // ansible编辑不查询ShellContent
                            if (!(version.extInfo && version.extInfo.host)) {
                                this.getShellContent(version.gitOid)
                            }
                        }
                        this.disabled = false
                    }
                )
            } else {
                this.showType = 'add'
                this.sheetForm = {
                    sheetName: '',
                    variables: [],
                    label: [],
                    editorDoc: '',
                    nodeIds: [],
                    nodeId: '',
                    customParamsAttrs: '',
                    description: ''
                }
                if (this.$refs.sheetForm) {
                    this.$refs.sheetForm.resetFields()
                }
                this.disabled = false
            }
        },
        showHiddenSetUp () {
            this.isShowhightSetup = !this.isShowhightSetup
        },
        /**
         * @description 脚本名称唯一性校验
         */
        setValideForm () {
            let self = this
            let uniqueRule = {
                getMessage (field, params, data) {
                    return (data && data.message) || 'program error!'
                },
                validate (value) {
                    //修改，禁止校验唯一性
                    if (self.showType === 'edit' && !self.$route.query.clone && self.editFileName === self.sheetForm.sheetName) {
                        return {valid: true, data: undefined}
                    }
                    
                    return Api.get('checkExistFileName', {name: self.sheetForm.sheetName}, true).then(
                        res => {
                            return {
                                valid: !res.data.exist,
                                data: res.data.exist ? {message: '该脚本名称已经存在，请重新输入'} : undefined
                            }
                        }
                    )
                }
            }
            Validator.extend('uniqueRule', uniqueRule)
        },
        /**
         * @description 
         */
        addFolder () {
            this.addFolderVisible = true
        },
        closeModal () {
            this.addFolderVisible = false
        },
        insertNode () {
            Api.get('getFolderTreeNodes', {}, true).then(
                res => {
                    this.folderData = res.data
                    this.treeData = Utils.transformToTreeData(this.folderData, 'id', 'parentId', 'children', null)
                }
            )
        }
    },
    created () {
        this.init()
    },
    computed: {
        tagIds () {
            let idArr = this.sheetForm.label.map(
                item => {
                    return item.id ? item.id : ''
                }
            )
            let rstArr = idArr.filter(
                item => {
                    if (item) {
                        return item
                    }
                }
            )
            return rstArr.join(',')
        },
        showMunuTitle () {
            let title = ''
            if (this.showType === 'edit') {
                title = this.$route.query.clone ? '克隆工具' : '编辑工具'
            } else {
                title = '新建工具'
            }
            
            return title
        }
    },
    components: {
        TableInput,
        AddFolder,
        HighlightEditor
    },
    watch: {
      // 如果路由有变化，会执行该方法, 解决从编辑脚本页面跳转到新建脚本页面不刷新问题
        $route (to, from) {  
            this.init() 
        }
    }
}
</script>
<style lang="scss" scoped>
    .explanation{
        font-size: 12px;
        color: rgb(230, 7, 7);
        margin-bottom: 5px;
    }
    .ml10{
        margin-left: 10px;
    }
    .host-required:before{
        content: "*";
        color: #f86255;
        margin-right: 4px;
    }
     .ml40{
        margin-left: 40px;
    }
</style>
