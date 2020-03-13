<template lang="pug">
  div.full-container
    div.container-flud.httpContant
        el-form(label-position="right" label-width="125px")
            el-form-item.is-required(label="选择absible")
                el-select.rw-input(
                    v-model="absible"
                    placeholder="请选择absible" 
                    v-validate="rules.absible"
                    name="absible"
                    data-vv-as="absible脚本"
                    :class="{'input': true, 'is-danger': errors.has('absible')}"
                    size="small"
                    @change="filterChange"
                    )
                    el-option(v-for="item in ansibleList" :key="item.id" :label="item.name" :value="item")
                span.validator-error.is-danger(v-if="errors.has('absible')") {{ errors.first('absible') }}
            el-form-item.is-required(label="节点名称")
                el-input.rw-input(
                    v-model.trim="config.taskName"
                    v-validate="rules.taskName"
                    name="taskName"
                    placeholder="请输入节点名称"
                    data-vv-as="节点名称"
                    :class="{'input': true, 'is-danger': errors.has('taskName')}"
                    :maxlength="9"
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
            ansibleList: [],
            absible: '',
            rules: {
                taskName: {
                    required: true
                },
                absible: {
                    required: true
                }
            }
        }
    },
    methods: {
        filterChange (value) {
            this.absible = value.name
            if (value.versions.length > 0) {
                this.$set(this.config, 'downloadUrl', value.versions[0].downloadUrl)
                this.$set(this.config, 'extInfo', value.versions[0].extInfo)
                this.$set(this.config, 'absibleName', value.name)
            }
        },
        getAnsibleList () {
            Api.get('getSheetListByFolderId', {
                limit: 50,
                offset: 1,
                type: 'ansible'
            }, true).then(
                (data) => {
                    this.ansibleList = data.data.fileList
                }
            )
        }
    },
    created () {
        this.getAnsibleList()
        if (this.config.hasOwnProperty('absibleName')) this.absible = this.config.absibleName
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
