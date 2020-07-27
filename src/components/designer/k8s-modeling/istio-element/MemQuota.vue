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
                        :text="'MemQuota'">
                </text-element>
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
    import PropertyPanel from './MemQuotaPropertyPanel'

    export default {
        mixins: [Element],
        name: 'memquota',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'MemQuota'
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
                        'width': 150,
                        'height': 150,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: {
                        "apiVersion": "config.istio.io/v1alpha2",
                        "kind": "memquota",
                        "metadata": {
                            "name": "handler",
                            "namespace": "istio-system"
                        },
                        "spec": {
                            "quotas": [
                                {
                                    "name": "requestcount.quota.istio-system",
                                    "maxAmount": 5000,
                                    "validDuration": "1s",
                                    "overrides": [
                                        {
                                            "dimensions": {
                                                "destination": "recommendation",
                                                "destinationVersion": "v2",
                                                "source": "preference"
                                            },
                                            "maxAmount": 1,
                                            "validDuration": "1s"
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    connectableType: [],
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
        mounted(){
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
            })
        },
        watch: {
            name(appName) {
                this.value.name = appName
            },
        },
        methods: {            
        }
    }
</script>
  
<style>

</style>