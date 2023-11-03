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
                :image.sync="refreshedImg"
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
                        'stroke': '#407bff',
                        fill: '#407bff',
                        'fill-opacity': 1,
                        r: '1',
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
                        :text="'CRD'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25">
                </image-element>
            </sub-elements>
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
    import PropertyPanel from './CustomResourceDefinitionPropertyPanel'

    export default {
        mixins: [Element],
        name: 'customResourceDefinition',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/crd-palette.svg`
            },
            className() {
                return 'CustomResourceDefinition'
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
                    object: object ? object : {
                        "apiVersion": "apiextensions.k8s.io/v1beta1",
                        "kind": "CustomResourceDefinition",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "group": "",
                            "versions": [
                                {
                                    "name": "",
                                    "served": true,
                                    "storage": true
                                }
                            ],
                            "scope": "Namespaced",
                            "names": {
                                "plural": "",
                                "singular": "",
                                "kind": "",
                                "shortNames": [
                                    ""
                                ]
                            }
                        }
                    },
                    advancedAttributePaths: {},
                    connectableType: [],
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
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch (e) {
                    return "";
                }

            },
        },
        data: function () {
            return {};
        },
        created: function () {
            var me = this
        },
        mounted() {
            var me = this
        },
        watch: {
        },
        methods: {
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    res = true
                }
                return res
            },
        }
    }
</script>

<style>

</style>