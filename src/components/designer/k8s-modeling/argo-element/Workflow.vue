<template>
    <div>
        <group-element
                selectable
                movable
                resizable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :label.sync="name"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:removeShape="onRemoveShape(value)"
                :image.sync="refreshedImg"
                :_style="{stroke:'black',
                        'vertical-align': 'top',
                        'font-weight': 'bold',
                        'font-size': '16',}">
            
            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25"
                ></image-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="'180%'"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Workflow'">
                </text-element>
            </sub-elements>
        </group-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
                @setSteps="setSteps"
                @setTasks="setTasks"
        ></property-panel>

        <vue-context-menu
                :elementId="value.elementView.id"
                :options="menuList"
                :ref="'vueSimpleContextMenu'"
                @option-clicked="optionClicked"
        ></vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import PropertyPanel from './WorkflowPanel'

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [Element],
        name: 'workflow',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Workflow'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            createNew(elementId, x, y, width, height, object, type) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: object ? object: {
                        "apiVersion": "argoproj.io/v1alpha1",
                        "kind": "Workflow",
                        "metadata": {
                            "generateName": ""
                        },
                        "spec": {
                            "entrypoint": "",
                            "templates": [
                                {
                                    "name": "",
                                    "steps": [
                                        [
                                            {
                                                "name": "Step1",
                                                "template": "",
                                                "arguments": {
                                                    "parameters": []
                                                }
                                            }
                                        ]
                                    ],
                                    "dag": {
                                        "tasks": [
                                            {
                                                "name": "Task1",
                                                "template": "",
                                                "arguments": {
                                                    "parameters": []
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    workflowType: type ? type : null,
                    steps: [],
                    tasks: [],
                    advancedAttributePaths: {},
                }
            },
            name() {
                try {
                    return this.value.object.metadata.generateName;
                } catch(e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace;
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal;
                }
            },
        },
        data: function () {
            return {
                stepComp: {
                    component: "workflowStep",
                    label: "step",
                    src: `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`,
                    x: 500 + Math.random()*200,
                    y: 280 + Math.random()*150
                },
                taskComp: {
                    component: "workflowDag",
                    label: "dag",
                    src: `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`,
                    x: 500 + Math.random()*200,
                    y: 280 + Math.random()*150
                }
            };
        },
        created() {
            var me = this;
            me.menuList.push({name: "argo submit"});
            me.menuList.push({name: "argo list"});
            me.menuList.push({name: "argo get " + me.value.object.metadata.generateName});
            me.menuList.push({name: "argo logs " + me.value.object.metadata.generateName});
        },
        mounted: function () {
            var me = this;
            if(me.value.workflowType == "Steps") {
                delete me.value.object.spec.templates[0].dag;
                me.setSteps(me.value.object.spec.templates[0].steps.length);
            } else if(me.value.workflowType == "Dag") {
                delete me.value.object.spec.templates[0].steps;
                me.setTasks(me.value.object.spec.templates[0].dag.tasks.length);
            } else {
                delete me.value.object.spec.templates[0].dag;
                delete me.value.object.spec.templates[0].steps;
                me.value.object.spec.templates[0].container = {
                    "name": "",
                    "image": "",
                    "command": [ "" ],
                    "args": [ "" ],
                }
            }

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="deleteStep" && obj.element && obj.element._type == "WorkflowStep") {
                    me.value.steps.splice(me.value.steps.indexOf(obj.element.elementView.id), 1);
                    me.value.object.spec.templates[0].steps.splice(obj.element.index, 1);
                }
                if(obj.action=="deleteDag" && obj.element && obj.element._type == "WorkflowDag") {
                    me.value.tasks.splice(me.value.tasks.indexOf(obj.element.elementView.id), 1);
                    me.value.object.spec.templates[0].dag.tasks.splice(obj.element.index, 1);
                }
                if(obj.action=="showProperty" && obj.element && obj.element._type.includes("Workflow")) {
                    me.selected = true;
                    me.showProperty();
                }
                if (obj.action == "closeProperty" && obj.element && obj.element._type.includes("Workflow")) {
                    me.selected = false;
                    me.closePanel();
                }

                if(obj.action=="updateDag" && obj.element && obj.element._type == "WorkflowDag") {
                    me.value.object.spec.templates[0].dag.tasks[obj.element.index] = obj.element.object;
                }
            });
        },
        watch: {
            name(appName){
                this.value.name = appName;
                this.menuList.forEach((cmd) => {
                    if(cmd.name.includes('argo get')) {
                        cmd.name = "argo get " + appName;
                    }
                    if(cmd.name.includes('argo logs')) {
                        cmd.name = "argo logs " + appName;
                    }
                })
            },
        },
        methods: {
             setSteps(val) {
                var me = this;
                var len = me.value.steps.length;
                
                if (val > len) {
                    var count = val - len;
                    for(var i=0; i<count; i++) {
                        me.stepComp.x = me.value.elementView.x - 230;
                        if (len > 0 && count === 1) {
                            me.stepComp.x += 100 * len;
                        } else if (len > 0 && count > 1) {
                            me.stepComp.x += 100 * (len+count-i);
                        }
                        me.stepComp.y = me.value.elementView.y;
                        
                        var el = me.canvas.addElement(me.stepComp, me.value);
                        el.name = "Step"+(len+count-i);
                        el.object.name = "Step"+(len+count-i);
                        me.value.steps.push(el.elementView.id);
                    }
                }
            },
            setTasks(val) {
                var me = this;
                var len = me.value.tasks.length;
                
                if (val > len) {
                    var count = val - len;
                    for(var i=0; i<count; i++) {
                        me.taskComp.x = me.value.elementView.x - 230;
                        if (len > 0 && count === 1) {
                            me.taskComp.x += 100 * len;
                        } else if (len > 0 && count > 1) {
                            me.taskComp.x += 100 * (len+count-i);
                        }
                        me.taskComp.y = me.value.elementView.y;
                        
                        var el = me.canvas.addElement(me.taskComp, me.value);
                        el.name = "Task"+(len+count-i);
                        el.object.name = "Task"+(len+count-i);
                        me.value.tasks.push(el.elementView.id);
                    }
                }
            },
        },
    }
</script>

<style>

</style>