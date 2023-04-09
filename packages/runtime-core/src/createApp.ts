import {createVnode} from './vnode'

export function createAppAPI(render){
    return function createApp(rootComponent){
        const app = {
            _component:rootComponent,
            mount(rootContainer){
                const vnode = createVnode(rootComponent) 
                render(vnode,rootContainer,null)
            }
        }
        return app
    }
}
