import sUtils from '@server/Utils'
class TemplateUtils {
    /**
     * 判断模板类型 如果所有数据含有机器信息，则返回 [complex], 否则返回 [normal]
     * @param {*} nodes 
     */
    validateType (nodes) {
        let rst = nodes.some(
            (item) => {
                if (!item.target) {
                    return true
                }
            }
        )
        return rst ? 'normal' : 'complex'
    }

    /** 
     * @description 获取DAG信息， 提交表单前使用
     */
    getDagInfo (workForm, isNormal) {
        let dag = {
            consumes: workForm.target,
            dagName: workForm.name,
            schdulerType: workForm.schdulerType,
            timeout: workForm.timeout,
            dagType: isNormal ? 'normal' : 'complex',
            startDate: new Date(workForm.startTime).getTime() / 1000,
            endDate: new Date(workForm.endTime).getTime() / 1000,
            owner: 'xinghua.wen'
        }
        if (dag.schdulerType === 2) {
            dag.interval = workForm.interval
            // dag.endDate = new Date(workForm.endTime).getTime() / 1000
        }
        if (dag.dagType === 'complex') {
            delete dag.consumes
        }
        return dag
    }

    /** 
     * @description 重置network节点数据：新UUID替换旧UUID,同时引发edges对应数据变化
     * @author xinghua.wen
     */
    resetNodes (network) {
        return network.nodes.map(
            item => {
                let uuid = sUtils.uuid()
                let tempId = item.id
                let rst = {}
                rst.taskId = uuid
                rst.taskName = item.label
                //处理不同的节点类型
                if (item.shape === 'circle') {
                    rst.operatorType = 'JoinOperator'
                    rst.consumeIp = item.target
                } else if (item.shape === 'ellipse') {
                    rst.operatorType = 'BranchPythonMapOperator'
                    rst.codeMapBranch = item.codeMapBranch
                    rst.consumeIp = item.target
                } else {
                    rst.operatorType = item.type === 'python' ? 'PythonOperator' : 'BashOperator'
                    rst.fileRemotePath = item.downloadUrl
                    rst.fileName = item.label
                    rst.nodeId = item.nodeId
                    rst.versions = item.versions
                    rst.version = item.version
                    if (item.vars) {
                        rst.vars = item.vars
                    }

                    if (network.dagInfo.dagType === 'complex') {
                        rst.consumeIp = item.target 
                    }
                }
                
                this.resetEdgeId(network.edges, tempId, uuid)
                return rst
            }
        )
    }

    resetEdgeId (edges, oldValue, newValue) {
        edges.forEach(
            item => {
                if (item.id) {
                    delete item.id
                }
                item.from = item.from === oldValue ? newValue : item.from
                item.to = item.to === oldValue ? newValue : item.to
            }
        )
    }
}
export default new TemplateUtils()
