<template>
    <v-dialog v-model="showDialog" max-width="600" @click:outside="participantClose()" style="overflow-y:hidden;">
        <v-card>
            <v-tabs
                    v-model="tab"
                    background-color="primary"
                    dark
            >
                <v-tab
                        v-for="item in items"
                        :key="item.tab"
                >
                    {{ item.tab }}
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <v-card flat>
                        <ModelCanvasParticipants
                                v-model="value"
                                :checkPublic="checkPublic"
                                :key="refreshKey"
                                @all="participantAll"
                                @apply="participantApply"
                                @close="participantClose"
                                @add="participantAdd"
                                @remove="participantRemove"
                        ></ModelCanvasParticipants>
                    </v-card>
                </v-tab-item>

                <v-tab-item>
                    <v-card flat>
                        <ModelCanvasShare
                                v-model="canvas"
                                :key="refreshKey"
                                :canvasComponentName="canvasComponentName"
                        ></ModelCanvasShare>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
    </v-dialog>
</template>

<script>
    import ModelCanvasParticipants from "./ModelCanvasParticipants";
    import ModelCanvasShare from "./ModelCanvasShare";
    export default {
        name: 'model-canvas-share-dialog',
        components: {
            ModelCanvasParticipants,
            ModelCanvasShare
        },
        props: {
            showDialog:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
            value: {
                type: Object,
                default: function () {
                    return null
                },
            },
            checkPublic: {
                type: Boolean,
                default: function () {
                    return false
                },
            },
            canvasComponentName: {
                type: String,
                default: function () {
                    return null
                },
            },
            canvas:{
                type: Object,
                default: function () {
                    return null
                },
            },
        },
        data() {
            return {
                refreshKey: 0,
                tab: 0,
                items: [
                    { tab: 'Participants'},
                    { tab: 'Url/ Image'},
                ],
            }
        },
        watch: {
            "showDialog":function (newVal,oldVal) {
                if(newVal){
                    //open
                    this.refreshKey++
                }
            },
        },
        methods: {
            participantClose(value){
                this.$emit('close',value)
            },
            participantAll(value){
                this.$emit('all', value)
            },
            participantApply(value){
                this.$emit('apply', value)
            },
            participantAdd(value){
                this.$emit('add', value)
            },
            participantRemove(value){
                this.$emit('remove', value)
            }
        },
    }
</script>