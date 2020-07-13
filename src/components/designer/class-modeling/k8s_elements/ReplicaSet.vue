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
                        'stroke': '#fdd835',
                        fill: '#fdd835',
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
                        :text="'ReplicaSet'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="30"
                >

                </image-element>
            </sub-elements>

            <sub-elements>
                <rectangle-element
                        v-if="value.status"
                        :sub-bottom="-20"
                        :sub-width="'50%'"
                        :sub-height="30"
                        :sub-align="'center'"
                        :sub-style="{
                            'stroke': statusColor,
                            fill: statusColor,
                            'fill-opacity': 1,
                            'font-weight': 'bold',
                            'font-size': '15',
                            'font-color': '#ffffff'
                        }"
                        :label.sync="value.replicasStatus">
                </rectangle-element>
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
    import Element from '../../modeling/Element'
    import PropertyPanel from './ReplicaSetPropertyPanel'

    export default {
        mixins: [Element],
        name: 'replicaSet',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'ReplicaSet'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs.svg`
            },
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace:'',
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
                        "kind": "ReplicaSet",
                        "metadata": {
                            "name": "",
                            "labels": {
                                "app": ""
                            }
                        },
                        "spec": {
                            "replicas": 1,
                            "selector": {
                                "matchLabels": {
                                    "app": ""
                                }
                            },
                            "template": {
                                "metadata": {
                                    "labels": {
                                        "app": ""
                                    }
                                },
                                "spec": {
                                    "containers": [
                                        {
                                            "name": "",
                                            "image": "",
                                            "ports": [
                                                {
                                                    "containerPort": 80
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    connectableType: ["Pod"],
                    status: null,
                    replicasStatus: "",
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
                    return "Untitled";
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
                
                if(obj.state == "get" && obj.element && obj.element.kind == me.value.object.kind) {
                    me.value.status = obj.element.status
                    me.setReplicasStatus()
                    me.refresh()
                }
            })
        },
        watch: {
            name(appName){
                this.value.object.metadata.labels.app = appName;
                this.value.object.spec.selector.matchLabels.app = appName;
                this.value.object.spec.template.metadata.labels.app = appName;
                this.value.object.spec.template.spec.containers[0].name = appName;
            },
        },

        methods: {
            setReplicasStatus() {
                var me = this
                var replicas = 0
                var availableReplicas = 0

                availableReplicas = me.value.status.availableReplicas ? me.value.status.availableReplicas : 0
                replicas = me.value.status.replicas ? me.value.status.replicas : me.value.status.replicas
                
                me.value.replicasStatus = String(availableReplicas) + " / " + String(replicas)

                if(replicas > 0 && availableReplicas > 0 && availableReplicas == replicas) {
                    me.changeStatusColor('success')
                } else {
                    me.changeStatusColor('waiting')
                }
            },
        },
    }
</script>

<style>

</style>