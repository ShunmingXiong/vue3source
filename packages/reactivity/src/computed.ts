import { isFunction } from "@vue/shared"
import { effect, track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"

class ComputedRefImpl{
    public _dirty = true //默认取值时不要用缓存
    public _value
    public effect
    constructor(getter,public setter){//默认不会挂载到this上
        this.effect = effect(getter//计算属性会产生一个effect
        ,{
            lazy:true, ///默认不执行
            scheduler:()=>{
                if(!this._dirty){
                    this._dirty = true
                    trigger(this,TriggerOpTypes.SET,'value')
                }
            }
        })
    }
    get value(){//计算属性也要收集依赖
        if(this._dirty){
            this._value = this.effect()// 会将用户的返回值返回
            this._dirty = false
        }
        track(this,TrackOpTypes.GET,'value')
        return this._value
    }
    set value(newValue){
        this.setter(newValue)
    }
}

export function computed(getterOrOptions){
    let getter
    let setter
    if(isFunction(getterOrOptions)){
        getter = getterOrOptions
        setter = () => {
            console.warn(`computed value must be readonly`)
        }
    }else{
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }
    return new ComputedRefImpl(getter,setter)
}