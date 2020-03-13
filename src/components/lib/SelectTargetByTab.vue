<template lang="pug">
  el-tabs.average.average-4(@tab-click="clickTab" v-model="activedTab")
    el-tab-pane(:label="state.label" v-for="state in states" :key="state.id" :name="state.id")
    el-row
        el-col(:span="8" v-for="(target, index) in allTargets" :key="index")        
            el-button.gray(type="text" @click="clickTarget(target)" :class="{'actived': selectedTarget === target}") {{target}}
</template>
<script>
import workflowApi from '@api/work.api'

export default {
  props: ['dagId', 'selectedTarget', 'date', 'activeTarget'],
  data () {
      return {
        states: [
            {id: 'success', label: '成功'},
            {id: 'failed', label: '失败'},
            {id: 'running', label: '执行中'},
            {id: 'notrun', label: '未执行'}              
        ],
        allTargets: [],
        activedTab: 'success'
      }
  },
  methods: {
    clickTab (tab, event) {
       this.getNewTargets()
    },
    clickTarget (target) {
        this.activeTarget(target)
    },
    getNewTargets () {
        let date = this.date.prop ? this.date.prop : this.date
        workflowApi.getHostsByDagIdAndState(this.dagId, date, this.activedTab).then(
            res => {
                this.allTargets = res.data.consumeIps
            }
        )
    }
  },
  created () {
      this.getNewTargets()
  },
  watch: {
    selectedTarget () {
        this.getNewTargets()
    },
    date () {
        this.getNewTargets()        
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
<style lang="scss">
div.average.average-4.el-tabs {
    div.el-tabs__nav {
        width: 100%;
        div.el-tabs__item {
            width: 25%;
            text-align: center;
        }
    }
}
button.el-button.el-button--text {
    &.gray {
        color: #646464;
        &.actived {
            color: #409EFF;            
        }
    }
}
</style>