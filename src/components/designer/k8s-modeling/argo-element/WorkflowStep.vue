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
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:labelChanged="onLabelChanged"
                v-on:addedToGroup="onAddedToGroup"
                v-on:dblclick="showWorkflowPanel"
                v-on:removeShape="beforeRemove(value); onRemoveShape(value)"
                :label.sync="name"
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
                        'stroke': '#98cbff',
                        fill: '#98cbff',
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
                        :text="value.name">
                </text-element>
            </sub-elements>
        </geometry-element>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";

    export default {
        mixins: [Element],
        name: 'workflowStep',
        components: {},
        props: {},
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            className() {
                return 'WorkflowStep'
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: "",
                    parentId: object ? object.elementView.id : "",
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
                    object: {
                        "name": "",
                        "template": "",
                        "arguments": {
                            "parameters": []
                        }
                    },
                    index: object ? object.steps.length : -1,
                }
            },
            name() {
                try {
                    return this.value.object.name;
                } catch (e) {
                    return "Untitled";
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

            var parentElement = me.canvas.value.elements[me.value.parentId];
            if (parentElement) {
                if (!parentElement.steps.includes(me.value.elementView.id)) {
                    me.onRemoveShape(me.value);
                }  else {
                    me.value.name = parentElement.object.spec.templates[0].steps[me.value.index].name;
                }
            }
        },
        watch: {
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
                    action: "deleteStep",
                    element: value
                }
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            },
            showWorkflowPanel() {
                var me = this;
                var obj = {
                    action: "showProperty",
                    element: me.value
                };
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            }
        },
    }
</script>

<style>

</style>