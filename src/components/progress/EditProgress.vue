<template lang="pug">
  div.container-flud
    el-row.breadcrumb-container
      el-breadcrumb(separator-class="el-icon-arrow-right")
        el-breadcrumb-item 原子作业平台
        el-breadcrumb-item(v-if="$route.query.from" :to="{ path: '/template' }") 流程列表
        el-breadcrumb-item {{showMunuTitle}}
    div.atom-content
        NodeNavbar.left-navbar.right-border
        div.right-canvas
            el-upload.import-btn(
                ref="upload"
                :auto-upload="false"
                :multiple="!$route.params.id"
                action="upload"
                :on-change="fileChange"
                :show-file-list="importFilesList"
            )
                button(slot="trigger" ref="uploadbtn") 导入编排
            FlowchartVue(
                ref="flowchart"
                :pureNodes="progressNodes"
                :defaultLinks="links"
                :useZoom="diagramConfig.useDrag" 
                :useDrag="diagramConfig.useZoom" 
                :useGrid="diagramConfig.useGrid"
                :uniqueKey="diagramConfig.uniqueKey"
                :dragCollisionDetect="diagramConfig.dragCollisionDetect"
                :findReferencedNodes="findReferencedNodes"
                :beforeAddLink="beforeAddLink"
                :beforeDeleteNodes="beforeDeleteNodes"
                :beforeDeleteLink="beforeDeleteLink"
                :nodeClick="nodeClick"
                :linkClick="linkClick"
                :clickCanvas="clickCanvas"
                :scale.sync="diagramConfig.scale"
            )
                div.moreCanvasBtns(slot="moreCanvasBtns")
                    IconButton.feature-button(
                        v-for="(operation, index) in operations"
                        :key="operation.key"
                        :type="operation.type"
                        :args="{type: operation.prop}"
                        @iconClick="handleOperation"
                        :text="operation.label"
                        :class="{'first-button': !index}"
                    )
            el-radio-group.flowType-radio(v-model="flowData.flowType")
                el-radio(v-for="type in types" :key="type.id" :label="type.id") {{ type.name }}
            SideDialog(
                v-for="node in progressNodes"
                v-if="node.info.category !== 'start' && node.info.category !== 'end' && node.info.category !== 'join' && nodeConfigs[node.id]"
                :key="node.id"
                :visible.sync="nodeConfigs[node.id].visible"
                placement="right"
                :title="dialogTitle"
                width="550px"
            )
                EditProcessNode(
                    v-if="node.info.category === 'progress'"
                    slot="dialog-content"
                    :config="nodeConfigs[node.id]"
                    :uniqueId="node.id"
                    :canvasData="progressNodes.find(d => d.id === node.id)"
                    :updateNodeLabel="updateNodeLabel"
                    :hasTargetHost="flowData.flowType !== 'normal'"
                    :flowType="flowData.flowType"
                )
                EditBranchNode(
                    v-if="node.info.category === 'branch'"
                    slot="dialog-content"
                    :config="nodeConfigs[node.id]"
                    :progressNode="getProgressNode(node)"
                    :uniqueId="node.id"
                    :canvasData="progressNodes.find(d => d.id === node.id)"
                    :updateNodeLabel="updateNodeLabel"
                )
                el-row(slot="dialog-content")
                    el-button.mr130(size="mini" type="danger" @click="deleteCurNode(node)") 删除节点
            SideDialog(
                v-for="link in links"
                v-if="checkedLink && link.id == checkedLink.id"
                :key="link.id"
                :visible.sync="checkedLink.visible"
                placement="right"
                title="连线"    
            )
                EditLink(
                    v-show="checkedLink && link.id === checkedLink.id"
                    slot="dialog-content"
                    :uniqueId="link.id"
                    :link="link"
                    :nodeConfigs="nodeConfigs"
                    :checkedBranchRules="allBranchLinkValues[link.source.id]"
                    :updateLinkLabel="updateLinkLabel"
                    @deleteLink="beforeDeleteLink"
                )
            SaveTemplate(   
                :visible="saveModalVisible"
                v-if="saveModalVisible"
                @closeDialog="closeSaveModal"
                :progress="diagramFormData"
                :flowForm.sync="flowData"
                :routerLeave.sync="routerLeave"
                :isEdit="flowData.id !== 'add'"
            )
            el-dialog(title="导出" v-if="exportDialog" :visible.sync="exportDialog" width="600px")
                el-form(label-width="80px" size="small" label-position="left")
                    el-form-item(label="文件名称")
                        el-input(type="text" v-model="exportFileName")
                    el-form-item
                        el-button(type="default" @click="exportDialog = false") 取消
                        el-button(type="primary" @click="exportToFile") 确定
