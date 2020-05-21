<template>
    <div>
        <geometry-element
                selectable
                :movable="!value.editing"
                :resizable="!value.editing"
                connectable
                :deletable=!isRead
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


        <modeling-property-panel
                v-if="openPanel"
                v-model="value"
                :titleName="'Service'"
                :img="'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/policy.png'">
        </modeling-property-panel>
    </div>
</template>

<script>
    import Element from '../../modeling/Element'
    export default {
        mixins: [Element],
        name: 'service',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Service'
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
                    editing: false,
                    status: 'add',
                    template: {
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
                    },
                    properties: [
                        {
                            key_lists: [
                                "metadata,name",
                                "metadata,labels,app"
                            ],
                            name: "service name",
                            type: "string",
                            val: "",
                        },
                        {
                            key_lists: [
                                "spec,selector,app"
                            ],
                            name: "deployment name",
                            type: "string",
                            val: "",
                        },
                        {
                            key_lists: [
                                "spec,ports,0,port"
                            ],
                            name: "port",
                            type: "number",
                            val: "80",
                        },
                        {
                            key_lists: [
                                "spec,ports,0,targetPort"
                            ],
                            name: "target port",
                            type: "number",
                            val: "80",
                        }
                    ],
                    relations: {
                        deployment: [],
                    }
                }
            }
        },
        data: function () {
            return {
                isRead:true,
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                failed_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/alert-icon.png',
            };
        },
        created: function () {
            var me = this
            var designer = me.getComponent('modeling-designer')

            this.$nextTick(function () {
                if(this.namePanel !=null ) {
                    this.namePanel =me.value.name
                }

                me.isRead = designer.isRead
            })

        },
        watch: {
            "openPanel":function (newVal) {
                var me = this
                if(newVal == false) {

                    me.$nextTick(function () {
                        var obj = {
                            state: "updateService",
                            element: JSON.parse(JSON.stringify(me.value))
                        }

                        me.value.checkValue = false
                    })
                }

            },
            "value.name":function(newVal,oldVal){
                this.namePanel = newVal
            },
        },
        mounted: function () {
            var me = this
            var designer = me.getComponent('modeling-designer')

            me.$nextTick(function () {
                me.isRead = designer.isRead
            })

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                me.$nextTick(function () {
                    var designer = me.getComponent('modeling-designer')
                    designer.editing = true;
                })
            })

        },
        methods: {
            deleteService() {
                var me = this
                var designer = me.getComponent('modeling-designer')

                return new Promise(function (resolve) {
                    me.$EventBus.$off(`${me.value.elementView.id}`);
                    var obj = {
                        state: "deleteService",
                        element: JSON.parse(JSON.stringify(me.value))
                    }

                    me.$emit('update:value', null);
                    resolve()
                })
            },
        }
    }
</script>

<style>

</style>