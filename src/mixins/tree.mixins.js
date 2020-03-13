export default {
    data () {
        return {
          checkedId: '',
          currentNodeKey: ''
        }
    },
    computed: {
        /**
     * 筛选后实际选中的节点id
     */
    computedDefaultCheckedIds () {
        let copiedCheckedIds = JSON.parse(JSON.stringify(this.checkedKeys))
        copiedCheckedIds.sort(this.compare)
        let fakeFilterIds = copiedCheckedIds.map(
          (item, index) => {
            let node = this.getNodeById(this.data, item)
            // 判断父节点是否实际被选中
            if (node && node.children) {
              let flag = node.children.some(
                child => {
                  if (copiedCheckedIds.indexOf(child.resourceId) === -1) {
                    return true
                  }
                }
              )
              if (flag) {
                return 0
              } else {
                return item
              }
            }
          }
        )
        // 去掉填充的卡槽数据 0，得到实际选中的节点id
        let filterIdStr = fakeFilterIds.join(',').replace(/(^0,)|(,0$)/g, '')
        filterIdStr.replace(/,0,/g, ',')
        return filterIdStr.split(',')
      },
      realFilterValue: {
          get () {
          return this.filterValue
          },
          set (newValue) {
              this.$refs[this.treeRef].filter(newValue)
              this.setTreeFilterValue(newValue)
          }
      }
    },
    methods: {
        filterNode (value, data) {
            if (!value) return true
            return data[this.defaultProps.label].indexOf(value) !== -1
        },
        // 根据id获得节点数据
        getNodeById (data, id, idName = 'resourceId') {
            for (let i = 0; i < data.length; i++) {
                if (data[i][idName] === id) {
                    return data[i]
                } else if (data[i].children) {
                    let deep = this.getNodeById(data[i].children, id, idName)
                    if (deep) {
                      return deep
                    }
                }
            }
        },
        compare (val1, val2) {
          if (val1 < val2) {
            return -1
          } else if (val1 > val2) {
            return 1
          } else {
            return 0
          }
        },
        handleCheckChange (data, checked, indeterminate) {
          if (this.checkboxStyle !== 'checkbox' && checked) {
            this.checkedId = data[this.defaultProps.id]
            this.$refs[this.treeRef].setCheckedKeys([])
            this.$refs[this.treeRef].setChecked(this.checkedId, true, false)
            this.$emit('checkChange', this.checkedId)
            return
          } else if (this.checkboxStyle !== 'checkbox' && !checked) {
            this.$refs[this.treeRef].setCheckedKeys([])
            this.checkedId = null
            this.$emit('checkChange', null)            
          }
          this.$emit('getCheckedNodeIds', this.filterCheckedNodeIds(this.$refs[this.treeRef].getCheckedNodes()))
        },
        filterCheckedNodeIds (nodes) {
          let tempArr = []
          nodes.forEach(
            item => {
              tempArr.push(item[this.defaultProps.id])
              tempArr = tempArr.concat(item.ancestorIds)
            }
          )
          let result = []
          tempArr.forEach(
            item => {
              if (result.indexOf(item) === -1) {
                result.push(item)
              }
            }
          )
          return result
        },
        nodeClick (data, checked, indeterminate) {
          this.checkedId = data.resourceId
        },
        initCheckedValue () {
          this.$refs[this.treeRef].setChecked(this.checkedKeys[0], true, false)
        }
    }
}
