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
                    v-model="temp_text"
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

    // import 'codemirror/mode/yaml/yaml'
    // import 'codemirror/lib/codemirror.css'
    // import 'codemirror/theme/base16-light.css'

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
            // codemirror: function () {
            //     return this.$refs.myCm.codemirror;
            // },
        },
        data: function () {
            return {
                yamlText: this.yamlFilter(json2yaml.stringify(this.value)),
                // cursor_pos: '',
                temp_text: '',
                isJson: false,
                autoFormat: true,
            }
        },
        watch: {
            value: {
                deep: true,
                handler: function () {
                    this.yamlText = this.yamlFilter(json2yaml.stringify(this.value));
                }
            },
            yamlText: {
                deep: true,
                handler: function () {
                    var me = this
                    // try {
                    //     me.cursor_pos = me.codemirror.getCursor("start")
                    //     this.$nextTick(function () {
                    //         me.codemirror.setCursor(me.cursor_pos)
                    //         me.codemirror.refreshImg()
                    //     });
                    // } catch (e) {
                    // }
                    var some = yaml.load(me.yamlText);
                    me.$emit("input", some);
                }
            }

        },
        methods: {
            yamlFilter(yaml_text) {
                var me = this

                let lines = yaml_text.split('\n');
                lines.splice(0, 1);
                for (let i in lines) {
                    lines[i] = lines[i].substring(2, lines[i].length);
                }
                yaml_text = lines.join('\n');
                yaml_text = yaml_text.replace(/ null/g, ' ');

                me.$EventBus.$emit('yamlText', yaml_text)
                return yaml_text;
            },
            formatYaml() {
                var me = this;
                if(me.autoFormat) {
                    var some = yaml.load(me.temp_text);
                    me.$emit("input", some);
                    me.temp_text = '';
                } else {
                    me.temp_text = me.yamlText;
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
