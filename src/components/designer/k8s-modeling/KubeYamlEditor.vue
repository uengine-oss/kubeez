<template>
    <div>
        <v-switch 
            v-model="isJson" class="justify-end" dense
            style="padding:0; margin:0; height:30px; padding-right:15px;" 
            :label="isJson ? 'Json' : 'Yaml'"
        ></v-switch>
        <codemirror
            v-if="!isJson"
            ref="myCm"
            :options="{
                theme: 'darcula',
                lineNumbers: true,
                lineWrapping: true,
            }"
            v-model="yamlText"
        ></codemirror>
        <vue-json-editor
            v-else
            v-model="value"
            :expandedOnStart="true"
        ></vue-json-editor>
    </div>
</template>


<script>
    import yaml from "js-yaml";
    import json2yaml from 'json2yaml'
    import vueJsonEditor from 'vue-json-editor';

    import {codemirror} from "vue-codemirror";


    export default {
        name: 'yaml-editor',
        props: {
            value: Object
        },
        components: {
            codemirror,
            vueJsonEditor,
        },
        computed: {
            codemirror: function () {
                return this.$refs.myCm.codemirror;
            },
        },
        data: function () {
            return {
                yamlText: json2yaml.stringify(this.value),
                cursor_pos: '',
                temp_text: '',
                isJson: false,
            }
        },
        watch: {
            value: {
                deep: true,
                handler: function () {
                    this.yamlText = json2yaml.stringify(this.value)
                }
            },
            yamlText: {
                deep: true,
                handler: function () {
                    var me = this
                    try {
                        me.temp_text = me.yamlText
                        me.cursor_pos = me.codemirror.getCursor("start")
                        this.$nextTick(function () {
                            me.codemirror.setCursor(me.cursor_pos)
                            me.codemirror.refresh()
                        });
                    } catch (e) {
                    }
                    var some = yaml.load(this.yamlText);
                    this.$emit("input", some);
                }
            }

        },
        methods: {}
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

    .vue-codemirror {
        width: 370px;
    }
</style>
