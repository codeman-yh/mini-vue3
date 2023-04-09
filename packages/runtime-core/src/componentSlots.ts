import { ShapeFlags } from "@mini-vue3/shared"

export function initSlots(instance,children){
    // 判断是否需要加载插槽处理
    let {vnode} = instance
    if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDRENN){
        normalizeObjectSlots(instance.slots,children)
    }
}
function normalizeObjectSlots(slots, children){
    for(let key in children){
        let val = children[key]
        slots[key] = typeof val === 'function'? (props) => normalArray(val(props)) : normalArray(val)
    }
}

function normalArray(children){
    return Array.isArray(children) ? children : [children]
}