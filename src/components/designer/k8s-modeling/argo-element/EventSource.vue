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
                        'stroke': '#cccccc',
                        fill: '#cccccc',
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
                        :text="'EventSource'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="25">
                </image-element>
            </sub-elements>

            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes" :key="idx"
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
    import PropertyPanel from './EventSourcePanel';

    export default {
        mixins: [Element],
        name: 'eventSource',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'EventSource'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            createNew(elementId, x, y, width, height, object) {
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
                    object: object ? object: {
                        "apiVersion": "argoproj.io/v1alpha1",
                        "kind": "EventSource",
                        "metadata": {
                            "name": "",
                        },
                        "spec": {}
                    },
                    advancedAttributePaths: {
                        "spec.github": {
                            "example": {
                                "owner": "",
                                "repository": "",
                                "webhook": {
                                    "endpoint": "",
                                    "port": "",
                                    "method": "",
                                    "url": ""
                                },
                                "events": [
                                    "*"
                                ],
                                "apiToken": {
                                    "name": "",
                                    "key": "",
                                },
                                "insecure": true,
                                "active": true,
                                "contentType": "json"
                            }
                        },
                        "spec.webhook": {
                            "example": {
                                "endpoint": "",
                                "port": "",
                                "method": "",
                                "url": ""
                            }
                        },
                        "spec.resource": {
                            "example": {
                                "namespace": "",
                                "group": "",
                                "version": "",
                                "resource": "",
                                "eventTypes": [
                                    "ADD"
                                ]
                            }
                        },
                        "spec.sns": {
                            "example": {
                                "topicArn": "",
                                "webhook": {
                                    "endpoint": "",
                                    "port": ""
                                },
                                "accessKey": {
                                    "key": "",
                                    "name": ""
                                },
                                "secretKey": {
                                    "key": "",
                                    "name": ""
                                },
                                "region": ""
                            }
                        }
                    },
                    connectableType: [],
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;    
                } catch(e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace;
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal;
                }
            },
        },
        data: function () {
            return {};
        },
        created() {
            var me = this;
        },
        mounted: function () {
            var me = this;
            
            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                //
            });
        },
        watch: {
        },
        methods: {
        },
    }
</script>

<style>

</style>