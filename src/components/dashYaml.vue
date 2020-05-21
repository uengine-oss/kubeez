<template>
    <div class="text-reader" style="text-align:center; margin: 10px">
        <input type="file" @change="loadTextFromFile"/>
        <!--<v-text-field v-else-if="item.ui_type=='number'"-->
                      <!--v-model="item.val" @focus="onUiFocus()"-->
                      <!--type="file"-->
                      <!--:label='item.ui_name'-->
        <!--&gt;</v-text-field>-->
    </div>
</template>

<script>
    export default {
        name: 'dashYaml',
        props: {
            plainText: String,
            fileName: String
        },
        components: {

        },
        data() {
            return {
                single: ''
            }
        },

        beforeDestroy: function () {

        },
        mounted() {

        },

        watch: {

        },
        methods: {
            loadTextFromFile(ev) {

                this.$emit('update:plainText', '')

                const file = ev.target.files[0];
                const reader = new FileReader();

                // this.fileName = file.name;
                this.$emit('update:fileName', file.name)
                reader.onload = e => this.$emit("load", e.target.result);
                reader.readAsText(file);
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
