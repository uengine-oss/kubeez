<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                v-on:removeShape="onRemoveShape(value)"
                :label.sync="name"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold','font-size': '16'
                }"
                v-on:contextmenu.prevent.stop="handleClick($event)"
        >

            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#9e9e9e',
                        fill: '#9e9e9e',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Sensor'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="25">
                </image-element>
            </sub-elements>

            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes" :key="idx"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component">
            </k8s-sub-controller>

        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        >
        </property-panel>

        <vue-context-menu
            :elementId="value.elementView.id"
            :options="menuList"
            :ref="'vueSimpleContextMenu'"
            @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import PropertyPanel from './SensorPanel';

    export default {
        mixins: [Element],
        name: 'sensor',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Sensor'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            createNew(elementId, x, y, width, height, object) {
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
                        "kind": "Sensor",
                        "metadata": {
                            "name": "",
                        },
                        "spec": {
                            "template": {
                                "serviceAccountName": ""
                            },
                            "dependencies": [],
                            "triggers": [{
                                "template": {
                                    "name": "",
                                }
                            }]
                        }
                    },
                    advancedAttributePaths: {},
                    outboundWorkflow: null,
                    outboundEventSource: null,
                    outboundPod: null,
                    connectableType: [ "EventSource", "Workflow", "Pod" ],
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;    
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
            outboundWorkflowName() {
                try {
                    return this.value.outboundWorkflow.object.metadata.generateName + ",";
                } catch(e) {
                    return "";
                }
            },
            outboundEventSourceName() {
                try {
                    return this.value.outboundEventSource.object.metadata.name;
                } catch(e) {
                    return "";
                }
            },
            outboundPodName() {
                try {
                    return this.value.outboundPod.object.metadata.generateName + ",";
                } catch (e) {
                    return "";
                }
            }
        },
        data: function () {
            return {};
        },
        created() {
            var me = this;
        },
        mounted: function () {
            var me = this;
            
            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Workflow") {
                    me.value.outboundWorkflow = obj.element.targetElement;
                    obj.element.targetElement.object.metadata.generateName = obj.element.targetElement.object.metadata.name;
                    // delete obj.element.targetElement.object.metadata.name;
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Workflow") {
                    me.value.outboundWorkflow = null;
                    // me.value.object.spec.triggers[0].template.argoWorkflow.source.resource = {};
                }
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod") {
                    me.value.outboundPod = obj.element.targetElement;
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod") {
                    me.value.outboundPod = null;
                    // me.value.object.spec.triggers[0].template.k8s.source.resource = {};
                }

                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "EventSource") {
                    me.value.outboundEventSource = obj.element.targetElement;
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "EventSource") {
                    me.value.outboundEventSource = null;
                    me.value.object.spec.dependencies = [];
                }
            });
        },
        watch: {
            outboundWorkflowName() {
                var me = this;
                if(me.value.outboundWorkflow.object) {
                    delete me.value.object.spec.triggers[0].template.k8s;
                    var arr = me.value.outboundWorkflow.object.apiVersion
                    me.value.object.spec.triggers[0].template.argoWorkflow = {
                        "group": "argoproj.io",
                        "version": "v1alpha1",
                        "resource": "workflows",
                        "operation": "",
                        "source": {
                            "resource": me.value.outboundWorkflow.object
                        },
                        "parameters": [{
                            "src": {
                                "dependencyName": ""
                            },
                            "dest": ""
                        }]
                    };
                }
            },
            outboundEventSourceName(val) {
                var me = this;
                me.value.object.spec.dependencies = [];
                me.value.object.spec.dependencies.push({
                    "name": "",
                    "eventSourceName": val,
                    "eventName": val ? "example" : ""
                });
            },
            outboundPodName() {
                var me = this;
                if(me.value.outboundPod.object) {
                    delete me.value.object.spec.triggers[0].template.argoWorkflow;
                    me.value.object.spec.triggers[0].template.k8s = {
                        "group": "",
                        "version": me.value.outboundPod.object.apiVersion,
                        "resource": "pods",
                        "operation": "",
                        "source": {
                            "resource": me.value.outboundPod.object
                        },
                        "parameters": [{
                            "src": {
                                "dependencyName": ""
                            },
                            "dest": ""
                        }]
                    };
                    delete me.value.object.spec.triggers[0].template.k8s.source.resource.metadata.name;
                    me.value.object.spec.triggers[0].template.k8s.source.resource.metadata.generateName = me.value.outboundPod.outboundPod.metadata.name;
                }
            }
        },
        methods: {
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(to._type == 'EventSource' && from.object.spec.dependencies) {
                        res = from.object.spec.dependencies.some((dep) => {
                            if(dep.eventSourceName == to.object.metadata.name) {
                                return true
                            }
                        })
                    }
                }
                return res
            },
        },
    }
</script>

<style>

</style>