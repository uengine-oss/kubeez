<template>
    <codemirror
            ref="myCm"
            :options="{
                theme: 'darcula',
                lineNumbers: true,
                lineWrapping: true,
            }"
            v-model="yamlText"
            :class="isEdit ? 'edit' : 'default'"
            @focus="isEdit = true"
            @blur="isEdit = false"
    ></codemirror>
</template>


<script>
    import yaml from "js-yaml";
    import json2yaml from 'json2yaml'

    import {codemirror} from "vue-codemirror";


    export default {
        name: 'yaml-editor',
        props: {
            value: Object
        },
        components: {
            codemirror
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
                isEdit: false,
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


<style lang="scss" rel="stylesheet/scss">
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

    .vue-codemirror.default {
        width: 280px;
        transform: scale(0.8) translate(0%, -5%);
    }
    .vue-codemirror.edit {
        width: 400px;
    }
</style>
