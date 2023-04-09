import {isProxy, isReactive, isReadonly, reactive, readonly} from '../src/reactive';
import {effect} from '../src/effect';
describe('reactive',()=>{
    test(
        'Object',
        ()=>{
            let state = {count: 1}
            let reacState = reactive(state)
            let newCount = 0;
            effect(()=>{
                newCount = reacState.count + 1;
            })
            expect(isProxy(reacState)).toBe(true);
            reacState.count = 3
            expect(newCount).toBe(4)
        }
    );

    test(
        'isReactive',
        ()=>{
            let reacState = reactive({count:1})
            expect(isReactive(reacState)).toBe(true);
            expect(isReactive({count:1})).toBe(false) 
        }
    );

    test(
        'reactive nest',
        ()=>{
            let reacState = reactive({
                count:1,
                array:[{count:1}],
                nest:{
                    count: 1
                }
            })
            expect(isReactive(reacState.nest)).toBe(true)
            expect(isReactive(reacState.array)).toBe(true)
            expect(isReactive(reacState.array[0])).toBe(true)
        }
    );

    test(
        'readonly nest',
        ()=>{
            let reacState = readonly({
                count:1,
                array:[{count:1}],
                nest:{
                    count: 1
                }
            })
            expect(isReadonly(reacState.nest)).toBe(true)
            expect(isReadonly(reacState.array)).toBe(true)
            expect(isReadonly(reacState.array[0])).toBe(true)
        }
    );
})
