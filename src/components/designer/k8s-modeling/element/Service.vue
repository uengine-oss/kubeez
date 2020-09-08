<template>
    <div>
        <geometry-element
                selectable
                :movable="editMode"
                :resizable="editMode"
                connectable
                :deletable=editMode
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="showProperty"
                v-on:rotateShape="onRotateShape"
                v-on:labelChanged="onLabelChanged"
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
                        'stroke': '#2196f3',
                        fill: '#2196f3',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-controller
                    :image="'subprocess.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Service'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25">
                </image-element>
            </sub-elements>
        </geometry-element>


        <property-panel
                v-if="openPanel"
                v-model="value"
                :img="imgSrc">
        </property-panel>

        <vue-context-menu
            :elementId="value._type"
            :options="menuList"
            :ref="'vueSimpleContextMenu'"
            @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import Element from '../Kube-Element'
    import PropertyPanel from './ServicePropertyPanel'

    export default {
        mixins: [Element],
        name: 'service',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Service'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc.svg`
            },
            createNew(elementId, x, y, width, height) {
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
                    object: {
                        "apiVersion": "v1",
                        "kind": "Service",
                        "metadata": {
                            "name": "",
                            "labels": {
                                "app": ""
                            }
                        },
                        "spec": {
                            "ports": [
                                {
                                    "port": 80,
                                    "targetPort": 80
                                }
                            ],
                            "selector": {
                                "app": ""
                            },
                            "type": "ClusterIP"
                        }
                    },
                    outboundDeployment: null,
                    outboundPod: null,
                    outboundReplicaSet: null,
                    connectableType: ["Deployment", "Pod", "ReplicaSet"],
                    status: null,
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name    
                } catch(e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal
                }
            },
            outboundDeploymentName() {
                try {
                    return this.value.outboundDeployment.object.metadata.name + ', ' + 
                        this.value.outboundDeployment.object.spec.template.spec.containers[0].ports[0].containerPort;
                } catch(e) {
                    return "";
                }
            },
            outboundPodName() {
                try {
                    return this.value.outboundPod.object.metadata.name + ', ' + 
                        this.value.outboundPod.object.spec.containers[0].ports[0].containerPort;
                } catch(e) {
                    return "";
                }
            },
            outboundReplicaSetName() {
                try {
                    return this.value.outboundReplicaSet.object.metadata.name + ', ' + 
                        this.value.outboundReplicaSet.object.spec.template.spec.containers[0].ports[0].containerPort;
                } catch(e) {
                    return ""
                }
            }
        },
        data: function () {
            return {};
        },
        created: function () {

        },
        mounted: function () {

            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Deployment"){
                    me.value.outboundDeployment = obj.element.targetElement;
                }
                else if(obj.state=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod"){
                    me.value.outboundPod = obj.element.targetElement;
                }
                else if(obj.state=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ReplicaSet"){
                    me.value.outboundReplicaSet = obj.element.targetElement;
                }

                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Deployment"){
                    me.value.outboundDeployment = null;
                }
                else if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod"){
                    me.value.outboundPod = null;
                }
                else if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ReplicaSet"){
                    me.value.outboundReplicaSet = null;
                }

                if(obj.state == "get" && obj.element && obj.element.kind == me.value.object.kind) {
                    me.value.status = obj.element.status
                }
            })
            
        },
        watch: {
            name(appName) {
                var me = this;
                me.value.name = appName;
                me.value.object.metadata.labels.app = appName;
            },
            outboundDeploymentName(val) {
                var me = this;
                me.value.object.spec.selector.app = me.value.outboundDeployment.object.metadata.name;
                me.value.object.spec.ports[0].targetPort 
                    = me.value.outboundDeployment.object.spec.template.spec.containers[0].ports[0].containerPort;
            },
            outboundPodName(val) {
                var me = this;
                me.value.object.spec.selector.app = val;
                me.value.object.spec.ports[0].targetPort = me.value.outboundPod.object.spec.containers[0].ports[0].containerPort;
            },
            outboundReplicaSetName(val) {
                var me = this;
                me.value.object.spec.selector.app = me.value.outboundReplicaSet.object.metadata.name;
                me.value.object.spec.ports[0].targetPort 
                    = me.value.outboundReplicaSet.object.spec.template.spec.containers[0].ports[0].containerPort;
            }
        },

        methods: {
        },
    }
</script>

<style>

</style>