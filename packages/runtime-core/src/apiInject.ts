import { getCurrentInstance } from "./component";

export function provide(key,val){
    const currentInstance:any = getCurrentInstance()
    // 这里需要处理一下 如果初始化，让 provides 指向父组件的provides原型
    if(currentInstance){
        let { provides, parent} = currentInstance
        if(provides == parent?.provides){
            provides = currentInstance.provides = Object.create(parent.provides)
        }
        currentInstance.provides[key] = val
    }
}


export function inject(key){
    const currentInstance:any = getCurrentInstance()
    if(currentInstance){
        const parentProvides = currentInstance.parent.provides
        return parentProvides[key]
    }
}