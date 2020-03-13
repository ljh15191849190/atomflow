// Most of the code from this file comes from:
// https://github.com/codemirror/CodeMirror/blob/master/addon/mode/loadmode.js
import * as CodeMirror from 'codemirror'

// Make CodeMirror available globally so the modes' can register themselves.
window.CodeMirror = CodeMirror
var loading = {}

function splitCallback (cont, n) {
  var countDown = n
  return function () {
    if (--countDown === 0) cont()
  }
}

function ensureDeps (mode, cont) {
  var deps = CodeMirror.modes[mode].dependencies
  if (!deps) return cont()
  var missing = []
  for (var i = 0; i < deps.length; ++i) {
    if (!CodeMirror.modes.hasOwnProperty(deps[i])) missing.push(deps[i])
  }
  if (!missing.length) return cont()
  var split = splitCallback(cont, missing.length)
  for (i = 0; i < missing.length; ++i) CodeMirror.requireMode(missing[i], split)
}

CodeMirror.requireMode = function (mode, cont) {
  if (typeof mode !== 'string') mode = mode.name
  if (CodeMirror.modes.hasOwnProperty(mode)) return ensureDeps(mode, cont)
  if (loading.hasOwnProperty(mode)) return loading[mode].push(cont)
  if (!CodeMirror.modeURL) CodeMirror.modeURL = process.env.NODE_ENV === 'production' ? '../atomflow-ui/static/mode/%N\//%N.js' : '../static/mode/%N\//%N.js'
  var file = CodeMirror.modeURL.replace(/%N/g, mode)

  var script = document.createElement('script')
  script.src = file
  var others = document.getElementsByTagName('script')[0]
  var list = loading[mode] = [cont]

  CodeMirror.on(script, 'load', function () {
    ensureDeps(mode, function () {
      for (var i = 0; i < list.length; ++i) list[i]()
    })
    
  })
  others.parentNode.insertBefore(script, others)
  // var foldScript = document.createElement('script')
  // foldScript.src = '../static/fold/foldcode.js'
}

CodeMirror.autoLoadMode = function (instance, mode) {
  if (CodeMirror.modes.hasOwnProperty(mode)) return

  CodeMirror.requireMode(mode, function () {
    instance.setOption('mode', instance.getOption('mode'))
  })
}
// CodeMirror.autoLoadAddOn = function (src) {
//   var script = document.createElement('script')
//   script.src = src
//   var others = document.getElementsByTagName('script')[0]
//   others.parentNode.insertBefore(script, others)
// }
export default CodeMirror