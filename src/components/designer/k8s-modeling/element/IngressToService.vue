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
                :titleName="'Ingress To Service'"
        ></relation-panel>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'
    import Panel from './IngressToServicePanel'

    export default {
        mixins: [Relation],
        name: 'IngressToService',
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
                return 'IngressToService'
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
                    path: "/",
                }
            },
            isOpen() {
                if (this.value.sourceElement._type == 'Ingress') {
                    return true
                }
                return false
            },
            name() {
                try {
                    return this.value.path
                } catch(e) {
                    return ''
                }
            },
        },
        data() {
            return {}
        },
        watch: {
            name(value) {
                this.value.name = value
            },
        },
        mounted() {
        },
        methods: {
        }
    }
</script>


<style>

</style>
