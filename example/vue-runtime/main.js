import {createApp,h ,getCurrentInstance,createTextVnode,provide} from '../../packages/vue/dist/mini-vue.esm-bundler.js'
import {foo} from './foo.js'
window.self
const App = {
    name: 'app',
    render(){
        window.self = this
        return h(
            'div',
            {
                id: '#root',
            },
            [
                h(
                    'h1',
                    {
                        class:['red'],
                        onClick: ()=>{console.log('click')},
                        onMousedown: ()=>{console.log('mousedown')},
                    },
                'see you ' +  this.msg
                ),
                h(
                    foo,
                    {
                        name:'if only',
                        onAdd: (a,b,c)=> {console.log('emit触发到父组件' + a + b + c)},
                    },
                    {
                        header:  ({num,age}) => h('p',{},'slot header '+ num + ' age: '+ age),
                        footer:  [
                            h('p',{},'slot footer'),
                            h('p',{},'slot footer2'),
                            createTextVnode('hhhhh')
                        ],
                    }
                ),
                h('div',null,[
                    h('p',{class:['green']}, "hello-word"),
                    h('p',{class:['green']}, "hello " + this.say),
                ])
            ],
        )
    },
    setup(){
        // console.log(getCurrentInstance())
        provide('custom','appVal')
        provide('customapp','appVal123')
        return{
            msg: 'melody',
            say: 'some day'
        }
    }
}
let container = document.querySelector('#app')
createApp(App).mount(container)