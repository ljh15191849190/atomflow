<template lang="pug">
  div.dagre-graph-container(:id="containerId")
    el-radio-group(v-model="direction" size="mini" v-if="!hideDirectionCrtl")
      el-radio-button(v-for="item in directions" :key="item.prop" :label="item.prop") {{item.label}}
    div.zoom-div
        el-button.zoom(type="default" size="mini" icon="el-icon-zoom-in" @click="zoomCtrl('in')")
        el-button.zoom(type="default" size="mini" icon="el-icon-zoom-out" @click="zoomCtrl('out')")
</template>
<script>
import dagreD3 from 'dagre-d3'
import relationDirections from '@mock/workflow/relationDirections'
import Utils from '@server/Utils'
let d3 = require('@/assets/plugins/d3.v3.js')
let inner = null

export default {
  props: ['nodes', 'edges', 'nodeClick', 'hideDirectionCrtl'],
  data () {
    return {
        renderer: null,
        graph: null,
        inner: null,
        direction: 'LR',
        directions: relationDirections,
        colors: {
          noStatus: '#fff',
          success: '#61b2e4',
          failed: '#f77d6b',
          running: '#87d86f',
          skipped: '#faec91',
          retry: '#f8b96c',
          queued: '#43e3ed'
        },
        zoom: null,
        comtainerId: '',
        width: 0,
        height: 0
    }
  },
  watch: {
    nodes () {
        // 获取之前的nodes缓存并清除
        let nodes = this.graph.nodes()
        if (nodes.length) {
          nodes.forEach(
            item => {
              this.graph.removeNode(item)
            }
          )
        }
        
        //通过operator来画shape(BranchPythonMapOperator: 分支； JoinOperator：合流)
        this.nodes.forEach(
            (item) => {
                let state = item.state ? item.state : 'no-status'
                let shape = 'rect'
                if (item.value.operator === 'BranchPythonMapOperator') {
                    shape = 'ellipse'
                } else if (item.value.operator === 'JoinOperator') {
                    shape = 'circle'
                }
                
                this.graph.setNode(item.id, {label: item.value.label, shape: shape, class: item.value.operator + ' dagre ' + state})
            }
        )
        this.renderer(inner, this.graph)                
        d3.selectAll('g.node').on('click', d => {
            this.nodeClick(d)
        })
    },
    edges () {
        //一个脚本节点时：不渲染eage
        if (this.nodes.length > 1) {
          this.edges.forEach(
              (item) => {
                  if (item.label) {
                      this.graph.setEdge(item.from, item.to, {label: item.label})   
                  } else {
                      this.graph.setEdge(item.from, item.to)   
                  }         
              }
          )
          this.renderer(inner, this.graph)  
        }      
    },
    direction () {
      this.graph.setGraph({
        rankdir: this.direction
      })
      this.renderer(inner, this.graph)
    }
  },
  created () {
    this.graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: this.direction
    }).setDefaultEdgeLabel(function () { return {} })
    this.containerId = Utils.uuid()
  },
  methods: {
    zoomCtrl (symbal) {
        let scale = symbal === 'in' ? 1.1 : 0.8
        this.zoom.scale(this.zoom.scale() * scale)
        this.zoomed()
    },
    zoomed () {
      inner.attr('transform', 'translate(' + this.zoom.translate() + ')' + 'scale(' + this.zoom.scale() + ')')
    }
  },
  mounted () {
    this.width = document.getElementById(this.containerId).clientWidth
    this.height = document.getElementById(this.containerId).clientHeight

    // eslint-disable-next-line
    this.renderer = new dagreD3.render()
    let svg = d3.select(this.$el)
      .append('svg')
    inner = svg
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('class', 'inner')
      
    this.zoom = d3.behavior.zoom().center([this.width / 2, this.height / 2]).size([this.width, this.height]).on('zoom', this.zoomed)
    svg.call(this.zoom)
    this.zoom.translate([this.width / 6, this.height / 6]).scale(0.8)
    this.zoomed()
  }
}
</script>
<style lang="scss">
.edgePath path {
  stroke: #333;
  fill: #333;
  stroke-width: 1.5px;
}
.dagre-graph-container {
  width: 100%;
  height: 100%;
}
</style>
