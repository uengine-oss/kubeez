<template>
    <div>
        <geometry-element
                selectable
                movable
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
                v-on:addedToGroup="onAddedToGroup"
                v-on:dblclick="showDRulePanel"
                v-on:removeShape="beforeRemove(value); onRemoveShape(value)"
                :label.sync="name"
                :image.sync="refreshedImg"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }">

            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#F1A746',
                        fill: '#F1A746',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>
            
            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="5"
                        :text="'subset'">
                </text-element>
            </sub-elements>
            <k8s-sub-controller
                    v-for="(connectableType, index) in filterConnectionTypes"
                    :key="index"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component">
            </k8s-sub-controller>
        </geometry-element>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";

    export default {
        mixins: [Element],
        name: 'destinationRuleSubset',
        components: {},
        props: {},
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`
            },
            className() {
                return 'DestinationRuleSubset'
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    parentId: object ? object.elementView.id : '',
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
                    connectableType: ["Deployment", "Pod", "ReplicaSet"],
                    outboundElement: "",
                    routeType: null,
                    weight: null,
                    index: object ? (object.subsets).length : -1,
                    host: object ? object.object.spec.host : '',
                }
            },
            name() {
                try {
                    return this.value.name;
                } catch (e) {
                    return "Untitled";
                }
            },
            host() {
                try {
                    return this.value.host;
                } catch (e) {
                    return "";
                }
            }
        },
        data: function () {
            return {
            };
        },
        watch: {
        },
        created() {
        },
        mounted() {
            var me = this;
            
            var parentElement = me.canvas.value.elements[me.value.parentId];
            if (parentElement) {
                if (!parentElement.subsets.includes(me.value.elementView.id)) {
                    me.onRemoveShape(me.value);
                } else {
                    me.value.name = parentElement.object.spec.subsets[me.value.index].name;
                }
            }

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && 
                    (obj.element.targetElement._type == "Deployment" || obj.element.targetElement._type == "Pod" || obj.element.targetElement._type == "ReplicaSet")) {
                    me.value.outboundElement = obj.element.targetElement;
                    obj.element.targetElement.subsetId = obj.element.sourceElement.elementView.id;
                    this.$EventBus.$emit(`${me.value.parentId}`, obj);
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && 
                    (obj.element.targetElement._type == "Deployment" || obj.element.targetElement._type == "Pod" || obj.element.targetElement._type == "ReplicaSet")) {
                    me.value.outboundElement = null;
                    this.$EventBus.$emit(`${me.value.parentId}`, obj);
                }

                if(obj.action=="addRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "VirtualService") {
                    if(me.value.routeType == null && me.value.weight == null) {
                        me.value.routeType = ""
                        me.value.weight = 0
                    }
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "VirtualService") {
                    delete me.value.routeType;
                    delete me.value.weight;
                }
            })
        },
        methods: {
            deSelectedActivity: function () {
                var me = this;
                if (me.value) {
                    me.selected = false
                    me.openPanel = false

                    var obj = {
                        action: "closeProperty",
                        element: me.value
                    };
                    me.$EventBus.$emit(`${me.value.parentId}`, obj);
                }
            },
            beforeRemove(value) {
                var me = this;
                var obj = {
                    action: "deleteSubset",
                    element: value
                }
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            },
            showDRulePanel() {
                var me = this;
                var obj = {
                    action: "showProperty",
                    element: me.value
                };
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            },
            isConnected(to, from) {
                if(!from.connectableType) {
                    return false
                }
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(from.object.app == to.object.metadata.name) {
                        res = true
                    }
                }
                return res
            },
        },
    }
</script>

<style>

</style>