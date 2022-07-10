"use strict";
exports.__esModule = true;
exports.createRender = void 0;
var reactivity_1 = require("@vue/reactivity");
var shapeFlag_1 = require("packages/shared/src/shapeFlag");
var apiCreateApp_1 = require("./apiCreateApp");
var component_1 = require("./component");
var scheduler_1 = require("./scheduler");
var vode_1 = require("./vode");
function createRender(rendererOptions) {
    var hostInsert = rendererOptions.insert, hostRemove = rendererOptions.remove, hostPatchProp = rendererOptions.patchProp, hostCreateElement = rendererOptions.createElement, hostCreateText = rendererOptions.createText, hostCreateComment = rendererOptions.createComment, hostSetText = rendererOptions.setText, hostSetElementText = rendererOptions.setElementText;
    var setupRenderEffect = function (instance, container) {
        instance.update = reactivity_1.effect(function componentEffect() {
            if (!instance.isMounted) {
                //初次渲染
                var proxyToUse = instance.proxy;
                var subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse);
                //用render函数的返回值继续渲染
                patch(null, subTree, container);
                instance.isMounted = true;
            }
            else {
                //更新逻辑
            }
        }, { scheduler: scheduler_1.queueJob });
    };
    var mountComponent = function (initialVNode, container) {
        //组件的渲染流程
        //先有实例
        var instance = (initialVNode.component = component_1.createComponentInstance(initialVNode));
        //需要的数据解析到实例上
        component_1.setupComponent(instance);
        //创建一个effect 让render执行
        setupRenderEffect(instance, container);
    };
    var processComponent = function (n1, n2, container) {
        if (n1 == null) { //初始化流程
            mountComponent(n2, container);
        }
        else {
        }
    };
    // 以上为组件相关
    var mountChildren = function (children, container) {
        for (var i = 0; i < children.length; i++) {
            var child = vode_1.normalizeVNode(children[i]);
            patch(null, child, container);
        }
    };
    var mountElement = function (vnode, container) {
        //递归渲染
        var props = vnode.props, shapeFlag = vnode.shapeFlag, type = vnode.type, children = vnode.children;
        var el = (vnode.el = hostCreateComment(type));
        if (props) {
            for (var key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        if (shapeFlag & shapeFlag_1.ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children);
        }
        else if (shapeFlag & shapeFlag_1.ShapeFlags.ARRAY_CHILDREN) {
            //数组['a','b']
            mountChildren(children, el);
        }
        hostInsert(el, container);
    };
    var processElement = function (n1, n2, container) {
        if (n1 == null) {
            mountElement(n2, container);
        }
        else {
            //元素更新
        }
    };
    var processText = function (n1, n2, container) {
        if (n1 == null) {
            hostInsert(n2.el = hostCreateText(n2.children), container);
        }
    };
    var patch = function (n1, n2, container) {
        //针对不同类型 做初始化操作
        var shapeFlag = n2.shapeFlag, type = n2.type;
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & shapeFlag_1.ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container);
                }
                else if (shapeFlag & shapeFlag_1.ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container);
                }
        }
    };
    var render = function (vnode, container) {
        patch(null, vnode, container);
    };
    return {
        createApp: apiCreateApp_1.createAppAPI(render)
    };
}
exports.createRender = createRender;
