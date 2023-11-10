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
                        'stroke': '#5099F7',
                        fill: '#5099F7',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>

            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-controller
                    :image="'subprocess.png'"
                    @click.prevent.stop="drawFrame(yamlSrc)"
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
            <k8s-sub-controller
                    v-for="(connectableType, index) in filterConnectionTypes"
                    :key="index"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component"
                    :customRelation="value.relationComponent"
            ></k8s-sub-controller>
        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
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
                        "kind": "VirtualService",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "hosts": [ "*" ],
                            "http": [{
                                "name": "",
                                "route": []
                            }],
                        },
                    },
                    outboundDestinationRules: [],
                    outboundDestinationRuleMirror: null,
                    outboundServices: [],
                    connectableType: [ "DestinationRuleSubset", "Service" ],
                    relationComponent: "VirtualserviceToDestinationrule",
                    inboundGateway: null,
                    druleName: ""
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
                    var me = this;
                    var ruleNames = "";
                    me.value.outboundDestinationRules.forEach(element => {
                        ruleNames += element.name + "," + element.host
                        me.setDestination(element);
                    });
                    return ruleNames
                } catch (e) {
                    return ""
                }
            },
            outboundDestinationRuleMirrorName() {
                try {
                    return this.value.outboundDestinationRuleMirror.name + ",";
                } catch (e) {
                    return ""
                }
            },
            gatewayName() {
                try {
                    return this.value.inboundGateway.object.metadata.name + "," + this.value.inboundGateway.object.spec.servers[0].hosts[0];
                } catch(e) {
                    return ""
                }
            },
            outboundServiceNames() {
                try {
                    var me = this;
                    var svcNames = "";
                    me.value.outboundServices.forEach(element => {
                        svcNames += element.object.metadata.name + ","
                        me.setService(element);
                    });
                    return svcNames;
                } catch(e) {
                    return "";
                }
            }
        },
        data: function () {
            return {
                yamlSrc: `${window.location.protocol + "//" + window.location.host}/static/kubernetes/istio-canary.yaml`
            };
        },
        created: function () {
        },
        mounted: function () {
            var me = this;

            if(me.value.object.spec.http.length == 0) {
                me.value.object.spec.http.push({
                    "route": []
                });
            }

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRuleSubset") {
                    var res = me.value.outboundDestinationRules.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    me.value.druleName = obj.element.targetElement.parentElName;
                    if(!res && obj.element.targetElement.routeType == 'weight') {
                        me.value.outboundDestinationRules.push(obj.element.targetElement)
                    } else if(obj.element.targetElement.routeType == 'mirror') {
                        if(res) {
                            me.value.outboundDestinationRules.splice(obj.element.targetElement.index, 1)
                            me.value.object.spec.http[0].route.splice(obj.element.targetElement.index, 1)
                        }
                        me.value.outboundDestinationRuleMirror = obj.element.targetElement
                    }
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRuleSubset") {
                    if(obj.element.targetElement.routeType == 'mirror') {
                        me.value.outboundDestinationRuleMirror = null
                    } else {
                        me.value.object.spec.http[0].route.splice(obj.element.targetElement.index, 1)
                        me.value.outboundDestinationRules.splice(me.value.outboundDestinationRules.indexOf(obj.element.targetElement), 1)
                    }
                }

                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    var res = me.value.outboundServices.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    })
                    if(!res) {
                        obj.element.targetElement.index = me.value.object.spec.http[0].route.length
                        me.value.outboundServices.push(obj.element.targetElement)
                    } else {
                        me.value.outboundServices.splice(obj.element.targetElement.index, 1)
                        me.value.object.spec.http[0].route.splice(obj.element.targetElement.index, 1)
                    }
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.object.spec.http[0].route.splice(obj.element.targetElement.index, 1)
                    me.value.outboundServices.splice(me.value.outboundServices.indexOf(obj.element.targetElement), 1)
                }

                if(obj.action=="addRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "Gateway") {
                    if(!me.value.object.spec.http[0].match) {
                        me.value.object.spec.http[0].match = [{
                            "uri": {
                                "prefix": "/"
                            }
                        }];
                    }
                    if(!me.value.object.spec.http[0].rewrite) {
                        me.value.object.spec.http[0].rewrite = {
                            "uri": "/"
                        };
                    }
                    me.value.inboundGateway = obj.element.sourceElement;
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "Gateway") {
                    me.value.inboundGateway = null;
                    delete me.value.object.spec.gateways;
                }
            })

        },
        watch: {
            outboundDestinationRuleNames(val) {
                var me = this;
            },
            outboundDestinationRuleMirrorName(val) {
                var me = this
                if(me.value.outboundDestinationRuleMirror) {
                    var obj = {
                        "host": me.value.outboundDestinationRuleMirror.host,
                        "subset": me.value.outboundDestinationRuleMirror.name
                    }
                    me.value.object.spec.http[0].mirror = obj
                } else if(!me.value.outboundDestinationRuleMirror) {
                    delete me.value.object.spec.http[0].mirror
                }
            },
            outboundServiceNames() {
                var me = this;
            },
            gatewayName() {
                var me = this;
                me.value.object.spec.gateways = []
                if(me.value.inboundGateway) {
                    me.value.object.spec.gateways.push(me.value.inboundGateway.object.metadata.name);
                } else {
                    delete me.value.object.spec.gateways
                }
            },
        },
        methods: {
            setDestination(el) {
                var me = this;
                if(el.routeType == 'weight') {
                    if(me.value.object.spec.http[0].route.length > 0) {
                        me.value.object.spec.http[0].route[el.index] = {
                            "destination": {
                                "host": el.host,
                                "subset": el.name
                            },
                            "weight": Number(el.weight)
                        }
                    } else {
                        me.value.object.spec.http[0].route.push({
                            "destination": {
                                "host": el.host,
                                "subset": el.name
                            },
                            "weight": Number(el.weight)
                        })
                    }
                }
            },
            setService(el) {
                var me = this;
                if(me.value.object.spec.http[0].route.length > 0) {
                    me.value.object.spec.http[0].route[el.index] = {
                        "destination": {
                            "host": el.object.metadata.name,
                        }
                    }
                } else {
                    me.value.object.spec.http[0].route.push({
                        "destination": {
                            "host": el.object.metadata.name,
                        }
                    })
                }
            },
            setDestinationHost(host) {
                var me = this;
                me.value.outboundDestinationRules.forEach(element => {
                    element.host = host;
                });
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
                var res = false
                if(connectable) {
                    if(to._type == "Service" && from.object.spec.http[0].route.length > 0) {
                        res = from.object.spec.http[0].route.some((svc) => {
                            if(svc.destination.host == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(to._type == "DestinationRuleSubset") {
                        if(from.object.spec.http[0].mirror) {
                            if(from.object.spec.http[0].mirror.destination.subset == to.name && drule.destination.host == to.host) {
                                res = true
                            }
                        }
                        if(from.object.spec.http[0].route.length > 0) {
                            res = from.object.spec.http[0].route.some((drule) => {
                                if(drule.destination.subset == to.name && drule.destination.host == to.host) {
                                    return true
                                }
                            })
                        }
                    }
                }
                return res
            },
        },
    }
</script>

<style>

</style>