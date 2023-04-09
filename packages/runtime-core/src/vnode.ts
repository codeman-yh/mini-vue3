import { isObject ,ShapeFlags} from '@mini-vue3/shared'

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');
export {
    createVnode as createElementBlock 
}

export function createVnode(type,props?,children?){
    const vnode = {
        type,
        shapeFlag: GetShapeFlags(type),
        props: props || {},
        key: props ? props.key : null, 
        component:null,
        children
    }

    if(typeof children === 'string'){
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }else if(Array.isArray(children)){
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }

    // 插槽类型，是组件节点 chidren 是对象 
    if(typeof children === 'object'){
        if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDRENN
        }
    }
    return vnode
}

export function createTextVnode(text: string){
    return createVnode(Text, {}, text)
}

function GetShapeFlags(type){
    return isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : ShapeFlags.ELEMENT
}