import { extend, hasChange, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
import { reactive, readonly } from "./reactive"

function createGetter(isReadonly = false,shallow = false){//核心获取功能
    return function get(target,key,receiver){
        const res = Reflect.get(target,key,receiver) //target[key]
        //Reflect 后续Object上的方法，会被迁移到Reflect
        //以前 target[key] = value 方式设置会失败，并不会报异常，也没有返回值标识
        if(!isReadonly){
            //收集依赖 例如：name对应一个effect age对应一个effect
            track(target,TrackOpTypes.GET,key);
        }

        if(shallow){
            return res
        }
        if(isObject(res)){//Vue3的代理模式是懒代理
            return isReadonly ? readonly(res) : reactive(res)
        }

        return res
    }
}

function createSetter(isShallow=false){//核心设置功能
    return function set(target,key,value,receiver){
        const oldValue = target[key]
        //既是数组又是通过索引修改
        let hedKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target,key)

        const res = Reflect.set(target,key,value,receiver) //target[key] = value
       
        if(!hedKey){//新增
            trigger(target,TriggerOpTypes.ADD,key,value)
        }else if(hasChange(oldValue,value)){//修改
            trigger(target,TriggerOpTypes.SET,key,value,oldValue)
        }
        return res
    }
}
const get = createGetter()
const shallowGet = createGetter(false,true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true) 

const set = createSetter()
const shallowSet = createSetter(true)
let readonlyObj = {
    set:(target,key) => {
        console.warn(`set on key ${key} falied`)
    }
}

export const mutableHandlers = {
    get,
    set
}
export const shallowReactiveHandlers = {
    get:shallowGet,
    set:shallowSet
}

export const readonlyHandlers = extend({
    get:readonlyGet,
},readonlyObj)

export const shallowReadonlyHandlers = extend({
    get:shallowReadonlyGet,
},readonlyObj)