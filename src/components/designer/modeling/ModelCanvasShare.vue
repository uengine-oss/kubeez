<template>
    <v-card>
        <v-card-text>
            <v-card>
                <v-card-subtitle style="font-size: large; color: cornflowerblue;">
                    URL
                    <v-btn icon small @click="copyUrl()" style="align-self: start;">
                        <v-icon small> mdi-content-copy</v-icon>
                    </v-btn>
                </v-card-subtitle>
                <v-card-text
                        @click="copyUrl()"
                >{{modelUrl}}</v-card-text>
            </v-card>
        </v-card-text>
        <v-card-text>
            <v-card>
                <v-card-subtitle style="font-size: large; color: cornflowerblue;">
                    IMAGE
                    <v-btn icon small @click="copyImage()" style="align-self: start;">
                        <v-icon small> mdi-content-copy</v-icon>
                    </v-btn>
                </v-card-subtitle>
                <v-card-text>
                    <v-img
                            style="cursor: pointer;"
                            :src="screenshot"
                            max-width="800"
                            max-height="300"
                            @click="copyImage()"
                    ></v-img>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'model-canvas-share',
        components: {},
        props: {
            // canvas
            value:{
                type: Object,
                default: null
            },
            canvasComponentName:{
                type: String,
                default: null
            },
        },
        data() {
            return {
                modelCanvasComponent: null,
                image: null
            }
        },
        watch: {},
        computed: {
            canvas(){
              return this.value
            },
            modelUrl(){
                return `${window.location.protocol}//${window.location.hostname}/${window.location.hash}`
            },
            screenshot(){
              return this.image
            },

        },
        methods: {
            copyUrl(){
                this.copyClipboard(this.modelUrl)
            },
            copyImage(){
                this.copyClipboard(this.screenshot)
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            copyClipboard(value){
                window.navigator.clipboard.writeText(value).then(() => {
                    this.$EventBus.$emit('snackbar', {show :true, text : 'Copied to clipboard!', timeout: 1000 ,bottom: true })
                });
            }
        },
        created() {
            var me = this

            try {
                me.modelCanvasComponent = me.getComponent(me.canvasComponentName)
                me.canvas = me.getComponent(me.canvasComponentName)
                me.canvas.$refs['modeler-image-generator'].save(null, me.canvas).then(async function (resolve) {
                    me.image = resolve
                })
            } catch (e) {

            }


        }
    }
</script>