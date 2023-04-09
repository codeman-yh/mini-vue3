import { isProxy, isReactive, isReadonly, readonly, shallowReadonly } from "../src/reactive"

describe(
    'shallowReadonly',()=>{
        test(
            'happy path',
            ()=>{
                let orignal = {
                    count:1,
                    data:{
                        goal: 2
                    }
                }
                let shallowState = shallowReadonly(orignal)
                expect(isProxy(shallowState)).toBe(true);
                expect(isProxy(shallowState.data)).toBe(false);
                expect(shallowState.count).toBe(1)
                expect(isReactive(shallowState.data)).toBe(false)
                let readonlyState = readonly(orignal)
                expect(shallowState).not.toBe(readonlyState)
                expect(isReadonly(shallowState)).toBe(true)
                expect(isReadonly(shallowState.data)).toBe((false))
                expect(isReadonly(readonlyState.data)).toBe(true)
                console.warn = jest.fn()
                shallowState.count = 2
                expect(console.warn).toBeCalled()
            }
        )
    }
)