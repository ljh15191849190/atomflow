<template lang="pug">
  div.full-container
    div.container-flud.httpContant
        el-form(label-position="right" label-width="125px")
            el-form-item.is-required(label="SQL链接")
                el-select.rw-input(
                    v-model="config.conn_id"
                    clearable
                    placeholder="请输入SQL链接" 
                    v-validate="rules.conn_id"
                    name="conn_id"
                    data-vv-as="SQL链接"
                    :class="{'input': true, 'is-danger': errors.has('conn_id')}"
                    size="small"
                    )
                    el-option(v-for="labelItem in linkList" :key="labelItem.conn_id" :label="labelItem.conn_id" :value="labelItem.conn_id")
                span.validator-error.is-danger(v-if="errors.has('conn_id')") {{ errors.first('conn_id') }}
            el-form-item.is-required(label="SQL脚本")
                el-select.rw-input(
                    clearable
                    v-model="sql"
                    placeholder="请输入SQL脚本" 
                    v-validate="rules.sql"
                    name="sql"
                    data-vv-as="SQL脚本"
                    :class="{'input': true, 'is-danger': errors.has('sql')}"
                    size="small"
                    @change="filterChange"
                    )
                    el-option(v-for="item in sqlList" :key="item.id" :label="item.name" :value="item")
                span.validator-error.is-danger(v-if="errors.has('sql')") {{ errors.first('sql') }}
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
            linkList: [],
            sqlList: [],
            shellContent: '',
            sql: '',
            rules: {
                taskName: {
                    required: true
                },
                conn_id: {
                    required: true
                },
                sql: {
                    required: true
                }
            }
        }
    },
    methods: {
        filterChange (value) {
            this.sql = value.name
            if (value.versions.length > 0) {
                let version = value.versions[0]
                Api.get('getShellContent', {fileId: value.id, version: version.gitOid}, true).then(
                    data => {
                        if (data.rst === 'ok') {
                            this.shellContent = data.data
                            let obj = {
                                conn_id: this.config.conn_id,
                                sql: this.shellContent,
                                autocommit: false,
                                parameters: ''
                            }
                            this.$set(this.config, 'sql', obj)
                            this.$set(this.config, 'sheelName', this.sql)
                        }
                    }
                )
            }
        },
        getLinkList () {
            Api.get('getLinkList', {
                limit: 50,
                offset: 1,
                conn_type: 'jdbc'
            }, true).then(
                (res) => {
                    if (res.rst === 'ok') {
                        this.linkList = res.data.conn_list
                    }
                }
            )
        },
        getSqlList () {
            Api.get('getSheetListByFolderId', {
                limit: 50,
                offset: 1,
                type: 'sql'
            }, true).then(
                (data) => {
                    this.sqlList = data.data.fileList
                }
            )
        }
    },
    created () {
        this.getLinkList()
        this.getSqlList()
        if (this.config.hasOwnProperty('sheelName')) this.sql = this.config.sheelName
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
