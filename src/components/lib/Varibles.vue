<template lang="pug">
  div.full-width
    div.variable-content
      div.add.flex(@click="addVarible" v-if="!variables || variables.length === 0")
        Atom-Icon-Button(type="icon-atom-add" :args="{}" text="添加")
        span 添加输入变量
      div.variables(v-else v-for="(item, index) in variables" @click="editVarible(item, index)")
        span {{item.key}}:
        div.flex
          div.default-value {{item.default}}
          div.edit.flex
            Atom-Icon-Button(type="icon-atom-drag" :args="{}" text="编辑")
    div.add.flex.add-para(@click="addVarible" v-if="variables && variables.length > 0")
        Atom-Icon-Button(type="icon-atom-add" :args="{}" text="添加")
        span 添加输入变量  
    el-dialog(title="添加输入变量" :visible.sync="visible" :before-close="closeModal" width="500px")
      el-form(ref="varForm" :rules="rules" :model="varForm")
        el-form-item(label="变量名" prop="key") 
          el-input.normal-widget-width(size="small" v-model="varForm.key" :maxlength="20")
        el-form-item.form-item(label="默认值" prop="default") 
          el-input.normal-widget-width(size="small" v-model="varForm.default" :maxlength="50")
      div.dialog-footer(slot="footer")
          el-button(size="small" type="danger" @click="deleteVarible" v-if="showType === 'edit'") 删除
          div(v-else)
          div
            el-button(size="small" @click="closeModal") 取消
            el-button(type="primary" size="small" @click="submitForm") 确定
</template>
<script>
/**
 * @description 脚本变量
 * @author shiliang.pan
 */
import AtomIconButton from '@lib/AtomIconButton'
export default {
  props: ['variables'],
  data () {
    return {
      showType: '',
      visible: false,
      editIndex: -1,
      varForm: {
        key: '',
        default: ''
      },
      rules: {
        key: [
            { required: true, message: '请输入变量名称', trigger: 'blur' }
        ],
        // 原子作业平台ATOMFLOWAT-304(创建脚本的时候，脚本变量只输入名称，没有输入默认值，点击确定按钮，无法保存)
        default: [
            { required: true, message: '请输入默认值', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    addVarible () {
      if (this.$refs.varForm) {
        this.$refs.varForm.clearValidate()
      }
      this.varForm = { key: '', default: '' }
      this.showType = 'add'
      this.visible = true
    },
    editVarible (item, index) {
      /* 原子作业平台ATOMFLOWAT-247(添加输入变量对话框中，变量名称为空保存时提示信息，选择一个已创建好的变量点击编辑后却提示请输入变量名称。)
       * 新建一个变量时，没有填值，点击保存后的错误校验在编辑其他变量时需要清除
       */
      if (this.$refs.varForm) {
        this.$refs.varForm.clearValidate()
      }
      
      this.varForm = JSON.parse(JSON.stringify(item))
      this.showType = 'edit'
      this.editIndex = index
      this.visible = true
    },
    deleteVarible () {
      this.variables.splice(this.editIndex, 1)
      this.visible = false
    },
    closeModal () {
      this.visible = false
    },
    submitForm () {
      this.$refs.varForm.validate((valid) => {
        if (valid) {
          if (this.showType === 'add') {
            this.variables.push(this.varForm)
          } else {
            this.variables[this.editIndex] = this.varForm
          }
          this.visible = false
        }
      })
    }
  },
  components: {
    AtomIconButton
  }
}
</script>
<style lang="scss" scoped>
.variable-content {
  width: 605px;
  padding: 10px;
  border: 1px dashed #e1e5e6;
}
.form-item {
  margin-top: 20px;
}
.variables {
  width: 584px;
  padding: 8px;
  .default-value {
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    border: 1px solid #e1e5e6;
  }
  .edit {
    margin-left: 10px;
    width: 40px;
    height: 40px;
    padding-left: 13px;
    border: 1px solid #e1e5e6;
  }
  &:hover {
    background-color: #f4f4f4;
  }
  &:hover .default-value{
    background-color: #fff;
  }
  &:hover .edit{
    background-color: #fff;
  }
}
.add {
  width: 160px;
  height: 40px;
  cursor: pointer;
  &:hover {
    background-color: #f4f4f4;
    border-color: #bdbdbd;
  }
}
.add-para {
  margin-top: 10px;
}
.el-dialog__body {
    padding: 10px 20px 30px;
    color: #606266;
    line-height: 24px;
    font-size: 14px;
}
.el-select {
    width: 100%;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>