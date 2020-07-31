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
        ></edge-element>

        <relation-panel
                v-if="openPanel && isOpen"
                v-model="value"
                :titleName="'VirtualService To DestinationRule'"
        ></relation-panel>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'
    import Panel from './VirtualSeviceToDestinationRulePanel'

    export default {
        mixins: [Relation],
        name: 'virtualservice-to-destinationrule',
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
                    routeType: 'weight',
                    weight: 0,
                }
            },
            isOpen() {
                if (this.value.sourceElement._type == 'VirtualService') {
                    return true
                }
                return false
            },
            name() {
                if(this.value.routeType == 'weight') {
                    return this.value.routeType + "\n" + this.value.weight + "%";
                } else if(this.value.routeType == 'mirror') {
                    return this.value.routeType
                }
            },
        },
        data() {
            return {
            }
        },
        watch: {
            name(value) {
                this.value.name = value
            },
            routeType() {
                try {
                    return this.value.weight
                } catch(e) {
                    return ""
                }
            }
        },
        mounted() {
        },
        methods: {

        }
    }
</script>


<style>

</style>
