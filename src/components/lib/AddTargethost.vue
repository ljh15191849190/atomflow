<template lang="pug">
  el-dialog(:title="title"
    width="850px"
    :visible.sync="visible"
    :before-close="handleClose")
    AgentList(:checked="checked" :selectTargets="selectTargets" :env='env' @selectRowData="selectRowData")
    div.dialog-footer(slot="footer")
        el-button(@click="handleClose()") 取消
        el-button(@click="submitForm" type="primary") 确定
</template>
<script>
/**
 * @description 添加目录组件
 * @author xinghua.wen
 */
import AgentList from '@/components/agent/AgentList'

export default {
    props: ['visible', 'checkedNode', 'folders', 'selectTargets', 'env'],
    data () {
        return {
            title: '目标主机',
            checked: true,
            selectRowDatas: []
        }
    },
    methods: {
        selectRowData (row) {
            this.selectRowDatas = row
        },
        handleClose () {
            this.$emit('closeDialog')
        },
        submitForm () {
            if (this.selectTargets && this.selectTargets.length > 0) {
                this.$emit('insertNode', this.selectTargets)
                this.handleClose()
            } else {
                this.$notify({
                        title: '通知',
                        type: 'warning',
                        message: '请选择一条数据'
                    })
                return false
            }
        }
    },
    computed: {
        
    },
    components: {
        AgentList
    }
}
</script>
<style lang="scss" scoped>
</style>
