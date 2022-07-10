import { isArray, isIntegerKey } from "@vue/shared"
import { TriggerOpTypes } from "./operators"

export function effect(fn,options:any={}){
    //effect变成响应式，做到数据变化重新执行
    const effect = createReactiveEffect(fn,options)
    if(!options.lazy){//默认先执行
        effect()       
    }
    return effect
}

let uid = 0
let activeEffect // 存储当前的effect
const effectStack = [] //解决effect嵌套 组件嵌套
function createReactiveEffect(fn,options){
    const effect = function reactiveEffect(){
        if(!effectStack.includes(effect)){//避免无限执行
            try {
                effectStack.push(effect)
                activeEffect = effect
                return fn()//函数执行时会走get方法
            } finally {
                effectStack.pop()
                activeEffect = effectStack[effectStack.length-1]
            }
        }
    }
    effect.id = uid ++ //制作effect，用于区分effect
    effect._isEffect = true //用于标识这是一个响应式对象
    effect.raw = fn //保留effect对应的原函数
    effect.options = options
    return effect
}

const targetMap = new WeakMap()
export function track(target,type,key){
    // activeEffect //当前正在运行的effect
    if(activeEffect === undefined){
        return
    }
    let depsMap = targetMap.get(target)
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep = new Set()))
    }
    if(!dep.has(activeEffect)){
        dep.add(activeEffect)
    }
}

export function trigger(target,type,key?,newValue?,oldValue?){
    const depsMap = targetMap.get(target)
    if(!depsMap) return
    const effects = new Set()
    const add = (effectsToAdd) => {
        if(effectsToAdd){
            effectsToAdd.forEach(effect => effects.add(effect))
        }
    }
    //将所有的要执行的effect全部存到一个新集合中。最终一起执行
    //修改长度
    if(key === 'length' && isArray(target)){
        depsMap.forEach((dep,key) => {
            if(key === 'length' || key > newValue){//更改的长度 < 收集的索引
                add(dep)
            }
        });
    }else{
        if(key !== undefined){//修改
            add(depsMap.get(key))
        }
        //修改数组中的某一个索引
        switch(type){//如果添加了一个索引就触发长度更新
            case TriggerOpTypes.ADD:
                if(isArray(target) && isIntegerKey(key)){
                    add(depsMap.get('length'))
                }
        }
    }
    effects.forEach((effect:any)=>{
        if(effect.options.scheduler){
            effect.options.scheduler(effect)
        }else{
            effect()
        }
    })
}