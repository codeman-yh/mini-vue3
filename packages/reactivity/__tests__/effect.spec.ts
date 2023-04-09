import { reactive } from "../src/reactive";
import {effect, stop} from '../src/effect';
describe('effect',()=>{
    test(
        'effect return runner call',
        ()=>{
            let state = {count: 1}
            let reacState = reactive(state)
            let newCount = 0;
            let runner = effect(()=>{
                // reacState.count++
                // reacState.count;
                newCount = reacState.count + 1;
                return 'hello runner'
            })       
            expect( runner()).toBe('hello runner')
            expect(newCount).toBe(2)
        }
    );

    test(
        'schedule',
        ()=>{
            let state = {count: 1}
            let reacState = reactive(state)
            let newCount = 0;
            let run:any
            let scheduler = jest.fn(() => {
                run = runner
            })
            let runner = effect(()=>{
                    newCount = reacState.count + 1;
                    return 'hello runner'
                },{ scheduler } 
            )
            expect(newCount).toBe(2);
            expect(scheduler).not.toHaveBeenCalled();
            // should not be trigger at first
            reacState.count ++
            expect(newCount).toBe(2);
            run()
            expect(newCount).toBe(3)
        }
    );
    test(
        'stop',
        ()=>{
            let state = reactive({count: 1})
            let newCount
            let runner = effect(()=>{
                newCount = state.count
            })
            state.count = 2
            expect(newCount).toBe(2)
            stop(runner)
            // state.count = state.count + 1
            state.count++
            expect(newCount).toBe(2)
            runner()
            expect(newCount).toBe(3)
        }
    );
    test(
        'onStop',
        ()=>{
            let state = reactive({count: 1})
            let newCount
            let onStop = jest.fn(() => {
                newCount = 555
            })
            let runner = effect(()=>{
                newCount = state.count
            },{onStop})
            state.count = 2
            expect(newCount).toBe(2)
            stop(runner)
            expect(onStop).toHaveBeenCalled();
            expect(newCount).toBe(555)
        }
    );
})