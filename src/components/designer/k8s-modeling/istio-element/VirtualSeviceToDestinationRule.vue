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
        },
        computed: {
            className() {
                return 'VirtualserviceToDestinationrule'
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
                    index: null,
                }
            },
            isOpen() {
                if (this.value.sourceElement._type == 'VirtualService') {
                    return true
                }
                return false
            },
        },
        data() {
            return {
            }
        },
        watch: {
            // name(value) {
            //     this.value.name = value
            // },
        },
        mounted() {
            var me = this;
            var list = [];
            if(me.value.targetElement._type == "DestinationRule") {
                list = me.value.sourceElement.outboundDestinationRules
            } else {
                list = me.value.sourceElement.outboundServices
            }
            me.value.index = list.findIndex(function (el) {
                return el.object.metadata.name == me.value.targetElement.object.metadata.name
            })
        },
        methods: {

        }
    }
</script>


<style>

</style>
