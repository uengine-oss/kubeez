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

            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#466BB0',
                        fill: '#466BB0',
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
                        :text="'QuotaSpecBinding'">
                </text-element>
            </sub-elements>
            <k8s-sub-controller
                    v-for="connectableType in filterConnectionTypes"
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
    import PropertyPanel from './QuotaSpecBindingPropertyPanel'

    export default {
        mixins: [Element],
        name: 'quotaSpecBinding',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'QuotaSpecBinding'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
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
                        "apiVersion": "config.istio.io/v1alpha2",
                        "kind": "QuotaSpecBinding",
                        "metadata": {
                            "creationTimestamp": null,
                            "name": "",
                            "namespace": "istio-system"
                        },
                        "spec": {
                            "quotaSpecs": [],
                            "services": []
                        }
                    },
                    connectableType: [ "QuotaSpec", "Service" ],
                    outboundQuotaSpecs: [],
                    outboundServices: [],
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
                get: function() {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal
                }
            },
            outboundQuotaSpecNames() {
                try {
                    var quotaSpecNames = ''
                    this.value.outboundQuotaSpecs.forEach(element => {
                        quotaSpecNames += element.object.metadata.name +  ","
                    })
                    return quotaSpecNames
                } catch(e) {
                    return ''
                }
            },
            outboundServiceNames() {
                try {
                    var svcNames = ''
                    this.value.outboundServices.forEach(element => {
                        svcNames += element.object.metadata.name +  ","
                    })
                    return svcNames
                } catch(e) {
                    return ''
                }
            },
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        mounted(){
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "QuotaSpec") {
                    me.value.outboundQuotaSpecs.push(obj.element.targetElement)
                }

                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "QuotaSpec") {
                    me.value.outboundQuotaSpecs.splice(me.value.outboundQuotaSpecs.indexOf(obj.element.targetElement), 1)
                }

                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.outboundServices.push(obj.element.targetElement)
                }

                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.outboundServices.splice(me.value.outboundServices.indexOf(obj.element.targetElement), 1)
                }
            })
        },
        watch: {
            outboundQuotaSpecNames() {
                var me = this
                me.value.object.spec.quotaSpecs = []

                me.value.outboundQuotaSpecs.forEach(function(element) {
                    me.value.object.spec.quotaSpecs.push({
                        "name": element.object.metadata.name,
                        "namespace": element.object.metadata.namespace
                    })
                })
            },
            outboundServiceNames() {
                var me = this
                me.value.object.spec.services = []
                
                me.value.outboundServices.forEach(function(element) {
                    me.value.object.spec.services.push({
                        "name": element.object.metadata.name,
                        "namespace": element.object.metadata.namespace
                    })
                })
            }
        },
        methods: {            
        }
    }
</script>
  
<style>

</style>