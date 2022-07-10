import { effect } from '@vue/reactivity'
import { ShapeFlags } from 'packages/shared/src/shapeFlag'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { normalizeVNode } from './vode'
export function createRender(rendererOptions){//告诉core怎么渲染
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
    } = rendererOptions
    const setupRenderEffect = (instance,container) => {
        instance.update = effect(function componentEffect(){//组件级更新
            if(!instance.isMounted){
                //初次渲染
                let proxyToUse = instance.proxy
                let subTree = instance.subTree = instance.render.call(proxyToUse,proxyToUse)
                //用render函数的返回值继续渲染
                patch(null,subTree,container)
                instance.isMounted = true
            }else{
                //更新逻辑
            }
        })
        instance.render()
    }
    
    const mountComponent = (initialVNode,container) => {
        //组件的渲染流程
        //先有实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode))
        //需要的数据解析到实例上
        setupComponent(instance)
        //创建一个effect 让render执行
        setupRenderEffect(instance,container)

    }

    const processComponent = (n1,n2,container) => {
        if(n1 == null){//初始化流程
            mountComponent(n2,container)
        }else{

        }
    }
    // 以上为组件相关

    const mountChildren = (children,container) => {
        for(let i = 0;i<children.length;i++){
            let child = normalizeVNode(children[i])
            patch(null,child,container)
        }
    }
    const mountElement = (vnode,container) => {
        //递归渲染
        const {props,shapeFlag,type,children} = vnode
        let el = (vnode.el = hostCreateComment(type))
        if(props){
            for(const key in props){
                hostPatchProp(el,key,null,props[key])
            }
        }
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            hostSetElementText(el,children)
        }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
            //数组['a','b']
            mountChildren(children,el)
        }
        hostInsert(el,container)
    }
    const processElement = (n1,n2,container) => {
        if(n1 == null){
            mountElement(n2,container)
        }else{
            //元素更新
        }
    }

    const processText = (n1,n2,container) => {
        if(n1 == null){
            hostInsert(n2.el = hostCreateText(n2.children),container)
        }
    }

    const patch = (n1,n2,container) => {
        //针对不同类型 做初始化操作
        const {shapeFlag,type} = n2
        switch(type){
            case Text:
                processText(n1,n2,container)
                break;
            default:
                if(shapeFlag & ShapeFlags.ELEMENT){
                    processElement(n1,n2,container)
                }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                    processComponent(n1,n2,container)
                }
        }
        
    }
    
    const render = (vnode,container) => {
        patch(null,vnode,container)
    }
    return {
        createApp:createAppAPI(render)
    }
}