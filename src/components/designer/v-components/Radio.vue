<template>
    <v-radio-group
            v-model="value"
            :column="column"
    >
        <v-radio
                v-for="key in Object.keys(items)"
                :key="key"
                :label="key"
                :value="items[key]"
        ></v-radio>
    </v-radio-group>
</template>


<script>
    export default {
        name: 'radio',
        props: {
            value: String,
            column: Boolean,
            items: Object,
        },
        created(){
            if(!this.value){
                var firstKey = Object.keys(this.items)[0];
                this.$emit('update:value', this.items[firstKey]);
            }
        },
        watch:{
            "value":function (newVal) {
                this.$emit('update:value', newVal)
            }
        }
    };
</script>