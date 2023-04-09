import {h , ref} from '../../packages/vue/dist/mini-vue.esm-bundler.js'
import textArrayC from './arrayToarray.js'

const children  = {
    render() {
        return this.isChange ? 
            this.arrayChildren
          :  
            this.textChildreen
        
    },
    setup() {
       let isChange = ref(false)
       window.isChange = isChange
       let textChildreen = h('p',{},'text')
       let newTextChildreen = h('p',{},'text ')
       let arrayChildren = h('div',{},
       [
        h('p',{},'children'),h('p',{},'children2')
       ])

        return{
            isChange,
            textChildreen,
            newTextChildreen,
            arrayChildren,

        }
    }
}

export default children