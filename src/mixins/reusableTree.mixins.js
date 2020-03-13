import TreeWithTable from '@/components/sheet/TreeWithTable'
import { mapGetters, mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions([
            'setTreeRef',
            'setAtomTreeData',
            'setCheckBoxStyle'
        ])
    },
    computed: {
        ...mapGetters([
          'treeData',
          'treeDefaultProps',
          'treeCheckedKeys',
          'atomTreeNode',
          'treeFilterSwitch',
          'treeFilterValue',
          'treeCheckBoxStyle',
          'checkStrictly'
        ])
    },
    components: {
      TreeWithTable
    }
}
