import { createVNode } from "./vode"

export function createAppAPI(render){
     return function createApp(rootComponent,rootProps){//哪个组件渲染
        const app = {
            _props:rootProps,
            _component:rootComponent,
            _container:null,
            mount(container){//挂载到哪里
                // let vnode = {}
                // render(vnode,container)
                // 1根据组件创建虚拟节点
                // 2将虚拟节点和容器取到后调用render方法渲染
                const vnode = createVNode(rootComponent,rootProps)
                render(vnode,container)
                app._container = container
            }
        }
        return app
    }
}