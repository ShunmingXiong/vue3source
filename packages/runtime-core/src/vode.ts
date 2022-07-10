import { isArray, isObject, isString } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlag"

export function isVnode(vnode){
    return vnode.__v_isVnode
}

export const createVNode = (type,props,children = null) => {
    //根据type来区分是组件还是普通元素
    //元素是字符串 组件是对象
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT:isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    const vnode = {
        __v_isVnode:true,
        type,
        props,
        children,
        component:null,
        el:null,//稍后会将虚拟节点和真实节点结合起来
        key:props && props.key,//diff算法
        shapeFlag //判断出自己的类型和儿子的类型
    }
    normalizeChildren(vnode,children)
    return vnode
}

function normalizeChildren(vnode,children){
    let type = 0
    if(children == null){}
    else if(isArray(children)){
        type = ShapeFlags.ARRAY_CHILDREN
    }else{
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
}

const Text = Symbol('Text')
export function normalizeVNode(child){
    if(isObject(child)) return child
    return createVNode(Text,null,String(child))
}