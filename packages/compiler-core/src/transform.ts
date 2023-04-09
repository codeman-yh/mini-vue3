import { NodeTypes } from "./ast";
import { TODISPLAYSTRING } from "./runtimeHelpers";

export function transform(root,options:any={}){
    const context = createTransformContext(root,options)
    // 遍历ast
    traverseNode(root,context)
    createRootCodegen(root)
    root.helpers.push(...context.helpers.keys());
}

function traverseNode(node,context) {
    const type:NodeTypes = node.type
    let plugins = context.nodeTransfrom


    switch (type){
        case NodeTypes.INTERPOLATION:
            context.helper(TODISPLAYSTRING)
        break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node,context)
        break;
    }

    // 这里执行是保存闭包的节点？
    if(plugins){
        plugins.forEach(plugin => {
            plugin(node,context)
        });
    }
}

function traverseChildren(node,context){
    let astChildren = node.children
    if(astChildren){
        for(let i=0; i<astChildren.length;i++){
            traverseNode(astChildren[i],context)            
        }
    }
}

function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransfrom: options.nodeTransfrom || [],
        helpers: new Map(),
        helper(name){
            const count = context.helpers.get(name) || 0
            context.helpers.set(name,count + 1)
        }
    }
    return context
}

function createRootCodegen(root) {
    const {children} = root
    const node = children[0]
    if(node.codegenNode){
        root.codegenNode = node.codegenNode
    }else{
        root.codegenNode = node
    }

}


