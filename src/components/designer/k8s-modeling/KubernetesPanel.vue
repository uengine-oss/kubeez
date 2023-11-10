<template>
</template>

<script>
    import ModelPanel from "../modeling/ModelPanel";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [ModelPanel],
        name: 'kubernetes-panel',
        props: {
            readOnly: Boolean,
            // value: Object,
            img: String,
            validationLists:{
                type: Array,
                default: function () {
                    return []
                }
            },
        },
        data: function () {
            return {
                modelCanvasComponent: null,
                openValidationLists:false,
                validationLevelIcon:
                    {
                      'error' : {icon: 'mdi-close-circle-outline', color:'#E53935'},
                      'warning' : {icon: 'mdi-alert-outline', color:'#FFA726'},
                      'info' : {icon: 'mdi-information-outline', color:'#29B6F6'},
                    },
            }
        },
        created: function () {
            var me = this;
            if(!me.canvas.embedded) {
                me.panelInit()
            }
        },
        beforeDestroy() {
            this.executeBeforeDestroy()
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.modelCanvasComponent = me.getComponent('kubernetes-model-canvas')
                me.canvas = me.getComponent('kubernetes-model-canvas')
            },
            closePanel() {
                this.$emit('close')
            },
            desDocOpen() {
            },
            panelInit() {
                try {
                    var me = this
                
                    if ( !me.canvas.embedded ) {
                        me.panelOpenAction()
                    }
                } catch (e) {
                    console.log('[Error] Kubernetes Panel Init: ', e)
                }

            },
            executeBeforeDestroy(){
                var me = this
                try{
                    /*
                        _value : 기존 값.
                        value  : Panel 사용되는 값,
                    */
                    var diff = jsondiffpatch.diff(me._value, me.value)
                    if (diff) {
                        if (!me.readOnly) {
                            me.canvas.changedByMe = true;

                            // all sync
                            Object.keys(me.value).forEach(function (itemKey) {
                                if(!(itemKey == 'elementView' || itemKey == 'relationView')) {
                                    // Exception: 위치정보
                                    me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]));
                                }
                            })

                            // re setting 값을 emit
                            me.$emit('_value-change', me._value);
                        }
                    }
                }catch (e) {
                    alert('[Error] Kubernetes Model Panel Sync: ', e)
                }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
