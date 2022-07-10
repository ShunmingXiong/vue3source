"use strict";
exports.__esModule = true;
exports.normalizeVNode = exports.createVNode = exports.isVnode = void 0;
var shared_1 = require("@vue/shared");
var shapeFlag_1 = require("packages/shared/src/shapeFlag");
function isVnode(vnode) {
    return vnode.__v_isVnode;
}
exports.isVnode = isVnode;
exports.createVNode = function (type, props, children) {
    if (children === void 0) { children = null; }
    //根据type来区分是组件还是普通元素
    //元素是字符串 组件是对象
    var shapeFlag = shared_1.isString(type) ? shapeFlag_1.ShapeFlags.ELEMENT : shared_1.isObject(type) ? shapeFlag_1.ShapeFlags.STATEFUL_COMPONENT : 0;
    var vnode = {
        __v_isVnode: true,
        type: type,
        props: props,
        children: children,
        component: null,
        el: null,
        key: props && props.key,
        shapeFlag: shapeFlag //判断出自己的类型和儿子的类型
    };
    normalizeChildren(vnode, children);
    return vnode;
};
function normalizeChildren(vnode, children) {
    var type = 0;
    if (children == null) { }
    else if (shared_1.isArray(children)) {
        type = shapeFlag_1.ShapeFlags.ARRAY_CHILDREN;
    }
    else {
        type = shapeFlag_1.ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
}
var Text = Symbol('Text');
function normalizeVNode(child) {
    if (shared_1.isObject(child))
        return child;
    return exports.createVNode(Text, null, String(child));
}
exports.normalizeVNode = normalizeVNode;
