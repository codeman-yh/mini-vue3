import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe('transform',()=>{ 
    test('happy path',()=>{
        const ast = baseParse(`<div>hello {{ message }}</div>`);
        const plugin = (node) => {
            if(node.type == NodeTypes.TEXT){
                node.content =  node.content + 'mini-vue'
            }
        }
        transform(ast,{
            nodeTransfrom: [plugin]
        })
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children:[
                {
                    type: NodeTypes.TEXT,
                    content: "hello mini-vue",
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: 'message'
                    }
                }
            ] 
        })
    })
})