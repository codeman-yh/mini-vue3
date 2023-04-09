import {h , ref} from '../../packages/vue/dist/mini-vue.esm-bundler.js'
const App = {
    render() {
        return h(
            'div',{},
            [
                h('p',{}, 'count '+ this.count),
                h('button',{onClick: this.onClick},'click')
            ]
        )
    },
    setup() {
        let count = ref(0)
        const onClick =  () => {
            count.value++
        }

        return{
            count,
            onClick
        }
    }
}

export default App