import { hasChange, isArray, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
import { reactive } from "./reactive"

export function ref(value){ //value是一个普通类型 也可以是一个对象
    //将普通用类型变成一个对象
    return createRef(value)
}
//ref内部使用defineProperty，reactive内部采用Proxy

export function shallowRef(value){
    return createRef(value,true)
}

const convert = val => isObject(val) ? reactive(val) : val

class RefImpl{
    public _value
    public __v_isRef = true //表示是一个ref属性
    constructor(public rawValue,public shallow){
        //参数中前面添加修饰符，表示此属性放到了实例上
        this._value = shallow ? rawValue : convert(rawValue)//如果是深度，需要把里面变成响应式
    }
    // 类的属性访问器
    get value(){
        track(this,TrackOpTypes.GET,'value')
        return this._value
    }
    set value(newValue){
        if(hasChange(newValue,this.rawValue)){
            this.rawValue = newValue//新值作为老值
            this._value = newValue
            trigger(this,TriggerOpTypes.SET,'value',newValue)
        }
        trigger(this,TriggerOpTypes.SET,'value',newValue)
    }
}

function createRef(rawValue,shallow = false){
    return new RefImpl(rawValue,shallow)
}

class ObjectRefImpl{
    public __v_isRef = true
    constructor(public target,public key){

    }
    get value(){
        return this.target[this.key]
    }
    set value(newValue){
        this.target[this.key] = newValue
    }
}

//可以将一个对象的值转换为ref
export function toRef(target,key){
    return new ObjectRefImpl(target,key)
}

export function toRefs(object) {
    const ret = isArray(object) ? new Array(object.length) : {}
    for(let key in object){
        ret[key] = toRef(object,key)
    }
    return ret
}