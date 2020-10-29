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
                        'stroke': '#5099F7',
                        fill: '#5099F7',
                        'fill-opacity': 1,
                        r: '1'
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
                        :text="'VirtualService'">
                </text-element>
            </sub-elements>
        </geometry-element>

        <property-panel
                v-if="openPanel"
                v-model="value">
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
    import Element from '../Kube-Element'
    import PropertyPanel from './VirtualServicePropertyPanel'

    export default {
        mixins: [Element],
        name: 'virtualService',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'VirtualService'
            },
            createNew(elementId, x, y, width, height) {
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
                    object: {
                        "apiVersion": "networking.istio.io/v1alpha3",
                        "kind": "VirtualService",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "hosts": [ "" ],
                            "http": [],
                        },
                    },
                    outboundDestinationRules: [],
                    outboundServices: [],
                    connectableType: [ "DestinationRule", "Service" ],
                    relationComponent: "VirtualserviceToDestinationrule",
                    inboundGateway: null,
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
            outboundDestinationRuleNames() {
                try {
                    var ruleNames = ""
                    this.value.outboundDestinationRules.forEach(element => {
                        ruleNames += element.object.spec.subsets[0].name +  "," + element.object.metadata.name + "," + element.routeType + "," + element.weight
                    })
                    return ruleNames
                } catch (e) {
                    return ""
                }
            },
            gatewayName() {
                try {
                    return this.value.inboundGateway.object.metadata.name + "," + this.value.inboundGateway.object.spec.servers[0].hosts[0] 
                } catch(e) {
                    return ""
                }
            },
            outboundServiceNames() {
                try {
                    var svcNames = "";
                    this.value.outboundServices.forEach(element => {
                        svcNames += element.object.metadata.name + ","
                    });
                    return svcNames;
                } catch(e) {
                    return "";
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
                // console.log(obj)
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRule") {   
                    var res = me.value.outboundDestinationRules.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if(!res) {
                        me.value.outboundDestinationRules.push(obj.element.targetElement)
                    }
                }
                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRule") {
                    me.value.outboundDestinationRules.splice(me.value.outboundDestinationRules.indexOf(obj.element.targetElement), 1)
                }
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {                    
                    var res = me.value.outboundServices.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if(!res) {
                        me.value.outboundServices.push(obj.element.targetElement)
                    }
                }
                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.outboundServices.splice(me.value.outboundServices.indexOf(obj.element.targetElement), 1)
                }

                if(obj.state=="addRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "Gateway") {  
                    me.value.inboundGateway = obj.element.sourceElement
                }
                if(obj.state=="deleteRelation" && obj.element && obj.element.sourceElements && obj.element.sourceElement._type == "Gateway") {
                    me.value.inboundGateway = null
                }
            })

        },
        watch: {
            outboundDestinationRuleNames() {
                var me = this;
                me.value.object.spec.http = [];
                me.value.outboundDestinationRules.forEach(element => {
                    // console.log(element);
                    me.setDestination(element);
                });
            },
            gatewayName() {
                var me = this
                me.value.object.spec.hosts = []
                me.value.object.spec.gateways = []
                if(me.value.inboundGateway) {
                    me.value.object.spec.hosts.push(me.value.inboundGateway.object.spec.servers[0].hosts[0])
                    me.value.object.spec.gateways.push(me.value.inboundGateway.object.metadata.name)
                }
            },
            outboundServiceNames(val) {
                var me = this;
                me.value.object.spec.http = [];
                me.value.outboundServices.forEach(element => {
                    var path = element.path || "/";
                    me.value.object.spec.http.push({
                        "match": [{
                            "uri": {
                                "prefix": path 
                            }
                        }],
                        "route": [{
                            "destination": {
                                "host": element.object.metadata.name,
                                "port": {
                                    "number": element.object.spec.ports[0].port
                                }
                            }
                        }],
                        "timeout": "3s",
                        "retries": {
                            "attempts": 3,
                            "perTryTimeout": "2s",
                            "retryOn": ""
                        }
                    });
                });
            }
        },
        methods: {
            setDestination(element) {
                var me = this;
                if(element.routeType == 'mirror') {
                    me.value.object.spec.http.push({
                        "mirror": {
                            "host": element.object.spec.host,
                            "subset": element.object.spec.subsets[0].name
                        },
                        "timeout": "3s",
                        "retries": {
                            "attempts": 3,
                            "perTryTimeout": "2s",
                            "retryOn": ""
                        }
                    });
                } else if(element.routeType == 'weight') {
                    me.value.object.spec.http.push({
                        "route": [{
                            "destination": {
                                "host": element.object.spec.host,
                                "subset": element.object.spec.subsets[0].name
                            }
                        }],
                        'weight': Number(element.weight),
                        "timeout": "3s",
                        "retries": {
                            "attempts": 3,
                            "perTryTimeout": "2s",
                            "retryOn": ""
                        }
                    });
                }
            },
        },
    }
</script>

<style>

</style>