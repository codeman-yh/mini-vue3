import { toHandlerKey } from "@mini-vue3/shared";

export function emit(instance, event, ...arg){
    
    let props = instance.props;

    let handler = props[toHandlerKey(event)]

    handler && handler(...arg)
}