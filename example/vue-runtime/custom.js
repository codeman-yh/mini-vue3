import { h, inject} from "../../packages/vue/dist/mini-vue.esm-bundler.js"

export const custom = {
    name:'custom',
    render() {
       return h('div',{},
        [
            h('p',{},'foo provide ' + this.fooParentVal),
            h('p',{},'app provide ' + this.appParentVal)
        ]
       )  
    },
    setup() {
        const fooParentVal = inject('custom')
        const appParentVal = inject('customapp')
        return{
            fooParentVal,
            appParentVal
        }
    }
}