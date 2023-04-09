import { createApp } from '../../packages/vue/dist/mini-vue.esm-bundler.js'
import App from './App.js'
let container = document.querySelector('#app')
createApp(App).mount(container)