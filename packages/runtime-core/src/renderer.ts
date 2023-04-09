import { effect } from "@mini-vue3/reactivity";
import { ShapeFlags } from "@mini-vue3/shared";
import { createComponentInstance, setupComponent } from "./component";
import { publicInstanceProxyhandlers } from "./componentPublicInstances";
import { shouleUpdateComponent } from "./componentRenderUtils";
import { createAppAPI } from "./createApp";
import {queueJob } from "./scheduler";
import { Fragment,Text} from "./vnode";

export function createRenderer(options){
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, rootContainer,parentComponent){
        patch(null,vnode,rootContainer,parentComponent,null)
    }

    function patch(n1,n2,container,parentComponent,anchor){
        const { type, shapeFlag} = n2
        switch (type) {
            case Fragment:
                processFragment(n1,n2,container,parentComponent,anchor)
                break;
            case Text:
                processText(n1,n2,container,anchor)
                break;
            default:
                // check type component element 根据type的数据类型
                if(shapeFlag & ShapeFlags.ELEMENT){
                    processElement(n1,n2,container,parentComponent,anchor)
                }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                    processComponent(n1,n2,container,parentComponent,anchor)  
                }
                break;
        }
    }

    function processComponent(n1,n2,container,parentComponent,anchor){
        // 初始化
        if(!n1){
            mountComponent(n1,n2,container,parentComponent,anchor)
        }else{
        // 更新组件
            updateComponent(n1,n2)
        }

    }

    function processElement(n1,n2,container,parentComponent,anchor){
        if(!n1){
            mountElement(n1,n2,container,parentComponent,anchor)
        }else{
            patchElement(n1,n2,container,parentComponent,anchor)
        }
    }

    function processFragment(n1,n2,container,parentComponent,anchor){
        mountChildren(n2.children,container,parentComponent,anchor)
    }

    function processText(n1,n2,container,anchor){
        let textNode = n2.el =  document.createTextNode(n2.children)
        hostInsert(textNode,container,anchor)
    }

    function mountComponent(n1,n2,container, parentComponent,anchor){
        const instance = n2.component = createComponentInstance(n2,parentComponent);
        console.log('createComponentInstance', instance.parent)
        // 加工实例
        setupComponent(instance);

        setupRenderEffect(instance,container,anchor);
    }

    function updateComponent(n1,n2){
        console.log('更新组件')
        const instance = n2.component = n1.component
        if(shouleUpdateComponent(n1,n2)){
            instance.next = n2
            instance.update()
        }else{
            instance.next = null
        }
    }

    function mountElement(n1,n2,container,parentComponent,anchor){
        const el:Element = n2.el = hostCreateElement(n2.type)
        const {props,children} = n2
        if(props){
            for(let key in props){
                const val = props[key]
                hostPatchProp(el,key,val)
            }
        }
        if(n2.shapeFlag & ShapeFlags.TEXT_CHILDREN){
            el.textContent = children
        }else if(n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN){
            // children Array(递归调用patch)
            mountChildren(children,el,parentComponent,anchor)
        }
        hostInsert(el,container,anchor)
    }

    function patchElement(n1,n2,container,parentComponent,anchor){
        console.log('patchElement')
        let oldProps = n1.props
        let newProps = n2.props
        let el = n2.el = n1.el;
        patchChildren(n1,n2,el,parentComponent,anchor)
        parchProps(el,oldProps,newProps)
    }

    function parchProps(el,oldProps,newProps){
        // props
        // 1. 原属性有值 -> 新属性undefined/null 删除属性
        // 2. 原属性有值 -> 新属性值不同 替换属性值
        // 3. 原属性有值 -> 新属性不存在 删除属性
        // 4. 原属性不存在 -> 新属性存在 添加属性
        if(oldProps !== newProps){
            for(let key in newProps){
                if(oldProps[key] != newProps[key]){
                    hostPatchProp(el, key, newProps[key])
                }      
            }
            if(JSON.stringify(oldProps) !== "{}"){
                for(let key in oldProps){
                    if(!(key in newProps)){
                        hostPatchProp(el,key,null)
                    }
                }
            }
        }
    }

    function patchChildren(n1,n2,container,parentComponent,anchor){
        // 1. text -> text 2. text - array 3.array -> text 4.array -> array
        const c1 = n1.children
        const c2 = n2.children
        const preShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag

        if(preShapeFlag & ShapeFlags.TEXT_CHILDREN){
            if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
                // text -> text
                c1 !== c2 && hostSetElementText(container,c2)
            }else{
                // text -> array
                hostRemove(n1.el)
                mountChildren(c2,container,parentComponent,anchor)
            }
        }else{
            if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
                // array -> text
                unMountChildren(c1)
                hostSetElementText(container,c2)
            }else{
                // array -> array
                patchKeyedChildren(c1,c2,container,parentComponent,anchor)
            }
        }
    }

    function patchKeyedChildren(c1,c2,container,parentComponent,anchor){
        let i = 0;
        let e1 = c1.length - 1
        let e2 = c2.length - 1
        // 从左侧比对
        while(i <= e1 && i <= e2){
            if(isSameNodeType(c1[i],c2[i])){
                patch(c1[i],c2[i],container,parentComponent,anchor)
            }else{
                break;
            }
            i++
        }

        // 从右侧比对
        while(i <= e1 && i <= e2){
            if(isSameNodeType(c1[e1], c2[e2])){
                patch(c1[e1],c2[e2],container,parentComponent,anchor)
            }else{
                break;
            }
            e1--
            e2--
        }
        // 已锁定范围 O(n) 尽量使n变小，提升性能
        // console.log(i)
        // console.log(e1)
        // console.log(e2)

        // 新的children比老的children长 // 左侧
        if(i > e1){ // 这里无论左右侧 都成立 说明之前的节点对比都相等
            if(i <= e2){
                const nextPros = e2 + 1 // 这里一定会指向老children的第一个元素
                let anchor = nextPros < c2.length ? c2[nextPros].el : null
                while(i <= e2){
                    patch(null,c2[i],container,parentComponent,anchor)
                    i++
                }
            }
        }
        else if(i > e2){ // 老的children比新的children长
            while(i <= e1){
                hostRemove(c1[i].el)  
                i++
            }
        }
        else{
            // 处理乱序部分
            // let s1 = e1 - i + 1
            // let s2 = e2 - i + 1
            let s1 = i
            let s2 = i
            let toBePatched = e2 - i + 1;
            let patched = 0;
            let keyToNewIndexMap = new Map()
            let newIndexToOldIndexMap = new Array(toBePatched).fill(-1)
            let moved = false
            let maxNewIndex = 0
            for(let i=s2; i <= e2; i++){
                // 建立有key的索引表，优化查找
                if(c2[i].key !== null){
                    keyToNewIndexMap.set(c2[i].key,i)
                }
            }

            for(let i=s1; i <= e1; i++){
                const prevChild = c1[i]
                if(patched >= toBePatched){
                    hostRemove(prevChild.el)
                    continue
                }
                let newIndex
                if(prevChild.key !== null){
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                }else{
                    // 遍历对比是否存在节点
                    for(let j=s1; j<=e2; j++){
                        if(isSameNodeType(prevChild,c2[j])){
                            newIndex = j
                            break;
                        }
                    }
                }
                if(newIndex < maxNewIndex){
                    moved = true
                }else{
                    maxNewIndex = newIndex
                }
                if(!newIndex){
                    hostRemove(prevChild.el)
                }else{
                    // 新节点在老节点中存在
                    newIndexToOldIndexMap[newIndex - s2] = i 
                    patch(prevChild,c2[newIndex],container,parentComponent,null)
                    patched ++
                }
            }
            let increaseSquence = moved ? getSequence(newIndexToOldIndexMap) : []
            console.log(newIndexToOldIndexMap)
            console.log(increaseSquence)
            let j = increaseSquence.length - 1
            for(let i = toBePatched - 1; i >= 0; i--){
                    let newIndex = i + s2
                    let anchor = newIndex + 1 <= c2.length ? c2[newIndex+1].el : null
                    if(newIndexToOldIndexMap[i] === -1){
                        // 创建
                        patch(null,c2[newIndex],container,parentComponent,anchor)
                        continue
                    }else if(moved){
                        console.log(c2[newIndex].el)
                        if(j<0 || i!==increaseSquence[j]){
                            hostInsert(c2[newIndex].el,container,anchor)
                        }else{
                            j--
                        }
                    }             
            }
        }
    }

    function mountChildren(children,container,parentComponent,anchor){
        children.forEach(v => {
            patch(null,v,container,parentComponent,anchor)
        })
    }

    function unMountChildren(children){
        children.forEach(v => {
            hostRemove(v.el)
        })
    }

    function setupRenderEffect(instance,container,anchor){
        instance.update = effect(()=>{
            if(!instance.isMounted){
                // 初始化
                let proxy = new Proxy({_:instance},publicInstanceProxyhandlers)
                instance.proxy = proxy
                let subTree = instance.subTree = instance.render.call(proxy,proxy)
                patch(null,subTree,container,instance,anchor)
                instance.vnode.el = subTree.el
                instance.isMounted = true
            }else{
                // 更新
                let proxy = new Proxy({_:instance},publicInstanceProxyhandlers)
                instance.proxy = proxy
                if(instance.next){
                    let {props: nextProps} = instance.next
                    instance.props = nextProps
                }
                let subTree = instance.render.call(proxy,proxy)
                let preSubTree = instance.subTree
                patch(preSubTree,subTree,container,instance,anchor)
                instance.vnode.el = subTree.el
                instance.subTree = subTree
            }
        }, {
            scheduler: () => queueJob(instance.update)           
        })
    }

    function isSameNodeType(v1,v2){
        return v1.type === v2.type && v1.key === v2.key
    }



    return {
        createApp: createAppAPI(render)
    }
}

function getSequence(arr){
    let dp = new Array(arr.length).fill(1)
    // 利用动态规划求出当前元素的最长递增子序列个数
    for(let i = 1; i< arr.length; i++){
        for(let j = 0; j < i; j++){
            if(arr[i] >  arr[j]){
                dp[i] = Math.max(dp[i], dp[j] +1 )
            }
        }
    }

    // 拿到每个0-i元素的最长递增子序列个数，取出最大值和下标
    let maxCount = Math.max.apply(null,dp)
    let maxIndex = 0
    for(let i =0; i<dp.length; i++){
        if(dp[i] === maxCount){
            maxIndex = i;
            break;
        }
    }

    // 求出最长子序列，将下标返回
    let result:number[] = [];
    let currentMax = arr[maxIndex]
    result.push(maxIndex)
    while(maxIndex > 0){
        if(currentMax > arr[maxIndex-1]){
            result.push(maxIndex-1)
            currentMax = arr[maxIndex-1]
        }
        maxIndex--
    }
    result.reverse()
    return result
}