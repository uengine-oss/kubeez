<template>
    <div>
        <v-text-field
                label="Image"
                :disabled="readOnly"
                v-model="value.spec.template.spec.containers[0].image"
        ></v-text-field>
        <kube-number-field
                :label="'Target Port'"
                :readOnly="readOnly"
                v-model="value.spec.template.spec.containers[0].ports[0].containerPort"
        ></kube-number-field>
    </div>
</template>

<script>

    export default {
        name: 'kube-template-field',
        props: {
            value: Object,
            readOnly:{
                type:Boolean,
                default:function () {
                    return false
                }
            }
        },
        data: function () {
            return {
            }
        },
    }
</script>

<style>

</style>