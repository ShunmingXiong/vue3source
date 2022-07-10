//domAPI 方法
// 节点操作 增删改查
// 属性操作 删除 更新 （样式、类、事件、）

import { createRender } from "@vue/runtime-core";
import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";//对象
import { patchProp } from "./patchProp";//方法

const rendererOptions = extend({patchProp},nodeOps)


export function createApp(rootComponent,rootProps = null){
    const app = createRender(rendererOptions).createApp(rootComponent,rootProps)
    let {mount} = app
    app.mount = function(container){
        //清空容器操作
        container = nodeOps.querySelector(container)
        container.innerHTML = ''

        //将组件渲染成dom元素，进行挂载
    }
    return app
}
export * from '@vue/runtime-core'
//用户调用的runtime-dom -> runtime-core
//runtime-dom 是为了解决平台差异（浏览器）