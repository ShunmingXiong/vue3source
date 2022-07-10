'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (value) => typeof value == "object" && value != null;
const extend = Object.assign;
const isArray = Array.isArray;
const isIntegerKey = (key) => parseInt(key) + '' === key;
let hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => hasOwnProperty.call(target, key);
const hasChange = (oldValue, value) => oldValue !== value;

function effect(fn, options = {}) {
    //effect变成响应式，做到数据变化重新执行
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) { //默认先执行
        effect();
    }
    return effect;
}
let uid = 0;
let activeEffect; // 存储当前的effect
const effectStack = []; //解决effect嵌套 组件嵌套
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) { //避免无限执行
            try {
                effectStack.push(effect);
                activeEffect = effect;
                return fn(); //函数执行时会走get方法
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    effect.id = uid++; //制作effect，用于区分effect
    effect._isEffect = true; //用于标识这是一个响应式对象
    effect.raw = fn; //保留effect对应的原函数
    effect.options = options;
    return effect;
}
const targetMap = new WeakMap();
function track(target, type, key) {
    // activeEffect //当前正在运行的effect
    if (activeEffect === undefined) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
}
function trigger(target, type, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const effects = new Set();
    const add = (effectsToAdd) => {
        if (effectsToAdd) {
            effectsToAdd.forEach(effect => effects.add(effect));
        }
    };
    //将所有的要执行的effect全部存到一个新集合中。最终一起执行
    //修改长度
    if (key === 'length' && isArray(target)) {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key > newValue) { //更改的长度 < 收集的索引
                add(dep);
            }
        });
    }
    else {
        if (key !== undefined) { //修改
            add(depsMap.get(key));
        }
        //修改数组中的某一个索引
        switch (type) { //如果添加了一个索引就触发长度更新
            case 0 /* ADD */:
                if (isArray(target) && isIntegerKey(key)) {
                    add(depsMap.get('length'));
                }
        }
    }
    effects.forEach((effect) => {
        if (effect.options.scheduler) {
            effect.options.scheduler(effect);
        }
        else {
            effect();
        }
    });
}

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver); //target[key]
        //Reflect 后续Object上的方法，会被迁移到Reflect
        //以前 target[key] = value 方式设置会失败，并不会报异常，也没有返回值标识
        if (!isReadonly) {
            //收集依赖 例如：name对应一个effect age对应一个effect
            track(target, 0 /* GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) { //Vue3的代理模式是懒代理
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isShallow = false) {
    return function set(target, key, value, receiver) {
        const oldValue = target[key];
        //既是数组又是通过索引修改
        let hedKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
        const res = Reflect.set(target, key, value, receiver); //target[key] = value
        if (!hedKey) { //新增
            trigger(target, 0 /* ADD */, key, value);
        }
        else if (hasChange(oldValue, value)) { //修改
            trigger(target, 1 /* SET */, key, value);
        }
        return res;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
const shallowSet = createSetter(true);
let readonlyObj = {
    set: (target, key) => {
        console.warn(`set on key ${key} falied`);
    }
};
const mutableHandlers = {
    get,
    set
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
};
const readonlyHandlers = extend({
    get: readonlyGet,
}, readonlyObj);
const shallowReadonlyHandlers = extend({
    get: shallowReadonlyGet,
}, readonlyObj);

function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
//是否只读 是否深度 柯里化 new Proxy()最核心需要拦截，数据读取和数据修改
const reactiveMap = new WeakMap(); //自动垃圾回收，不会内存泄漏，存储的key只能是对象
const readonlyMap = new WeakMap();
function createReactiveObject(target, isReadonly, baseHandlers) {
    //如果目标不是对象 reactive就没法拦截
    if (!isObject(target)) {
        return target;
    }
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    const exisitProxy = proxyMap.get(target);
    if (exisitProxy) {
        return exisitProxy; //已经被代理过，直接返回
    }
    //如果某个对象已经代理过了，就不需要代理类
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

function ref(value) {
    //将普通用类型变成一个对象
    return createRef(value);
}
//ref内部使用defineProperty，reactive内部采用Proxy
function shallowRef(value) {
    return createRef(value, true);
}
const convert = val => isObject(val) ? reactive(val) : val;
class RefImpl {
    constructor(rawValue, shallow) {
        this.rawValue = rawValue;
        this.shallow = shallow;
        this.__v_isRef = true; //表示是一个ref属性
        //参数中前面添加修饰符，表示此属性放到了实例上
        this._value = shallow ? rawValue : convert(rawValue); //如果是深度，需要把里面变成响应式
    }
    // 类的属性访问器
    get value() {
        track(this, 0 /* GET */, 'value');
        return this._value;
    }
    set value(newValue) {
        if (hasChange(newValue, this.rawValue)) {
            this.rawValue = newValue; //新值作为老值
            this._value = newValue;
            trigger(this, 1 /* SET */, 'value', newValue);
        }
        trigger(this, 1 /* SET */, 'value', newValue);
    }
}
function createRef(rawValue, shallow = false) {
    return new RefImpl(rawValue, shallow);
}
class ObjectRefImpl {
    constructor(target, key) {
        this.target = target;
        this.key = key;
        this.__v_isRef = true;
    }
    get value() {
        return this.target[this.key];
    }
    set value(newValue) {
        this.target[this.key] = newValue;
    }
}
//可以将一个对象的值转换为ref
function toRef(target, key) {
    return new ObjectRefImpl(target, key);
}
function toRefs(object) {
    const ret = isArray(object) ? new Array(object.length) : {};
    for (let key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}

exports.effect = effect;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.shallowRef = shallowRef;
exports.toRef = toRef;
exports.toRefs = toRefs;
//# sourceMappingURL=reactivity.cjs.js.map
