export function shouleUpdateComponent(prevVNode, nextVNode){
    let {props: nextProps} = nextVNode
    let {props: preProps} = prevVNode

    if(nextProps === preProps) return false

    // 检测是否存在

    // 之前不存在 取决于现在有无值
    if(!preProps){
        return !!nextProps
    }

    // 之前存在 现在的值不存在就得更新
    if(!nextProps){
        return true
    }

    // 检测长度是否变化
    if(Object.keys(nextProps).length !== Object.keys(preProps).length){
        return true
    }

    // 检测props里面的key是否变化
    for(let key in nextProps){
        if(preProps[key] !== nextProps[key]){
            return true;
            break;
        }
    }

    return false
}