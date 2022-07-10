"use strict";
exports.__esModule = true;
exports.h = void 0;
var shared_1 = require("@vue/shared");
var vode_1 = require("./vode");
function h(type, propsOrChildren, children) {
    var l = arguments.length;
    if (l == 2) { //两个参数 类型+属性 类型+孩子
        if (shared_1.isObject(propsOrChildren) && !shared_1.isArray(propsOrChildren)) {
            if (vode_1.isVnode(propsOrChildren)) {
                return vode_1.createVNode(type, null, [propsOrChildren]);
            }
            return vode_1.createVNode(type, propsOrChildren);
        }
        else { //孩子 要么是字符串要么是数组
            return vode_1.createVNode(type, null, propsOrChildren);
        }
    }
    else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (l === 3 && vode_1.isVnode(children)) {
            children = [children];
        }
    }
}
exports.h = h;
