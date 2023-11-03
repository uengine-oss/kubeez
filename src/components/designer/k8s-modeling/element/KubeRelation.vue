<template>
    <div>
        <edge-element
                v-if="isView"
                selectable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :movable="!canvas.isReadOnlyModel"
                :vertices.sync="vertices"
                :id.sync="value.relationView.id"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:removeShape="onRemoveShape(value)"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
        ></edge-element>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'

    export default {
        mixins: [Relation],
        name: 'kube-relation',
        props: {},
        created: function () {
            var me = this

        },
        computed: {
            className() {
                return 'org.uengine.modeling.model.Relation'
            },
            style_() {
                var me = this
                var style = {}

                if (me.value.sourceElement && me.value.targetElement) {
                    if (!this.value.sourceElement.connectableType) {
                        style = {
                            'stroke-dasharray': '- '
                        }
                    } else if (!this.value.sourceElement.connectableType.includes(me.value.targetElement._type)) {
                        style = {
                            'stroke-dasharray': '- '
                        }
                    }
                }

                return style
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    name: '',
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
                    style: {}
                }
            },
        },
        data: function () {
            return {}
        },
        watch: {},
        mounted: function () {

        },
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
