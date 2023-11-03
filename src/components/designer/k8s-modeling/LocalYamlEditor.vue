<template>
    <div>
        <v-switch
                v-model="isJson"
                class="justify-end" 
                dense
                style="padding:0; margin:0; height:30px; padding-right:15px;"
                :label="isJson ? 'Json' : 'Yaml'"
        ></v-switch>
        <v-card :disabled="readOnly">
            <codemirror
                    v-if="!isJson"
                    v-model="yamlText"
                    ref="myCm"
                    :options="{
                        theme: 'darcula',
                        lineNumbers: true,
                        lineWrapping: true,
                    }"
                    style="width: 100%; height: 100%;"
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
    import vueJsonEditor from 'vue-json-editor';
    import { codemirror } from "vue-codemirror";

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
                isJson: false,
            }
        },
        watch: {
            value: {
                deep: true,
                handler(newVal) {
                    this.yamlText = newVal
                }
            },
            yamlText: {
                handler(newVal) {
                    this.$emit('input', newVal)
                }
            },
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
