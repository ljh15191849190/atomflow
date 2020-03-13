
<template lang="pug">
  div
    div.drag-container
        el-row
            el-col(:span="8")
                ul.nav.flex-column
                    li.nav-item.drag-item(v-for="(node, index) in nodes" :key="node.id")
                        a.nav-link(@click.stop.prevent="selectSheet(node, index)") {{node.label}}
            el-col(:span="16")
                Network(:nodes="networkNodes" :edges="networkEdges" ref="network" @deleteNode="deleteNode")

</template>
<script>
import Network from './Network'
import 'vis/dist/vis.css'
export default {
  data () {
    return {
        container: null,
        update: null,
        drag: null,
        nodes: [
            {id: 1, label: '节点1'},
            {id: 2, label: '节点2'},
            {id: 3, label: '节点3'},
            {id: 4, label: '节点4'},
            {id: 5, label: '节点5'},
            {id: 6, label: '节点6'},
            {id: 7, label: '节点7'}
        ],
        networkNodes: [
            {id: 1, label: '节点1'},
            {id: 2, label: '节点2'},
            {id: 3, label: '节点3'}
        ],
        networkEdges: []
    }
  },
  methods: {
    selectSheet (node, index) {
        this.$refs.network.addNode(node)
        // this.nodes.splice(index, 1)
    },
    /**
     * @description 删除节点事件
     * @author xinghua.wen
     * */
    deleteNode (nodeIds) {
        // let index = this.copiedIds.indexOf(nodeIds[0])
        // if (index !== -1) {
        //     this.nodes.push(this.copiedData[index])
        // }
    }
  },
  created () {
    this.copiedData = JSON.parse(JSON.stringify(this.nodes))
    this.copiedIds = this.copiedData.map(
        (item) => {
            return item.id
        }
    )
  },
  mounted () {
    
  },
  components: {
    Network
  }
}
</script>
<style lang="scss" scoped>
.drag-container {
    width: 100%;
    height: 600px;
}
</style>
