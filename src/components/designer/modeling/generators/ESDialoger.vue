<template>
    <div style="margin-top: 10px;">
        <div class="auto-modeling-message-border">
            <v-col class="auto-modeling-message-box">
                <v-card class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.selectMessage1')]"
                                :typeSpeed="10"
                                :showCursor="false"
                                @onComplete="state.firstMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col class="auto-modeling-message-box">
                <v-card v-if="!state.firstMessageIsTyping" class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.selectMessage2')]"
                                :typeSpeed="5"
                                :showCursor="false"
                                @onComplete="state.secondMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
        </div>
        <v-card v-if="!state.secondMessageIsTyping" class="auto-modeling-user-story-card">
            <v-card-subtitle>{{$t('autoModeling.explanation')}}</v-card-subtitle>
            <v-card-text class="auto-modling-textarea">
                <v-textarea
                        v-model="value.userStory"
                        dense
                        auto-grow
                        rows="2"
                        solo
                >
                </v-textarea>
                <!--                <div-->
                <!--                    v-for="modelId in value.modelList"-->
                <!--                    :key="modelId"-->
                <!--                >-->
                <!--                    <v-btn x-small @click="jumpToModel(modelId)">{{ modelId }}</v-btn>    -->
                <!--                </div>-->
            </v-card-text>
            <v-card-actions v-if="done" class="auto-modeling-btn-box">
                <v-btn class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                <v-btn class="auto-modeling-btn" color="primary" @click="jump()">Create Model<v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon></v-btn>
            </v-card-actions>
            <v-card-actions v-else class="auto-modeling-btn-box">
                <v-btn class="auto-modeling-btn" @click="stop()"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop generating</v-btn>
            </v-card-actions>
        </v-card>
        <div
             class="auto-modeling-message-card"
             style="margin-top:25px; height: 100%; width: 20%;">
            <v-col v-if="value && value.modelList && value.modelList.length > 0"
                   style="height: 100%; align-items: center; margin: 2px; width: 100%;"
            >
                <div v-for="id in value.modelList" :key="id">
                    <jump-to-model-lists-card :id="id" path="storming" @deleteModel="deleteModel" ></jump-to-model-lists-card>
                </div>
            </v-col>
        </div>
    </div>

</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UserStoryGenerator.js'
    //import UserStoryGenerator from './UserStoryGenerator.js'
    import StorageBase from "../StorageBase";
    import getParent from '../../../../utils/getParent'

    export default {
        name: 'es-dialoger',
        mixins:[StorageBase],
        props: {
            value: Object,
            prompt: String,
            uiStyle: Object,
            cachedModels: Object,
            projectId: String,
        },
        components: {
            VueTypedJs
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        },
        created(){
            this.autoModel = getParent(this.$parent, 'auto-modeling-dialog');
            this.init()
        },
        watch: {
        },
        mounted(){
            var me = this;
            me.setUIStyle(me.uiStyle);
            this.generator = new Generator(this);
            me.generate();
        },
        data() {
            return {
                autoModel: null,
                state:{
                    generator: "EventOnlyESGenerator", // EventOnlyESGenerator
                    firstMessageIsTyping: true,
                    secondMessageIsTyping: true,
                    userStory: '',
                    communicationStyle: 'Choreography', // 'Orchestration'
                    aggregateDetail: false,
                    uiStyle: this.uiStyle
                },
                input:{
                    title: this.prompt,
                    separationPrinciple:  "Conway's Principle.", // "Business Capability" // "Infra Diversity" // "Per Persona",
                    businessModel: this.cachedModels["BMGenerator"]
                },
                done: false,
                generator: null,
            }
        },
        methods: {
            deleteModel(id){
                var me = this
                var index = me.value.modelList.findIndex(x => x == id)
                me.value.modelList.splice(index, 1)
                
                this.$emit("input", this.value);
                this.$emit("change", 'eventStorming');
            },
            setUIStyle(uiStyle){
                this.uiStyle = uiStyle;
            },
            init(){
                var me = this 
                if(!me.value){
                    me.value = {
                        userStory: '',
                    }
                } else {
                    me.done = true;
                }
            },

            onReceived(content){
                this.value.userStory = content;
            },

            async onGenerationFinished(){
                this.done = true;

                this.$emit("input", this.value);
                this.$emit("change", 'eventStorming');
                
            },  

            generate(){
                this.value.userStory = '';
                this.input.businessModel = this.cachedModels["BMGenerator"]

                this.generator.generate();
                this.state.startTemplateGenerate = true
                this.done = false;            
            },

            stop(){
                this.generator.stop();
                this.state.startTemplateGenerate = false
                this.done = true;
            },

            jump(){
                var me = this
                let uuid = me.uuid();
                if(!me.value.modelList){
                    me.value.modelList = []
                }
                me.value.modelList.push(uuid);

                me.$emit("input", me.value);
                me.$emit("change", 'eventStorming');

                me.state.userStory = me.value.userStory;
                let stateJson = JSON.stringify(me.state);
                localStorage["gen-state"] = stateJson;

                window.open(`/#/storming/${uuid}`, "_blank")
                // this.$router.push({path: `storming/${uuid}`});
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


        }
    }
</script>
<style>
</style>


