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
                        'stroke': '#d0b4f1',
                        fill: '#d0b4f1',
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
                        :text="'HPA'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25">
                </image-element>
            </sub-elements>

            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes"
                    :element="value" :key="idx"
                    :image="connectableType.src"
                    :type="connectableType.component">
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
            @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import PropertyPanel from './HPAPanel'
    import ImageElement from "../../../opengraph/shape/ImageElement";

    export default {
        mixins: [Element],
        name: 'horizontalPodAutoscaler',
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
                return 'HorizontalPodAutoscaler'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/hpa.svg`
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
                        "apiVersion": "autoscaling/v2beta2",
                        "kind": "HorizontalPodAutoscaler",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "scaleTargetRef": {},
                            "minReplicas": 1,
                            "maxReplicas": 10,
                            "metrics": [
                                {
                                    "type": "Resource",
                                    "resource": {
                                        "name": "cpu",
                                        "target": {
                                            "type": "Utilization",
                                            "averageUtilization": 50
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    status: null,
                    outboundDeployment: null,
                    connectableType: ["Deployment", "ReplicaSet", "StatefulSet"],
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
            outboundDeploymentName() {
                try {
                    return this.value.outboundDeployment.object.metadata.name;
                } catch(e) {
                    return '';
                }
            }
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        mounted(){
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {

                if(obj.action=="addRelation" && obj.element && obj.element.targetElement 
                        && (obj.element.targetElement._type == "Deployment" 
                            || obj.element.targetElement._type == "ReplicaSet" 
                            || obj.element.targetElement._type == "StatefulSet")
                ) {
                    me.value.outboundDeployment = obj.element.targetElement
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement 
                        && (obj.element.targetElement._type == "Deployment" 
                            || obj.element.targetElement._type == "ReplicaSet" 
                            || obj.element.targetElement._type == "StatefulSet")
                ) {
                    me.value.outboundDeployment = null
                }

            })
        },
        watch: {
            outboundDeploymentName(val) {
                var me = this;
                if(val) {
                    me.value.object.spec.scaleTargetRef = {
                        'apiVersion': me.value.outboundDeployment.object.apiVersion,
                        'kind': me.value.outboundDeployment.object.kind,
                        'name': me.value.outboundDeployment.object.metadata.name
                    };
                } else {
                    delete me.value.object.spec.scaleTargetRef
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
            isConnected(to, from) {
                if(!from.connectableType) {
                    return false
                }
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                if(connectable) {
                    if(from.object.spec.scaleTargetRef.name == to.object.metadata.name) {
                        return true
                    }
                }
                return false
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
        }
    }
</script>
  
<style>

</style>