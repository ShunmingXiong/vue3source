import { isArray, isObject } from "@vue/shared"
import { createVNode, isVnode } from "./vode"

export function h(type,propsOrChildren,children){
    const l = arguments.length
    if(l == 2){//两个参数 类型+属性 类型+孩子
        if(isObject(propsOrChildren) && !isArray(propsOrChildren)){
            if(isVnode(propsOrChildren)){
                return createVNode(type,null,[propsOrChildren])
            }
            return createVNode(type,propsOrChildren)
        }else{//孩子 要么是字符串要么是数组
            return createVNode(type,null,propsOrChildren)
        }
    }else{
        if(l>3){
            children = Array.prototype.slice.call(arguments,2)
        }else if(l === 3 && isVnode(children)){
            children = [children]
        }
    }
}