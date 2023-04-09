import { effect } from "../src/effect";
import { isProxy, reactive } from "../src/reactive";
import { isRef, proxyRefs, ref, unRef } from "../src/ref";

describe('ref',()=>{
    test(
        'happy path',
        ()=>{
            let count = ref(1)
            expect(count.value).toBe(1)
            count.value = 2
            expect(count.value).toBe(2)
        }
    );
    test('reactive',
        ()=>{
            let count = ref(1)
            let newCount = 0
            let call = 0
            effect(()=>{
                call++
                newCount = count.value
            })
            expect(newCount).toBe(1)
            count.value = 2
            expect(newCount).toBe(2)
            expect(call).toBe(2)
            // same value should not trigger
            count.value = 2
            expect(call).toBe(2)
        }
    );

    test(
        'should make nested properties reactive',
        ()=>{
            let count = ref({num : 1})
            let dummy
            effect(()=>{
                dummy = count.value.num
            })
            expect(dummy).toBe(1)
            count.value.num = 2
            expect(dummy).toBe(2)
            count.value = 3
            expect(dummy).toBe(undefined)
        }
    );

    test(
        'isRef',
        ()=>{
            let a = ref(1)
            let rec = reactive({count:1})
            expect(isRef(a)).toBe(true)
            expect(isRef(1)).toBe(false)
            expect(isRef(rec)).toBe(false)
        }
    );

    test(
        'unRef',
        ()=>{
            let a = ref(1)
            let rec = reactive({count:1})
            expect(unRef(a)).toBe(1)
            expect(unRef(1)).toBe(1)
            expect(unRef(rec)).toBe(rec) 
        }
    );

    test(
        'proxyRefs',
        ()=>{
            let a = {
                count: ref(10),
                name: 'handsard'
            }
            let proxy = proxyRefs(a)
            // not neccseery wirte value
            expect(proxy.count).toBe(10)
            expect(proxy.name).toBe('handsard')

            proxy.count = 20
            expect(proxy.count).toBe(20)
            expect(a.count.value).toBe(20)

            proxy.count = 30
            expect(proxy.count).toBe(30)
            expect(a.count.value).toBe(30)

        }
    )
})