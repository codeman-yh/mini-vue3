import { hasOwn } from "@mini-vue3/shared"

const publicPropertiesMap = {
    '$el': (i) => i.vnode.el,
    '$slots': (i) => i.slots,
    '$props': (i) => i.props
}

// 将render运行时绑定this 指向proxy
export const publicInstanceProxyhandlers = {
    // 解构后重新命名成instance
    get({_: instance},key){
        if(hasOwn(instance.setupState,key)){
            return instance.setupState[key]
        }else if(hasOwn(instance.props, key)){
            return instance.props[key]
        }
        if( key in publicPropertiesMap){
            return publicPropertiesMap[key](instance)
        }
    }
}