<template lang="pug">
    Navbar.menu-list(
        v-if="showMenu"
        proModule="atom"
        :router="router"
        :data="menuList"
        :activedIndex="activedIndex"
        :collapseTransition="hasAnimation"
        :collapse="isCollapse"
        :menuDict="menuDict"
        @subMenuOpen="subMenuOpen"
    @update:activedIndex="updateActivedIndex"
    )
    div.full-width.full-height.display-navbar(v-else)
</template>
<script>
import { Navbar } from '@leaptocloud/standard-ui'
import Utils from '@server/Utils'
import MenuApi from '@api/menu.api'
import axios from 'axios'
import {mapGetters, mapActions} from 'vuex'

export default {
    props: ['isCollapse'],
    data () {
        return {
            index: '/',
            router: true,
            menuList: [],
            hasAnimation: false,
            projectId: localStorage.getItem('tenant'),
            showMenu: false,
            menuDict: {}
        }
    },
    methods: {
        getMenu () {
            let getModules = MenuApi.getModules(this.projectId)
            let getMenus = MenuApi.getMenusByUser()
            axios.all([getModules, getMenus]).then(
                axios.spread((modules, menus) => {
                    let atomflowApp = modules.data.find(app => app.module_url === 'atomflow')

                    this.menuList = menus.data.filter(item => item.sys_module_id === atomflowApp.id)
                    this.showMenu = true

                    if (!this.menuList.length) {
                        Utils.goEmpty()
                    } else {
                        //如果没有默认的路由没在菜单中，取菜单的第一项路由
                        if (this.menuList[0].subMenus.length) {
                            let storageRoute = sessionStorage.getItem('atomflow-router-path')
                            if (storageRoute) {
                                this.$router.push(storageRoute)
                            } else {
                                this.setActivedNavIndex(this.menuList[0].subMenus[0].url)
                                this.$router.push('/sheetList/tableview')
                            }
                        }
                    }
                })
            )
        },
        subMenuOpen (index) {
            this.$router.push(index)
        },
        selectChange (index, path) {
            if (index === '/sheetList/tableview') {
                sessionStorage.setItem('atomflow-router-path', index)
                this.setActivedNavIndex(index)
            }
        },
        updateActivedIndex (index) {
            this.activedIndex = index
        },
        ...mapActions([
            'setActivedNavIndex'
        ])
    },
    computed: {
        activedIndex: {
            get () {
                return this.activedNavIndex
            },
            set (val) {
                this.setActivedNavIndex(val)
            }
        },
        ...mapGetters([
            'activedNavIndex'
        ])
    },
    created () {
        this.getMenu()
    },
    mounted () {
        // UCMP-1231 自定义菜单，主动式配置管理数据库平台子菜单未加链接，点击无法跳转
        window.addEventListener('message', res => {
            if (res.data.menu_source === 'custom') {
                this.activedIndex = '/external?site=' + res.data.selectdCustomMenu
                this.$router.push(this.activedIndex)
                return
            }
            if (res.data.selectdCustomMenu) {
                this.setActivedNavIndex(res.data.selectdCustomMenu)
                this.$router.push(this.activedIndex)
            }
        })
    },
    components: {
        Navbar
    }
}
</script>
<style lang="scss" scoped>
.display-navbar {
    background: #364150;
}
</style>

