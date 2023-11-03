<template>
    <v-checkbox v-model="value" :label="label" />
</template>

<script>
    export default {
        name: 'text-field',
        props: {
            value: Boolean,
            label: String
        },
        created(){
            if(!this.value){
                this.$emit('update:value', false);
            }
        },
        watch:{
            "value":function (newVal) {
                this.$emit('update:value', newVal)
            }
        }
    };
</script>