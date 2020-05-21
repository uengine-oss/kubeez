<template>


</template>

<script>

    var changeCase = require('change-case');
    var pluralize = require('pluralize');

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
                editUserImg:[]

            }
        },
        computed: {
            type() {
                return ''
            },
            code() {
                return ''
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

        },
        watch: {

        },
        mounted: function () {
            var me = this
            $(document).keydown((evt) => {
                if (evt.keyCode == 46 || evt.keyCode == 8) {
                    var designer = me.getComponent('modeling-designer');

                    if (me.selected && !me.openPanel) {
                        var obj = {
                            state: 'delete',
                            element: me.value
                        }

                        if (me.value._type == 'org.uengine.modeling.model.Relation') {
                            console.log(me.value.relationView.id)
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

            if (me.value._type != 'org.uengine.modeling.model.Relation') {
                me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                    if (obj.state == "delete") {
                        me.deleteActivity(obj)
                    }

                })
            } else if (me.value._type == 'org.uengine.modeling.model.Relation') {
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
                var designer = this.getComponent('modeling-designer')
                var opengraph = this.getComponent('opengraph')
                // console.log(this.value._type)
                var type = this.value._type.split(".");
                type = type[type.length - 1]
                eval("this.delete" + type + "()");


                if (!obj.element.isUndoRedo) {

                    me.selected = false;
                    //user delete
                    if (me.value._type != "org.uengine.modeling.model.Relation") {
                        // console.log("user-delete-element");
                        // me.$EventBus.$emit('storage')
                        // me.$EventBus.$emit('undoRedo', obj)

                    } else {
                        //선삭
                        // console.log("user-delete- relation")

                    }
                } else {
                    //undoRedo 제
                    if (me.value._type != "org.uengine.modeling.model.Relation") {
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
                // console.log("onLabelChanged", be, af);
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
                var designer = this.getComponent('modeling-designer')

                // this.openPanel = true
                // console.log("showProperty", this.openPanel)

                if (!this.value.editing) {
                    // this.value.drawer = true;
                    this.openPanel = true
                } else {
                    designer.snackbar = true
                }

            },

            /**
             * 자신에게 도형들이 그룹으로 들어왔을때의 이벤트
             * @param groupElement
             * @param elements
             */
            onAddToGroup: function (groupElement, elements, eventOffset) {
                var me = this
                elements.forEach(function (element) {
                    var inner = false
                    groupElement.$parent.value.groups.some(function (tmp) {
                        if (tmp == element.$parent.value.elementView.id) {
                            return inner = true;
                        }
                    })

                    if (inner == false) {
                        if (groupElement.$parent.value._type == 'org.uengine.modeling.model.BoundedContext' && element.$parent.value._type == 'org.uengine.modeling.model.Aggregate') {
                            groupElement.$parent.value.aggregates.push(element.$parent.value)
                            groupElement.$parent.value.groups.push(element.$parent.value.elementView.id)
                        } else if (groupElement.$parent.value._type == 'org.uengine.modeling.model.BoundedContext' && element.$parent.value._type == 'org.uengine.modeling.model.Policy') {
                            groupElement.$parent.value.policies.push(element.$parent.value)
                            groupElement.$parent.value.groups.push(element.$parent.value.elementView.id)
                        } else if (groupElement.$parent.value._type == 'org.uengine.modeling.model.BoundedContext' && element.$parent.value._type == 'org.uengine.modeling.model.View') {
                            groupElement.$parent.value.viewes.push(element.$parent.value)
                            groupElement.$parent.value.groups.push(element.$parent.value.elementView.id)
                        } else if (groupElement.$parent.value._type == 'org.uengine.modeling.model.BoundedContext' && element.$parent.value._type == 'org.uengine.modeling.model.Event') {
                            groupElement.$parent.value.groups.push(element.$parent.value.elementView.id)
                        }
                    }

                })
            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToGroup: function (groupElement, element, eventOffset) {
                var me = this;
                var designer = this.getComponent('modeling-designer')

                if (groupElement.tagName) {
                    // Canvas로 나가는 경우
                    console.log("Out BoundedContext")
                    designer.value.definition.forEach(function (tmp) {
                        if (tmp != null) {
                            if (tmp._type == 'org.uengine.modeling.model.BoundedContext' && tmp.name == element.$parent.value.boundedContext.name) {
                                if (element.$parent.value._type == 'org.uengine.modeling.model.Aggregate') {
                                    tmp.aggregates.some(function (boundedTmp, idx) {
                                        if (boundedTmp.elementView.id == element.$parent.value.elementView.id) {
                                            tmp.aggregates = [
                                                ...tmp.aggregates.slice(0, idx),
                                                ...tmp.aggregates.slice(idx + 1)
                                            ]
                                        }
                                    })
                                } else if (element.$parent.value._type == 'org.uengine.modeling.model.Policy') {
                                    tmp.policies.some(function (boundedTmp, idx) {
                                        if (boundedTmp.elementView.id == element.$parent.value.elementView.id) {
                                            tmp.policies = [
                                                ...tmp.policies.slice(0, idx),
                                                ...tmp.policies.slice(idx + 1)
                                            ]
                                        }
                                    })
                                } else if (element.$parent.value._type == 'org.uengine.modeling.model.View') {
                                    tmp.viewes.some(function (boundedTmp, idx) {
                                        if (boundedTmp.elementView.id == element.$parent.value.elementView.id) {
                                            tmp.viewes = [
                                                ...tmp.viewes.slice(0, idx),
                                                ...tmp.viewes.slice(idx + 1)
                                            ]
                                        }
                                    })
                                }

                                tmp.groups.some(function (groupsId, idx) {
                                    if (groupsId == element.$parent.value.elementView.id) {
                                        tmp.groups = [
                                            ...tmp.groups.slice(0, idx),
                                            ...tmp.groups.slice(idx + 1)
                                        ]
                                    }
                                })
                            }
                        }

                    })

                    // element.$parent.value.boundedContext = {}

                } else {
                    // console.log("Into BoundedContext")
                    // Bounded Context로 들어가는 경우
                    // 초기화 하고 새로운 값으로 변경
                    if (groupElement.$parent.value._type == 'org.uengine.modeling.model.BoundedContext') {
                        var boundedOb = {
                            id: groupElement.$parent.value.elementView.id,
                            name: groupElement.$parent.value.name
                        }

                        element.$parent.value.boundedContext = {}
                        element.$parent.value.boundedContext = boundedOb
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
                    me.value.elementView.width = me.tmpWidth
                    me.value.elementView.height = me.tmpHeight
                    me.rotateMove = true
                    me.value.elementView.x = me.value.elementView.x - 1
                    me.$nextTick(function () {
                        me.value.elementView.width = me.tmpWidth
                        me.value.elementView.height = me.tmpHeight
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
                if (me.value._type == 'org.uengine.modeling.model.Relation') {
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
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
