<template>
    <div>
        <geometry-element
                selectable
                :movable="!value.editing"
                :resizable="!value.editing"
                connectable
                :deletable=!editMode
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
                :label.sync="namePanel"
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
                        'stroke': '#BB94BF',
                        fill: '#BB94BF',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Service'">
                </text-element>
            </sub-elements>
        </geometry-element>


        <property-panel
            @close="closeProperty"
            v-if="openPanel"
            v-model="value"
            :img="'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/policy.png'">
        </property-panel>
    </div>
</template>

<script>
    import Element from '../../modeling/Element'
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

            relativeKinds: {
                deployment: {

                    updated: function(me, deployment){
                        me.object.selector.app = deployment.name;
                    }

                },
            },
            
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: '',
                    
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: {
                        "apiVersion": "apps/v1",
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
                            }
                        }
                    }
                    
                }
            }
        },
        data: function () {
            return {
                
            };
        },
        created: function () {
        
        },
        watch: {
        },

        methods: {



        }
    }
</script>

<style>

</style>