<template>
    <div>
        <edge-element
                v-if="isView"
                selectable
                connectable
                deletable
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:dblclick="showProperty"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape(value)"
        >
        </edge-element>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'

    export default {
        mixins: [Relation],
        name: 'kube-relation',
        props: {
            value: Object
        },
        created: function () {
            var me = this
            if (this.value && this.value.relationView) {
                this.value.from = this.value.relationView.from;
                this.value.to = this.value.relationView.to;
            }
        },
        computed: {
            className() {
                return 'org.uengine.modeling.model.Relation'
            },
            style_() {
                var style = {}
                return style
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    name: '',
                    // relationKey: '',
                    // relationValue: '',
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    // checkValue: false,
                    // selected: false,
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
                    // drawer: false
                }
            },
        },
        data: function () {
            return {}
        },
        watch: {
        },
        mounted: function () {
        },
        methods: {
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
