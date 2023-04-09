import { h, renderSlot ,provide,getCurrentInstance,inject} from "../../packages/vue/dist/mini-vue.esm-bundler.js"
import {custom} from './custom.js'
export const foo = {
    name: 'foo',
    render() {
      this.getCurrentInstace
      return h(
        'div',{},
        [
          renderSlot(this.$slots,"header",{num:6,age:10}),
          h('div',{},'foo see props ' + this.name),
          h('button',{onClick: this.emitAdd},'emitAdd'),
          renderSlot(this.$slots,"footer"),
          h('p',{},'app provide '+ this.appParentVal),
          h(custom)
        ])  
    },
    setup(props,{emit}) {
      // console.log(getCurrentInstance())
      provide('custom','123')    
      let appParentVal = inject('custom');
      function emitAdd(){
      emit('add','hello','emit','if only')
      }
      return{
      emitAdd,
      appParentVal
      }
    }
}