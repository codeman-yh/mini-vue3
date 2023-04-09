const p = Promise.resolve()


// 在渲染之前要执行watchEffect里面的函数任务
const activePreFlushCbs:Function[] = []
const queue:Function[] = []

let isFlushPending = false
export function nextTick(fn?){
    fn ? p.then(fn) : p
}

export function queueJob(job:Function){
    if(!queue.includes(job)){
        queue.push(job)
        queueFlush()
    }
}
export function queuePreFlushCb(job:Function){
    if(!activePreFlushCbs.includes(job)){
        activePreFlushCbs.push(job)
        queueFlush()
    }
}

function queueFlush(){
    if(isFlushPending) return
    isFlushPending = true
    nextTick(flushJob)
}

function flushJob(){
    isFlushPending = false;
    let preJob
    while(preJob = activePreFlushCbs.shift()){
        if(preJob){
            preJob()
        }
    } 

    let doJob
    while(doJob = queue.shift()){
        if(doJob){
            doJob()
        }
    }
}

