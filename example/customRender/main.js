import { createRenderer } from '../../packages/vue/dist/mini-vue.esm-bundler.js'
import App from './App.js'

let app = new PIXI.Application({width: 300, height: 300});

document.getElementById('app').appendChild(app.view);

const {createApp} = createRenderer(
    {
        createElement(type){
           if(type == 'circle'){
            console.log(PIXI)
            let circle = new PIXI.Graphics()
            circle.beginFill(0x9966FF);
            circle.drawCircle(0, 0, 32);
            circle.endFill();
            return circle
           }
        },
        patchProp(el,key,val){
            console.log(el)
            el[key] = val
        },
        insert(el,parent){
            parent.addChild(el)
        }
    }
)

createApp(App).mount(app.stage)