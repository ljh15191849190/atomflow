<template lang="pug">
  div.variable-content
    div.variable.flex(v-for="item in variables")
      el-tooltip(:content="item.key" placement="top" effect="light")
        div.lable {{item.key}}:
      el-input.normal-widget-width(size="small" v-model="item.default")
</template>

<script>
export default {
    name: 'EditVarible',
    props: ['variables'],
    data () {
        return {
            
        }
    },
    methods: {
        
    }
}
</script>

<style lang="scss" scoped>
.variable-content {
  width: 100%;
  padding: 0px 20px 10px;
  border: 1px dashed #e1e5e6;
  .variable {
    margin-top: 20px;
  }
  .lable {
    width: 150px;
    padding-right: 20px;
    text-align: right;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
}
</style>
