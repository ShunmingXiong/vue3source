"use strict";
//domAPI 方法
// 节点操作 增删改查
// 属性操作 删除 更新 （样式、类、事件、）
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.createApp = void 0;
var runtime_core_1 = require("@vue/runtime-core");
var shared_1 = require("@vue/shared");
var nodeOps_1 = require("./nodeOps"); //对象
var patchProp_1 = require("./patchProp"); //方法
var rendererOptions = shared_1.extend({ patchProp: patchProp_1.patchProp }, nodeOps_1.nodeOps);
function createApp(rootComponent, rootProps) {
    if (rootProps === void 0) { rootProps = null; }
    var app = runtime_core_1.createRender(rendererOptions).createApp(rootComponent, rootProps);
    var mount = app.mount;
    app.mount = function (container) {
        //清空容器操作
        container = nodeOps_1.nodeOps.querySelector(container);
        container.innerHTML = '';
        //将组件渲染成dom元素，进行挂载
    };
    return app;
}
exports.createApp = createApp;
__exportStar(require("@vue/runtime-core"), exports);
//用户调用的runtime-dom -> runtime-core
//runtime-dom 是为了解决平台差异（浏览器）
