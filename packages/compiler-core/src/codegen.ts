import { isString } from "@mini-vue3/shared"
import { NodeTypes } from "./ast"
import { CREATEELEMENTBLOCK, helperNameMap, TODISPLAYSTRING } from "./runtimeHelpers"

export function generate(ast){
    const context = createGenerateContext(ast)
    const {push} = context

    genFunctionPreamble(ast, context)

    const functionName = 'render'
    const arg = ['_ctx']


    push(`return function ${functionName}`)
    push(`(${[...arg]}){`)
    push(`return `)

    genNode(ast.codegenNode, context);

    push("}")
    return context

}

function genNode(node: any, context) {
    switch (node.type){
        case NodeTypes.TEXT:
            genText(node,context)
            break;
        case NodeTypes.INTERPOLATION:
            genInterpolation(node,context)
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node,context)
            break;
        case NodeTypes.ELEMENT:
            genElement(node,context)
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context);
            break;
    }
}

function genText(node: any, context: any){
    const {push} = context
    push(`'${node.content}'`)
}

function genInterpolation(node: any, context: any) {
    const {push} = context
    push(`${context.helper(TODISPLAYSTRING)}(`)
    genNode(node.content,context)
    push(")")
}

function genExpression(node: any, context: any){
    context.push(`${node.content}`)
}

function genElement(node: any,context: any){
    const {push} = context
    const {tag, props, children} = node
    push(`${context.helper(CREATEELEMENTBLOCK)}(`)
    genNodeList(genNullableArgs([tag,props,children]),context)
    push(")")
}

function genCompoundExpression(node: any, context: any) {
    const {push} = context
    for(let i=0; i<node.children.length; i++){
        if(isString(node.children[i])){
            push(node.children[i])
        }else{ 
            genNode(node.children[i],context)
        }
    }
}

function genNodeList(nodes,context){
    const {push} = context
    for(let i=0;i<nodes.length;i++){
        const node = nodes[i]
        if(isString(node)){
            push(`${node}`)
        }else{
            genNode(node,context)
        }
        if (i < nodes.length - 1) {
            push(", ");
          }

    }
}

function genNullableArgs(args){
    return args.map(arg => arg || 'null')
}

function createGenerateContext(ast: any) {
    const context = {
        code:'',
        push(code){
            context.code += code
        },
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
    }
    return context
}



function genFunctionPreamble(ast, context) {
   const {push} = context
   const name = 'Vue'
   const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`
   if(ast.helpers.length > 0){
    const arg = ast.helpers.map(aliasHelper).join(",")
    push(`const { ${arg} } = ${name} `)
   }
   push('\n')
}


