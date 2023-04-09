import { NodeTypes } from "../ast"
import { CREATEELEMENTBLOCK } from "../runtimeHelpers"

export function transformElement(node,context){
    if(node.type === NodeTypes.ELEMENT){
        context.helper(CREATEELEMENTBLOCK)
        const childNode = node.children[0]
        const vTag = `'${node.tag}'`
        const vProps = node.props
        const vnode = {
            type:NodeTypes.ELEMENT,
            tag: vTag,
            props: vProps,
            children: childNode
        }
        node.codegenNode = vnode
    }

}