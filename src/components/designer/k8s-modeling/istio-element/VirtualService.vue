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
                    v-if="value.status"
                    :image="'subprocess.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="30"
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
            :elementId="value._type"
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
        name: 'virtual-service',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
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
                        'width': 150,
                        'height': 150,
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
                        },
                    },
                    outboundDestinationRules: [],
                    connectableType: [ "DestinationRule" ],
                    relationComponent: "virtualservice-to-destinationrule",
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
                        ruleNames += element.object.spec.subsets[0].name +  ","
                    })
                    return ruleNames
                } catch (e) {
                    return ""
                }
            },
            gatewayName() {
                try {
                    return this.value.inboundGateway.object.metadata.name + ","
                } catch(e) {
                    return ""
                }
            },
        },
        data: function () {
            return {
                menuList : [
                    { name: "View Terminal" },
                    { name: "Delete" }
                ]
            };
        },
        created: function () {
        },
        mounted: function () {
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement
                    && obj.element.targetElement._type == "DestinationRule") {                    
                    me.value.outboundDestinationRules.push(obj.element.targetElement)
                }
                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement
                    && obj.element.targetElement._type == "DestinationRule") {
                    me.value.outboundDestinationRules.splice(me.value.outboundDestinationRules.indexOf(obj.element.targetElement), 1)
                }

                if(obj.state=="updateRouteType" && obj.value) {
                    me.setRouteType(obj)
                }
                if(obj.state=="updateWeight" && obj.value) {
                    me.setWeight(obj)
                }

                if(obj.state=="addRelation" && obj.element && obj.element.sourceElement
                    && obj.element.sourceElement._type == "Gateway") {                    
                    me.value.inboundGateway = obj.element.sourceElement
                }
                if(obj.state=="deleteRelation" && obj.element && obj.element.sourceElement
                    && obj.element.sourceElement._type == "Gateway") {
                     me.value.inboundGateway = null
                }
            })

        },
        watch: {
            outboundDestinationRuleNames() {
                var me = this
                var route = []
                me.value.object.spec.http = []
                me.value.object.spec.http.push({route})
                
                me.value.outboundDestinationRules.forEach(element => {
                    me.value.object.spec.http[0].route.push({
                        'destination': [
                            {
                                'host': element.object.spec.host,
                                'subset': element.object.spec.subsets[0].name
                            }
                        ]
                    })
                })
            },
            gatewayName() {
                var me = this
                me.value.object.spec.gateways = []
                me.value.object.spec.gateways.push(me.value.inboundGateway.object.metadata.name)
            }
        },
        methods: {
            setRouteType(obj) {
                var me = this
                var index = me.value.outboundDestinationRules.findIndex(function(val) {
                    return val == obj.value.targetElement
                })
                if(obj.value.routeType == 'mirror') {
                    me.value.outboundDestinationRules.splice(index, 1)
                    me.value.object.spec.http[0].route.splice(index, 1)
                    me.value.outboundDestinationRules.push(obj.value.targetElement)
                    me.value.object.spec.http[0].route.push({
                        'mirror': [
                            {
                                'host': obj.value.targetElement.object.spec.host,
                                'subset': obj.value.targetElement.object.spec.subsets[0].name
                            }
                        ]
                    })
                } else if(obj.value.routeType == 'weight') {
                    me.value.outboundDestinationRules.splice(index, 1)
                    me.value.object.spec.http[0].route.splice(index, 1)
                    me.value.outboundDestinationRules.push(obj.value.targetElement)
                    me.value.object.spec.http[0].route.push({
                        'destination': [
                            {
                                'host': obj.value.targetElement.object.spec.host,
                                'subset': obj.value.targetElement.object.spec.subsets[0].name
                            }
                        ],
                        'weight': 0
                    })
                }
            },
            setWeight(obj) {
                var me = this
                var index = me.value.outboundDestinationRules.findIndex(function(val) {
                    return val == obj.value.targetElement
                })
                me.value.object.spec.http[0].route[index].weight = Number(obj.value.weight)
            }
        },
    }
</script>

<style>

</style>