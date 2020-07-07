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
        >
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#ffeb3b',
                        fill: '#ffeb3b',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="30"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'DaemonSet'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="30">
                </image-element>
            </sub-elements>
        </geometry-element>

         <property-panel
            v-if="openPanel"
            v-model="value"
            :img="imgSrc">
        </property-panel>
    </div>
</template>

<script>
    import Element from '../../modeling/Element'
    import PropertyPanel from './DaemonSetPropertyPanel'
    import ImageElement from "../../../opengraph/shape/ImageElement";

    export default {
        mixins: [Element],
        name: 'daemonSet',
        components: {
            ImageElement,
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'DaemonSet'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ds.svg`
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
                        "apiVersion": "apps/v1",
                        "kind": "DaemonSet",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "selector": {
                                "matchLabels": {
                                    "name": ""
                                }
                            },
                            "template": {
                                "metadata": {
                                    "labels": {
                                        "name": ""
                                    }
                                },
                                "spec": {
                                    "containers": [
                                        {
                                            "name": "",
                                            "image": ""
                                        }
                                    ],
                                    "tolerations": [
                                        {
                                            "key": "",
                                            "effect": ""
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    status: null,                    
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
            name(){
                try{
                    return this.value.object.metadata.name; 
                }catch(e){
                    return "";
                }
                
            },

        },
        data() {
            return {};
        },
        created() {
        },
        mounted() {
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.state == "get" && obj.element && obj.element.kind == me.value.object.kind) {
                    me.value.status = obj.element.status
                    me.refresh()
                }
                
            })

        },

        watch: {
            name(appName) {
                this.value.object.spec.selector.matchLabels.app = appName;
                this.value.object.spec.template.metadata.labels.app = appName;
                this.value.object.spec.template.spec.containers[0].name = appName;
            },

        },

        methods: {   
        }
    }
</script>
  
<style>

</style>