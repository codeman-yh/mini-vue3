import { createRenderer } from "@mini-vue3/runtime-core";
import { isOnEvent } from "@mini-vue3/shared";

function createElement(type){
    return document.createElement(type)
}

function patchProp(el,key,val){
    if(isOnEvent(key)){
        let event = key.slice(2).toLowerCase();
        el.addEventListener(event,val)
    }else{
        if(val === undefined || val === null){
            el.removeAttribute(key)      
        }else{
            el.setAttribute(key,val)
        }

    }
}

function insert(child,parent,anchor){
    parent.insertBefore(child,anchor || null)
}

function remove(el){
    el.parentNode.removeChild(el);
}

function setElementText(el,text){
    console.log('setElementText')
    el.textContent = text
}

const {createApp} = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export {
    createApp
}

export * from "@mini-vue3/runtime-core";