<template>
    <v-text-field v-model="value" :label="label" :disable="disable" :rules="rules" :hint="hint"/>
</template>

<script>
    export default {
        name: 'text-field',
        props: {
            value: String,
            label: String,
            rules: Array,
            hint: String,
            disable: Boolean
        },
        created(){
            if(!this.value){
                this.$emit('update:value', null);
            }
        },
        watch:{
            "value":function (newVal) {
                this.$emit('update:value', newVal)
            }
        }
    };
</script>