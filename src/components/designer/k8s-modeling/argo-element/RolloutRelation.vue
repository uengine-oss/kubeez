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
                :titleName="'Rollout'"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></relation-panel>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'
    import Panel from './RolloutRelationPanel'

    export default {
        mixins: [Relation],
        name: 'RolloutRelation',
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
            if (me.value.targetElement._type == "VirtualService") {
                me.value.name = ''
                me.value.version = ''
            }
            if (me.value.targetElement._type.includes("DestinationRuleSubset")) {
                if(me.value.sourceElement.object.spec.strategy.canary.trafficRouting.istio.destinationRule.canarySubsetName == me.value.targetElement.name) {
                    me.value.name = 'canary'
                    me.value.version = 'canary'
                } else if(me.value.sourceElement.object.spec.strategy.canary.trafficRouting.istio.destinationRule.stableSubsetName == me.value.targetElement.name) {
                    me.value.name = 'stable'
                    me.value.version = 'stable'
                }
            }
        },
        computed: {
            className() {
                return 'RolloutRelation'
            },
            style_() {
                var me = this
                var style = {}
                if (me.value.sourceElement && me.value.targetElement) {
                    if (!me.value.targetElement._type.includes("DestinationRuleSubset")) {
                        if (!me.value.targetElement._type == "VirtualService") {
                            style = {
                                'stroke-dasharray': '- '
                            }
                        }
                    }
                }
                return style
            },
            name() {
                return this.value.version;
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    name: "",
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
                    version: '',
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

                if(me.value.sourceElement.object.spec.strategy.canary.trafficRouting.istio.destinationRule.canarySubsetName == me.value.targetElement.name) {
                    me.value.name = 'canary'
                    me.value.version = 'canary'
                } else if(me.value.sourceElement.object.spec.strategy.canary.trafficRouting.istio.destinationRule.stableSubsetName == me.value.targetElement.name) {
                    me.value.name = 'stable'
                    me.value.version = 'stable'
                }
            }
        },
        watch: {
            name(val) {
                this.value.name = val;
            }
        }
    }
</script>


<style>

</style>