</template>
<script>
/**
 * @description 流程编排可视化入口
 * @author xinghua.wen
 */

import NodeNavbar from './NodeNavbar'
import { FlowchartVue, SideDialog } from '@leaptocloud/standard-ui'
import EditProcessNode from './configForm/nodes/EditProcessNode'
import EditBranchNode from './configForm/nodes/EditBranchNode'
import EditLink from './configForm/links/EditLink'
import Utils from '@server/Utils'
import { MessageBox } from 'element-ui'
import SaveTemplate from './SaveTemplate'
import IconButton from '@lib/AtomIconButton'
import Api from '@api'
import FileSaver from 'file-saver'
import {mapActions} from 'vuex'

// 新增模式，默认显示开始、结束节点配置信息
const defaultNodes = [
    {
        id: '',
        fx: 160,
        fy: 290,
        radius: 20,
        shape: 'circle',
        checked: false,
        info: {
            label: '开始',
            category: 'start',
            shape: 'circle',
            referenceKey: [
                {
                    category: 'progress',
                    tooltip: '流程'
                }
            ]
        }
    },
    {
        id: '',
        fx: 660,
        fy: 290,
        radius: 20,
        shape: 'circle',
        checked: false,
        info: {
            label: '结束',
            category: 'end',
            shape: 'circle',
            referenceKey: []
        }
    }
]

