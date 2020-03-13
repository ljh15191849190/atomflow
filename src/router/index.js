import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Empty from '@/components/Empty'
import SheetList from '@/components/sheet/list/SheetList'
import TableView from '@/components/sheet/list/TableView'
import TreeView from '@/components/sheet/list/TreeView'
import SheetExcuteList from '@/components/sheet/list/SheetExcuteList'
import Tools from '@/components/sheet/list/Tools'
import SqlHook from '@/components/sheet/list/SqlHook'
import SheetDetail from '@/components/sheet/detail/SheetDetail'
import SheetTest from '@/components/sheet/detail/SheetTest'
import RunWork from '@/components/sheet/detail/RunWork'
import TreeViewDetail from '@/components/sheet/detail/TreeViewDetail'
import EditSheet from '@/components/sheet/EditSheet'
import BatchWorkList from '@/components/work/batchwork/BatchWorkList'
import BatchDetails from '@/components/work/batchwork/BatchDetails'
import BatchList from '@/components/work/batchwork/BatchList'
import TaskRelation from '@/components/work/detail/TaskRelation'
import TaskChart from '@/components/work/detail/TaskChart'
import EditWork from '@/components/work/EditWork'
import WorkList from '@/components/work/WorkList'
import FlowDetails from '@/components/work/detail/FlowDetails'
import TaskLog from '@/components/work/detail/TaskLog'
import TaskRunInfo from '@/components/work/detail/TaskRunInfo'
import EditProgress from '@/components/progress/EditProgress'
import ProgressList from '@/components/progress/ProgressList.vue'
import AddWork from '@/components/work/AddWork'
import AddProgress from '@/components/work/AddProgress'
import AddSql from '@/components/work/AddSql'
import AddAnsible from '@/components/work/AddAnsible'
import WorkRunLogger from '@/components/work/WorkRunLogger'
import AuditLogger from '@/components/audit/AuditLogger'
import AuditLoggerDetail from '@/components/audit/AuditLoggerDetail'
import ConnectList from '@/components/connect/ConnectList'
import EditConnect from '@/components/connect/EditConnect'
import AgentConfig from '@/components/agent/AgentConfig'
import CycleList from '@/components/cycle/CycleList'
import CycleDetail from '@/components/cycle/CycleDetail'
import AddCycle from '@/components/cycle/AddCycle'
import ProgressDetail from '@/components/progress/ProgressDetail'
import LinkList from '@/components/link/LinkList'
import LinkDetail from '@/components/link/LinkDetail'
import CommandList from '@/components/command/CommandList'
import {externalRouter} from '@leaptocloud/standard-ui'
import store from '@/store'
import * as types from '@/store/mutations_types'

Vue.use(Router)

const router = new Router({
  routes: [
    {
        path: '/',
        redirect: '/sheetList'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/empty',
      component: Empty
    },
    {
      path: '/sheetList',
      name: 'sheetList',
      component: SheetList,
      redirect: '/tableview',
      children: [
        {
          path: 'tableview',
          component: TableView
        },
        {
          path: 'treeview',
          component: TreeView,
          children: [
            {path: 'detail/:id',
            component: TreeViewDetail}
          ]
        }
      ]
    },
    {
        path: '/tools',
        name: 'tools',
        component: Tools
    },
    {
        path: '/sqlhook',
        name: 'sqlhook',
        component: SqlHook
    },
    {
      path: '/sheetExcuteList',
      name: 'sheetexcutelist',
      component: SheetExcuteList
    },
    {
      path: '/sheetdetail/:id',
      name: 'sheetdetail',
      component: SheetDetail
    },
    {
      path: '/sheetdetail/:id/run',
      name: 'runwork',
      component: RunWork
    },
    {
        path: '/sheettest',
        name: 'sheettest',
        component: SheetTest
    },
    {
      path: '/editSheet/:id',
      name: 'editOrAddSheet',
      component: EditSheet
    },
    {
      path: '/editFlow/:id',
      name: 'editFlow',
      component: EditWork
    },
    {
        path: '/batchworkList',
        name: 'batchworkList',
        component: BatchWorkList
    },
    {
        path: '/batchList/:dagId',
        name: 'batchList',
        component: BatchList
    },
    {
        path: '/batchDetails/:dagId',
        name: 'batchDetails',
        redirect: { name: 'taskRelation' },
        component: BatchDetails,
        children: [
            {
                path: 'taskRelation',
                name: 'taskRelation',
                component: TaskRelation
            },
            {
                path: 'taskChart',
                name: 'taskChart',
                component: TaskChart
            }
        ]
      },
    {
      path: '/workList',
      name: 'workList',
      component: WorkList
    },
    {
      path: '/flowDetails/:dagId',
      name: 'flowDetails',
      component: FlowDetails
    },
    {
      path: '/taskLog',
      name: 'taskLog',
      component: TaskLog
    },
    {
      path: '/runningFlow/:id',
      component: TaskRunInfo
    },
    {
      path: '/template/:id',
      component: EditProgress
    },
    {
      path: '/template',
      component: ProgressList
    },
    {
        path: '/templateDetail',
        component: ProgressDetail
    },
    {
      path: '/addwork',
      component: AddWork
    },
    {
        path: '/addprogress',
        component: AddProgress
    },
    {
        path: '/addsql',
        component: AddSql
    },
    {
        path: '/addansible',
        component: AddAnsible
    },
    {
      path: '/dagLogger',
      component: WorkRunLogger
    },
    {
      path: '/auditLogger',
      component: AuditLogger
    },
    {
        path: '/auditLoggerDetail',
        name: 'AuditLoggerDetail',
        component: AuditLoggerDetail
      },
    {
      path: '/connectList',
      component: ConnectList
    },
    {
      path: '/editConnect/:id',
      component: EditConnect
    },
    {
      path: '/agentList',
      component: AgentConfig
    },
    {
        path: '/cycleList',
        component: CycleList
    },
    {
        path: '/cycleDetail/:id',
        component: CycleDetail
    },
    {
        path: '/addcycle',
        component: AddCycle
    },
    {
        path: '/linkList',
        component: LinkList
    },
    {
        path: '/linkDetail',
        name: 'linkDetail',
        component: LinkDetail
    },
    {
        path: '/commandList',
        component: CommandList
    },
    externalRouter
  ]
})

router.beforeEach((to, from, next) => {
  next()
})
router.afterEach((to, from) => {
  let fullPath = to.fullPath
  if (fullPath.match(/\/external\?site\=/)) {
    fullPath = fullPath.replace(/\%2F/g, '/').replace(/\%3A/g, ':').replace(/\%23/g, '#').replace(/\%2B/g, '+').replace(/\%20/g, ' ').replace(/\%26/g, '&').replace(/\%3D/g, '=').replace(/\%3F/g, '?')
  }
    // 保存当前路由信息
  if (fullPath !== '/tableview' && fullPath !== '/sheetList' && fullPath !== '/login') {
    sessionStorage.setItem('atomflow-router-path', fullPath)
  }

  let matched = fullPath.match(/^\/(template|editSheet){1}\/[a-zA-Z0-9\_\-]+$/g)
  if (!matched) store.commit(types.SET_ACTIVED_NAV_INDEX, fullPath)
  else {
    let filteredPath = fullPath.match(/^\/(template|editSheet){1}\//g)
    if (filteredPath && filteredPath.length) store.commit(types.SET_ACTIVED_NAV_INDEX, filteredPath[0] + 'add')
    else store.commit(types.SET_ACTIVED_NAV_INDEX, fullPath)
  }
})

export default router
