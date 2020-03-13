<template lang="pug">
    div.editor-container
        el-row.row-content(:gutter="20" v-if="mode !== 'read'")
            el-col.nav-group(:span="16")
                el-radio-group(v-model="checkedLang" size="mini" v-if="!mode || mode === 'edit'")
                    el-radio-button(v-for="langItem in langs" :key="langItem.label" :label="langItem.label" :disabled="langItem.disabled")
                el-tooltip.pos-right(placement="right")
                    div(slot="content") {{tip.editor[0]}}<br/>{{tip.editor[1]}}     <br/>{{tip.editor[2]}}<br/>{{tip.editor[3]}}
                    i.atom-icon-sheet-help.theme-color.help-icon
            el-col(:span="8" v-if="isShowThemes")
                el-select.theme(v-model="checkedTheme" placeholder="请选择主题" size="mini" @change="themeChange" :class="{'no-border': mode === 'read'}")
                    el-option(
                        v-for="item in themes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    )
        div.editor-div(:class="{'editor-border': checkedTheme === 'default' || checkedTheme === 'mdn-like'}")
            textarea.mirror-editor
</template>
<script>
/**@augments 高亮语法文本编辑器
 * @author xinghua.wen
 */
import CodeMirror from '@/assets/plugins/codemirror'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/xml-fold.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/foldgutter.css'

export default {
  // editorValue 文本编辑器初始化值
  // lang 默认语言
  // langs 语言集合
  // 默认主题
  props: ['editorValue', 'lang', 'langs', 'theme', 'mode', 'readOnly', 'isShowThemes'],
  data () {
      return {
        // 主题集合
        themes: [],
        // 编辑器对象
        editorInstance: null,
        tempCheckedTheme: '',
        tempCheckedLang: '',
        innerValue: '',
        tip: {
            editor: ['熟练使用shell、python(2.7。下面的python, 在没有标识版时, 默认都是2.7)、powershell、bat四种语言之一;', '默认规则工具执行结果是成功或失败，是由脚本执行的返回码决定的，0为成功，非0为失败;', '工具的输出参数只支持字符串类型, 输出非字符串类型时, 注意需要转换;', 'Linux支持shell和python; Windows支持python和powershell。']
        }
      }
  },
  methods: {
      /**@augments 初始化编辑器
       * @author xinghua.wen
       */
      initEditor () {
        let mode = this.checkedLang === 'bat' ? 'powershell' : this.checkedLang
        this.editorInstance = CodeMirror.fromTextArea(this.$el.querySelector('textarea.mirror-editor'), {
            value: this.editorValue,
            lineNumbers: true,
            autofocus: true,
            mode: mode,
            theme: this.checkedTheme,
            lineWrapping: true,
            readOnly: this.readOnly ? 'nocursor' : false,
            extraKeys: {'Ctrl-Q': cm => { cm.foldCode(cm.getCursor()) }},
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
        })
        CodeMirror.autoLoadMode(this.editorInstance, mode)
        this.editorInstance.doc.setValue(this.editorValue)
        this.editorInstance.doc.on('change', this.editorDocChange)
      },
      themeChange () {
        this.editorInstance.setOption('theme', this.checkedTheme)
      },
      langChange () {
        this.editorInstance.toTextArea()
        this.$emit('langChange', this.checkedLang)
        this.initEditor()
      },
      editorDocChange () {
        this.innerValue = this.editorInstance.doc.getValue()
        this.$emit('docChange', this.innerValue)
      },
      refresh () {
          this.editorInstance.refresh()
      }
  },
  computed: {
    checkedTheme: {
        get () {
            return this.tempCheckedTheme ? this.tempCheckedTheme : this.theme
        },
        set (value) {
            this.tempCheckedTheme = value
        }
    },
    checkedLang: {
        get () {
            return this.tempCheckedLang ? this.tempCheckedLang : this.lang
        },
        set (value) {
            this.tempCheckedLang = value
        }
    }
  },
  watch: {
      editorValue () {
        this.refresh()
        if (this.editorValue !== this.innerValue) {
            this.editorInstance.doc.setValue(this.editorValue)
        } 
      },
      checkedLang () {
          this.langChange()
      }
  },
  mounted () {
    this.initEditor()
  },
  created () {
    this.themes = [
        {
            label: '默认',
            value: 'default'
        },
        {
            label: '蓝黑',
            value: 'erlang-dark'
        },
        {
            label: '灰黑',
            value: 'icecoder'
        },
        {
            label: '暗黑',
            value: 'base16-dark'
        },
        {
            label: 'MDN风格',
            value: 'mdn-like'
        },
        {
            label: '暖色',
            value: 'duotone-light'
        }
    ]
  }
}
</script>
<style lang="scss" scoped>
.mirror-editor {
    display: none !important;
}
.row-content {
    .nav-group {
        padding-bottom: 5px;
        display: flex;
        align-items: center;
    }
    .mode-title {
        color: #ffffff;
    }
}
.editor-border {
    border: 1px dashed #e1e5e6;
}
</style>


