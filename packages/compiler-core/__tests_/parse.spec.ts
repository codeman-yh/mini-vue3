import { NodeTypes } from "../src/ast"
import {baseParse } from "../src/parse"

describe('parse',()=>{
    describe('Interpolation',() =>{
        test('simple interpolation',()=>{
            const ast = baseParse('{{ message }}')
            const interpolation = ast.children[0]

            expect(interpolation).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: 'message'
                }
            })
        })
    })

    describe('Element', () => {
        test("simple div", () => {
            const ast = baseParse("<div></div>");
            const element = ast.children[0];
      
            expect(element).toStrictEqual({
              type: NodeTypes.ELEMENT,
              tag: "div",
              children:[]
            });
          });
    })

    describe('text',()=>{
        test("simple text", () => {
        const ast = baseParse("some text");
        const text = ast.children[0];
    
        expect(text).toStrictEqual({
                type: NodeTypes.TEXT,
                content: "some text",
            });
        });
    })

    describe('combilne type',()=>{
        test("element with interpolation and text", () => {
            const ast = baseParse("<div>hi,{{ msg }}</div>");
            const element = ast.children[0];
      
        expect(element).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
            {
                type: NodeTypes.TEXT,
                content: "hi,",
            },
            {
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: "msg",
                },
            },
            ],
        });
      });
    })

    describe('edge case',()=>{
        test('without end tag',()=>{
            expect(()=>{
                baseParse("<div><span></div>")
            }).toThrow("缺失结束标签：span");
        })

        test('nest element',()=>{
            const ast = baseParse("<div><p>hi,</p>{{ msg }}</div>");
            const element = ast.children[0];
            expect(element).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag:"p",
                    children:[
                        {
                            type: NodeTypes.TEXT,
                            content: "hi,",
                        },
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "msg",
                    },
                },
                ],
            });
        })
    })
})