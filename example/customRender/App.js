import {h} from '../../packages/vue/dist/mini-vue.esm-bundler.js'
const App = {
    render() {
       return h('circle',{x: this.x, y: this.y})
    },
    setup() {
        let x = 200;
        let y = 200;
        return{
            x,y
        }
    }
}
export default App