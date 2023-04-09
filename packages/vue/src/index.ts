export * from "@mini-vue3/runtime-dom"

import {baseCompiler} from "@mini-vue3/compiler-core"
import * as Vue from "@mini-vue3/runtime-dom"
import {registerRuntimeCompiler} from "@mini-vue3/runtime-dom"

function compilerToRenderFuntion(template){
    // 函数体
    const {code} =  baseCompiler(template)
    const render = new Function("Vue",code)(Vue)
    return render
}
registerRuntimeCompiler(compilerToRenderFuntion)

