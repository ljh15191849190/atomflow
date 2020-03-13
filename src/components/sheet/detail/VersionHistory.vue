<template lang="pug">
    div.version-history-container 
        ul.timeline-container
            li.timeline-item(v-for="(version, index) in versionHistory" :key="index")
                div.version-time {{version.version_time}}
                div.version-line-circle
                div.version-line
                div.version-content 
                    span
                        i.atom-icon-sheet-user.theme-color
                        span.user 作者: {{version.userName}}
                    i.atom-icon-sheet-down.theme-color.download-icon(@click="downLoadSheetFile(version.gitOid, version.gitPath)")
</template>
<script>
/**
 * @description 脚本管理-版本历史组件
 */
import Api from '@api'
import FileSaver from 'file-saver'
import DateUtil from '@server/date-utils'
export default {
    name: 'VersionHistory',
    props: {
        versions: {
            type: Array,
            default: () => []
        },
        sheetDetail: {
            type: Object
        }
    },
    data () {
        return {
        }
    },
    methods: {
        /**
         * @description 下载脚本文件
         */
        downLoadSheetFile (gitOid, gitPath) {
            Api.get('downLoadSheetFile', { gitOid, type: this.sheetDetail.type, name: this.sheetDetail.name }, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, gitPath)
                }
            )
        }
    },
    computed: {
        versionHistory () {
            let versions = this.versions.map(item => {
                return {version_time: DateUtil.formate(item.updateDate), userName: item.userName, gitOid: item.gitOid, gitPath: item.gitPath}
            })
            
            return versions
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
