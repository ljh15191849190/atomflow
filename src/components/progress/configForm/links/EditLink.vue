<template lang="pug">
    el-form(size="mini")
     EditBranchLink(
        v-if="linkBusinessType === 'branch'"
        :values.sync="link.values"
        :rules="rules"
        :checkedBranchRules="checkedBranchRules"
        :uniqueId="link.id"
        :updateLinkLabel="updateLinkLabel"
        :target="typeof link.target === 'object' ? link.target.id : link.target")
     el-form-item(label="绘制方式")
        el-radio-group(v-model="link.format")
            el-radio(v-for="type in drawTypes" :key="type.prop" :label="type.prop") {{type.label}}
     el-form-item
        el-button(type="danger" @click="deleteLink") 删除连线
</template>
<script>
/**
 * @description 连线配置表单(总)
 */
import EditBranchLink from './EditBranchLink'

export default {
    inject: ['$validator'],
    props: {
        nodeConfigs: {
            type: Object,
            default: () => {}
        },
        link: {
            type: Object,
            default: () => {}
        },
        checkedBranchRules: Array | undefined,
        updateLinkLabel: Function
    },
    data () {
        return {
            drawTypes: [
                {prop: 'broken', label: '折线'},
                {prop: 'straight', label: '直线'}
            ]
        }
    },
    methods: {
        initilizeFormData () {
            if (!this.link.format) this.link.format = this.drawTypes[0].prop
        },
        deleteLink () {
            this.$emit('deleteLink', this.link)
        }
    },
    computed: {
        /**
         * 当前连线的业务类型(progress|branch|join)
         */
        linkBusinessType () {
            if (this.link && this.link.source && this.link.source.info && this.link.source.info.category) {
                return this.link.source.info.category
            }
            return ''
        },

        /**
         * 当前连线的source节点是分支，获取其分支条件列表
         */
        rules () {
            if (this.linkBusinessType !== 'branch') return []
            if (this.nodeConfigs && this.nodeConfigs[this.link.source.id] && this.nodeConfigs[this.link.source.id].rules) {
                return this.nodeConfigs[this.link.source.id].rules
            }
            return []
        }
    },
    created () {
        this.initilizeFormData()
    },
    components: {
        EditBranchLink
    }
}
</script>
<style lang="scss" scoped>

</style>
