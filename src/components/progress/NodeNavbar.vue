<template lang="pug">
    ul.progress-nav
        li.progress-item(:ref="'item_' + d[uniqueKey]" v-for="d in navbars" :key="d[uniqueKey]" draggable="true" @dragstart="dragstartHandler($event, d)" @dragend="dragendHandler($event)")
            div.circle-background(:class="'bg-' + d[uniqueKey]")
            div.progress-item-text(:class="'progress-icon-' + d[uniqueKey]") {{ d[label] }}
</template>
<script>
export default {
    data () {
        return {
            navbars: [
                {
                    label: '分支',
                    category: 'branch',
                    shape: 'circle',
                    referenceKey: [
                        {
                            category: 'progress',
                            tooltip: '流程'
                        }
                    ]
                },
                {
                    label: '合流',
                    category: 'join',
                    shape: 'circle',
                    referenceKey: [
                        {
                            category: 'progress',
                            tooltip: '流程'
                        },
                        {
                            category: 'end',
                            tooltip: 'END'
                        }
                    ]
                },
                {
                    label: '流程',
                    category: 'progress',
                    shape: 'rect',
                    referenceKey: [
                        {
                            category: 'progress',
                            tooltip: '流程'
                        },
                        {
                            category: 'branch',
                            tooltip: '分支'
                        },
                        {
                            category: 'join',
                            tooltip: '合流'
                        },
                        {
                            category: 'end',
                            tooltip: 'END'
                        }
                    ]
                }
            ],
            uniqueKey: 'category',
            label: 'label',
            dragGhost: null
        }
    },

    methods: {
        dragstartHandler (ev, d) {
            ev.dataTransfer && ev.dataTransfer.setData && ev.dataTransfer.setData('Text', JSON.stringify(d))
            // clone icon node for drag display
            this.dragGhost = this.$refs['item_' + [d[this.uniqueKey]]][0].cloneNode(true)
            this.dragGhost.classList.add('custom-drag-ghost')
            this.dragGhost.getElementsByClassName('progress-item-text')[0].innerHTML = ''
            // add cloned node to body child
            document.body.appendChild(this.dragGhost)
            ev.dataTransfer && ev.dataTransfer.setDragImage && ev.dataTransfer.setDragImage(this.dragGhost, 11, 22)
            ev.effectAllowed = 'copyMove'
        },

        dragendHandler (ev, d) {
            this.dragGhost.parentNode.removeChild(this.dragGhost)
            ev.preventDefault()
        }
    }
}
</script>
<style lang="scss" scoped>
ul.progress-nav {
    padding-inline-start: 0; 
    list-style: none;
    margin-bottom: 0;
    padding-left: 0;
    li.progress-item {
        padding-top: 8px;
        margin-bottom: 20px;

        &:hover {
            background: #addff1;
            opacity: 0.8;
            cursor: move;
            .circle-background {
                &, &::before{
                    border-color: #fff;
                }
            }
        }
        -moz-user-select:none;
        -webkit-user-select:none;
        user-select:none;
    }
    div.progress-item-text {
        width: 100%;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        font-size: 12px;
    }
}
</style>
