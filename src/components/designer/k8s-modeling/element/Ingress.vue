<template>
    <div>
        <geometry-element
            selectable
            :movable="editMode"
            :resizable="editMode"
            connectable
            :deletable="editMode"
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
                    'stroke': '#4caf50',
                    fill: '#4caf50',
                    'fill-opacity': 1,
                    r: '1',
                    'z-index': '998'
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
                    :text="'Ingress'"
                ></text-element>
                <image-element
                    :image="imgSrc"
                    :sub-bottom="5"
                    :sub-left="5"
                    :sub-width="25"
                    :sub-height="25"
                ></image-element>
            </sub-elements>
        </geometry-element>

        <property-panel 
            v-if="openPanel" 
            v-model="value" 
            :img="imgSrc"
        ></property-panel>

        <vue-context-menu
            :elementId="value.elementView.id"
            :options="menuList"
            :ref="'vueSimpleContextMenu'"
            @option-clicked="optionClicked"
        ></vue-context-menu>
    </div>
</template>

<script>
    import Element from "../Kube-Element";
    import PropertyPanel from "./IngressPropertyPanel";

    export default {
        mixins: [Element],
        name: "ingress",
        components: {
            "property-panel": PropertyPanel,
        },
        props: {},
        computed: {
            defaultStyle() {
                return {};
            },
            className() {
                return "Ingress";
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ing.svg`;
            },
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: "",
                    namespace: "",
                    elementView: {
                        _type: this.className(),
                        id: elementId,
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        style: JSON.stringify({}),
                        angle: 0,
                    },
                    object: {
                        apiVersion: "extensions/v1beta1",
                        kind: "Ingress",
                        metadata: {
                            name: "",
                            annotations: {
                                "kubernetes.io/ingress.class": "nginx",
                            },
                        },
                        spec: {
                            rules: [],
                        },
                    },
                    outboundServices: [],
                    connectableType: [ "Service" ],
                    status: null,
                    relationComponent: "IngressToService",
                };
            },
            namespace: {
                get: function () {
                    return this.value.object.metadata.namespace;
                },
                set: function (newVal) {
                    this.value.object.metadata.namespace = newVal;
                },
            },
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch (e) {
                    return "Untitled";
                }
            },
            outboundServiceNames() {
                try {
                    var serviceNames = "";
                    this.value.outboundServices.forEach((element) => {
                        serviceNames += element.host + element.path + element.name + ",";
                    });
                    return serviceNames;
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        mounted: function () {
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if (obj.state == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    obj.element.targetElement.routeType = "path";
                    obj.element.targetElement.host = "";
                    obj.element.targetElement.path = "/";
                    me.value.outboundServices.push(obj.element.targetElement);
                }

                if (obj.state == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.outboundServices.splice(me.value.outboundServices.indexOf(obj.element.targetElement), 1);
                }
            });
        },
        watch: {
            outboundServiceNames(names) {
                var me = this;
                me.value.object.spec.rules = [];
                me.value.outboundServices.forEach((element) => {
                    me.setService(element);
                });
            },
        },
        methods: {
            setService(element) {
                var me = this;
                var obj = {};
                if(element.routeType = "path" && me.value.object.spec.rules.length > 0 && element.host == "") {
                    obj = {
                        path: element.path,
                        backend: {
                            serviceName: element.object.metadata.name,
                            servicePort: element.object.spec.ports[0].port,
                        }
                    }
                    me.value.object.spec.rules[0].http.paths.push(obj);
                } else {
                    obj = {
                        host: element.host,
                        http: {
                            paths: [{
                                path: element.path,
                                pathType: "Prefix",
                                backend: {
                                    serviceName: element.object.metadata.name,
                                    servicePort: element.object.spec.ports[0].port,
                                }
                            }]
                        },
                    };
                    me.value.object.spec.rules.push(obj);
                }
            }
        },
    };
</script>

<style>
</style>