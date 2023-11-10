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
                    'stroke': '#4caf50',
                    fill: '#4caf50',
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

            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes" :key="idx"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component"
                    :customRelation="value.relationComponent">
            </k8s-sub-controller>
        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :validationLists="filteredElementValidationResults"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        >
        </property-panel>

        <vue-context-menu
                :elementId="value.elementView.id"
                :options="menuList"
                :ref="'vueSimpleContextMenu'"
                @option-clicked="optionClicked"
        ></vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
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
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace: '',
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
                    object: object ? object : {
                        apiVersion: "networking.k8s.io/v1",
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
                    connectableType: ["Service"],
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
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {

                    var duplicate = me.value.outboundServices.find(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    var duplicateIndex = me.value.outboundServices.findIndex(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    if (duplicate) {
                        // 재연결 및 업데이트 기능
                        obj.element.sourceElement = me.value
                        me.value.outboundServices[duplicateIndex] = obj.element.targetElement
                        me.value.outboundServices.__ob__.dep.notify();
                        return true
                    } else {
                        obj.element.targetElement.routeType = "path";
                        me.value.outboundServices.push(obj.element.targetElement);
                    }

                }

                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Service") {
                    me.value.outboundServices.splice(me.value.outboundServices.indexOf(obj.element.targetElement), 1);
                }
            });
        },
        watch: {
            'outboundServiceNames': {
                deep: true,
                handler: function(){
                    var me = this;
                    me.value.object.spec.rules = [];
                    me.value.outboundServices.forEach((element) => {
                        me.setService(element);
                    });
                }
            },
            "value": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                }, 200)
            },
        },
        methods: {
            setService(element) {
                var me = this;
                var obj = {};
                if (element.routeType = "path" && me.value.object.spec.rules.length > 0 && element.host == "") {
                    obj = {
                        path: element.path,
                        pathType: "Prefix",
                        backend: {
                            service: {
                                name: element.object.metadata.name,
                                port: {
                                    number: element.object.spec.ports[0].port
                                }
                            }
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
                                    service: {
                                        name: element.object.metadata.name,
                                        port: {
                                            number: element.object.spec.ports[0].port
                                        }
                                    }
                                }
                            }]
                        },
                    };
                    me.value.object.spec.rules.push(obj);
                }
            },
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(from.object.spec.rules.length > 1) {
                        res = from.object.spec.rules.some((rule) => {
                            if(rule.http.paths[0].backend.service.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(from.object.spec.rules.length == 1) {
                        res = from.object.spec.rules[0].http.paths.some((svc) => {
                            if(svc.backend.service.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    }
                }
                return res
            },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                this.$super(Element).validate()

                //Element
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }

                me.canvas.changedTemplateCode = true
            },
        },
    };
</script>

<style>
</style>