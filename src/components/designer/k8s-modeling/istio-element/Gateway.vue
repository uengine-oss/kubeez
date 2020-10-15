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
                        'stroke': '#ED73B6',
                        fill: '#ED73B6',
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
                        :text="'Gateway'">
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
    import PropertyPanel from './GatewayPropertyPanel'

    export default {
        mixins: [Element],
        name: 'gateway',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Gateway'
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
                        "kind": "Gateway",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "selector": {
                                "istio": "ingressgateway"
                            },
                            "servers": [
                                {
                                    "port": {
                                        "number": 80,
                                        "name": "",
                                        "protocol": ""
                                    },
                                    "hosts": [ "*" ]
                                }
                            ]
                        }
                    },
                    connectableType: [ "VirtualService" ],
                    outboundVirtualServices: [],
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name
                } catch (e) {
                    return ""
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
            outboundVirtualServiceNames() {
                try {
                    var svcNames = ""
                    this.value.outboundVirtualServices.forEach(element => {
                        svcNames += element.object.spec.hosts[0] +  ","
                    })
                    return svcNames
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

                if(obj.state=="addRelation" && obj.element && obj.element.targetElement
                    && obj.element.targetElement._type == "VirtualService") {                    
                    me.value.outboundVirtualServices.push(obj.element.targetElement)
                }

                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement
                    && obj.element.targetElement._type == "VirtualService") {
                    me.value.outboundVirtualServices.splice(me.value.outboundVirtualServices.indexOf(obj.element.targetElement), 1)
                }

            })

        },
        watch: {
            name(appName) {
                this.value.name = appName
            },
        },
        methods: {
        },
    }
</script>

<style>

</style>