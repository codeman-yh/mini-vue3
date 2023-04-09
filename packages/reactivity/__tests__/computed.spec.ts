import { computed } from "../src/computed"
import { reactive } from "../src/reactive"

describe(
    'computed',()=>{
        test(
            'happy path',
            ()=>{
                let a = reactive({count:1})
                // let a  = {count:1}
                let getter = jest.fn(()=>{
                    return a.count + 1
                })
                let dummy = computed(getter)
                // lazy
                expect(getter).not.toHaveBeenCalled();

                expect(dummy.value).toBe(2)
                dummy.value
                expect(getter).toHaveBeenCalledTimes(1);

                dummy.value
                expect(getter).toHaveBeenCalledTimes(1);

                a.count = 2
                dummy.value
                expect(getter).toHaveBeenCalledTimes(2);
                expect(dummy.value).toBe(3)
                expect(getter).toHaveBeenCalledTimes(2);

                a.count = 5
                expect(dummy.value).toBe(6)
                expect(getter).toHaveBeenCalledTimes(3);
            }
        )
    }
)