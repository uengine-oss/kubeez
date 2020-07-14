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

            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#cccccc',
                        fill: '#cccccc',
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
                        :text="'PVC'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="30">
                </image-element>
            </sub-elements>

            <sub-elements>
                <circle-element
                        v-if="value.status"
                        :sub-bottom="-15"
                        :sub-width="30"
                        :sub-height="30"
                        :sub-align="'center'"
                        :sub-style="{
                            'stroke': statusColor,
                            fill: statusColor,
                            'fill-opacity': 1,
                        }">
                </circle-element>
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
    import Element from '../Kube-Element'
    import PropertyPanel from './PersistentVolumeClaimPropertyPanel'

    export default {
        mixins: [Element],
        name: 'persistent-volume-claim',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'PersistentVolumeClaim'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pvc.svg`
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
                        "apiVersion": "v1",
                        "kind": "PersistentVolumeClaim",
                        "metadata": {
                            "name": "",
                        },
                        "spec": {
                            "accessModes": [ "" ],
                            "resources": {
                                "requests": {
                                    "storage": "1Gi"
                                }
                            },
                            "storageClassName": "",
                            "volumeMode": "",
                            "volumeName": ""
                        }
                    },
                    connectableType: ["PersistentVolume"],
                    outboundVolume: null,
                    status: null,
                    
                }
            },

            name(){
                try{
                    return this.value.object.metadata.name;
                }catch(e){
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
            outboundVolumeName(){
                try{
                    return this.value.outboundVolume.object.metadata.name;
                }catch(e){
                    return "";
                }
            }

        },
        data: function () {
            return {
                                
            };
        },
        created: function () {
            
        },
        mounted: function () {

            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement 
                    && obj.element.targetElement._type == "PersistentVolume"){

                    me.value.outboundVolume = obj.element.targetElement;
                }

                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement 
                    && obj.element.targetElement._type == "PersistentVolume"){

                    me.value.outboundVolume = null;
                }

                if(obj.state == "get" && obj.element && obj.element.kind == me.value.object.kind) {
                    me.value.status = obj.element.status
                    me.setStatus()
                    me.refresh()
                }
            })
            
        },
        watch: {
            "outboundVolumeName": function(volumeName){
                this.value.object.spec.volumeName = volumeName;
            }
        },

        methods: {
            setStatus() {
                var me = this
                
                if(me.value.status.phase == 'Bound') {
                    me.changeStatusColor('success')
                } else {
                    me.changeStatusColor('waiting')
                }
            },
        }
    }
</script>

<style>

</style>