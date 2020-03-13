<template lang="pug">
  Sheet-Detail(:sheetId="sheetForm_Id")
</template>
<script>
import SheetDetail from './SheetDetail'
export default {
  data () {
    return {
        
    }
  },
  computed: {
    sheetForm_Id () {
      return this.$route.params.id
    }
  },
  components: {
    SheetDetail
  }
}
</script>
