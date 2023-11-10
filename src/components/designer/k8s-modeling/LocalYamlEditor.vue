<template>
    <div>
        <v-switch
                v-model="isJson" class="justify-end" dense
                style="padding:0; margin:0; height:30px; padding-right:15px;"
                :label="isJson ? 'Json' : 'Yaml'"
        ></v-switch>
        <v-card :disabled="readOnly">
            <codemirror
                    style="width: 100%; height: 100%;"
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
        </v-card>
    </div>
</template>


<script>
    import yaml from "js-yaml";
    import json2yaml from 'json2yaml'
    import vueJsonEditor from 'vue-json-editor';

    import {codemirror} from "vue-codemirror";


    export default {
        name: 'local-yaml-editor',
        props: {
            value: String,
            readOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            }
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
                yamlText: "",
                cursor_pos: '',
                temp_text: '',
                isJson: false,
            }
        },
        watch: {
            value: {
                deep: true,
                handler: function () {
                    this.yamlText = this.value
                    // this.$emit('input', this.)
                }
            },
            yamlText: {
                 handler: function (newVal) {
                    // this.yamlText = this.value
                    this.$emit('input', newVal)
                }
            }
            // yamlText: {
            //     deep: true,
            //     handler: function () {
            //         var me = this
            //         try {
            //             me.temp_text = me.yamlText
            //             me.cursor_pos = me.codemirror.getCursor("start")
            //             this.$nextTick(function () {
            //                 me.codemirror.setCursor(me.cursor_pos)
            //                 me.codemirror.refresh()
            //             });
            //         } catch (e) {
            //         }
            //         var some = yaml.load(this.yamlText);
            //         this.$emit("input", some);
            //     }
            // }

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
