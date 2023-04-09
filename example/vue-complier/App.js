import {ref} from '../../packages/vue/dist/mini-vue.esm-bundler.js'
const App = {
    name: 'App',
    template: `<div>hello {{message}}</div>`,
    setup() {
        let message = ref('mini-vue')
        window.message = message
        return{
            message
        }
    } 
}
export default App