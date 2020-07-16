<template>
    <div>
        <v-text-field
                label="Image"
                v-model="value.spec.template.spec.containers[0].image"
        ></v-text-field>
        <number-field
                :label="'Target Port'"
                v-model="value.spec.template.spec.containers[0].ports[0].containerPort"
        ></number-field>
    </div>
</template>

<script>
    import NumberField from './NumberField'

    export default {
        name: 'v-number-field',
        props: {
            value: Object,
        },
        components: {
            "number-field": NumberField,
        },
        data: function () {
            return {
            }
        },
    }
</script>

<style>

</style>