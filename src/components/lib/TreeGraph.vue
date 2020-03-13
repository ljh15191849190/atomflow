<template lang="pug">
  div.tree-graph-container
    svg.tree(width="100%")
    div.zoom-div
        el-button.zoom(type="default" size="mini" icon="el-icon-zoom-in" @click="zoomCtrl('in')")
        el-button.zoom(type="default" size="mini" icon="el-icon-zoom-out" @click="zoomCtrl('out')")
</template>
<script>
/**@author xinghua.wen
 * @description 基于d3.js的树形graph图组件
 */
/* eslint-disable */
import tempRunning from '@mock/workflow/tempRunning'
import util from '@server/Utils'
import * as d3 from 'd3'
import 'bootstrap/dist/js/bootstrap.bundle.js'
let levelGraph = null
let axis = null
export default {
  props: ['data'],
  data () {
    return {
        tree: null,
        nodes: null,
        // descendants: [],
        margin: {},
        barHeight: null,
        square_size: null,
        square_spacing: null,
        square_x: null,
        barWidth: null,
        zoom: null
    }
  },
  methods: {
    zoomCtrl (symbal) {
        let scale = symbal === 'in' ? 1.1 : 0.8
        const svg = d3.select(this.$el).select('svg.tree')
        this.zoom.scaleBy(svg, scale)
    },
    zoomed () {
        d3.select(this.$el).select('g.container').attr('transform', d3.event.transform)
    },
    /** 
     * @description 左侧树节点非叶子节点筛选
     */
    toggles (clicked_d) {
        d3.selectAll("[task_id='" + clicked_d.data.name + "']").each(
        d => {
            if(clicked_d.data != d.data && d.children && d.children.length) {
                this.$set(d.data, '_children', d.data.children)
                d.data._children = d.data.children
                d.data.children = null
            }
        })

        // Toggle clicked node
        if(clicked_d.data._children) {
            this.$set(clicked_d.data, 'children', clicked_d.data._children)            
            clicked_d.data._children = null
        } else if (clicked_d.data.children && clicked_d.data.children.length) {
            this.$set(clicked_d.data, '_children', clicked_d.data.children)                        
            clicked_d.data.children = null
        }
        // this.update(this.data)
    },

    /** 
     * 图表tooltip启动
     */
    set_tooltip (){
        $('rect.state').tooltip({
            html: true,
            container: 'body',
        })
        $('circle.task').tooltip({
            html: true,
            container: 'body',
        })
    },

    /** 
     * @description 动态判断左侧树节点类型
     */
    node_class (d) {
        let sclass = 'node'
        if (d.children === undefined && d.data._children === undefined)
            sclass += ' leaf'
        else if (!d.parent && !d.data.parent) {
            sclass += ' root'
        } else {
            sclass += ' parent'
            if (d.children === undefined)
                sclass += ' collapsed'
            else
                sclass += ' expanded'
        }
        return sclass
    },

    /** 
     * @description 数据变化后动态变换图表实际内容
     */
    update (source) {
        source.x0 = 0
        source.y0 = 0        
        // Compute the flattened node list. TODO use d3.layout.hierarchy.
        let nodes = d3.hierarchy(source)
        this.nodes = this.tree(nodes)
        // this.descendants = this.nodes.descendants()
        let diagonal = d => { 
            return "M" + d.y + "," + d.x
            + "C" + (d.y + d.parent.y) / 2 + "," + d.x
            + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x
        }
        let duration = 400
        let height = Math.max(500, this.descendants.length * this.barHeight + this.margin.top + this.margin.bottom)
        let width = this.square_x + (this.numSquare * (this.square_size + this.square_spacing)) + this.margin.left + this.margin.right + 50
        d3.select(this.$el).select('svg').transition()
            .duration(duration)
            .attr('height', height)
            .attr('width', width)

        // Compute the 'layout'.
        this.descendants.forEach(
            (n, i) => {
                n.x = i * this.barHeight
                // n.y = i * this.barHeight                
            }
        )

        // Update the this.nodes…
        let count = this.descendants.length    
        let node = levelGraph.selectAll('g.node')
            .data(this.descendants, d => { 
                return d.data.id || (d.data.id = ++count)
                }
            )

        let nodeEnter = node.enter().append('g')
            .attr('class', this.node_class)
            // .merge(node)
            .attr('transform', d => {
                return 'translate(' + source.y0 + ',' + source.x0 + ')'
            })
            .style('opacity', 1e-6)
        //原子作业平台ATOMFLOWAT-176(作业执行日志详情页面，鼠标移至脚本，信息为英文显示，且日期显示错误)
        nodeEnter.append('circle')
            .attr('r', (this.barHeight / 2))
            .attr('class', 'task')
            .attr('data-html', true)
            .attr('data-toggle', 'tooltip')
            .attr('title', d => {
                let tt = "<p align='left'>"
                let queue = d.data.queue ? d.data.queue : '-'
                if (d.data.operator != undefined) {
                tt += '操作器类型: ' + d.data.operator + '<br/>'
                tt += '重执次数: ' + d.data.retries + '<br/>'
                tt += '队列: ' + queue + '<br/>'
                tt += '创建者: ' + d.data.owner + '<br/>'
                tt += '开始时间: ' + util.transformToDate(d.data.start_date) + '<br/>'
                tt += '结束时间: ' + util.transformToDate(d.data.end_date) + '<br/>'
                }
                tt = tt + '</p>'
                return tt
            })
            .attr('height', this.barHeight)
            .attr('width', (d, i) => {return this.barWidth - d.y})
            // .style('fill', d => {return d.ui_color})
            .attr('task_id', d => {return d.data.name})
            .on('click', this.toggles)

        let line = nodeEnter.append('line')
            .attr('class', 'arrow')
            .attr('x1', this.barHeight)
            .attr('y1', 0)
            .attr('x2', d => {return this.square_x-d.y})
            .attr('y2', 0)

        let text = nodeEnter.append('text')
            .attr('dy', 0)
            .attr('dx', this.barHeight/2 + 3)
            .text(d => { return d.data.name })
            
        nodeEnter.append('g')
            .attr('class', 'stateboxes')
            .attr('transform',
                (d, i) => { 
                    return 'translate(' + (this.square_x-d.y) + ', 0)'
                })
        // AT-143 更改执行条件后，图表列数没有变化的问题
        let nodeUpdate = nodeEnter.merge(node)
        // Transition this.nodes to their new position.
        nodeUpdate.transition()
            .duration(duration)
            .attr('transform', d => { return 'translate(' + d.y + ',' + d.x * 1.3 + ')' })
            .style('opacity', 1)
        //获取update部分
        let stateboxes = nodeUpdate.select('.stateboxes').selectAll('rect').data(d => { 
                return d.data.instances 
            })
        const self = this
        //获取enter部分
        let stateboxesEnter = stateboxes.enter()
        //enter部分添加处理
        stateboxesEnter.append('rect')
            .on('click', d =>{
                if(d.task_id === undefined)
                    console.log(d)
                else if(this.nodeobj[d.task_id].operator=='SubDagOperator')
                    console.log(d.task_id, d.execution_date, true)
                else
                    console.log(d.task_id, d.execution_date)
            })
            .attr('class', d => {return 'state ' + d.state})
            .attr('data-html', true)
            .attr('data-toggle', 'tooltip')
            .attr('title', d => {
                return self.getStateBoxToolTip(d)
            })
            .attr('rx', d => {return (d.run_id != undefined)? '15': '5'})
            .attr('ry', d => {return (d.run_id != undefined)? '15': '5'})
            .style('shape-rendering', d => {return (d.run_id != undefined)? 'auto': 'crispEdges'})
            .style('stroke-width', d => {return (d.run_id != undefined)? '2': '1'})
            .style('stroke-opacity', d => {return d.external_trigger ? '0': '1'})
            .attr('x', (d, i) => {return (i*(this.square_size+this.square_spacing))})
            .attr('y', -this.square_size/2)
            .attr('width', this.square_size)
            .attr('height', this.square_size)
            .on('mouseover', function (d, i) {
                d3.select(this).attr('data-original-title', d => {
                    return self.getStateBoxToolTip(d)
                })
                d3.select(this).transition()
                        .style('stroke', '#61b2e4')
                        .style('stroke-width', 3)
            })
            .on('mouseout', function (d,i) {
                d3.select(this).transition()
                .style('stroke-width', d => {
                    return (d.run_id != undefined) ? '2' : '1'
                })
                .style('stroke', d => {
                    return !d.state || d.state === 'scheduled' ? '#e1e6e5' : 'transparent'
                })                
            }) 
        //update部分更新数据
        stateboxes.attr('class', d => {return 'state ' + d.state})
            .attr('data-html', true)
            .attr('data-toggle', 'tooltip')
            .attr('title', d => {
                return self.getStateBoxToolTip(d)
            })
            .attr('rx', d => {return (d.run_id != undefined)? '15': '5'})
            .attr('ry', d => {return (d.run_id != undefined)? '15': '5'})
            .style('shape-rendering', d => {return (d.run_id != undefined)? 'auto': 'crispEdges'})
            .style('stroke-width', d => {return (d.run_id != undefined)? '2': '1'})
            .style('stroke-opacity', d => {return d.external_trigger ? '0': '1'})
            .attr('x', (d, i) => {return (i*(this.square_size+this.square_spacing))})
            .attr('y', -this.square_size/2)
            .attr('width', this.square_size)
            .attr('height', this.square_size)
            .on('mouseover', function (d, i) {
                d3.select(this).attr('data-original-title', d => {
                    return self.getStateBoxToolTip(d)
                })
                d3.select(this).transition()
                        .style('stroke', '#61b2e4')
                        .style('stroke-width', 3)
                $(this).tooltip('show')
            })
            .on('mouseout', function (d,i) {
                d3.select(this).transition()
                .style('stroke-width', d => {
                    return (d.run_id != undefined) ? '2' : '1'
                })
                .style('stroke', d => {
                    return !d.state || d.state === 'scheduled' ? '#e1e6e5' : 'transparent'
                })                
            }) 
        //exit部分的删除
        stateboxes.exit().remove()

        // Transition exiting this.nodes to the parent's new position.
        node.exit().transition()
            .duration(duration)
            .attr('transform', d => { 
                return 'translate(' + d.y + ',' + d.x + ')' 
            })
            .style('opacity', 1e-6)
            .remove()

        // Update the links…
        let link = levelGraph.selectAll('path.link')
            .data(this.descendants.slice(1))

        // Enter any new links at the parent's previous position.
        let linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', d => {
                d.x = d.x * 1.3
            })
            .attr('d', diagonal)

        // Transition links to their new position.
        let linkUpdate = linkEnter.merge(link)
        linkUpdate.transition()
            .duration(duration)
            .attr('d', diagonal)

        // Transition exiting this.nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr('d', diagonal)
            .remove()

        // Stash the old positions for transition.
        this.descendants.forEach(d => {
            d.x0 = d.x
            d.y0 = d.y
        })
        this.set_tooltip()
    },
    getState (state) {
        switch (state) {
            case 'success':
                return '成功'
            case 'running':
                return '执行中'
            case 'failed':
                return '失败'
            case 'upstream_failed':
                return '上游失败'
            case 'skipped':
                return '跳过'
            case 'retry':
                return '重试'
            case 'queued':
                return '排队'
            default:
                return '-'
        }
    },
    getStateBoxToolTip (d) {
        let s = "<p align='left'>"
        let runId = d.run_id ? d.run_id : '-'
        let queue = d.queue ? d.queue : '-'
        let executionDate = d.execution_date ? util.transformToDate(d.execution_date) : '-'
        s = s + '队列: ' + queue + '<br>'
        s += '执行日期: ' + executionDate + '<br>'
        s += '运行Id: ' + runId + '<br>'
        // s += 'Operator: ' + d.operator + '<br>'
        //原子作业平台ATOMFLOWAT-162(卓业执行日志页面，运行id显示不全，周期没有获取出来)
        if(d.start_date !== undefined){
            let startDate = d.start_date ? util.transformToDate(d.start_date) : '-'
            let endDate = d.end_date ? util.transformToDate(d.end_date) : '-'
            let duration = d.duration ? d.duration + 's' : '-'
            s += '执行开始时间: ' + startDate + '<br>'
            s += '执行结束时间: ' + endDate + '<br>'
            s += '周期: ' + duration + '<br>'
            s += '状态: ' + this.getState(d.state) + '<br>'
        }
        s = s + '</p>'
        return s
    }
  },
  computed: {
    /** 
     * @description 
     * @author xinghua.wen
    */
    nodeobj () {
        let obj = {}, nodes = this.descendants
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i].data
            obj[node.name] = node
        }
        return obj
    },
    baseNode () {
        let rst = {
            instances: []
        }
        if (!this.nodes || !this.descendants.length) {
            return rst
        }
        rst = this.descendants.length === 1 ? this.descendants[0].data : this.descendants[1].data
        return rst
    },
    numSquare () {
        if (this.baseNode.instances.length) return this.baseNode.instances.length
        else return 1
    },
    extent() {
        return d3.extent(this.baseNode.instances, (d, i) => {
            return new Date(d.execution_date * 1000)
        })
    },
    xScale () {
        return d3.scaleTime()
        .domain(this.extent)
        .range([
            this.square_size / 2,
            (this.numSquare * this.square_size) + ((this.numSquare - 1) * this.square_spacing) - (this.square_size / 2)
        ])
    },
    /** 
     * @description 后代数据 
     */ 
    descendants () {
        return this.nodes.descendants()
    }
  },
  watch: {
    /**
     * @description 观察data变化，刷新页面效果
     */
    data: {
        deep: true,
        handler () {
            if (!this.data) {
                return
            }
            this.update(this.data)
        }
    },
    xScale () {
        axis.call(
            d3.axisTop()
            .scale(this.xScale)
            .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S"))
            .ticks(2)
        )
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'start')
    }
  },
  mounted () {
    // 初始化图表绘制 1. 绘制坐标轴；2. 绘制图container
    let svg = d3.select(this.$el).select('svg.tree')
    let container = svg.append('g').attr('class', 'container')
    axis = container
        .insert('g')
        .attr('class', 'axis')
        .attr('transform',
            'translate(' + (this.square_x + this.margin.left) + ', ' + this.axisHeight + ')')  
    levelGraph = container
        .append('g')
        .attr('class', 'level')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    // 图表添加缩放功能
    this.zoom = d3.zoom()
        .scaleExtent([1 / 2, 8])
        .on("zoom", this.zoomed) 
    svg.call(this.zoom)    
  },
  created () {
    // 图表尺寸等计算单位
    this.barHeight = 30
    this.axisHeight = 40
    this.square_x = 500
    this.square_size = 30
    this.square_spacing = 5
    this.margin = {top: this.barHeight + this.axisHeight, right: 0, bottom: 0, left: this.barHeight/2}
    let width = 960 - this.margin.left - this.margin.right
    this.barWidth = width * 0.9
    this.tree = d3.tree().nodeSize([0, 25])
  }
}
</script>
<style lang="scss">
.tree-graph-container {
    overflow: hidden;
}
</style>
