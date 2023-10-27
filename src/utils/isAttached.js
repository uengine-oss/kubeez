const getParent = require('./getParent')


function isAttached(element1, element2, vueComponent){

    let canvas = vueComponent ? getParent(vueComponent, 'event-storming-model-canvas'): null

    let elementView1, elementView2

    elementView1 = element1.elementView
    elementView2 = element2.elementView

    if(!elementView1 || !elementView2) return false

    var outer = {
        x: elementView1.x - elementView1.width / 2,
        y: elementView1.y - elementView1.height / 2,
        width: elementView1.width,
        height: elementView1.height
    }

    var inner = {
        x: elementView2.x - elementView2.width / 2,
        y: elementView2.y - elementView2.height / 2,
        width: elementView2.width,
        height: elementView2.height
    }
    

    if (
        //왼쪽 상단 모서리에 걸린 경우
        (outer.x < inner.x + inner.width &&
            outer.y < inner.y + inner.height)

        &&

        //우측 하단 모서리에 걸린 경우
        (inner.x < outer.x + outer.width &&
            inner.y < outer.y + outer.height)

        &&

        //오른쪽 상단 모서리에 걸린 경우
        (inner.x < outer.x + outer.width &&
            outer.y < inner.y + inner.height)

        &&

        //왼쪽 하단 모서리에 걸린 경우
        (outer.x < inner.x + inner.width &&
            inner.y < outer.y + outer.height)
    ) return true;

    return false;
}


module.exports = isAttached