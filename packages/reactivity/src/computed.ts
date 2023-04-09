import { ReactiveEffect } from "./effect"

class ComputedRefImpl{
    private _getter: ReactiveEffect
    private _value
    private _dirty = true
    constructor(getter){
        this._getter = new ReactiveEffect(getter,()=>{
            if(!this._dirty){
                this._dirty = true
            }
        })
    }

    get value(){
        if(this._dirty){
            this._value = this._getter.run()
            this._dirty = false
        }
        return this._value
    }
}
export function computed(getter){
    return new ComputedRefImpl(getter)
}