<template>
</template>

<script>
    import Element from './KubernetesElement'

    export default {
        mixins: [Element],
        name: 'relation-abstract',
        props: { },
        created: function () {
            var me = this
        },
        computed: {
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
                    var me = this
                    me.value.relationView.value = JSON.stringify(val)
                    var type = me.value.targetElement._type
                    var name = me.value.targetElement.name ? me.value.targetElement.name : me.value.targetElement.object.metadata.name
                    var key = 'msaez.io/' + type + '_' + name
                    if(!me.canvas.embedded && me.value.sourceElement.object.metadata.annotations && name != '') {
                        me.value.sourceElement.object.metadata.annotations[key] = JSON.stringify(val)
                    }
                }
            },
            isView () {
                var me = this
                // if (me.value.sourceElement._type != me.value.targetElement._type) {
                    return true
                // } else {
                //     return false
                // }
            },
        },
        data: function () {
            return {}
        },
        watch: {
        },
        mounted: function () {
            var me = this

            me.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
                if (obj.action == 'delete' && obj.element.relationView) {
                    me.deleteRelation()
                }
            })

            //재설정
            if (me.value && me.value.relationView) {
                me.value.from = me.value.relationView.from;
                me.value.to = me.value.relationView.to;
                me.value.sourceElement =   me.canvas.$refs[me.value.from][0].value
                me.value.targetElement =  me.canvas.$refs[me.value.to][0].value
            }

            var obj = {
                action: "addRelation",
                element: me.value
            }

            me.$EventBus.$emit(`${me.value.from}`, obj)
            me.$EventBus.$emit(`${me.value.to}`, obj)

            // me.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
            //     if (obj.action == 'delete' && obj.element.relationView) {
            //         me.deleteRelation()
            //     }
            // })
            //
            // var obj = {
            //     action: "addRelation",
            //     element: me.value
            // }
            // me.$EventBus.$emit(me.value.sourceElement.elementView.id, obj)
            // me.$EventBus.$emit(me.value.targetElement.elementView.id, obj)
            //
            // if (me.value && me.value.relationView) {
            //     me.value.from = me.value.relationView.from;
            //     me.value.to = me.value.relationView.to;
            // }

        },
        methods: {
            deleteRelation() {
                var me = this

                return new Promise(function (resolve) {

                    var obj = {
                        action: "deleteRelation",
                        element: me.value
                    }
                    if (me.value.from) {
                        me.$EventBus.$emit(me.value.from, obj)
                    }
                    if (me.value.to) {
                        me.$EventBus.$emit(me.value.to, obj)
                    }

                    // me.$emit('update:value', null);
                    resolve()
                })
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
