<template>
</template>

<script>
    import json2yaml from 'json2yaml';
    
    import Element from '../modeling/ModelElement';

    export default {
        mixins:[Element],
        name: 'kubernetes-model-element',
        props: {
            value: Object
        },
        created() {
            var me = this;

            me.modelCanvasComponent = me.getComponent('kubernetes-model-canvas');

            if (me.value.elementView && me.modelCanvasComponent.autoOpenPanel) {
                me.selectedActivity();
                me.showProperty();
            }

            if (me.modelCanvasComponent && me.value.connectableType) {
                me.filterConnectionTypes = []
                me.value.connectableType.forEach(function (connectableType) {
                    if (connectableType && me.modelCanvasComponent.mergeElementTypes) {
                        var item = me.modelCanvasComponent.mergeElementTypes.find(element => element.component.toLowerCase() == connectableType.toLowerCase())
                        if (connectableType === "DestinationRuleSubset") {
                            item = me.modelCanvasComponent.mergeElementTypes.find(
                                element => element.component === "destinationRule"
                            )
                        }
                        me.filterConnectionTypes.push(item)
                    }
                })
            }

            if(!me.value.relationView && me.value.object && me.value.object.metadata) {
                if(me.value.object.metadata.annotations) {
                    if(me.value.object.metadata.annotations['msaez.io/x']) {
                        me.value.elementView.x = Number(me.value.object.metadata.annotations['msaez.io/x'])
                    }
                    if(me.value.object.metadata.annotations['msaez.io/y']) {
                        me.value.elementView.y = Number(me.value.object.metadata.annotations['msaez.io/y'])
                    }
                    if(me.value.object.metadata.annotations['msaez.io/width']) {
                        me.value.elementView.width = Number(me.value.object.metadata.annotations['msaez.io/width'])
                    }
                    if(me.value.object.metadata.annotations['msaez.io/height']) {
                        me.value.elementView.height = Number(me.value.object.metadata.annotations['msaez.io/height'])
                    }
                }
            }

            if(!me.modelCanvasComponent.embedded && me.value.relationView) {
                if(me.value.sourceElement.object.metadata.annotations) {
                    var type = me.value.targetElement._type
                    var name = me.value.targetElement.name ? me.value.targetElement.name : me.value.targetElement.object.metadata.name
                    var key = 'msaez.io/' + type + '_' + name
                    
                    if(me.value.sourceElement.object.metadata.annotations && me.value.sourceElement.object.metadata.annotations.hasOwnProperty(key)) {
                        var x = me.value.sourceElement.elementView.x - Number(me.value.sourceElement.object.metadata.annotations['msaez.io/x'])
                        var y = me.value.sourceElement.elementView.y - Number(me.value.sourceElement.object.metadata.annotations['msaez.io/y'])
                        var arr = JSON.parse(me.value.sourceElement.object.metadata.annotations[key])
                        var newArr = []
                        arr.forEach(function(value) {
                            var newArr2 = []
                            value.forEach(function(val, idx) {
                                if(idx%2 == 0) {
                                    val = val + x
                                }
                                if(idx%2 == 1) {
                                    val = val + y
                                }
                                newArr2.push(val)
                            })
                            newArr.push(newArr2)
                        })
                        if(name != '') {
                            me.value.relationView.value = JSON.stringify(newArr)
                            me.value.sourceElement.object.metadata.annotations[key] = me.value.relationView.value
                        }
                    }
                }
            }
            me.validate();
        },
        data: function () {
            return {
                selected: false,
                autoOpenPanel: false,
                namePanel: '',
                modelCanvasComponent: null,
                filterConnectionTypes: null,
                messageRef: {},
                deploySuccess: false,
                menuList: [],
                isMovedElement: false,
                ESE_NOT_NAME: 0,
                validationCodeLists: {
                    0: {
                        'level': 'error',
                        'msg': ' Must have a name.'
                    },
                    1: {
                        'level': 'info',
                        'msg': 'Element must be in a Bounded Context.'
                    },
                    2: {
                        'level': 'warning',
                        'msg': 'Must be attached to an Aggregate.'
                    },
                    3: {
                        'level': 'error',
                        'msg': 'Key is undefined.'
                    },
                    4: {
                        'level': 'error',
                        'msg': 'Attribute name is duplicated.'
                    },
                    5: {
                        'level': 'error',
                        'msg': 'Blank, space, or special characters are not allowed for the API path.'
                    },
                    6: {
                        'level': 'warning',
                        'msg': 'Duplicate methods.'
                    }
                },
            }
        },
        computed: {
            filteredElementValidationResults(){
                var me = this
                var levelSort = ['error','warning','info']
                try {
                    return me.elementValidationResults.sort(function compare(a, b) {
                        var aIdx = levelSort.findIndex(x => x == a.level);
                        var bIdx = levelSort.findIndex(x => x == b.level);
                        return aIdx - bIdx;
                    });
                } catch (e) {
                    return me.elementValidationResults;
                } finally {
                    me.refreshImg();
                }
            },
            storage() {
                if (this.modelCanvasComponent) {
                    return this.modelCanvasComponent.storage;
                } else {
                    return 'localstorage';
                }
            },
            isReadOnly() {
                if (this.modelCanvasComponent) {
                    return this.modelCanvasComponent.readOnly;
                } else {
                    return false;
                }
            },
            isEmbedded() {
                if (this.modelCanvasComponent) {
                    return this.modelCanvasComponent.embedded;
                } else {
                    return false;
                }
            },
            style: {
                get() {
                    var style;
                    if (this.value) {
                        if (this.value.elementView){
                            style = this.value.elementView.style;
                        } else {
                            style = this.value.relationView.style;
                        }
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
                set(val) {
                    if (this.value) {
                        if (this.value.elementView) {
                            this.value.elementView.style = JSON.stringify(val);
                        } else {
                            this.value.relationView.style = JSON.stringify(val);
                        }
                    }
                }
            },
            statusColor() {
                if (this.deploySuccess) {
                    return '#27ae60';
                } else {
                    return '#e74c3c';
                }
            },
        },
        watch: {
            "value.elementView.width": {
                handler(newVal) {
                    var me = this;
                    var obj = {
                        type: me.value._type,
                        width: newVal,
                        height: me.value.elementView.height
                    };
                    me.$store.dispatch('resize', obj);
                    if(me.value.object && me.value.object.metadata) {
                        if (!me.value.object.metadata.annotations) {
                            me.value.object.metadata.annotations = {};
                        }
                        me.value.object.metadata.annotations['msaez.io/width'] = String(newVal);
                    }
                }
            },
            "value.elementView.height": {
                handler(newVal) {
                    var me = this;
                    var obj = {
                        type: me.value._type,
                        width: me.value.elementView.width,
                        height: newVal
                    };
                    me.$store.dispatch('resize', obj);
                    if(me.value.object && me.value.object.metadata) {
                        if (!me.value.object.metadata.annotations) {
                            me.value.object.metadata.annotations = {};
                        }
                        me.value.object.metadata.annotations['msaez.io/height'] = String(newVal);
                    }
                }
            },
            "value.elementView.x": {
                handler(newVal) {
                    var me = this;
                    if(me.value.object && me.value.object.metadata) {
                        if (!me.value.object.metadata.annotations) {
                            me.value.object.metadata.annotations = {};
                        }
                        me.value.object.metadata.annotations['msaez.io/x'] = String(newVal);
                    }
                }
            },
            "value.elementView.y": {
                handler(newVal) {
                    var me = this;
                    if(me.value.object && me.value.object.metadata) {
                        if (!me.value.object.metadata.annotations) {
                            me.value.object.metadata.annotations = {};
                        }
                        me.value.object.metadata.annotations['msaez.io/y'] = String(newVal);
                    }
                }
            },
            "value.name": function (newVal) {
                this.namePanel = newVal;
                this.validate();
            },
        },
        mounted() {
            var me = this;
            var elementId = me.value.elementView ? me.value.elementView.id : me.value.relationView.id;

            me.$EventBus.$on(`${elementId}`, (obj) => {

                if (obj.action == "delete") {
                    var location = obj.element.elementView ? 
                        me.modelCanvasComponent.value.elements : me.modelCanvasComponent.value.relations;
                    location[elementId] = null;
                    me.$EventBus.$off(`${elementId}`);
                }

                if (obj.action == "getStatus" &&
                        obj.element &&
                        obj.element.kind == me.value.object.kind
                ) {
                    me.value.status = "created";

                    if (obj.element.status) {
                        me.value.status = obj.element.status;
                        if (obj.element.kind == "Deployment" || obj.element.kind == "ReplicaSet") {
                            me.setReplicasStatus();
                        } else if (obj.element.kind == "Pod") {
                            me.setStatus();
                        }
                    }

                    me.refreshImg();
                }

                if (obj.action == "delStatus") {
                    me.value.status = null;
                    me.refreshImg();
                }

                if(obj.action == 'deleteAnnotations' && me.value.object.metadata.annotations) {
                    var name = obj.element.targetElement.name ?
                        obj.element.targetElement.name : obj.element.targetElement.object.metadata.name;
                    var key = 'msaez.io/' + obj.element.targetElement._type + '_' + name;
                    delete me.value.object.metadata.annotations[key];;
                }
            });

            me.$EventBus.$on('isMovedElement', (id) => {
                if (me.value.elementView) {
                    if (me.value.elementView.id == id) {
                        me.isMovedElement = true;
                        me.movedNewActivity();
                    } else {
                        if (me.isMovedElement == true) {
                            me.isMovedElement = false;
                            me.movedOldActivity();
                        }
                    }
                }
            });

            if(me.modelCanvasComponent.embedded) {
                me.refreshImg();
            }
        },
        beforeDestroy() {
        },
        methods: {
            movedNewActivity() {
                var me = this;
                if (me.modelCanvasComponent.isLogin &&
                        me.modelCanvasComponent.isServerModeling &&
                        !me.modelCanvasComponent.isClazzModeling &&
                        !me.isReadOnly
                ) {
                    var obj = {
                        action: 'userMovedOn',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    };
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj);
                }
            },
            movedOldActivity() {
                var me = this
                if (me.modelCanvasComponent.isLogin &&
                        me.modelCanvasComponent.isServerModeling &&
                        !me.modelCanvasComponent.isClazzModeling &&
                        !me.isReadOnly
                ) {
                    var obj = {
                        action: 'userMovedOff',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    };
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj);
                }
            },
            onMoveShape() {
                this.$EventBus.$emit('isMovedElement', this.value.elementView.id);
            },
            mergeDeep(target, sources) {
                if (!sources.length) {
                    return target;
                }
                const source = sources.shift();

                if (isObject(target) && isObject(source)) {
                    for (const key in source) {
                        if (isObject(source[key])) {
                            if (!target[key]) {
                                Object.assign(target, {[key]: {}});
                            }
                            mergeDeep(target[key], source[key]);
                        } else {
                            Object.assign(target, {[key]: source[key]});
                        }
                    }
                }

                return this.mergeDeep(target, sources);
            },
            difference: _.debounce(
                function (object, base) {
                    function changes(object, base) {
                        return _.transform(object, function (result, value, key) {
                            if (!_.isEqual(value, base[key])) {
                                result[key] = (_.isObject(value) && _.isObject(base[key])) ?
                                    changes(value, base[key]) : value;
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
                this.value.elementView.angle = angle;
            },
            selectedActivity: function () {
                var me = this
                if (this.value) {
                    this.selected = true

                    // selected Template
                    var elementType = me.value._type ? me.value._type : null
                    me.$EventBus.$emit('selectedElementObj', {selected: true, id: me.getId, type: elementType, isEmbedded: me.isEmbedded})
                }
            },
            deSelectedActivity: function () {
                var me = this
                if (this.value) {
                    this.propertyPanel = false
                    this.selected = false
                    this.staySelected = false

                    // deselected Template
                    me.$EventBus.$emit('selectedElementObj', {selected: false, id: me.getId, isEmbedded: me.isEmbedded})
                }

            },
            showProperty() {
                if (this.selected)
                    this.propertyPanel = true
            },
            fireClosed() {
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
                if (groupElement.tagName) {
                    // Canvas로 나가는 경우

                    element.$parent.namespace = undefined;

                } else {
                    if (groupElement.$parent.value._type === 'Namespace') {
                        var namespace = groupElement.$parent.value.name;
                        groupElement.$parent.value.innerElement.push(element.$parent.value.elementView.id)
                        element.$parent.namespace = namespace
                        element.$parent.value.namespaceId = groupElement.$parent.value.elementView.id;
                    }

                    if (groupElement.$parent.value._type === 'DestinationRule' &&
                            element.$parent.value._type === 'DestinationRuleSubset'
                    ) {
                        if (!groupElement.$parent.value.subsets.includes(element.$parent.value.elementView.id)) {
                            groupElement.$parent.value.subsets.push(element.$parent.value.elementView.id);
                        }
                    }

                    if (groupElement.$parent.value._type === 'Workflow') {
                        if (element.$parent.value._type === 'WorkflowDag') {
                            if (!groupElement.$parent.value.tasks.includes(element.$parent.value.elementView.id)) {
                                groupElement.$parent.value.tasks.push(element.$parent.value.elementView.id);
                            }
                        } else if (element.$parent.value._type === 'WorkflowStep') {
                            if (!groupElement.$parent.value.steps.includes(element.$parent.value.elementView.id)) {
                                groupElement.$parent.value.steps.push(element.$parent.value.elementView.id);
                            }
                        }
                    }
                }

            },
            uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
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
            onRemoveShape(value) {
                var me = this;
                var obj = {
                    action: 'delete',
                    element: value
                };
                if (me.value.relationView) {
                    me.$EventBus.$emit(`${me.value.relationView.id}`, obj);
                    me.deleteAnnotations(obj.element);
                } else {
                    me.$EventBus.$emit(`${me.value.elementView.id}`, obj);
                }

                try {
                    if ( me.isCustomMoveExist ) {
                        me.removeShapeQueue();
                    } else {
                        me.removeShapeLocal();
                    }
                    me.validate();
                } catch (e) {
                    alert(`[Error] KubernetesModelElement-onRemoveShape: ${e}`);
                }
            },
            deleteRelation(id) {
                var me = this;
                var obj = {
                    action: "delete",
                    element: me.value
                };
                me.$EventBus.$emit(id, obj);
            },
            async optionClicked(event) {
                var me = this
                var code = event.option.name;
                var designer = me.getComponent('kubernetes-model-canvas');
                var yamlName = localStorage.getItem("email") + "_" + me.value.name + ".yaml"
                if (code.includes('create')) {
                    code = 'kubectl create -f'
                    var yaml = designer.yamlFilter(json2yaml.stringify(me.value.object))
                    try {
                        var put = await me.putString(`storage://yamlStorage/${yamlName}`, yaml)
                        var presignedUrl = await me.getURL(`storage://yamlStorage/${yamlName}`)
                        code += ' "'+ presignedUrl + "\"";
                    } catch (error) {
                        code += '- <<EOF \n' + yaml + 'EOF\n'
                    }
                } else if (code.includes('apply')) {
                    code = 'kubectl apply -f'
                    var yaml = designer.yamlFilter(json2yaml.stringify(me.value.object))
                    try {
                        var presignedUrl = await me.getURL(`storage://yamlStorage/${yamlName}`);
                        code += ' "'+ presignedUrl + "\"";
                    } catch (error) {
                        code += '- <<EOF \n' + yaml + 'EOF\n'
                    }
                } else if (code.includes('Terminal')) {
                    code = ''
                    designer.functionCluster('Terminal')
                    return
                }
                code += '\n';

                if(event.isCopy) {
                    me.commandCopy(code);
                } else {
                    me.$EventBus.$emit('sendCode', code);
                }
            },
            commandCopy(cmd) {
                const t = document.createElement("textarea");
                document.body.appendChild(t);
                t.value = cmd;
                t.select();
                document.execCommand('copy');
                document.body.removeChild(t);
            },
            async drawFrame(yamlSrc) {
                var me = this

                me.$EventBus.$emit('progressValue', true);
                
                await me.$http.get(yamlSrc).then((res) => {
                    var yamlData = res.data;
                    var lists = yamlData.split("---");
                    var parentX = 0;
                    var parentY = 0;
                    var jsonList = [];
                    
                    lists.forEach((item) => {
                        if (item.length > 1) {
                            var parseItem = YAML.parse(item);
                            if(parseItem.kind == me.value.elementView._type) {
                                parentX = me.value.elementView.x - Number(parseItem.metadata.annotations['msaez.io/x']);
                                parentY = me.value.elementView.y - Number(parseItem.metadata.annotations['msaez.io/y']);
                                me.value.object = parseItem;
                            } else {
                                jsonList.push(parseItem);
                            }
                        }
                    });
                    
                    yamlData = '';
                    jsonList.forEach((obj) => {
                        yamlData += '--- \n' + me.modelCanvasComponent.yamlFilter(json2yaml.stringify(obj));
                    });
                    me.modelCanvasComponent.drawFrameYaml(yamlData, {'parentX': parentX, 'parentY': parentY});
                });

                me.$nextTick(() => {
                    me.$EventBus.$emit('progressValue', false);
                });
            },
            deleteAnnotations(value) {
                var me = this;
                var obj = {
                    action: 'deleteAnnotations',
                    element: value
                };
                me.$EventBus.$emit(`${me.value.sourceElement.elementView.id}`, obj);
            },
            validationFromCode(code) {
                if (code == null || code == undefined) {
                    return null;
                }

                var validationCode = this.validationCodeLists[code];
                if (validationCode) {
                    validationCode.code = code;
                    return validationCode;
                }

                return null;
            },
            validate() {
                var me = this;
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
