<template lang="pug">
  el-dialog(:title="title"
    width="500px"
    :visible.sync="visible"
    :before-close="handleClose")
    el-form(:model="folderForm" :rules="rules" ref="folderForm" label-width="80px")
        el-form-item(label="父目录" prop="nodeIds" v-if="folders")
            el-cascader.full-width(
                placeholder="请选择父目录"
                :options="folders"
                :props="folderProps"
                v-model="folderForm.nodeIds"
                change-on-select
            )
        el-form-item(label="目录名称" prop="name")
            el-input(v-model="folderForm.name" :maxlength="20" v-loading="loading" placeholder="请输入目录名称")
    div.dialog-footer(slot="footer")
        el-button(@click="handleClose()") 取消
        el-button(@click="submitForm" type="primary") 确定
</template>
<script>
/**
 * @description 添加目录组件
 * @author xinghua.wen
 */
import Api from '@api'

export default {
    props: ['visible', 'checkedNode', 'folders'],
    data () {
        return {
            loading: false,
            title: '添加目录',
            editFolderName: '',
            folderProps: {
                value: 'id',
                label: 'name'
            },
            folderForm: {
                nodeIds: [],
                name: ''
            },
            rules: {
                nodeIds: [
                    { type: 'array', required: true, message: '请选择父目录', trigger: 'change' }
                ],
                name: [
                    { required: true, message: '请输入目录名称', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
                    { validator: this.isExistName, trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        handleClose () {
            this.$emit('closeDialog')
        },
        isExistName (rule, value, callback) {
            if (!value) return callback() 
            this.loading = true
            Api.get('checkExistFolderName', {name: this.folderForm.name}, true).then(
                res => {
                    this.loading = false
                    if (res.data.exist) {
                        callback(new Error('该目录名称已经存在，请重新输入!'))
                    } else {
                        callback()                    
                    }
                }, err => {
                    console.log(err)
                    this.loading = false                
                }
            )
        },
        submitForm () {
            this.$refs.folderForm.validate((valid) => {
                if (valid) {
                    let payload = {
                        name: this.folderForm.name,
                        parentId: this.parentId
                    }
                    Api.post('saveFolderNode', payload).then(
                        (data) => {
                            let rstData = data.data
                            if (data.rst === 'ok') {
                                this.$emit('insertNode', {parentId: this.parentId, id: rstData.nodeId, name: this.folderForm.name})
                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '新增目录节点成功'
                                })

                                this.folderForm.name = ''
                                this.folderForm.nodeIds = []
                                this.handleClose()
                            }
                        }
                    )
                }
            })
        }
    },
    computed: {
        parentId () {
            let parentId = ''
            // 扁平视图添加目录
            if (this.checkedNode && this.checkedNode.id) {
                parentId = this.checkedNode.id
            }

            // 新建脚本添加目录
            if (this.folderForm.nodeIds.length) {
                parentId = this.folderForm.nodeIds[this.folderForm.nodeIds.length - 1]
            }
            
            return parentId
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
