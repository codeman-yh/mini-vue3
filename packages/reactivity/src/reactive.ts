import { isObject } from '@mini-vue3/shared'
import {mutableHandlers,readonlyHandlers,shallowHandlers } from './baseHandlers'
export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive",
    IS_READONLY = "_v_isReadonly"
}
export function reactive(raw){
    return createReactiveObj(raw, mutableHandlers)
}

export function readonly(raw){
    return createReactiveObj(raw, readonlyHandlers)
}

export function shallowReadonly(raw){
    return createReactiveObj(raw, shallowHandlers)
}

export function isReactive(raw){
    return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw){
    return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw){
    return isReactive(raw) || isReadonly(raw)
}

function createReactiveObj(raw, baseHandlers){
    if(!isObject(raw)){
        console.warn(`${raw} 必须是一个对象`)
        return raw
    }
    return new Proxy(raw, baseHandlers)
}