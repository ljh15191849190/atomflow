<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container(v-if="$route.query.fileId")
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 原子作业平台
            el-breadcrumb-item(:to="{ path: '/sheetList/tableview' }") 脚本列表
            el-breadcrumb-item Sql执行
    el-form(ref="workForm" :class="{ 'atom-content': $route.query.fileId ? true : false }" :model="workForm" :rules="rules" label-width="150px")
        div.server-number(v-if="$route.query.fileId")
            span 脚本名称：
            span {{workForm.name}}
        el-form-item(label="脚本名称" prop="shell" v-if="!this.$route.query.fileId")   
            el-select.normal-width(clearable v-model="workForm.shell"  placeholder="选择脚本" size="small" @change="onChangeSheet")
                el-option(v-for="shelldata in SheetList" :key="shelldata.id" :label="shelldata.name" :value="shelldata.id")
            el-select.normal-width(clearable v-model="workForm.tag"  placeholder="脚本标签" size="small" @change="onChangeTag")
                el-option(v-for="tag in TagList" :key="tag.id" :label="tag.name" :value="tag.id")
        el-form-item(label="数据库链接" prop="conn_id")
            el-select.normal-widget-width(
                v-model="workForm.conn_id"
                placeholder="请选择数据库链接" 
                clearable
                size="small"
                )
                el-option(v-for="labelItem in categories" :key="labelItem.conn_id" :label="labelItem.conn_id" :value="labelItem.conn_id")
        el-form-item(label="作业名称" prop="dagName")
            el-input.normal-widget-width(v-model="workForm.dagName" size="small") 
        el-form-item(label="定时策略" prop="interval" v-if="cycleFlag")
            el-input.normal-widget-width(v-model="workForm.interval" size="small" placeholder="请输入crontab表达式") 
        el-form-item(label="开始时间" prop="startDate")
            el-date-picker.normal-widget-width(v-model="workForm.startDate" type="datetime" placeholder="选择开始时间" size="small")
        el-form-item(label="结束时间" prop="endDate" v-if="cycleFlag")
            el-date-picker.normal-widget-width(v-model="workForm.endDate" type="datetime" placeholder="选择结束时间" size="small")
        el-form-item(label="执行超时时间(分钟)" prop="timeout")
            el-input.normal-widget-width(v-model="workForm.timeout" size="small") 
        div.server-number.clickSee(@click="handlerSee") {{isShow?"通知设置":"隐藏通知设置"}}
        template(v-if="!isShow")
            div.ml80 通知人员
                el-tooltip.pos-right(content="作业执行结果（包含成功/失败）输出后会给下列人员发送消息" placement="right")
                    i.atom-icon-sheet-help.theme-color.help-icon
            el-form-item(label="作业创建者" prop="creatuser")
                el-checkbox-group(v-model="workForm.creatWorkList")
                    el-checkbox(v-for="role in creatWorkVal" :key="role.id" :label="role") 作业创建者
            el-form-item.mt10(label="通知人" prop="notice_user")
                el-select.normal-widget-width(
                    v-model="workForm.notice_user"
                    placeholder="请输入登录名/姓名搜索"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    value-key="id"
                    :remote-method="remoteUserList"
                    :loading="userLoading"
                    size="small")
                        el-option(v-for="item in userList" :key="item.id" :label="item.name" :value="item")
                            span {{item.name}}
                            span(v-if="item.org_name") ({{item.org_name}})
        el-form-item(label="说明" prop="description")
            el-input.normal-widget-width(v-model="workForm.description" :autosize="{ minRows: 4}" size="small" type="textarea")   
        el-form-item()
            el-button(size="small" @click="reset") 返回
            el-button(type="primary" size="small" @click="submitForm") 确定   
</template>
<script>
/** 
 * @description sql执行
 * @author lijinghao
 */
import Api from '@api'
import Utils from '@server/Utils'
import WorkApi from '@api/work.api'

