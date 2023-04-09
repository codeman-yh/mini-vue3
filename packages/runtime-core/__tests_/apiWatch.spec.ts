import { nextTick, reactive } from "../../runtime-dom/src";
import { watchEffect } from "../src/apiWatch";

describe('watch',()=>{
    test('base api', async()=>{
        const state = reactive({ count: 0 });
        let dummy; 
        watchEffect(() => {
          dummy = state.count;
        });
        expect(dummy).toBe(0);
        state.count++;
        await nextTick();
        expect(dummy).toBe(1);       
    })

    test('stop', async()=>{
        const state = reactive({ count: 0 });
        let dummy;
        const stop: any = watchEffect(() => {
          dummy = state.count;
        });
        expect(dummy).toBe(0);
    
        stop();
        state.count++;
        await nextTick();
        // should not update
        expect(dummy).toBe(0);
    })

    test('cleanUp', async()=>{
        const state = reactive({ count: 0 });
        let dummy;
        let cleanup = jest.fn()
        const stop: any = watchEffect((onCleanup) => {
          onCleanup(cleanup)
          dummy = state.count;
        });
        expect(dummy).toBe(0);
        state.count++;
        await nextTick();
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);
        stop();
        expect(cleanup).toHaveBeenCalledTimes(2);
    })
})