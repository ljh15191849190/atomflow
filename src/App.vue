<template lang="pug">
  div#app
    div.container-left-part
      div.collapse-switch.position-relative(@click="toggleCollapse" size="small" :class="{'btn-mini-width': isCollapse}")
        span.atom-navbar-icon.atom-icon-menu-collapse-btn.collapse-btn
      navbar.full-height.atom-navbar(:is-collapse="isCollapse")
    div.container-right-part(:class="{'more-width': isCollapse }")
      router-view
</template>

<script>
import Navbar from '@/components/Navbar'
export default {
  name: 'app',
  data () {
    return {
      isCollapse: false,
      timeInterval: null,
      lastTime: null,
      currentTime: null,
      timeOut: 30 * 60 * 1000
    }
  },
  methods: {
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    testTime () {
      let sessionTime = sessionStorage.getItem('session_time')
      if (sessionTime) {
          this.timeOut = Number(sessionTime) * 60 * 1000
      }
      //更新当前时间
      this.currentTime = new Date().getTime()
      //判断是否超时
      if (this.currentTime - this.lastTime > this.timeOut) {
        window.parent.postMessage({status: 601}, '*')
        clearInterval(this.timeInterval)
      }
    }
  },
  mounted () {
    this.lastTime = new Date().getTime()
    document.addEventListener('mouseover', () => {
      this.lastTime = new Date().getTime()
    })
    this.timeInterval = setInterval(this.testTime, 5000)
  },
  components: {
    navbar: Navbar
  }
}
</script>

<style lang="scss" scoped>
</style>
