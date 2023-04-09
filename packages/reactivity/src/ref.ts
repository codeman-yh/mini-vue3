import { hasChange, isObject } from "@mini-vue3/shared"
import { trackEffects, triggerEffects, Dep} from "./effect"
import { reactive } from "./reactive"

class RefImpl{
    private _value: any
    public dep: Dep
    public __v_isRef = true
    constructor(value){
        this._value = isObject(value) ?  reactive(value) : value
        this.dep = new Dep()
    }

    get value(){
        // 收集依赖 如何找到依赖
        trackRefValue(this);
        
        return this._value
    }

    set value(newValue){
        if(hasChange(this._value,newValue)) {
            this._value = newValue
            triggerRefValue(this)
        }
    }
}

export function ref(value){
    return new RefImpl(value);
}

export function proxyRefs(raw){
    return new Proxy(raw, {
        get(target, key){
            let value = Reflect.get(target,key)
            return unRef(value)
        },
        set(target,key,value){
            // let refValue = isRef(value) ? value : ref(value)
            // let res = Reflect.set(target,key,refValue)
            // return res;
            const oldValue = target[key];
            if (isRef(oldValue) && !isRef(value)) {
              return (target[key].value = value);
            } else {
              return Reflect.set(target, key, value);
            }
        }
    })
}


export function isRef(ref){
    return !!ref.__v_isRef
}

export function unRef(ref){
    return isRef(ref) ? ref.value : ref
}

export function trackRefValue(ref){
    trackEffects(ref.dep)
}

export function triggerRefValue(ref){
    triggerEffects(ref.dep)
}