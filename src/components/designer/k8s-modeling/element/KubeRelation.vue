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

        <!--        <uml-property-panel-->
        <!--            v-if="value.sourceElement._type == 'org.uengine.uml.model.Class'"-->
        <!--            v-model="value"-->
        <!--            :titleName="'uml-Relation'"-->
        <!--        ></uml-property-panel>-->

        <relation-panel
                v-if="openPanel && isOpen"
                v-model="value"
                :titleName="'Relation'"
        ></relation-panel>
    </div>
</template>

<script>
    import Element from '../Kube-Element'
    import Panel from './KubeRelationPanel'

    export default {
        mixins: [Element],
        name: 'kube-relation',
        components: {
            "relation-panel": Panel
        },
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
            defaultStyle() {
                return {}
            },
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
            vertices: {
                get: function () {
                    var style;
                    try {
                        return JSON.parse(this.value.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.relationView.value = JSON.stringify(val);
                }
            },
            isView () {
                var me = this
                if (me.value.sourceElement._type != me.value.targetElement._type) {
                    return true
                } else {
                    return false
                }
            },
            isOpen() {
                var me = this
                if (me.value.sourceElement._type == 'VirtualService' && me.value.targetElement._type == 'DestinationRule') {
                    return true
                }
                return false
            }
        },
        data: function () {
            return {}
        },
        watch: {
        },
        mounted: function () {
            var me = this
            console.log(me.value)
            me.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
                if (obj.state == 'delete' && obj.element._type == 'org.uengine.modeling.model.Relation') {
                    me.deleteRelation()
                }

            })

            var obj = {
                state: "addRelation",
                element: me.value
            }
            me.$EventBus.$emit(me.value.sourceElement.elementView.id, obj)
            me.$EventBus.$emit(me.value.targetElement.elementView.id, obj)

        },
        methods: {
            deleteRelation() {
                var me = this

                return new Promise(function (resolve) {
                    me.$EventBus.$off(`${me.value.relationView.id}`);

                    var obj = {
                        state: "deleteRelation",
                        element: me.value
                    }
                    if (me.value.from) {
                        me.$EventBus.$emit(me.value.from, obj)
                    }
                    if (me.value.to) {
                        me.$EventBus.$emit(me.value.to, obj)
                    }

                    me.$emit('update:value', null);
                    resolve()
                })
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