export default {
  $_veeValidate: { validator: 'new' },
  beforeRouteLeave (to, from, next) {
    if (this.routerLeave) {
        next()
        return
    }

    this.$confirm('当前流程未保存,离开此页面后该数据将被销毁,是否继续离开?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        next()
    }).catch(() => {
        this.setActivedNavIndex(this.currentPath)
    })
  },
  data () {
    return {
        progressId: '',
        progressNodes: [],
        links: [],
        types: [
            { id: 'normal', name: '简单流程' },
            { id: 'complex', name: '复杂流程' }
        ],
        operations: [
            { prop: 'clear', label: '清空', type: 'atom-icon-clear' },
            { prop: 'clone', label: '克隆', type: 'atom-icon-progress-clone' },
            { prop: 'save', label: '保存', type: 'atom-icon-progress-save' },
            { prop: 'import', label: '导入', type: 'atom-icon-progress-import' },
            { prop: 'export', label: '导出', type: 'atom-icon-progress-export' },
            { prop: 'zoomExtent', label: '画布居中', type: 'atom-icon-progress-center' }
        ],
        diagramConfig: {
            scale: 100,
            useDrag: true,
            useZoom: true,
            useGrid: false,
            dragCollisionDetect: false,
            uniqueKey: 'category'
        },
        diagramInstance: null,
        dialogVisible: false,
        modal: false,
        checkedNode: null,
        checkedLink: null,
        preCheckedNode: null,
        nodeConfigs: {},
        flowData: {
            owner: '',
            flowName: '',
            timeout: 60,
            flowType: 'normal',
            id: '',
            description: ''
        },
        saveModalVisible: false,
        exportDialog: false,
        importFilesList: false,
        exportFileName: '',
        routerLeave: false, // 保存成功路由合法跳转标志,
        currentPath: 'template/add'
    }
  },

  computed: {
    startEndNodeIds () {
        return this.progressNodes.filter(d => d.info.category === 'start' || d.info.category === 'end').map(d => d.id)
    },

    showMunuTitle () {
        let title = this.flowData.id === 'add' ? '新建流程' : '编辑流程'
        return title
    },

    dialogTitle () {
        if (!this.checkedNode) {
            return ''
        }
        return this.checkedNode.info.label
    },

    /**
     * @description 流程节点的业务配置数据
     */
    configs () {
        return Object.keys(this.nodeConfigs).map(key => {
            let config = JSON.parse(JSON.stringify(this.nodeConfigs[key]))
            config.taskId = key
            delete config.visible

            return config
        })
    },

    canvas () {
       let links = JSON.parse(JSON.stringify(this.links))
       links.forEach(link => {
           link.source = link.source.id
           link.target = link.target.id
        })
       return {
           nodes: this.progressNodes, 
           links
        }
    },

    nodes () {
        return this.progressNodes.filter(d => d.info.category !== 'start' && d.info.category !== 'end')
            .map(d => {
            let node = JSON.parse('{}')
            node.taskId = d.id
            node.taskName = this.nodeConfigs[d.id].hasOwnProperty('taskName') ? this.nodeConfigs[d.id].taskName : d.info.category
            node.config = this.nodeConfigs[d.id]

            return node
        })
    },

    edges () {
        return this.links.filter(link => {
            // return (typeof link.source === 'string' && this.startEndNodeIds.indexOf(link.source) === -1 && typeof link.target === 'string' && this.startEndNodeIds.indexOf(link.target) === -1) || 
            return (typeof link.source === 'object' && this.startEndNodeIds.indexOf(link.source.id) === -1 && 
            typeof link.target === 'object' && this.startEndNodeIds.indexOf(link.target.id) === -1)
        }).map(link => {
            let edge = JSON.parse('{}')
            edge.source = link.source.id
            edge.target = link.target.id
            edge.id = link.id
            edge.values = link.values
            edge.label = link.label ? link.label : ''
            // edge.description = link.description
            return edge
        })
    },

    /**
     * 汇总 DAG 表单值
     */
    diagramFormData () {
        let flow = {
            nodes: this.nodes,
            edges: this.edges,
            canvas: this.canvas,
            timeout: this.flowData.timeout,
            flowName: this.flowData.flowName,
            owner: this.flowData.owner,
            flowType: this.flowData.flowType
        }
        if (this.flowData.id) {
            flow.id = this.flowData.id
        }
        return flow
    },

    /**
     * 以分支节点为维度，获取所有与其有关系(source)的所有连线的业务配置表单值
     */
    allBranchLinkValues () {
        let rst = {}
        this.links.filter(link => link.source && link.source.info && link.source.info.category === 'branch')
            .forEach(link => {
                if (!rst[link.source.id]) rst[link.source.id] = []
                    rst[link.source.id].push(this.links.find(lk => lk.id === link.id).values)
            })
        return rst
    },

    nodeCoordinates () {
        return this.progressNodes.map(
            node => node.fx + ',' + node.fy
        )
    }
  },

  methods: {
    initialize (rstData) {
        this.progressNodes.splice(0, this.progressNodes.length)
        this.links.splice(0, this.links.length)

        // $nextTick 让流程拓扑图组件监听到progressNodes以及links的长度变化，及时更改画布内容
        this.$nextTick(
            () => {
                // 通过导入文件功能，初始化画布信息
                if (rstData) {
                    this.initEditCanvasForm(rstData)
                    return
                }

                // 新增模式
                if (this.flowData.id === 'add') {
                    // 新增模式，初始化开始/结束节点【id信息】
                    let startend = JSON.parse(JSON.stringify(defaultNodes))
                    startend.forEach(
                        d => {
                            d.id = Utils.uuid()
                        }
                    )
                    
                    this.progressNodes = this.progressNodes.concat(startend)
                } else {
                    // 编辑模式，初始化画布以及表单配置信息
                    Api.get('getTemplateById', {id: this.flowData.id}, true).then(
                        (data) => {
                            if (data.data) this.initEditCanvasForm(data.data)
                        }
                    )
                }
            }
        )
    },

    /**
     * @description 编辑模式从后端拉取到流程图数据后，初始化图以及业务表单数据
     */
    initEditCanvasForm (data) {
        this.flowData.flowName = data.flowName
        this.flowData.flowType = data.flowType
        this.flowData.owner = data.owner
        this.flowData.description = data.description
        this.progressNodes = data.canvas.nodes
        this.links = data.canvas.links
        data.nodes.forEach(node => {
            if (!this.nodeConfigs[node.taskId]) this.$set(this.nodeConfigs, node.taskId, {})
            this.nodeConfigs[node.taskId] = JSON.parse(JSON.stringify(node.config))
            this.$set(this.nodeConfigs[node.taskId], 'visible', false)
        })
    },

    findReferencedNodes (reference, node) {
        return node.info.category === reference.category
    },

    /**
     * @description 节点连线前确认事件
     */
    beforeAddLink (source, target) {
        let validation = source.info.referenceKey.some(reference => reference.category === target.info.category)
        if (target.info.category === 'branch') {
            validation = !this.links.find(link => link.target.id === target.id)
            if (!validation) {
                this.$notify({
                type: 'warning',
                message: target.info.label + '(分支节点)只能连接一个流程节点'
            })
            return validation
            }
        }
        if (!validation) {
            this.$notify({
                type: 'warning',
                message: source.info.label + '不能与' + target.info.label + '连接'
            })
            return validation
        }
        return {
            type: 'link',
            description: '',
            format: 'broken',
            visible: false
        }
    },

    /**
     * @description 删除节点前确认事件
     */
    beforeDeleteNodes (nodes) {
        MessageBox({
            message: '确认删除选中节点？',
            title: '警告',
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }).then(() => {
            // 画布删除节点
            this.diagramInstance.deleteNodes(nodes)
            // 画布重绘节点以及连线
            this.diagramInstance.redrawNodes()
            this.diagramInstance.redrawLinks()

            // 删除对应节点的业务配置内容
            nodes.forEach(node => delete this.nodeConfigs[node.id])
        }).catch(() => {
        })
    },

    beforeDeleteLink (d) {
        MessageBox({
            message: '确认删除选中连线？',
            title: '警告',
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }).then(() => {
            this.resetBranchLinkTarget(d)
            // 画布删除节点
            this.diagramInstance.deleteLink(d)
            // 画布重绘节点以及连线
            this.diagramInstance.redrawLinks()
        }).catch(() => {
        })
    },

    // AT-582 分支与流程节点的连线在删除前，重置该分支节点上与当前流程有关系的taskId
    resetBranchLinkTarget (d) {
        if (typeof d.source === 'object' && d.source.info && d.source.info.category === 'branch') {
            // AT-582 遍历分支节点的配置规则，查找匹配的配置项，重置 taskId 为 null
            this.nodeConfigs[d.source.id].rules.forEach(
                rule => {
                    if (rule.ruleId === d.values.ruleId) rule.taskId = null
                }
            )
        }
    },

    /**
     * @description 节点点击事件
     */
    nodeClick (d) {
        this.checkedNode = d
        this.checkedLink = null
        if (this.preCheckedNode && this.nodeConfigs[this.preCheckedNode.id] && this.nodeConfigs[this.preCheckedNode.id].hasOwnProperty('visible')) {
            this.nodeConfigs[this.preCheckedNode.id].visible = false
        }
        if (this.checkedNode.info.category !== 'start' && this.checkedNode.info.category !== 'end') {
            if (!this.nodeConfigs[d.id].hasOwnProperty('visible')) this.$set(this.nodeConfigs[d.id], 'visible', true)
            else this.nodeConfigs[d.id].visible = true
        }

        this.preCheckedNode = d
    },

    linkClick (d) {
        if (this.checkedNode && this.checkedNode.info.category !== 'start' && this.checkedNode.info.category !== 'end' && this.nodeConfigs[this.checkedNode.id] && this.nodeConfigs[this.checkedNode.id].visible) this.nodeConfigs[this.checkedNode.id].visible = false
        this.checkedNode = null
        this.preCheckedNode = null
        this.checkedLink = d
        this.$set(this.checkedLink, 'visible', true)
    },

    /**
     * @description 点击空白画布，取消节点、连线的选中状态
     */
    clickCanvas () {
        this.checkedLink = null
        if (this.checkedNode) {
            if (this.nodeConfigs[this.checkedNode.id] && this.nodeConfigs[this.checkedNode.id].hasOwnProperty('visible')) {
                this.nodeConfigs[this.checkedNode.id].visible = false
            }
            this.preCheckedNode = null
        }
    },

    updateNodeLabel (id, label) {
        this.$refs.flowchart.updateNodeLabel(id, label)
    },

    updateLinkLabel (id, label) {
        this.$refs.flowchart.updateLinkLabel(id, label)
    },

    closeSaveModal () {
        this.saveModalVisible = false
    },

    /**
     * @description 画布事件控制中枢
     */
    handleOperation (obj) {
        // 保存流程拓扑图以及业务配置
        if (obj.type === 'save') {
            let hasProgressNode = this.progressNodes.some(node => {
                if (node.info.category === 'progress') return true
            })
            if (!hasProgressNode) {
                this.$notify.error('请至少拖入一个流程节点到画布')
                return
            }
            this.$validator.validateAll().then(
                valid => {
                    if (!valid) this.$notify.error('部分节点或者连线的配置校验没通过，请检查')
                    else this.saveModalVisible = true
                }
            )
            return
        }

        // 导出
        if (obj.type === 'export') {
            this.exportDialog = true
            return
        }

        // 导入
        if (obj.type === 'import') {
            this.importEvent()
            return
        }

        // 画布居中
        if (obj.type === 'zoomExtent') {
            this.diagramInstance.zoomExtent()
            return
        }

        // 节点克隆
        if (obj.type === 'clone') {
            if (!this.checkedNode) return
            let node = JSON.parse(JSON.stringify(this.checkedNode))
            let id = Utils.uuid()
            node.id = id

            // AT-567 修复克隆节点与已有节点位置重叠的问题，让互相之间有适当间距
            while (this.nodeCoordinates.indexOf(node.fx + ',' + node.fy) !== -1) {
                node.fx += 20
                node.fy += 20
            }
            this.$set(this.nodeConfigs, id, JSON.parse(JSON.stringify(this.nodeConfigs[this.checkedNode.id])))
            this.progressNodes.push(node)
            this.$notify.success('成功拷贝节点')
            return
        }
        if (obj.type === 'clear') {
            MessageBox({
                message: '确认清空画布内容？',
                title: '警告',
                type: 'warning',
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(() => {
                this.clearCanvas()
            }).catch(() => {
            })
        }
    },

    clearCanvas () {
        this.diagramInstance.deleteNodes(this.progressNodes.filter(d => d.info.category !== 'start' && d.info.category !== 'end'))
        // 画布重绘节点以及连线
        this.diagramInstance.redrawNodes()
        this.diagramInstance.redrawLinks()
        this.nodeConfigs = JSON.parse('{}')
    },

    /**
     * @description 编排导出为文件
     */
    exportToFile () {
        var blob = new Blob([JSON.stringify(this.diagramFormData)], {type: 'text/plain;charset=utf-8'})
        FileSaver.saveAs(blob, this.exportFileName + '_progress.json')
        this.exportDialog = false
    },

    /**
     * @description 导入功能事件
     */
    importEvent () {
        this.$refs.uploadbtn.click()
    },

    /**
     * @description 导入功能提示
     */
    fileChange (file, fList) {
        this.$confirm('导入外部文件将删除画布已有内容以及配置, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.importFileContent(file)
        }).catch(() => {

        })
    },

    /**
     * @description 使用导入文件绘图
     */
    importFileContent (file) {
        let self = this
        let fileReader = new FileReader()
        fileReader.readAsText(file.raw)
        fileReader.onload = () => {
            let result = JSON.parse(fileReader.result)
            self.initialize(result)
        }
    },

    deleteCurNode (node) {
        this.beforeDeleteNodes([node])
    },

    /**
     * 根据给定节点(分支节点)，获取与之有关系的流程节点业务表单值，方便在子组件中获取选中脚本的信息(返回值)
     */
    getProgressNode (node) {
        let checkedLink = this.links.find(link => link.target.id === node.id)
        if (checkedLink && checkedLink.source && this.nodeConfigs[checkedLink.source.id]) return {...this.nodeConfigs[checkedLink.source.id], ...{taskId: checkedLink.source.id}}
        else return null
    },
    ...mapActions([
        'setActivedNavIndex'
    ])
  },

  watch: {
      /**
       * @description 节点增加后，添加其业务配置内容
       */
      'progressNodes.length' (val, old) {
          if (val <= old) return
          this.progressNodes.forEach(node => {
              if (node.info.category !== 'start' && node.info.category !== 'end' && !this.nodeConfigs[node.id]) {
                  let configs = JSON.parse('{}')
                  configs.visible = false
                  // 根据节点类型，指定默认操作器类型
                  switch (node.info.category) {
                    case 'progress':
                        configs.operatorType = 'AgentOperator'
                        break
                    case 'branch':
                        configs.operatorType = 'BranchPythonMapOperator'
                        break
                    case 'join':
                        configs.operatorType = 'JoinOperator'
                        break
                    default: break
                  }
                  this.$set(this.nodeConfigs, node.id, configs)
              }
          })
      },

      '$route.params.id' (val) {
        if (!val) return
        this.flowData.id = val
        this.initialize()
      }
  },

  created () {
    this.currentPath = this.$route.fullPath
    this.flowData.id = this.$route.params.id
    this.initialize()

    // 筛选可点击连线列表(branch可点击)
    if (!Array.prototype.linkHasClickEvent) {
        Array.prototype.linkHasClickEvent = function () {
            let rst = []
            let len = this.length
            for (let i = 0; i < len; i++) {
                if (this[i].source && this[i].source.info && this[i].source.info.category === 'branch') {
                    rst.push(this[i])
                }
            }

            return rst
        }
    }
  },

  mounted () {
    // 获取拓扑图实例对象
    this.diagramInstance = this.$refs.flowchart.instance
  },

  components: {
    NodeNavbar, // 左侧待选项导航栏
    FlowchartVue, // 可视化流程图组件
    SideDialog, // 侧边栏模态框
    EditProcessNode, // 流程节点业务表单
    EditBranchNode, // 分支节点业务表单
    EditLink, // 连线业务表单
    SaveTemplate, // 保存流程图
    IconButton
  }
}
</script>
<style lang="scss" scoped>
.atom-content {
  position: relative;
  overflow: hidden;
  display: flex;
  padding-left: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  height: calc(100% - 46px);
  .left-navbar {
    width: 70px;
    height: 100%;
    overflow: auto;
  }
  .right-canvas {
    width: calc(100% - 70px);
    height: 100%;
    position: relative;
    &.full-width {
        width: 100%;
    }
  }
}
.template-control {
  top: 15px;
  left: 450px;
}

.editnode-dialog {
    position: absolute;
    top: 0;
    right: -16px;
    width: 250px;
    height: 100%;
    background: #e3e3e3;
    .diagram-form {
        width: 100%;
        height: 100%;
    }
}
.moreCanvasBtns {
    height: 38px;
    line-height: 38px;
    .feature-button {
        &.first-button {
            margin-left: 10px;
        }
        &:before {
            color: #333;
            font-size: 18px;
        }
    }
}
.flowType-radio {
    position: absolute;
    top: 30px;
    right: 16px;
}
.import-btn {
    display: none;
}
.mr130{
    margin-left: 125px;
}
</style>
