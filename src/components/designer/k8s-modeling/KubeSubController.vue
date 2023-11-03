<template>
    <div>
        <sub-controller
                :image="setImage(image)"
                cloneable
                v-on:clone="edgeAndElement"
        >
            <circle-element :width="100" :height="100"></circle-element>
        </sub-controller>
    </div>
</template>

<script>
    import SubElements from "../../opengraph/shape/SubElements";

    export default {
        name: 'k8s-sub-controller',
        components: {SubElements},
        props: {
            type: String,
            element: Object,
            image: String,
            customRelation: String,
        },
        created() {
            var me = this
            me.modelCanvasComponent = me.getComponent('kubernetes-model-canvas')
            me.canvas = me.getComponent('kubernetes-model-canvas')
        },
        computed: {},
        data: function () {
            return {
                modelCanvasComponent: null,
                canvas: null
            }
        },
        watch: {},
        mounted: function () {
        },
        methods: {
            edgeAndElement: function (edgeElement, sourceElement, targetElement) {
                var me = this
                if (me.type) {
                    me.createEdgeAndElement(edgeElement, sourceElement, targetElement, me.type);
                }
            },
            createEdgeAndElement: function (edgeElement, sourceElement, targetElement, componentName) {
                var me = this

                let boundary = targetElement.shape.geom.getBoundary();
                var targetInfo = {
                    x: boundary.getCentroid().x,
                    y: boundary.getCentroid().y,
                    width: boundary.getWidth(),
                    height: boundary.getHeight(),
                    component: componentName
                }

                if (me.canvas) {
                    //make element
                    var targetValue = me.canvas.addElement(targetInfo);
                    me.canvas.canvas.removeShape(targetElement);

                    //make relation
                    me.customConnectShape(edgeElement, sourceElement, targetValue);
                }

            },
            customConnectShape: function (edge, from, toValue) {
                var me = this;

                if (edge && from && toValue) {
                    var vertices = '[' + edge.shape.geom.vertices.toString() + ']';

                    var sourceComponent = from.$parent ? from.$parent : from
                    var sourceValue = sourceComponent.value ? sourceComponent.value : sourceComponent
                    var relationComponent = me.customRelation ? me.customRelation : 'kube-relation'

                    var componentInfo = {
                        component: relationComponent,
                        sourceElement: sourceValue,
                        targetElement: toValue,
                        vertices: vertices,
                        isRelation: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }

                    me.$nextTick(() => {
                        if (toValue._type === "DestinationRule") {
                            var elId = toValue.subsets[0];
                            var elValue = me.canvas.value.elements[elId];
                            componentInfo.targetElement = elValue;
                        }

                        me.canvas.addElement(componentInfo, null, true);
                    })
                }
            },
            setImage(path) {
                var splitPath = path.split('kubernetes/')
                var lastIndex = splitPath.length - 1

                return 'kubernetes/' + splitPath[lastIndex]
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
    .ui-draggable-handle {
        -ms-touch-action: none;
        touch-action: none;
    }
</style>

