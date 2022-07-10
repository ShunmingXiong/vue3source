import { isFunction, isObject } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlag"
import { PublicInstanceProxyHandlers } from "./publicInstanceProxyHandlers"

//组件中所有的方法
export function createComponentInstance(vnode){
    //组件的实例
    //webcomponent 组件需要有属性 插槽
    const instance = {
        vnode,
        type:vnode.type,
        props:{}, //vnode包含props
        attrs:{}, //
        slots:{},
        ctx:{},
        setupState:{},
        isMounted:false//表示组件是否挂载过
    }

    instance.ctx = {_:instance}//instance.ctx._

    return instance
}

export function setupComponent(instance){
    const {props,children} = instance.vnode
    instance.props = props//initProps
    instance.children = children//插槽解析initSlot
    //需要先看下，当前组件是不是有状态的组件，函数组件
    let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    if(isStateful){
        //调用当前实例的setup方法，用他的返回值填充对应的render方法
        setupStatefulComponent(instance)
    }
}

function setupStatefulComponent(instance){
    //1代理，传递给render函数
    instance.proxy = new Proxy(instance.ctx,PublicInstanceProxyHandlers as any)
    //2获取组件类型，拿到组件的setup方法
    let Component = instance.type
    let {setup} = Component
    if(setup){
        let setupContext = createSetupContext(instance)
        const setupResult = setup(instance.props,setupContext)
        
        handleSetupResult(instance,setupResult)
    }else{
        finishComponentSetup(instance)
    }
    Component.render(instance.ctx)
}

function createSetupContext(instance){
    return {
        attrs:instance.attrs,
        slots:instance.slots,
        emit:()=>{},
        expose:()=>{}
    }
}

function finishComponentSetup(instance){
    let Component = instance.type
    if(!instance.render){
        //对template模板进行编译
        if(!Component.render && Component.template){
            instance.render = Component.render//将生成的render函数放在实力上
        }
    }
    
}

function handleSetupResult(instance,setupResult){
    if(isFunction(setupResult)){
        instance.render = setupResult
    }else if(isObject(setupResult)){
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}