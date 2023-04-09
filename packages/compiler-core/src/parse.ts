import { NodeTypes } from "./ast"

const enum TagType{
    start,
    end
}

export function baseParse(content: string){
    const context = creatParserContext(content)
    return createRoot(parseChildren(context,[]))
}

function parseChildren(context,ancestors){
    const nodes:any = []
    while(!isEnd(context,ancestors)){
        const s = context.source
        let node;
        if(s.startsWith("{{")){
            node = parseInterpolation(context)
        }else if(s[0] == "<"){
            if(/^[a-z]/i.test(s[1])){
                node = parseElement(context,ancestors)
            }
        }else{
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}



function parseInterpolation(context){
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    let closeIndex = context.source.indexOf(closeDelimiter,openDelimiter)

    advanceBy(context,openDelimiter.length)
    let rawContent =  parseTextData(context, closeIndex - closeDelimiter.length)
    let content = rawContent.trim()
    advanceBy(context,closeDelimiter.length)

    return {      
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content
        }       
    }   
}

function parseElement(context,ancestors){
    const elementNode:any = parseTag(context,TagType.start)
    ancestors.push(elementNode)
    elementNode.children = parseChildren(context,ancestors)
    ancestors.pop()
    if(isCloseWithSameTag(context.source,elementNode.tag)){
        parseTag(context,TagType.end)
    }else{
        throw new Error('缺失结束标签：span')
    }
    return elementNode
}

function parseTag(context, tagType){
    let match = context.source.match(/^<\/?([a-z]*)/i)
    let tag = match![1]
    advanceBy(context, match[0].length)
    advanceBy(context,1)
    if(tagType == TagType.start){
        return{       
            type: NodeTypes.ELEMENT,
            tag,
        }
    }

}

function parseText(context){
    const s = context.source
    const endTokens = ["{{","<"]
    let endIndex = s.length;
    for(let i=0; i<endTokens.length;i++){
        const index  = s.indexOf(endTokens[i])
        if(index !== -1 && index < endIndex){
            endIndex = index
        }
    }
    const content = parseTextData(context,endIndex)
    return {
        type: NodeTypes.TEXT,
        content,
    }
}

function parseTextData(context,length){
    const content = context.source.slice(0,length)
    advanceBy(context,length)
    return content
}

function creatParserContext(content: string) {
    return{
        source: content
    }
}
function createRoot(children) {
    return{
        type: NodeTypes.ROOT,
        children,
        helpers: [],
    }
}

function advanceBy(context, length) {
    context.source = context.source.slice(length)
}

function isEnd(context,ancestors){
    const s = context.source
    // 还需判断节点是否需要闭合
    if(s.startsWith("</")){
        for(let i= ancestors.length -1;i>=0;i--){
            if(isCloseWithSameTag(s,ancestors[i].tag)){
                return true
            }
        }
        return 
    }
    return !context.source
}

function isCloseWithSameTag(s,tag){
    return s.slice(2,tag.length + 2) === tag
}
