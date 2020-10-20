<template>


</template>

<script>

    var changeCase = require('change-case');
    var pluralize = require('pluralize');

    import json2yaml from 'json2yaml'

    export default {
        name: 'modeling-element-base',
        props: {
            value: Object,
        },
        created: function () {
            var me = this;
        },
        data: function () {
            return {
                _id: null,
                rotateMove: false,
                tmpWidth: 0,
                tmpHeight: 0,
                messageRef: {},
                isException: 'NO',
                isUndoRedo: false,
                checkValue: false,
                selected: false,
                openPanel: false,
                namePanel: '',
                editUserImg:[],
                deploySuccess: false,
                menuList : [
                    { name: "Terminal Open" },
                    { name: "Get " + this.value._type },
                    { name: "Describe " + this.value._type },
                    { name: "Delete " + this.value._type },
                    { name: "Create " + this.value._type },
                    { name: "Update " + this.value._type }
                ],
            }
        },
        computed: {
            type() {
                return ''
            },
            code() {
                return ''
            },
            editMode(){
                return true;
            },
            style: {
                get: function () {
                    var style;
                    //스타일이 없다면 디폴트 스타일을 사용한다.
                    if (this.value) {
                        if (this.value.elementView)
                            style = this.value.elementView.style;
                        else
                            style = this.value.relationView.style;
                    }

                    if (style) {
                        var jsonStyle = JSON.parse(style);
                        if ($.isEmptyObject(jsonStyle)) {
                            return this.defaultStyle;
                        } else {
                            return jsonStyle;
                        }
                    } else {
                        return this.defaultStyle;
                    }
                },
                set: function (val) {
                    if (this.value) {
                        if (this.value.elementView)
                            this.value.elementView.style = JSON.stringify(val);
                        else
                            this.value.relationView.style = JSON.stringify(val);
                    }
                }
            },
            moveElement() {
                return _.cloneDeep(this.value.elementView)
            },
            valueChangeElement() {
                return _.cloneDeep(this.value)
            },
            statusColor() {
                if(this.deploySuccess) {
                    return '#27ae60'
                } else {
                    return '#e74c3c'
                }
            },
        },
        watch: {
            "value.elementView.width": {
                handler(newVal) {
                    var me = this
                    var obj = {
                        type: me.value._type,
                        width: newVal,
                        height: me.value.elementView.height
                    }
                    me.$store.dispatch('resize', obj)
                }
            },
            "value.elementView.height": {
                handler(newVal) {
                    var me = this
                    var obj = {
                        type: me.value._type,
                        width: me.value.elementView.width,
                        height: newVal
                    }
                    me.$store.dispatch('resize', obj)
                }
            }
        },
        mounted: function () {
            var me = this
            $(document).keydown((evt) => {
                if (evt.keyCode == 46 || evt.keyCode == 8) {
                    var designer = me.getComponent('kube-modeling-designer');

                    if (me.selected && !me.openPanel) {
                        var obj = {
                            state: 'delete',
                            element: me.value
                        }

                        if (me.value.relationView) {
                            // console.log(me.value.relationView.id)
                            me.$EventBus.$emit(`${me.value.relationView.id}`, obj)
                        } else {
                            if (me.value.boundedContext == undefined) {
                                console.log("bounded")
                                me.$EventBus.$emit(`${me.value.elementView.id}`, obj)
                            } else if (me.value.boundedContext.id == undefined) {
                                console.log("out bounded")
                                me.$EventBus.$emit(`${me.value.elementView.id}`, obj)
                            } else {
                                console.log("inner bounded")
                                me.$EventBus.$emit(`${me.value.elementView.id}`, obj)
                            }
                        }

                        console.log("============== Storage Location Search Test 1-1 (Back Delete) ============= ")
                        // me.$EventBus.$emit('storage')
                        // var obj = {
                        //     state: 'D',
                        //     element: me.value
                        // }
                        // me.$EventBus.$emit('undoRedo', obj)
                    }
                }
            });

            if (!me.value.relationView) {
                me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                    if (obj.state == "delete") {
                        me.deleteActivity(obj)
                    }
                })
            } else if (me.value.relationView) {
                me.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
                    if (obj.state == "delete") {
                        me.deleteActivity(obj)
                    }
                })
            }
        },
        beforeDestroy() {
            if (this.value.elementView) {
                this.$EventBus.$off(`${this.value.elementView.id}`)
            } else {
                this.$EventBus.$off(`${this.value.relationView.id}`)
            }

        },
        methods: {
            setNameCase:
                function (newVal) {
                    var me = this
                    if (me.value._type == 'org.uengine.modeling.model.View' || me.value._type == 'org.uengine.modeling.model.Event' || me.value._type == 'org.uengine.modeling.model.Command' || me.value._type == 'org.uengine.modeling.model.Policy' || me.value._type == 'org.uengine.modeling.model.Aggregate') {
                        me.value.name = newVal
                        me.value.namePascalCase = changeCase.pascalCase(newVal)
                        me.value.nameCamelCase = changeCase.camelCase(newVal)
                        me.value.namePlural = changeCase.camelCase(pluralize(newVal));
                    }
                },

            mergeDeep(target, sources) {
                // console.log(target)
                if (!sources.length) return target;
                const source = sources.shift();

                if (isObject(target) && isObject(source)) {
                    for (const key in source) {
                        if (isObject(source[key])) {
                            if (!target[key]) Object.assign(target, {[key]: {}});
                            mergeDeep(target[key], source[key]);
                        } else {
                            Object.assign(target, {[key]: source[key]});
                        }
                    }
                }

                return this.mergeDeep(target, sources);
            },
            deleteActivity(obj) {
                var me = this
                var designer = this.getComponent('kube-modeling-designer')
                var opengraph = this.getComponent('opengraph')
                // console.log(this.value._type)
                // var type = this.value._type.split(".");
                // type = type[type.length - 1]
                // eval("this.delete" + type + "()");


                if (!obj.element.isUndoRedo) {

                    me.selected = false;
                    //user delete
                    if (!me.value.relationView) {
                        // console.log("user-delete-element");
                        // me.$EventBus.$emit('storage')
                        // me.$EventBus.$emit('undoRedo', obj)
                        
                        designer.value.definition.splice(designer.value.definition.indexOf(obj.element), 1)

                    } else {
                        //선삭
                        // console.log("user-delete- relation")

                        designer.value.relation.splice(designer.value.relation.indexOf(obj.element), 1)

                    }
                } else {
                    //undoRedo 제
                    if (!me.value.relationView) {
                        // console.log("undoRedo-delete-element")

                        var totalLength = designer.value.definition.length
                        designer.value.definition.some(function (currValue, currIndex) {
                            if (!currValue) {
                                if (me.value.elementView.id === currValue.elementView.id) {
                                    designer.value.definition[currIndex] = null
                                    designer.value.definition[currIndex] = designer.value.definition[totalLength - 1];
                                    designer.value.definition[totalLength - 1] = null
                                    return;
                                }
                            }
                        })
                        // designer.value.definition = designer.value.definition.filter(n => n);

                    } else {
                        // console.log("undoRedo-delete-relation")
                    }

                }
            },
            difference: _.debounce(
                function (object, base) {
                    function changes(object, base) {
                        return _.transform(object, function (result, value, key) {
                            if (!_.isEqual(value, base[key])) {
                                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                            }
                        });
                    }

                    return changes(object, base);
                }, 100
            ),
            onLabelChanged: function (be, af) {
                console.log("onLabelChanged", be, af);
            },
            onRotateShape: function (me, angle) {
                this.value.elementView.angle = angle
            },
            connected: function () {
                // console.log(this.value)
            },
            selectedActivity: function () {
                // if (this.value) {
                //     this.value.selected = true
                // }
                // this._selected = true;
                if (this.value) {
                    this.selected = true
                }
            },
            deSelectedActivity: function () {
                // // console.log('UnSelected')
                // this.openPanel = false
                // console.log("deSelectedActivity", this.openPanel)

                if (this.value) {
                    if (this.selected)
                        this.selected = false

                    if (this.openPanel) {
                        this.openPanel = false
                    }
                }
            },
            showProperty: function () {
                var designer = this.getComponent('kube-modeling-designer')

                // this.openPanel = true
                // console.log("showProperty", this.openPanel)

                if (!this.value.editing) {
                    // this.value.drawer = true;
                    this.openPanel = true
                } else {
                    designer.snackbar = true
                }

            },
            closeProperty(){

                if (this.openPanel) {
                    this.openPanel = false
                }

            },

            fireClosed(){
                this.$emit('close');
            },
            
            /**
             * 자신에게 도형들이 그룹으로 들어왔을때의 이벤트
             * @param groupElement
             * @param elements
             */
            onAddToGroup: function (groupElement, elements, eventOffset) {
                var me = this


            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToGroup: function (groupElement, element, eventOffset) {
                var me = this;
                var designer = this.getComponent('kube-modeling-designer')

                if (groupElement.tagName) {
                    // Canvas로 나가는 경우

                    element.$parent.namespace = undefined;

                } else {
                    if (groupElement.$parent.value._type == 'Namespace') {
                        var namespace = groupElement.$parent.value.name;
                        groupElement.$parent.value.innerElement.push(element.$parent.value.elementView.id)
                        element.$parent.namespace = namespace
                        element.$parent.value.namespaceId = groupElement.$parent.value.elementView.id;
                    }
                }

            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            refresh() {
                var me = this
                me.value.elementView.x = me.value.elementView.x + 1
                me.$nextTick(function () {
                    me.value.elementView.width = me.tmpWidth > 0 ? me.tmpWidth : me.value.elementView.width
                    me.value.elementView.height = me.tmpHeight > 0 ? me.tmpHeight : me.value.elementView.height
                    me.rotateMove = true
                    me.value.elementView.x = me.value.elementView.x - 1
                    me.$nextTick(function () {
                        me.value.elementView.width = me.tmpWidth > 0 ? me.tmpWidth : me.value.elementView.width
                        me.value.elementView.height = me.tmpHeight > 0 ? me.tmpHeight : me.value.elementView.height
                    })
                })
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            onRemoveShape: function (value) {
                var me = this
                console.log(value)
                var obj = {
                    state: 'delete',
                    element: value
                }
                if (me.value.relationView) {
                    me.$EventBus.$emit(`${me.value.relationView.id}`, obj)
                } else {
                    me.$EventBus.$emit(`${me.value.elementView.id}`, obj)
                }

                console.log("============== Storage Location Search Test 1-2 (Delete Btn) ============= ")
                // me.$EventBus.$emit('storage')
                // var obj = {
                //     state: 'D',
                //     element: this.value
                // }
                // me.$EventBus.$emit('undoRedo', obj)
            },
            deleteRelation: function(relationId) {
                var me = this
                var obj = {
                    state: "delete",
                    element: me.value
                }
                me.$EventBus.$emit(relationId, obj)
            },
            handleClick(event) {
                var me = this
                event.pageY = event.pageY - 62
                me.$refs.vueSimpleContextMenu.showMenu(event)
            },
            async optionClicked(event) {
                var me = this
                var code = 'kubectl ' + event.option.name.toLowerCase()
                var designer = me.getComponent('kube-modeling-designer')
                var namespace = me.value.object.metadata.namespace
                
                if(code.includes('describe') || code.includes('delete') || code.includes('get')) {
                    code += ' ' + me.value.object.metadata.name + ' -n '
                    if(namespace != undefined) {
                        code += namespace
                    } else {
                        code += 'default'
                    }
                } else if(code.includes('create')) {
                    if(namespace == undefined) {
                        me.value.object.metadata.namespace = 'default'
                    }
                    code = 'kubectl create -f- <<EOF \n'
                    var yaml = designer.yamlFilter(json2yaml.stringify(me.value.object))
                    code += yaml + "EOF"
                } else if(code.includes('update')) {
                    code = 'kubectl apply -f- <<EOF \n'
                    var yaml = designer.yamlFilter(json2yaml.stringify(me.value.object))
                    code += yaml + "EOF"
                }

                code += '\n'
                me.$EventBus.$emit('sendCode', code)
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
