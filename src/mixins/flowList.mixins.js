import operations from '@mock/workflow/onceOperations'
import AtomIconButton from '@lib/AtomIconButton'
import DateUtils from '@server/date-utils'

export default {
    data () {
        return {
            operations: []            
        }
    },
    methods: {
        handleOperation (obj) {
            if (obj.id === 'relation') {
                this.$router.push('/flowDetails/' + obj.row.id)
            }
        },
        formatter (row, column) {
            return DateUtils.formate(row.startTime)
        }
    },
    created () {
        this.operations = operations        
    },
    components: {
        AtomIconButton
    }
}
