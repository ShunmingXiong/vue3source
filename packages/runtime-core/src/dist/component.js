"use strict";
exports.__esModule = true;
exports.setupComponent = exports.createComponentInstance = void 0;
var shared_1 = require("@vue/shared");
var shapeFlag_1 = require("packages/shared/src/shapeFlag");
var publicInstanceProxyHandlers_1 = require("./publicInstanceProxyHandlers");
//组件中所有的方法
function createComponentInstance(vnode) {
    //组件的实例
    //webcomponent 组件需要有属性 插槽
    var instance = {
        vnode: vnode,
        type: vnode.type,
        props: {},
        attrs: {},
        slots: {},
        ctx: {},
        setupState: {},
        isMounted: false //表示组件是否挂载过
    };
    instance.ctx = { _: instance }; //instance.ctx._
    return instance;
}
exports.createComponentInstance = createComponentInstance;
function setupComponent(instance) {
    var _a = instance.vnode, props = _a.props, children = _a.children;
    instance.props = props; //initProps
    instance.children = children; //插槽解析initSlot
    //需要先看下，当前组件是不是有状态的组件，函数组件
    var isStateful = instance.vnode.shapeFlag & shapeFlag_1.ShapeFlags.STATEFUL_COMPONENT;
    if (isStateful) {
        //调用当前实例的setup方法，用他的返回值填充对应的render方法
        setupStatefulComponent(instance);
    }
}
exports.setupComponent = setupComponent;
function setupStatefulComponent(instance) {
    //1代理，传递给render函数
    instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers_1.PublicInstanceProxyHandlers);
    //2获取组件类型，拿到组件的setup方法
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        var setupContext = createSetupContext(instance);
        var setupResult = setup(instance.props, setupContext);
        handleSetupResult(instance, setupResult);
    }
    else {
        finishComponentSetup(instance);
    }
    Component.render(instance.ctx);
}
function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: function () { },
        expose: function () { }
    };
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (!instance.render) {
        //对template模板进行编译
        if (!Component.render && Component.template) {
            instance.render = Component.render; //将生成的render函数放在实力上
        }
    }
}
function handleSetupResult(instance, setupResult) {
    if (shared_1.isFunction(setupResult)) {
        instance.render = setupResult;
    }
    else if (shared_1.isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
