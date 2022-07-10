export const patchStyle = (el,preValue,nextValue) => {
    const style = el.style//获取样式
    if(nextValue == null) {
        el.removeAttribute('style')//{style:{}} {}
    }else {
        //老有新无
        if(preValue){
            for(let key in preValue){
                if(nextValue[key] == null){
                    style[key] =''
                }
            }
        }
        //新的需要赋值到style上
        for(let key in nextValue){// {style:{color:red}} => {style:{background}}
            style[key] = nextValue[key]
        }
    }
}