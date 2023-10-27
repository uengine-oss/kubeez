
function getParent(parent, tagName){
    while(parent && parent.$vnode.tag.indexOf(tagName) == -1) parent = parent.$parent;

    return parent
}

module.exports = getParent