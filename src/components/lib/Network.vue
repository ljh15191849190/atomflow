<template lang="pug">
  div.drag-container
    el-row 
        el-col(:span="12")
            el-button-group
                el-button(
                    size="mini"
                    :icon="item.icon"
                    v-for="item in manipulationBtns"
                    :key="item.id"
                    @click="manipulation(item.id)"
                    :disabled="!btnSwitch && (item.id === 'addEdge' && allNodes.length === 0 || item.id === 'deleteEdge' && checkedEdges.length === 0 || item.id === 'deleteNode' && checkedNodes.length === 0 || item.id === 'clearAll' && initNodes.length === 0)") {{item.name}}
        el-col(:span="12")
    el-row.network-container
</template>
<script>
/**
 * @description 网络拓扑图组件
 * @xinghua.wen
 */
import vis from 'vis'
import Utils from '@/server/Utils'

let networkInstance = null
export default {
  props: ['nodes', 'edges'],
  data () {
      return {
        network: null,
        manipulationBtns: [
            {
                id: 'addNode', name: '添加节点', icon: 'el-icon-circle-plus-outline'
            },
            {
                id: 'addEdge', name: '添加连接', icon: 'atom-icon-link'
            },
            {
                id: 'deleteEdge', name: '删除连接', icon: 'atom-icon-delete'
            },
            {
                id: 'clearAll', name: '清空', icon: 'atom-icon-clear'
            }
        ],
        // 初始化modes、edges
        initNodes: [],
        initEdges: [],
        // 开启编辑模式
        btnSwitch: false,
        // 选中的node/edge
        checkedEdges: [],
        checkedNodes: [],
        // 所有的nodes、edges
        allNodes: [],
        allEdges: [],
        themeColor: '#409EFF',
        activeThemeColor: '#D2E5FF',
        edgeThemeColor: '#646464',
        nodeTextColor: '#fff'
      }
  },
  methods: {
    /**
     * @description 初始化网络拓扑组件
     * @author xinghua.wen
     * */
    initNetwork () {
        let vm = this
        this.$nextTick(
            () => {
                let options = {
                    edges: {
                        smooth: {
                            forceDirection: 'none',
                            roundness: 0
                        },
                        arrows: {
                            to: {enabled: true, scaleFactor: 1, type: 'arrow'},
                            from: {enabled: false, scaleFactor: 1, type: 'arrow'}
                        },
                        color: {
                            color: this.edgeThemeColor,
                            highlight: this.activeThemeColor,
                            hover: this.activeThemeColor,
                            inherit: 'from',
                            opacity: 0.8
                        },    
                        chosen: {
                            label: function (values, id, selected, hovering) {
                                values.color = '#0081f6'
                            },
                            edge: function (values, id, selected, hovering) {
                                values.toArrowType = 'circle'
                            }
                        }
                    },
                    nodes: {
                        shape: 'box',
                        borderWidth: 0,
                        borderWidthSelected: 0,
                        font: {
                            color: this.nodeTextColor
                        },
                        color: {
                            background: this.themeColor,
                            highlight: {
                                background: this.activeThemeColor
                            },
                            hover: {
                                background: this.activeThemeColor
                            }
                        },
                        widthConstraint: {
                            minimum: 120,
                            maximum: 120
                        },
                        heightConstraint: {minimum: 30, valign: 'middle'}
                    },
                    physics: {
                        forceAtlas2Based: {
                            springLength: 200,
                            springConstant: 0.32,
                            damping: 0.22
                        },
                        maxVelocity: 82,
                        minVelocity: 1,
                        solver: 'forceAtlas2Based'
                    },
                    manipulation: {
                        addEdge: function (data, callback) {
                            if (data.from === data.to) {
                                //分支、合流不可以连接自己
                                let nodes = vm.initNodes.get()
                                let type = null
                                let index = nodes.findIndex(item => { 
                                        type = item.nodeCategory
                                        return item.id === data.to && type && (type === 2 || type === 3)
                                    })
                                if (index < 0) {
                                     vm.$confirm('此操作将连接该节点自身, 是否继续?', '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                    }).then(() => {
                                        callback(data)
                                        vm.btnSwitch = false
                                    }).catch(() => { 
                                    })
                                } else {
                                    let msg = type === 2 ? '分支不能连接自身!' : '合流不能连接自身!'
                                    vm.$notify({
                                        title: '通知',
                                        type: 'warning',
                                        message: msg
                                    })
                                } 
                            } else {
                                let nodes = vm.initNodes.get()
                                let eages = vm.initEdges.get()
                                let fromShapeType = 1
                                let toShapeType = 1
                                let fromIndex = nodes.findIndex(item => { 
                                    fromShapeType = item.nodeCategory
                                    return data.from === item.id && fromShapeType && (fromShapeType === 2 || fromShapeType === 3)
                                })
                                let toIndex = nodes.findIndex(item => {
                                    toShapeType = item.nodeCategory
                                    return data.to === item.id && toShapeType && (toShapeType === 2 || toShapeType === 3) 
                                })
                                if (toIndex === -1) {
                                    let hasFromMeageIndex = eages.findIndex(item => {
                                        return item.from === data.from
                                    })
                                    //end节点是脚本的
                                    if (fromIndex > -1 && fromShapeType === 2) {
                                        data.label = 'Edit'
                                        data.title = '双击编辑'
                                        callback(data)   
                                    } else if (fromIndex > -1 && fromShapeType === 3) {
                                        //合流只能流向一个脚本
                                        if (hasFromMeageIndex > -1) {
                                            vm.$notify({
                                                title: '通知',
                                                type: 'warning',
                                                message: '合流只能连接一个脚本节点!'
                                            })
                                        } else {
                                            callback(data)
                                        }
                                    } else {
                                        callback(data)
                                    }              
                                } else if (fromIndex === -1 && toIndex > -1) {
                                    //start节点是脚本、end节点是分支或者合流的
                                    let hasToEageIndex = eages.findIndex(item => {
                                        return item.to === data.to
                                    })
                                    
                                    if (toShapeType === 2) {
                                        if (hasToEageIndex > -1) {
                                            //一个分支只能有一个来源
                                            vm.$notify({
                                                title: '通知',
                                                type: 'warning',
                                                message: '该分支已有连接!'
                                            })
                                        } else {
                                            //一个源只能有一个分支
                                            let hasFromEageIndex = eages.findIndex(item => {
                                                return item.from === data.from
                                            })

                                            if (hasFromEageIndex > -1) {
                                                vm.$notify({
                                                    title: '通知',
                                                    type: 'warning',
                                                    message: '一个脚本节点只能有一个分支!'
                                                })
                                            } else {
                                                callback(data)
                                            }
                                        }
                                    } else {
                                        callback(data)
                                    }
                                } else {
                                    //start和end节点是分支或者合流的
                                    let msg = ''
                                    if (fromShapeType === toShapeType) {
                                        msg = fromShapeType === 2 ? '分支不能连接分支!' : '合流不能连接合流!' 
                                    } else {
                                        msg = fromShapeType === 2 ? '分支不能连接合流!' : '合流不能连接分支!'
                                    }
                                    vm.$notify({
                                        title: '通知',
                                        type: 'warning',
                                        message: msg
                                    })
                                }
                            }
                        }
                    }
                }
                networkInstance = new vis.Network(this.$el.querySelector('.network-container'), {nodes: this.initNodes, edges: this.initEdges}, options)  
                networkInstance.on('selectNode', this.checkedNode).on('selectEdge', this.checkedEdge).on('doubleClick', this.doubleClickEdge)
            }
        )
    },
    addNode (node) {
        this.initNodes.add(node)
    },
    clear () {
        let vm = this
        vm.$confirm('确定要清空模板内容吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            vm.initNodes.remove(vm.nodes)
        }).catch(() => { 
        })
    },
    manipulation (id) {
        if (id === 'addNode') {
            let node = {id: Utils.uuid(), label: '', shape: 'box'}
            this.addNode(node)
            return
        }
        if (id === 'addEdge') {
           networkInstance.addEdgeMode()
           return
        }
        if (id === 'deleteEdge') {
            let selectedEdges = networkInstance.getSelectedEdges()
            if (selectedEdges && selectedEdges.length) {
                let eages = this.initEdges.get()
                let index = eages.findIndex(item => { return item.id === selectedEdges[0] })
                if (index > -1) {
                    this.deleteEage(eages[index])
                }
            }
            networkInstance.deleteSelected()
            this.checkedEdges.splice(0, this.checkedEdges.length)     
            return                   
        }
        if (id === 'deleteNode') {
            this.$emit('deleteNode', networkInstance.getSelectedNodes())
            networkInstance.deleteSelected()
            this.checkedNodes.splice(0, this.checkedNodes.length)            
        }
        if (id === 'clearAll') {
            this.clear()
        }
    },
    /**
     * 选择节点或者连线
     * @augments 
     * @author xinghua.wen
     * */
    checkedNode (obj) {
        if (obj.nodes.length) {
            this.btnSwitch = false
            this.checkedEdges.splice(0, this.checkedEdges.length)            
            this.checkedNodes = obj.nodes
            this.$emit('checkedNode', this.initNodes.get(this.checkedNodes[0]))
        }
    },
    checkedEdge (obj) {
        if (obj.edges.length) {
            this.btnSwitch = false
            this.checkedNodes.splice(0, this.checkedNodes.length)
            this.checkedEdges = obj.edges            
        }
    },
    doubleClickEdge (obj) {
        let curEage = this.edges.find(item => {
            return item.label && item.id === obj.edges[0]
        })

        let nodes = this.initNodes.get()
        let eages = this.initEdges.get()

        //找到点击连接的所处分支的上一个节点
        let fieldId = null
        if (curEage) {
            for (const key in eages) {
                if (curEage.from === eages[key].to) {
                    fieldId = eages[key].from
                    break
                }
            }
        }

        let rstCode = null
        if (fieldId) {
            for (const key in nodes) {
                if (fieldId === nodes[key].id) {
                    if (nodes[key].version && nodes[key].version.rstCode) {
                        rstCode = nodes[key].version.rstCode
                    } else {
                        this.$notify({
                            title: '通知',
                            type: 'warning',
                            message: '请先编辑该分支的源节点!'
                        })
                    }
                    break
                }
            }
        }

        if (rstCode) {
            let curObj = {rstCode: rstCode, eage: curEage}
            this.$emit('editEage', curObj)
        }
    },
    getNodes () {
        this.allNodes = this.initNodes.get()
        this.$emit('networkNodesChange', this.allNodes)
    },
    getEdges () {
        this.allEdges = this.initEdges.get()   
        this.$emit('networkEdgesChange', this.allEdges)
    },
    updateNode (node) {
        if (node.nodeCategory === 2) {
            node.shape = 'ellipse'
        } else if (node.nodeCategory === 3) {
            node.shape = 'circle'
        } else {
            node.shape = 'box'
        }
        this.initNodes.update(node)
        //处理存在连接自己的分支或者合流
        let eages = this.initEdges.get()
        eages.forEach((item, index) => {
            if (node.shape !== 'box') {
                if (item.from === item.to && node.id === item.to) {
                    this.deleteEage([eages[index]])
                }
            }
            //处理node变化引起的eage
            if ((node.id === item.from) && !eages[index].label) {
                eages[index].label = node.shape === 'ellipse' ? 'Edit' : ''
                eages[index].title = node.shape === 'ellipse' ? '双击编辑' : ''
                this.initEdges.update(eages[index])
            }
        })

        let nodes = this.initNodes.get()
        let hasEageFlag = false
        let hasEageindx = eages.findIndex(item => { return node.shape === 'ellipse' && node.id === item.to })
        let hasMergeFlag = false
        let hasMergeindx = eages.findIndex(item => { return node.shape === 'circle' && node.id === item.from })
        //处理存在分支(合流)连接分支(合流) 或者 存在多脚本连分支 或者 存在合流连多脚本
        nodes.forEach(nodeItem => {
            //已经存在一个脚本连接分支
            if (!hasEageFlag && hasEageindx > -1 && (eages[hasEageindx].from === nodeItem.id) && nodeItem.shape === 'box') {
                hasEageFlag = true
            }
            //已经存在一个合流连接脚本
            if (!hasMergeFlag && hasMergeindx > -1 && (eages[hasMergeindx].to === nodeItem.id) && nodeItem.shape === 'box') {
                hasMergeFlag = true
            }
            
            eages.forEach((eageItem, index) => {
                //分支(合流)连接分支(合流)
                let isFromNetSelf = false
                let isToNetSelf = false
                let isShellTOMti = false
                let isMtiToShell = false
                if (node.shape !== 'box') {
                    if (node.id === eageItem.from) {
                        if (eageItem.to === nodeItem.id && nodeItem.shape !== 'box') {
                            isFromNetSelf = true
                        }
                    } else if (node.id === eageItem.to) {
                        if (eageItem.from === nodeItem.id && nodeItem.shape !== 'box') {
                            isToNetSelf = true
                        } 
                    }

                    if (hasEageFlag && hasEageindx !== index && node.id === eageItem.to) {
                        isShellTOMti = true
                    }

                    if (hasMergeFlag && hasMergeindx !== index && node.id === eageItem.from) {
                        isMtiToShell = true
                    }
                }
                
                if (isFromNetSelf || isToNetSelf || isShellTOMti || isMtiToShell) {
                    this.deleteEage([eages[index]])
                }
            })
        })
    },
    deleteNode (node) {
        this.initNodes.remove(node)
    },
    updateEage (eage) {
        //处理eage是分支的
        let returnCode = eage.returnCode
        if (returnCode) {
            let nodes = this.initNodes.get()
            let eageNode = nodes.find(item => { return eage.from === item.id })
            if (!eageNode.codeMapBranch || !eageNode.codeMapBranch.length) {
                eageNode.codeMapBranch = []
                let codeMapBranchItem = {code: returnCode.code, targetId: eage.to, code_desc: returnCode.desc}
                eageNode.codeMapBranch.push(codeMapBranchItem)
                this.initNodes.update(eageNode)
            } else {
                //是否在codeMapBranch中
                let index = eageNode.codeMapBranch.findIndex(item => { return item.code === returnCode.code })
                if (index > -1) {
                    this.$notify({
                        title: '通知',
                        type: 'warning',
                        message: '该分支条件已被选择, 请重新选择!'
                    })

                    return
                } else {
                    //是否是更新eage
                    let updateIndex = eageNode.codeMapBranch.findIndex(item => { return item.targetId === eage.to })
                    if (updateIndex > -1) {
                        eageNode.codeMapBranch[updateIndex].code = returnCode.code
                        eageNode.codeMapBranch[updateIndex].code_desc = returnCode.desc
                    } else {
                        let codeMapBranchItem = {code: returnCode.code, targetId: eage.to, code_desc: returnCode.desc}
                        eageNode.codeMapBranch.push(codeMapBranchItem)
                    }
                    
                    this.initNodes.update(eageNode)
                }
            }
        }

        this.initEdges.update(eage)
    },
    deleteEage (eage) {
        //处理eage是分支被删除时，去除分支节点中codeMapBranch的item
        let returnCode = eage.returnCode
        if (returnCode) {
            let nodes = this.initNodes.get()
            let eageNode = nodes.find(item => { return eage.from === item.id })
            let index = eageNode.codeMapBranch.findIndex(item => { return item.code === returnCode.code })
            if (index > -1) {
                eageNode.codeMapBranch.splice(index, 1)
                this.initNodes.update(eageNode)
            }
        }

        this.initEdges.remove(eage)
    },
    unselectAll () {
        networkInstance.unselectAll()
    }
  },
  watch: {
    nodes () {
        if (this.allNodes.length !== this.nodes.length) {
            this.initNodes.update(this.nodes)            
        }
        // 节点数据变化后，删掉连线的冗余数据
        let tempEdges = JSON.parse(JSON.stringify(this.edges))
        let rst = tempEdges.filter(
            item => {
                if (this.allNodeIds.indexOf(item.from) === -1 || this.allNodeIds.indexOf(item.to) === -1) {
                    return item
                }
            }
        )
        this.initEdges.remove(rst)
    },
    edges () {
        if (this.allEdges.length !== this.edges.length) {
            let tempEdges = JSON.parse(JSON.stringify(this.edges))
            let rst = tempEdges.filter(
                item => {
                    if (this.allNodeIds.indexOf(item.from) !== -1 && this.allNodeIds.indexOf(item.to) !== -1) {
                        return item
                    }
                }
            )

            this.initEdges.update(rst)
        }
    }
  },
  computed: {
    allNodeIds () {
        return this.nodes.map(
            item => {
                return item.id
            }
        )
    }
  },
  mounted () {
    this.initNetwork()
  },
  created () {
    this.initNodes = new vis.DataSet(this.nodes)
    this.initNodes.on('*', () => {
        this.getNodes()     
    })
    this.initEdges = new vis.DataSet(this.edges)
    this.initEdges.on('*', () => {
        this.getEdges()
    })
  }
}
</script>
<style lang="scss" scoped>
.network-container {
    height: 600px;
}
</style>
<style lang="scss">
.vis-manipulation, .vis-close, .vis-edit-mode {
    display: none !important;
}
</style>
