export const patchEvent = (el,key,value) => {
    //对函数的缓存
    const invokers = el._vei || (el._vei = {})
    const exists = invokers[key]
    if(value && exists) {
        //需要绑定事件，而且还存在
        exists.value = value
    }else{
        const eventName = key.slice(2).toLowerCase()
        if(value){//需要绑定事件，以前没绑过
            let invoker = invokers[eventName] = createInvoker(value)
            el.addEventListener(eventName,invoker)
        }else{//以前绑定了，没有value
            el.removeEventListener(eventName,exists)
            invokers[eventName] = undefined
        }
    }
}

function createInvoker(value){
    const invoker = (e) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}

//一个元素绑定事件 addEventListener
