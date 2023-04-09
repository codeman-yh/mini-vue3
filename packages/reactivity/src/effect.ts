import { extend } from "@mini-vue3/shared";
let activeEffect;
const targetDepMap = new WeakMap(); // 可用对象为键值，弱引用（可垃圾回收）

export class ReactiveEffect{
    _fn: Function
    deps: Array<Dep>
    active: boolean
    scheduler?: Function | undefined
    onStop?:Function

    constructor(fn,scheduler?){
        this._fn = fn
        this.scheduler = scheduler
        this.active = true
        this.deps = []
    }
    
    run(){
        activeEffect = this;
        let result = this._fn();
        activeEffect = null;
        return result;
    }

    stop(){
        if(this.active){
            // 找到dep依赖并清除
            cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect){
    effect.deps.forEach(dep => {
        dep.subscribeList.delete(effect)
    })
    effect.deps.length = 0
}

export function track(target,key){
    const dep = getDep(target,key)
    trackEffects(dep)
}

export function trigger(target,key){
    const dep = getDep(target,key)
    triggerEffects(dep)
}

export function trackEffects(dep){
    if(!dep.subscribeList.has(activeEffect) && activeEffect){ 
        dep.subscribeList.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}

export function triggerEffects(dep){
    dep.subscribeList.forEach(sub => {
        if(sub.scheduler){
            sub.scheduler();
        }else{
            sub.run(); 
        }
    })
}

export function effect(fn,options:ReactiveEffectOptions = {}){
    let _effect = new ReactiveEffect(fn,options?.scheduler);
    if(options){
        extend(_effect, options)
    }
    _effect.run();
    // 通过赋值runner绑定实例
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect;
    return runner;
}

export function stop(runner){
    // 调用实例
    runner.effect.stop();
}

export interface ReactiveEffectOptions{
    scheduler?: (...args: any[]) => void
    onStop?: () => void
}

export class Dep{
    subscribeList: Set<ReactiveEffect>;
    constructor(){
        this.subscribeList = new Set();
    }   
}

function getDep(target,key):Dep{
    let depMap = targetDepMap.get(target)
    if(!depMap){
        depMap = new Map()
        targetDepMap.set(target,depMap)
    }
    let dep = depMap.get(key)
    if(!dep){
        dep = new Dep()
        depMap.set(key,dep)
    }
    return dep;
}