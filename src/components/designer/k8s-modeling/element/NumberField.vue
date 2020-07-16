<template>
    <v-text-field
            :label="label"
            v-model="numberVal"
            type="number">
        <template v-slot:append-outer>
            <v-icon v-if="desDoc" small @click="openDoc(desDoc)">mdi-help-circle-outline</v-icon>
        </template>
    </v-text-field>
</template>

<script>

    export default {
        name: 'v-number-field',
        props: {
            value: Number,
            label: String,
            desDoc: String,
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
        methods: {
            openDoc(desDoc) {
                this.$emit('openDesDoc', desDoc)
            }
        }
    }
</script>

<style>

</style>