<template>
    <div>
        <edge-element
                v-if="isView"
                selectable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :moveable="!canvas.isReadOnlyModel"
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape(value)"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
        ></edge-element>

        <relation-panel
                v-if="propertyPanel"
                v-model="value"
                :titleName="'VirtualService To DestinationRule'"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></relation-panel>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'
    import Panel from './VirtualSeviceToDestinationRulePanel'

    export default {
        mixins: [Relation],
        name: 'VirtualserviceToDestinationrule',
        props: {},
        components: {
            'relation-panel': Panel,
        },
        created: function () {
            var me = this
            if (this.value && this.value.relationView) {
                this.value.from = this.value.relationView.from;
                this.value.to = this.value.relationView.to;
            }
            if (me.value.sourceElement && me.value.targetElement) {
                if (this.value.sourceElement._type == 'VirtualService' && this.value.targetElement._type == "DestinationRule") {
                    return false;
                }
                if (me.value.targetElement._type.includes("DestinationRuleSubset")) {
                    me.value.name = me.value.targetElement.routeType;
                    if(me.value.sourceElement.object.spec.http[0].route[me.value.targetElement.index]) {
                        me.value.name = 'weight ' + me.value.sourceElement.object.spec.http[0].route[me.value.targetElement.index].weight + '%'
                        me.value.targetElement.routeType = 'weight'
                        me.value.targetElement.weight = me.value.sourceElement.object.spec.http[0].route[me.value.targetElement.index].weight
                    }
                    if(me.value.name == null) {
                        me.value.name = "weight 100%";
                        me.value.targetElement.routeType = 'weight'
                        me.value.targetElement.weight = 100
                    }
                }
            }
        },
        computed: {
            className() {
                return 'VirtualserviceToDestinationrule'
            },
            style_() {
                var me = this
                var style = {}
                if (me.value.sourceElement && me.value.targetElement) {
                    if (!me.value.targetElement._type.includes("DestinationRuleSubset")) {
                        if(me.value.targetElement._type != "Service") {
                            style = {
                                'stroke-dasharray': '- '
                            }
                        }
                    }
                }
                return style
            },
            name() {
                var name = "";
                return name;
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    name: this.name(),
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    relationView: {
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none",
                        }),
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    sourceMultiplicity: 3,
                    targetMultiplicity: 3,
                    index: null,
                }
            },
        },
        data() {
            return {
            }
        },
        mounted() {
            var me = this;

            if (me.value.targetElement._type.includes("DestinationRuleSubset")) {
                var list = [];
                me.value.index = list.findIndex(function (el) {
                    return el.object.metadata.name == me.value.targetElement.object.metadata.name
                });
            }
        }
    }
</script>


<style>

</style>
