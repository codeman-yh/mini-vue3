import { NodeTypes } from "../ast";

export function transformText(node){
    if(node.type === NodeTypes.ELEMENT){
        for(let i=0; i<node.children.length;i++){
            let currentContainer:any = {};
            let child = node.children[i]
            // 查看下一个是否为Text类型的节点
            if(isText(child)){
                for(let j=i+1; j<node.children.length; j++){
                    let next = node.children[j]
                    if(isText(next)){
                        if(!currentContainer.children){
                           // 创建初始值
                           currentContainer = node.children[i] = {
                                type: NodeTypes.COMPOUND_EXPRESSION,
                                children:[child]
                           }
                        }
                        currentContainer.children.push(" + ", next)                       
                        // 将添加进COMPOUND类型的数据从原数组删除
                        node.children.splice(j,1)
                        j--;
                    }else{
                        break;
                    }
                }  
            }
    
        }
    }
}

function isText(node){
   return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}