import { ReactiveEffect } from "@mini-vue3/reactivity";
import { queuePreFlushCb } from "./scheduler";

export function watchEffect(source){
    let cleanup;
    let onCleanup = (fn) => {
        cleanup = effect.onStop = () =>{
           fn()
        }
    }

    const getter = () => {
        if(cleanup){
            cleanup()
        }
        source(onCleanup)
    }
    const job = () =>{
        effect.run()
    }
    let effect  = new ReactiveEffect(
        getter,
        ()=>{
            queuePreFlushCb(job)
        }
    )
    effect.run()

    return ()=>{
        effect.stop()
    }
}