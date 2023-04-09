import { proxyRefs, shallowReadonly } from "@mini-vue3/reactivity"
import { emit } from "./componentEmits"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlots"

let currentInstance = {}
let _compiler;
export function createComponentInstance(vnode,parentComponent){
    let instance = {
        vnode,
        type: vnode.type,
        setupState:{},
        props:{},
        slots:{},
        subTree:{},
        provides: parentComponent ? parentComponent.provides : {},
        parent: parentComponent,
        isMounted: false,
        update:null,
        next:null,
        emit: () =>{}
    }
    instance.emit = emit.bind(null,instance) as any
    return instance
}

export function setupComponent(instance){
    initProps(instance,instance.vnode.props)

    initSlots(instance,instance.vnode.children)

    // 基于options创建的有状态组件 
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance){
    const {setup} = instance.type
    if(setup){
        setCurrentInstance(instance)
        let setupResult = setup(
            shallowReadonly(instance.props),
            {emit: instance.emit}
        )
        handleSetupResult(instance,setupResult);
    }

}

function handleSetupResult(instance,setupResult){
    // object
    if(typeof setupResult == 'object'){
        instance.setupState = proxyRefs(setupResult)
    }
    finishComponentSetup(instance)
    // funtion

}

function finishComponentSetup(instance){
    let component = instance.type
    if(_compiler && !component.render){
        if(component.template){
            component.render = _compiler(component.template)
        }
    }
    instance.render = component.render
    
}

function setCurrentInstance(instance){
    currentInstance = instance
}

export function getCurrentInstance(){
    return currentInstance;
}

export function registerRuntimeCompiler(compiler){
    _compiler = compiler
}

