import { extend, isObject } from "@mini-vue3/shared";
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowGet = createGetter(true,true)
const set = createSetter();
export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get:readonlyGet,
    set(target,key){
        console.warn(
            `Set operation on key "${String(key)}" failed: ${target} is readonly.`
        )
        return true;
    }
}

export const shallowHandlers = 
    extend(
        {},
        readonlyHandlers,
        {
            get: shallowGet
        }
    )

function createGetter(isReadonly = false, isShallow = false){
    return function get(target,key,receiver){
        if(key == ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }else if(key == ReactiveFlags.IS_READONLY){
            return isReadonly
        }
        let res = Reflect.get(target,key,receiver)
        
        if(isShallow) return res;

        if(isObject(res)){
            res = isReadonly ? readonly(res) : reactive(res);
        }
        // 收集依赖 track
        if(!isReadonly){
            track(target,key)
        }
        return res
    }
}

function createSetter(){
    return  function set(target,key,value,receiver){
        let res = Reflect.set(target,key,value,receiver)
        // 触发依赖 trigger
        trigger(target,key)
        return res;
    }
}