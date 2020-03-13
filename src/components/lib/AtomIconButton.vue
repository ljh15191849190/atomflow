<template lang="pug">
  el-tooltip(:content="text" effect="light")
    i.theme-color(@click="handleClick" :class="[isAtom ? 'atom-icon-button' : '', type, disabled ? 'disabled' : '']")
</template>
<script>
export default {
  props: ['args', 'type', 'text', 'disabled'],
  data () {
    return {
        
    }
  },
  methods: {
    handleClick () {
        if (this.disabled) { return }
        this.$emit('iconClick', this.args)
    }
  },
  computed: {
      isAtom () {
        return this.type.indexOf('atom') !== -1
      }
  },
  created () {
    this.type = this.type ? this.type : 'atom-icon-dict'
    this.args = this.args ? this.args : ''
    this.text = this.text ? this.text : ''    
  }
}
</script>
<style lang="scss" scoped>
.atom-icon-button {
    font-family: 'iconfont-atom' !important;
    font-size: 22px;
    color: #409EFF;
    cursor: pointer;
    margin-right: 10px;
}
</style>

