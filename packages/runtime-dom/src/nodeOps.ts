export const nodeOps = {
    //createElement
    createElement:tagName => document.createElement(tagName),
    remove:child => { //删除
        const parent = child.parentNode
        if(parent) {
            parent.removeChild(child)
        }
    },
    insert:(child,parent,anchor) => {
        //如果参照物为空 相当于appendChild
        parent.insertBefore(child,anchor)
    },
    querySelector:selector => document.querySelector(selector),
    setElementText:(el,text) => el.textContent = text,
    //文本操作
    //创建文本节点
    createText:text => document.createTextNode(text),
    //设置文本节点的内容
    setText:(node,text) => node.nodeValue = text

}