<template lang="pug">
  div.full-width
    el-row(v-if="!rowData.length")  
        Atom-Icon-Button(:key="btns[0].prop" :type="btns[0].type" :args="{id: btns[0].prop, index: 0}" :text="btns[0].label" @iconClick="handleClick")        
    el-row(v-else v-for="(item,bIndex)  in rowData" :key="bIndex")
        el-col(:span="11")
            el-input(v-model="item.name" size="small")
        el-col(:span="11")
            el-input(v-model="item.value" size="small")
        el-col(:span="2")
            Atom-Icon-Button(v-for="btn in btns" :key="btn.prop" :type="btn.type" :args="{id: btn.prop, index: bIndex}" :text="btn.label" @iconClick="handleClick")
</template>
<script>
/**
 * @description 多行input输入
 * @author xinghua.wen
 */
import AtomIconButton from './AtomIconButton'
export default {
  props: ['rowData'],
  data () {
    return {
        btns: [
            {
                prop: 'add',
                label: '添加',
                icon: '',
                type: 'el-icon-circle-plus-outline'
            },
            {
                prop: 'delete',
                label: '删除',
                icon: '',
                type: 'el-icon-remove-outline'
            }
        ] 
    }
  },
  methods: {
    handleClick (obj) {
        let copiedData = JSON.parse(JSON.stringify(this.rowData))
        if (obj.id === 'add') {
            copiedData.splice(obj.index, 0, {name: '', value: ''})
        }
        if (obj.id === 'delete') {
            copiedData.splice(obj.index, 1)            
        }
        this.$emit('changeData', copiedData)
    }
  },
  components: {
    AtomIconButton
  }
}
</script>
<style lang="scss" scoped>

</style>
