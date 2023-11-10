<template>
    <div>
        <edge-element
                v-if="isView"
                selectable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
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
                @close="closePanel"
                :readOnly="canvas.isReadOnlyModel"
                :titleName="'Ingress To Service'"
        ></relation-panel>
    </div>
</template>

<script>
    import Relation from '../RelationAbstract'
    import IngressToServicePanel from "./IngressToServicePanel";

    export default {
        mixins: [Relation],
        name: 'IngressToService',
        props: {},
        components: {
            "relation-panel": IngressToServicePanel,
        },
        created: function () {
            var me = this
            if (this.value && this.value.relationView) {
                this.value.from = this.value.relationView.from;
                this.value.to = this.value.relationView.to;
            }
            if(!me.value.name) {
                if(me.value.targetElement.object.metadata.name != '') {
                    var name = (me.value.targetElement.object.metadata.name).toLowerCase()
                    var lastChar = name.charAt(name.length - 1)
                    if (lastChar == 's') {
                        name += 'es'
                    } else if (lastChar == 'y') {
                        name = name.slice(0, -1) + 'ies'
                    } else {
                        name += 's'
                    }
                    me.value.targetElement.path = "/" + name;
                    me.value.name = me.value.targetElement.host + me.value.targetElement.path;
                }
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
                    return this.value.targetElement.host + this.value.targetElement.path
                } catch(e) {
                    return ''
                }
            },
        },
        data() {
            return {}
        },
        watch: {
            'name': {
                deep: true,
                handler: function(value) {
                    this.value.name = value;
                }
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
