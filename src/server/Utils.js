import router from '@/router'
class Utils {
    /**
     * 遍历树得到选中key值
     * @param {*数据} data
     * @param {*选中属性名} isCheck
     * @param {*key} resourceId
     * @param {*子节点属性名} children
     * @param {*保存到哪里} keys
     */
    traverseTree (data, isCheck, resourceId, children, keys) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][isCheck]) {
            keys.push(data[i][resourceId])
            }
            if (data[i].children.length) {
            this.traverseTree(data[i][children], isCheck, resourceId, children, keys)
            }
        }
    }
    transformToTreeData (data, idName, pIdName, childrenName, pId) {
        let result = []
        let temp = []
        // 深拷贝数组对象
        for (let i = 0; i < data.length; i++) {
            if (data[i][pIdName] === pId) {
                let node = data[i]
                let tempArr = JSON.parse(JSON.stringify(data))
                tempArr.splice(i, 1)
                temp = this.transformToTreeData(tempArr, idName, pIdName, childrenName, data[i][idName])
                if (temp.length) {
                    node[childrenName] = temp
                }
                result.push(node)
            }
        }
        return result
    }

    getAncestorIds (dataSource, targetId, id = 'id', parentId = 'parentId', children = 'children', root = 'root') {
        let tempData = JSON.parse(JSON.stringify(dataSource))
        let result = []
        let temp = []
        for (let i = 0; i < tempData.length; i++) {
            if (tempData[i][id] === targetId) {
                if (tempData[i][parentId]) {
                    result.push(tempData[i][parentId])                
                }
                if (tempData[i][parentId] !== root) {
                    let copiedData = JSON.parse(JSON.stringify(tempData))        
                    copiedData.splice(i, 1)
                    temp = this.getAncestorIds(copiedData, tempData[i][parentId], id, parentId, children, root)
                    if (temp.length) {
                        result = result.concat(temp)
                    }
                }
                break
            }
        }
        return result
    }

    /**
     * 时间戳转时间格式(yy-mm-dd hh:mm:ss)
     * @param {*时间戳} tempstams
     */
    transformToDate (tempstams) {
        if (!tempstams) return ''
        let date = new Date(tempstams * 1000)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        month = month < 10 ? '0' + month : month
        /* 原子作业平台ATOMFLOWAT-238(作业详情页面中节点开始时间和结束时间显示不正确)
         * 问题原因：getDay()返回一星期中的某一天(0-6) getDate()返回一个月中的某一天(1-31)
         */
        let day = date.getDate()
        day = day < 10 ? '0' + day : day
        let hour = date.getHours()
        hour = hour < 10 ? '0' + hour : hour
        let minute = date.getMinutes()
        minute = minute < 10 ? '0' + minute : minute
        let second = date.getSeconds()
        second = second < 10 ? '0' + second : second
        return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':')
    }

    uuid () {
        function s4 () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4()
    }

    goEmpty () {
        router.push('/empty')
    }
    // 根据数组对象某一个属性去重（如：id）
    getObjArrEqual (arr, u_key) {
        let map = new Map()
        arr.forEach((item, index) => {
            if (!map.has(item[u_key])) {
                map.set(item[u_key], item)
            }
        })
        return [...map.values()]
    }
}
export default new Utils()
