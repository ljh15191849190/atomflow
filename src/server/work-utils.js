import Utils from '@/server/Utils'

class WorkUtils {
    /**
     * @description 创建任务前构造network数据
     * @param {*} rowList 
     */
    buildNetworkData (rowList) {
        let rst = {
            nodes: [],
            edges: []
        }
        rowList.forEach(
            row => {
                let uuid = Utils.uuid()
                row.id = uuid
                row.alias = row.name
                row.label = row.name
                rst.nodes.push(row)
                rst.edges.push(
                    {from: uuid, to: uuid}
                )
            }
        )
        return rst
    }
}
export default new WorkUtils()
