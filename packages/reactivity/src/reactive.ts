import { isObject } from "@vue/shared"
import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers"


export function reactive(target){
    return createReactiveObject(target,false,mutableHandlers)
}

export function shallowReactive(target){
    return createReactiveObject(target,false,shallowReactiveHandlers)
}

export function readonly(target){
    return createReactiveObject(target,true,readonlyHandlers)
}

export function shallowReadonly(target){
    return createReactiveObject(target,true,shallowReadonlyHandlers)
}

//是否只读 是否深度 柯里化 new Proxy()最核心需要拦截，数据读取和数据修改
const reactiveMap = new WeakMap()//自动垃圾回收，不会内存泄漏，存储的key只能是对象
const readonlyMap = new WeakMap()
export function createReactiveObject(target,isReadonly,baseHandlers){
    //如果目标不是对象 reactive就没法拦截
    if(!isObject(target)){
        return target
    }
    const proxyMap = isReadonly ? readonlyMap : reactiveMap
    const exisitProxy = proxyMap.get(target)
    if(exisitProxy){
        return exisitProxy//已经被代理过，直接返回
    }

    //如果某个对象已经代理过了，就不需要代理类
    const proxy = new Proxy(target,baseHandlers);
    proxyMap.set(target,proxy)

    return proxy
}
