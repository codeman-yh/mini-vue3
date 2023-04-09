import { isProxy, isReadonly, reactive, readonly } from "../src/reactive";

describe('readyonly',()=>{
    test('happy path',
        ()=>{
            let reacState = reactive({count : 1})
            let readyonlyState = readonly(reacState)
            console.warn = jest.fn();
            expect(isProxy(reacState)).toBe(true);
            expect(reacState === readyonlyState).toBe(false)
            expect(readyonlyState.count).toBe(1)
            readyonlyState.count++
            expect(console.warn).toBeCalled()
        }
    );

    test('isReadonly',
        ()=>{
            let reacState = reactive({count : 1})
            let readyonlyState = readonly(reacState)
            expect(isReadonly(readyonlyState)).toBe(true)
            expect(isReadonly(reacState)).toBe(false)
            expect(isReadonly({count:1})).toBe(false)
        }
    )
})