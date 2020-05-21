<template>
    <div class="text-reader" style="max-width: 300px; text-align:center; margin-left: 10px; margin-top: 16px">
        <label for="ex_file">Upload</label>
        <input id="ex_file" type="file" @change="loadTextFromFile"/>
    </div>
</template>

<script>
    export default {
        name: 'text-reader',
        props: {
            importType: String,
            plainText: String,
            fileName: String
        },
        components: {},
        data() {
            return {
                single: ''
            }
        },

        beforeDestroy: function () {

        },
        mounted() {

        },

        watch: {},
        methods: {

            loadTextFromFile(ev) {
                // console.log(ev)
                if (this.importType == 'yaml') {
                    this.$emit('update:plainText', '')
                    const file = ev.target.files[0];
                    const reader = new FileReader();

                    // this.fileName = file.name;
                    this.$emit('update:fileName', file.name)
                    reader.onload = e => this.$emit("load", e.target.result);
                    reader.readAsText(file);
                } else if (this.importType == 'json') {
                    const file = ev.target.files[0];
                    this.$emit('update:fileName', file.name.replace('.json', ''))
                    const reader = new FileReader();
                    reader.onload = e => this.$emit("load", JSON.parse(e.target.result));
                    reader.readAsText(file);
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

</style>
