export default {
    data () {
        return {
            pagination: {
                index: 1,
                count: 1,
                size: 20
            }
        }
    },
    methods: {
        handleSizeChange (size) {
            this.pagination.size = size
            this.filterDagDetail()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.filterDagDetail()
        }
    }
}