const CREAT_WORK_VAL = [{
    default_project_id: localStorage.getItem('tenant'),
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('systemUserName')
}]
export default {
    props: ['cycleFlag'],
    data () {
        return {
            isShow: true,
            workForm: {
                creatWorkList: [],
                dagName: '',  //作业名称
                startDate: new Date().getTime(),
                endDate: null,
                interval: '',
                timeout: 60,
                description: '',
                name: '',
                conn_id: '',
                sql: '',
                shell: '',
                notice_type: null,
                notice_user: []
            },
            categories: [],
            SheetList: [],
            TagList: [],
            tag: '',
            userLoading: false,
            userList: [],
            creatWorkVal: CREAT_WORK_VAL,
            rules: {
                shell: [
                    { required: true, message: '请选择脚本名称', trigger: 'blur' }                
                ],
                dagName: [
                    { required: true, message: '请输入作业名称', trigger: 'blur' },
                    { validator: this.ifNameExist, trigger: 'blur' }
                ],
                startDate: [
                    { required: true, message: '请选择开始时间', trigger: 'change' }                
                ],
                interval: [
                    { required: true, message: '请输入Crontab表达式', trigger: 'blur' }                
                ],
                timeout: [
                    { required: true, message: '请选择超时时间', trigger: 'blur' }                
                ],
                conn_id: [
                    { required: true, message: '请选择数据库链接', trigger: 'change' }                
                ]
                
            }
        }
    },
    methods: {
        // 用户
        remoteUserList (query) {
            if (query !== '') {
                this.userLoading = true
                let param = {
                    page_idx: 1,
                    limit: 99999,
                    name: query
                }
                Api.get('getUserListWithPagination', param, true).then(res => {
                    if (res.rst === 'ok') {
                        this.userLoading = false
                        this.userList = res.data.users
                    }
                })
            } else {
                this.userList = []
            }
        },
        handlerSee () {
            this.isShow = !this.isShow
        },
        doRequestResult (data) {
            if (data.rst === 'ok') {
                this.$notify({
                    type: 'success',
                    message: '创建作业成功'
                })
                if (this.cycleFlag) {
                    this.$router.push('/cycleList')
                } else {
                    this.$router.push('/workList')
                }
            } else {
                let errCode = data.err_code
                switch (errCode) {
                    case 2001:
                        this.$notify({
                            type: 'error',
                            message: 'DAG不合法!'
                        })
                        break
                    default:
                        this.$notify({
                            type: 'error',
                            message: '创建作业失败，请稍后再试!'
                        })
                        break
                }
            }
        },
        submitForm () {
            // 校验表单是否合法
            this.$refs.workForm.validate(
                valid => {
                    if (!valid) {
                        return
                    }
                    let new_notice_user = [...this.workForm.notice_user, ...this.workForm.creatWorkList]
                    let form = {
                        dagName: this.workForm.dagName,
                        schdulerType: this.cycleFlag ? 2 : 1, //普通作业
                        interval: this.workForm.interval, //Crontab表达式
                        dagType: 'complex', //简单流程
                        timeout: this.workForm.timeout,
                        startDate: new Date(this.workForm.startDate).getTime() / 1000,
                        endDate: new Date(this.workForm.endDate).getTime() / 1000,
                        description: this.workForm.description,
                        batch: 0,
                        notice_type: !this.isShow ? 0 : null,
                        notice_user: Utils.getObjArrEqual(new_notice_user, 'id')
                    }
                    let uuid = Utils.uuid()
                    let payload = {
                        dagInfo: form,
                        edges: [],
                        nodes: []
                    }
                    // 选择脚本
                    payload.nodes = [{
                        taskName: this.workForm.name, 
                        taskId: uuid,
                        config: {
                            operatorType: 'JdbcOperator',        //步骤类型
                            sql: {
                                conn_id: this.workForm.conn_id,
                                taskName: this.workForm.name, 
                                sql: this.workForm.sql,
                                // autocommit: false,
                                parameters: ''
                            }
                            
                        }
                    }]
                    this.disabled = true
                    WorkApi.createWork(payload).then(
                        (data) => {
                            this.doRequestResult(data)
                            this.disabled = false
                        }
                    )
                }
            )
        },
        reset () {
            if (this.cycleFlag) {
                this.$router.push('/cycleList')
            } else {
                this.$router.push('/workList')
            }
        },
        ifNameExist (rule, value, callback) {
            this.loading = true 
            Api.get('queryWorkByName', {
                name: this.workForm.dagName
            }, true).then(
                (res) => {
                    this.loading = false
                    if (res.data.exist) {
                        callback(new Error('该作业名称已经存在，请重新输入'))
                    } else {
                        callback()                    
                    }
                }, err => {
                    console.log(err)
                    this.loading = false                
                }
            )
        },
        //获取详情
        onChangeSql (value) {
            Api.get('getShellContent', {
                fileId: value
            }, true).then(
                (res) => {
                    if (res.rst === 'ok' && res.data) {
                        this.workForm.name = res.data.name
                        this.getSql(res.data)
                    }
                }
            )
        },
        getSql (value) {
            if (value.versions.length > 0) {
                let version = value.versions[0]
                Api.get('getShellContent', {fileId: value.id, version: version.gitOid}, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            this.workForm.sql = data.data
                        }
                    }
                )
            }
        },
        // link链接
        getLink () {
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
        },
        //脚本列表
        querySheetList () {
            Api.get('getSheetListByFolderId', {
                limit: 50,
                offset: 1,
                tagIds: this.tag,
                type: 'sql'
            }, true).then(
                (data) => {
                    this.SheetList = data.data.fileList
                }
            )
        },
        //获取脚本详情
        onChangeSheet (value) {
            Api.get('getShellContent', {
                fileId: value
            }, true).then(
                (res) => {
                    if (res.rst === 'ok' && res.data) {
                        this.workForm.name = res.data.name
                        this.getSql(res.data)
                    }
                }
            )
        },
        //脚本标签
        queryTagList () {
            Api.get('getAllLabels', { }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.TagList = res.data
                    }
                }
            )
        },
        onChangeTag (value) {
            this.tag = value
        }
    },
    computed: {

    },
    watch: {
        tag: {
            deep: true,
            handler (newVal, oldVal) {
                this.querySheetList()
            }
        }
    },
    created () {
        let file = this.$route.query.fileId
        this.getLink()
        if (file) {
            this.onChangeSql(file)
        } else {
            this.querySheetList()
            this.queryTagList()
        }
    }
}
</script>
<style lang="scss" scoped>
.atom-content {
    overflow: auto;
}
.normal-widget-width {
    width: 560px;
}
.server-number{
    margin-left: 80px;
    margin-bottom: 15px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 305px !important;
}
.clickSee{
    color: #8C99FF;
    cursor: pointer;
}
.ml80{
    margin-left: 80px;
}
.mt10{
    margin-top:-15px;
}
.normal-width{
    width: 280px;
}
</style>

