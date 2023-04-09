import { NodeTypes } from "../ast";

export function transformExpression(node){
    if(node.type === NodeTypes.INTERPOLATION){
        processExpression(node.content)
    }
}

function processExpression(contentNode) {
    contentNode.content = `_ctx.${contentNode.content}`
}
