<template>
    <div v-if="!commandView">
        <div>
            <v-switch
                    v-model="isJson" class="justify-end"
                    style="padding:0 15px 0 0; margin:0; float:left;"
                    :label="isJson ? 'Yaml' : 'Json'"
            ></v-switch>
            <v-checkbox
                    v-model="autoFormat" 
                    @change="formatYaml"
                    label="Auto format"
            ></v-checkbox>
        </div>
        <v-card :disabled="readOnly">
            <MonacoEditor 
                    v-if="!isJson && autoFormat"
                    v-model="yamlText"
                    class="editor"
                    theme="vs-dark"
                    language="yaml"
            ></MonacoEditor>
            <MonacoEditor 
                    v-if="!isJson && !autoFormat"
                    v-model="tempText"
                    class="editor"
                    theme="vs-dark"
                    language="plaintext"
            ></MonacoEditor>
            <vue-json-editor
                    v-if="isJson"
                    v-model="value"
                    :expandedOnStart="true"
            ></vue-json-editor>
        </v-card>
    </div>
</template>


<script>
    import yaml from "js-yaml";
    import json2yaml from 'json2yaml'
    import vueJsonEditor from 'vue-json-editor';
    import MonacoEditor from 'vue-monaco';

    export default {
        name: 'kube-yaml-editor',
        props: {
            value: Object,
            commandView: Boolean,
            readOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            }
        },
        components: {
            vueJsonEditor,
            MonacoEditor,
        },
        computed: {
        },
        data: function () {
            return {
                yamlText: this.yamlFilter(json2yaml.stringify(this.value)),
                tempText: '',
                isJson: false,
                autoFormat: true,
            }
        },
        watch: {
            value: {
                deep: true,
                handler(val) {
                    this.yamlText = this.yamlFilter(json2yaml.stringify(val));
                }
            },
            yamlText: {
                deep: true,
                handler(val) {
                    var yamlData = yaml.load(val);
                    this.$emit("input", yamlData);
                }
            },
        },
        methods: {
            yamlFilter(val) {
                var me = this;
                let lines = val.split('\n');
                lines.splice(0, 1);
                for (let i in lines) {
                    lines[i] = lines[i].substring(2, lines[i].length);
                }
                val = lines.join('\n');
                val = val.replace(/ null/g, ' ');

                me.$EventBus.$emit('yamlText', val);
                return val;
            },
            formatYaml() {
                var me = this;
                if(me.autoFormat) {
                    var yamlData = yaml.load(me.tempText);
                    me.$emit("input", yamlData);
                    me.tempText = '';
                } else {
                    me.tempText = me.yamlText;
                }
            }
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss" scoped>
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }

    .editor {
        width: 370px;
        height: 100vh;
    }
</style>
