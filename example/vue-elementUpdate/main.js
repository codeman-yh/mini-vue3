import App from './App.js'
import prop from './prop.js'
import children from './children.js'
import arrayToarray from './arrayToarray.js'
import { createApp } from '../../packages/vue/dist/mini-vue.esm-bundler.js'


let container = document.querySelector('#app')
createApp(arrayToarray).mount(container)