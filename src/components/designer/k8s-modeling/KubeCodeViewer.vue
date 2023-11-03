<template>
    <v-container>
        <v-card v-if="value[0]">
            <v-card-title v-if="value[0]">
                {{value[0].name}} 1
            </v-card-title>
            <v-card-text
                    id="scroll-target"
                    style="max-height: 600px;"
                    class="overflow-auto"
                    v-if="value[0].name.includes('.png')"
            >
                <v-img
                        :src='cmOption'
                        aspect-ratio="1"
                        class="grey lighten-2"
                        max-width="500"
                        max-height="300"
                ></v-img>
            </v-card-text>
            <v-card-text
                    id="scroll-target"
                    style="max-height: 600px;"
                    class="overflow-auto"
                    v-else-if="value[0].name.includes('.jpg')"
            >
                <v-img
                        :src='cmOption'
                        aspect-ratio="1"
                        class="grey lighten-2"
                        max-width="500"
                        max-height="300"
                ></v-img>
            </v-card-text>
            <v-card-text
                    id="scroll-target"
                    style="max-height: 600px;"
                    class="overflow-auto"
                    v-else
            >
                <codemirror
                        v-if="value[0]"
                        ref="codemirror"
                        :value="value[0].code"
                        :options="cmOption"
                        @ready="onCmReady"
                        @Focus="onCmFocus"
                        @input="onCmCodeChange"
                        height="700"
                        style="width: 580px;"
                >
                </codemirror>
            </v-card-text>
        </v-card>

    </v-container>
</template>
<script>
    import 'codemirror/mode/dockerfile/dockerfile'
    import 'codemirror/mode/markdown/markdown'
    import 'codemirror/mode/properties/properties'
    import 'codemirror/mode/shell/shell'
    import 'codemirror/mode/xml/xml'
    import 'codemirror/mode/python/python'

    import 'codemirror/mode/clike/clike'
    import 'codemirror/mode/yaml/yaml'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/darcula.css'

    export default {
        name: 'code-viewer',
        props: {
            value: Array
        },
        data() {
            return {
                // code: '',
                // offsetTop: 0,
            }
        },
        computed: {
            cmOption() {
                if (this.value.length > 0) {
                    if (this.value[0].name.includes('.java')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-java',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: true,
                            scrollbarStyle: null,
                            lineWiseCopyCut: true,


                        }
                    } else if (this.value[0].name.includes('.yml') || this.value[0].name.includes('.yaml')) {
                        var type = {
                            // autoCloseBrackets: true,
                            // tabSize: 4,
                            // lineNumbers: true,
                            // line: true,
                            // mode: 'text/x-java',
                            // theme: 'base16-light',
                            // lineWrapping: true,
                            // matchBrackets: true,
                            // scroll: true,
                            // readOnly: true,
                            // scrollbarStyle: null,
                            // lineWiseCopyCut:true,
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-yaml',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: true,
                            lineWiseCopyCut: true,
                        }
                    } else if (this.value[0].name.includes('.md')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-markdown',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('.properties')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-properties',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('mvnw')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-sh',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('.xml')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'application/xml',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('Dockerfile')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-dockerfile',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }

                    } else if (this.value[0].name.includes('.json')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'application/json',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('.py')) {
                        var type = {
                            autoCloseBrackets: true,
                            tabSize: 4,
                            lineNumbers: true,
                            line: true,
                            mode: 'text/x-python',
                            theme: 'darcula',
                            lineWrapping: true,
                            matchBrackets: true,
                            scroll: true,
                            readOnly: 'nocursor'
                        }
                    } else if (this.value[0].name.includes('.png') || this.value[0].name.includes('.jpg') || this.value[0].name.includes('.jpeg')) {

                        var type = `data:image/png;base64,${this.value[0].code}`
                        // console.log(type)
                        // console.log(this.value[0])
                    } else if (this.value[0].name.includes('.jpg') || this.value[0].name.includes('.jpeg')) {
                        var type = `data:image/jpg;base64,${this.value[0].code}`
                    }
                    return type
                }
            },
        },
        watch: {},
        methods: {
            onScroll(e) {
                // this.offsetTop = e.target.scrollTop
            },
            onCmReady(cm) {
                // // console.log('the editor is readied!', cm)

            },
            onCmFocus(cm) {
                // // console.log('the editor is focus!', cm)
            },
            onCmCodeChange(newCode) {
                // // console.log('this is new code', newCode)
                // this.code = newCode
            },
        },
        mounted() {
        },
        beforeDestroy() {
        }
    }
</script>
<style>
    .CodeMirror {
        height: auto;
    }
</style>
