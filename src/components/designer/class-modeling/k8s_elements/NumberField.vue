<template>
    <v-text-field
        :label="label"
        v-model="numberVal"
        type="number"
    ></v-text-field>
</template>

<script>

    export default {
        name: 'v-number-field',
        props: {
            value: Number,
            label: String,
        },
        data: function () {
            return {
                numberVal: this.value
            }
        },
        computed: {
        },
        watch: {
            value() {
                this.numberVal = this.value
            },
            numberVal() {
                var num = Number(this.numberVal)
                this.$emit("input", num)
            }
        },
    }
</script>

<style>

</style>