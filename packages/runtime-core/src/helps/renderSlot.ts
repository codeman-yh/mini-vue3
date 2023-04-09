import { h } from "../h"
import { Fragment, Text} from "../vnode"

export function renderSlot(slots,name,props?){
    let slot = slots[name]
    if(slot){
        if(typeof slot === 'function'){
            return h(Fragment,{}, slot(props))
        }else{
            return h(Fragment,{}, slot)
        }
    }else{
        return h(Text,{},'')
    }
}