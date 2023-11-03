<template>
    <div>
        <group-element
                selectable
                movable
                resizable
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
                v-on:addedToGroup="onAddedToGroup"
                v-on:dblclick="openPanel"
                v-on:removeShape="onRemoveShape(value)"
                :image.sync="refreshedImg"
                :_style="{
                    stroke:'black',
                    'vertical-align': 'top',
                    'font-weight': 'bold',
                    'font-size': '16',
                }">

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
                        :text="'DestinationRule'">
                </text-element>
            </sub-elements>
        </group-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
                @setSubSet="setSubSet"
        ></property-panel>

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
    import PropertyPanel from './DestinationRulePropertyPanel'

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [Element],
        name: 'destinationRule',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'DestinationRule'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace: '',
                    namespaceId: '',
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
                    object: object ? object : {
                        "apiVersion": "networking.istio.io/v1alpha3",
                        "kind": "DestinationRule",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "host": "",
                            "subsets": [
                                {
                                    "name": "v1",
                                    "labels": {
                                        "version": "v1"
                                    }
                                }
                            ]
                        }
                    },
                    "trafficPolicy": {
                        "connectionPool": {
                            "http": {
                                "http1MaxPendingRequests": 1,
                                "maxRequestsPerConnection": 1
                            },
                            "tcp": {
                                "maxConnections": 1
                            }
                        },
                        "outlierDetection": {
                            "baseEjectionTime": "30s",
                            "consecutiveErrors": 5,
                            "interval": "10s",
                            "maxEjectionPercent": 10
                        }
                    },
                    advancedAttributePaths: {},
                    subsets: [],
                    outboundDeployments: [],
                    outboundPods: [],
                    outboundReplicaSets: [],
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch (e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function () {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal) {
                    this.value.object.metadata.namespace = newVal
                }
            },
            outboundDeploymentNames() {
                try {
                    var names = "";
                    this.value.outboundDeployments.forEach(element => {
                        names += element.object.metadata.name + "," + element.object.spec.selector.matchLabels.app;
                    });
                    return names;
                } catch (e) {
                    return ""
                }
            },
            outboundPodNames() {
                try {
                    var names = "";
                    this.value.outboundPods.forEach(element => {
                        names += element.object.metadata.name + ",";
                    });
                    return names;
                } catch (e) {
                    return "";
                }
            },
            outboundReplicaSetNames() {
                try {
                    var names = "";
                    this.value.outboundReplicaSets.forEach(element => {
                        names += element.object.metadata.name + ",";
                    });
                    return names;
                } catch (e) {
                    return "";
                }
            }
        },
        data: function () {
            return {
                compInfo: {
                    component: "destinationRuleSubset",
                    label: "subset",
                    src: `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`,
                    x: 0,
                    y: 0
                }
            };
        },
        created: function () {
        },
        mounted: function () {
            var me = this;            
            me.setSubSet(me.value.object.spec.subsets.length);

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Deployment") {
                    var res = me.value.outboundDeployments.some((el) => {
                        if (el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if (!res) {
                        me.value.outboundDeployments.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Deployment") {
                    me.value.outboundDeployments.splice(me.value.outboundDeployments.indexOf(obj.element.targetElement), 1);
                    var idx = obj.element.sourceElement.index;
                    delete me.value.object.spec.subsets[idx].labels.app;
                }
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod") {
                    var res = me.value.outboundPods.some((el) => {
                        if (el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if (!res) {
                        me.value.outboundPods.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Pod") {
                    me.value.outboundPods.splice(me.value.outboundPods.indexOf(obj.element.targetElement), 1);
                    var idx = obj.element.sourceElement.index;
                    delete me.value.object.spec.subsets[idx].labels.app;
                }
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ReplicaSet") {
                    var res = me.value.outboundReplicaSets.some((el) => {
                        if (el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if (!res) {
                        me.value.outboundReplicaSets.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ReplicaSet") {
                    me.value.outboundReplicaSets.splice(me.value.outboundReplicaSets.indexOf(obj.element.targetElement), 1);
                    var idx = obj.element.sourceElement.index;
                    delete me.value.object.spec.subsets[idx].labels.app;
                }

                if (obj.action == "deleteSubset" && obj.element && obj.element._type == "DestinationRuleSubset") {
                    me.deleteSubset(obj.element.index);
                }
                if (obj.action == "showProperty" && obj.element && obj.element._type == "DestinationRuleSubset") {
                    me.selected = true;
                    me.showProperty();
                }
                if (obj.action == "closeProperty" && obj.element && obj.element._type == "DestinationRuleSubset") {
                    me.selected = false;
                    me.closePanel();
                }
            })
        },
        watch: {
            name(appName) {
                this.value.name = appName
            },
            outboundDeploymentNames(val) {
                var me = this;
                me.value.outboundDeployments.forEach(deploy => {
                    me.value.subsets.forEach(sb => {
                        if (deploy.subsetId == sb) {
                            me.value.object.spec.subsets[sb.index].labels.app = deploy.object.metadata.name;
                        }
                    });
                });
            },
            outboundPodNames(val) {
                var me = this;
                me.value.outboundPods.forEach(deploy => {
                    me.value.subsets.forEach(sb => {
                        if (deploy.subsetId == sb) {
                            me.value.object.spec.subsets[sb.index].labels.app = deploy.object.metadata.name;
                        }
                    });
                });
            },
            outboundReplicaSetNames(val) {
                var me = this;
                me.value.outboundReplicaSets.forEach(deploy => {
                    me.value.subsets.forEach(sb => {
                        if (deploy.subsetId == sb) {
                            me.value.object.spec.subsets[sb.index].labels.app = deploy.object.metadata.name;
                        }
                    });
                });
            },
        },
        methods: {
            setSubSet(val) {
                var me = this;
                var len = me.value.subsets.length;
                
                if (val > len) {
                    var count = val - len;
                    for(var i=0; i<count; i++) {
                        me.compInfo.x = me.value.elementView.x - 100;
                        if (len > 0 && count === 1) {
                            me.compInfo.x += 100 * len;
                        } else if (len > 0 && count > 1) {
                            me.compInfo.x += 100 * (len+count-i);
                        }
                        me.compInfo.y = me.value.elementView.y;
                        
                        var el = me.canvas.addElement(me.compInfo, me.value);
                        el.name = "v"+(len+count-i);
                        el.version = "v"+(len+count-i);
                        me.value.subsets.push(el.elementView.id);
                    }
                }
            },
            deleteSubset(index) {
                var me = this;
                me.value.subsets.splice(index, 1);
                me.value.object.spec.subsets.splice(index, 1);
            },
            isConnected(to, from) {
                if(!from.connectableType) {
                    return false
                }
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                if(connectable) {
                    return true
                }
                return false
            },
        },
    }
</script>

<style>

</style>