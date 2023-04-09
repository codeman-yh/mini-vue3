import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"
import { transformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"

describe('codegen',()=>{
    test('text',()=>{ 
        const ast = baseParse('hello')
        transform(ast)
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })

    test('interploation',()=>{
        const ast = baseParse('{{message}}')
        transform(ast,{
            nodeTransfrom: [transformExpression]
        })
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })

    test('element',()=>{
        const ast = baseParse('<div>hi，{{message}}</div>')
        transform(ast,{
            nodeTransfrom:[transformExpression,transformText,transformElement]
        })
        console.log(ast)
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
})