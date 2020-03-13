<template lang="pug">
  div.full-container
    div.container-flud.httpContant
        el-form(label-position="right" label-width="125px")
            el-form-item.is-required(label="执行超时时间(S)")
                el-input.rw-input(
                    v-model.trim="config.timeout"
                    v-validate="rules.timeout"
                    :name="'timeout'"
                    placeholder="请输入执行超时时间"
                    data-vv-as="执行超时时间"
                    :class="{'input': true, 'is-danger': errors.has('timeout')}"
                    maxlength="20"
                    size="small"
                )
                span.validator-error.is-danger(v-if="errors.has('timeout')") {{ errors.first('timeout') }}
            el-form-item.is-required(label="请求方式")
                el-radio-group(v-model="config.method")
                    el-radio(label="GET" value="GET") get
                    el-radio(label="POST" value="POST") post
                    el-radio(label="PUT" value="PUT") put
                    el-radio(label="DELETE" value="DELETE") delete
            el-form-item.is-required(label="选择HTTP链接")
                el-select.rw-input(
                    v-model="config.http_conn_id"
                    placeholder="请选择HTTP链接" 
                    v-validate="rules.http_conn_id"
                    name="http_conn_id"
                    data-vv-as="HTTP链接"
                    :class="{'input': true, 'is-danger': errors.has('http_conn_id')}"
                    size="small"
                    )
                    el-option(v-for="labelItem in linkList" :key="labelItem.conn_id" :label="labelItem.conn_id" :value="labelItem.conn_id")
                span.validator-error.is-danger(v-if="errors.has('http_conn_id')") {{ errors.first('http_conn_id') }}
            el-form-item.is-required(label="请求")
                el-input.request-input(
                    disabled
                    v-model="config.http_conn_id"
                    size="small"
                )
                span /
                el-input.request-input(
                    v-model="config.endpoint"
                    v-validate="rules.endpoint"
                    :name="'endpoint'"
                    size="small"
                    data-vv-as="请求"
                    :class="{'input': true, 'is-danger': errors.has('endpoint')}"
                )
                span.validator-error.is-danger(v-if="errors.has('endpoint')") {{ errors.first('endpoint') }}
            el-form-item(label="header")
                TableInput.pad-left(:tableInputConfig="returnConfig" :tableData="httpform.headerData")
            el-form-item(label="body")
                el-radio-group(v-model="httpform.bodyType" @change="bodyModeChange")
                    el-radio(label="raw" value="raw") raw
                    el-radio(label="from" value="from") form-data
            el-form-item(label="" v-if="httpform.bodyType==='from'")
                TableInput.pad-left(:tableInputConfig="variableConfig" :tableData="httpform.bodyData" :Isrequired="false")
            el-form-item(v-if="httpform.bodyType==='raw'")
                el-input.pad-left(v-model.trim="httpform.rowdata" :rows="6" type="textarea")    
            el-form-item.is-required(label="节点名称")
                el-input.rw-input(
                    v-model.trim="config.taskName"
                    v-validate="rules.taskName"
                    :name="'taskName'"
                    placeholder="请输入节点名称"
                    data-vv-as="节点名称"
                    :maxlength="9"
                    :class="{'input': true, 'is-danger': errors.has('taskName')}"
                    size="small"
                )
                span.validator-error.is-danger(v-if="errors.has('taskName')") {{ errors.first('taskName') }}
</template>
<script>
import TableInput from '@lib/TableInput'
import Api from '@api'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    inject: ['$validator'],
    props: {
        config: {
            type: Object,
            default: () => { }
        }
    },
    data () {
        return {
            httpform: {
                bodyType: 'raw',
                bodyData: [],
                headerData: [],
                rowdata: ''
            },
            linkList: [],
            rules: {
                timeout: {
                    required: true
                },
                taskName: {
                    required: true
                },
                endpoint: {
                    required: true
                }, 
                http_conn_id: {
                    required: true
                }
            },
            returnConfig: {
                columns: [
                    { prop: 'code', label: 'key' },
                    { prop: 'desc', label: 'value' }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加'
            },
            variableConfig: {
                columns: [
                    { prop: 'key', label: 'key' },
                    { prop: 'default', label: 'value' }
                ],
                isEdit: true,
                isShowOpr: true,
                addDesc: '添加'
            }
        }
    },
    methods: {
        //body
        bodyModeChange (value) {
            // this.httpform.bodyData = []
            // this.$set(this.httpform, 'rowdata', '')
        },
        getLinkList () {
            Api.get('getLinkList', {
                limit: 50,
                offset: 1,
                conn_type: 'http'
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.linkList = res.data.conn_list
                    }
                }
            )
        },
        init () {
            if (!this.config.hasOwnProperty('method')) this.$set(this.config, 'method', 'GET')
            if (!this.config.hasOwnProperty('bodyTypes')) this.$set(this.config, 'bodyTypes', 'form-data')
            if (this.config.headers) {
                for (let aa in this.config.headers) {
                    let obj = {
                        'code': aa,
                        'desc': this.config.headers[aa]
                    }
                    this.httpform.headerData.push(obj)
                }
            } 
            if (this.config.data) {
                if (this.config.bodyTypes === 'raw') {
                    this.httpform.bodyType = 'raw'
                    this.httpform.rowdata = this.config.data
                } else {
                    this.httpform.bodyType = 'from'
                    for (let aa in this.config.data) {
                        let obj = {
                            'key': aa,
                            'default': this.config.data[aa]
                        }
                        this.httpform.bodyData.push(obj)
                    }
                }
            }
        }
    },
    created () {
        this.getLinkList()
        this.init()
    },
    components: {
        TableInput
    },
    watch: {
        'httpform.headerData': {
            deep: true,
            handler (newVal, oldVal) {
                let obj = {}
                newVal.forEach(res => {
                    obj[res.code] = res.desc
                })
                this.$set(this.config, 'headers', obj)
            }
        },
        'httpform.bodyData': {
            deep: true,
            handler (newVal, oldVal) {
                this.$set(this.config, 'data', null)
                let obj = {}
                newVal.forEach(res => {
                    obj[res.key] = res.default
                })
                this.$set(this.config, 'data', obj)
                this.$set(this.config, 'bodyTypes', 'form-data')
            }
        },
        'httpform.rowdata' (val) {
            this.$set(this.config, 'data', null)
            this.$set(this.config, 'data', val)
            this.$set(this.config, 'bodyTypes', 'raw')
        }
        
    }
}
</script>
<style lang="scss" scoped>
    .httpContant{
        padding-right: 10px;
    }
    .el-form-item {
        margin-bottom: 5px;
    }
    .request-input{
        width:49%;
    }
    .headertitle{
        margin-bottom: 10px;
    }
    .el-select {
        width: 100%;
    }
</style>
