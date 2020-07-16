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

        <!--        <modeling-property-panel-->
        <!--                v-if="value.sourceElement._type != 'org.uengine.modeling.model.Policy'"-->
        <!--                v-model="value"-->
        <!--                :titleName="'Relation'"-->
        <!--        ></modeling-property-panel>-->
    </div>
</template>

<script>
    import Element from '../Kube-Element'

    export default {
        mixins: [Element],
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
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.Relation'
            },
            style_() {
                var style = {}
                if (this.value.targetElement._type == 'org.uengine.modeling.model.Policy') {
                    style = {
                        "arrow-end": "block",
                        'stroke-width': '1.3',
                        'stroke-dasharray': '- ',
                        'font-size': 20,
                    }
                } else if (this.value.targetElement._type == 'org.uengine.modeling.model.Command') {
                    style = {
                        "arrow-end": "block",
                        'font-size': 20,
                    }
                }
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
            }
        },
        data: function () {
            return {}
        },
        watch: {

        },
        mounted: function () {
            var me = this
            this.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
                /* Todo: Element가 삭제 되었을 때, 선도 삭제되는 로직 넣는 부분  */
                // if (obj.state == 'deleteEvent') {
                //     me.deleteRelation()
                // }
                // if (obj.state == 'deletePolicy') {
                //     me.deleteRelation()
                // }
                // if (obj.state == 'deleteCommand') {
                //     me.deleteRelation()
                // }
                // if (obj.state == 'delete' && obj.element._type == 'org.uengine.modeling.model.Relation') {
                //     me.deleteRelation()
                // }

                me.deleteRelation()
            })
            console.log(me.value.sourceElement)
            console.log(me.value.targetElement)
            if(me.value.sourceElement._type == 'Ingress') {
                /* Todo: Element Type 별 연결 체크 부분 */
            }


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
                    // console.log("deleteRelation")
                    //evnet, policy 쪽 정보 업데이트
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
