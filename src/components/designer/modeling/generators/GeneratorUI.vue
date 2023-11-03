<template>
    <div v-if="input && modelCreationCompleted" >
     <v-row style="position:absolute; right:30px; top:75px;">
        <v-card style="text-align: center; z-index: 2;" width="auto">
            <v-card-text :style="(isExpanded && generationStopped) ? { width: '70px' } : isExpanded ? { width: '160px' } : { width: '400px' }" 
                style="padding: 0px; ">
                <v-progress-linear  :indeterminate="generationStopped" v-if="generationStopped"
                    style="margin-top: 10px; pointer-events: none;"
                ></v-progress-linear>

                <div v-if="generationStopped" style="text-align: right; position: absolute; right: 30px; top: 25px;">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="stop()"
                                icon small
                                v-bind="attrs"
                                v-on="on"
                                style="z-index:2"
                            >
                                <v-icon style="margin-right: 5px;">mdi-stop-circle-outline</v-icon>
                            </v-btn>
                        </template>
                        <span>Stop</span>
                    </v-tooltip>
                </div>
                <div v-else style="text-align: right; position: absolute; right: 20px; top: 10px;">
                    <!-- <v-tooltip  bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="generate(test)"
                                icon small
                                v-bind="attrs"
                                v-on="on"
                                style="margin-right: 10px; z-index:2"
                            >
                                <v-icon style="margin-right: 5px;">mdi-refresh</v-icon>
                            </v-btn>
                        </template>
                        <span>reCreate model use to json</span>
                    </v-tooltip> -->
                    <v-tooltip  bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="generate()"
                                icon small
                                v-bind="attrs"
                                v-on="on"
                                style="margin-right: 10px; z-index:2"
                            >
                                <v-icon style="margin-right: 5px;">mdi-refresh</v-icon>
                            </v-btn>
                        </template>
                        <span>Try again</span>
                    </v-tooltip>
                    <!-- <v-tooltip  bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="continueGenerator()"
                                icon small
                                v-bind="attrs"
                                v-on="on"
                                style="margin-right: 10px; z-index:2"
                            >
                                <v-icon style="margin-right: 5px;">mdi-refresh</v-icon>
                            </v-btn>
                        </template>
                        <span>Continue</span>
                    </v-tooltip> -->
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="finishModelCreation()"
                                icon small
                                v-bind="attrs"
                                v-on="on"
                                color="primary"
                                style="z-index:2; margin-right:10px;"
                            >
                            <v-icon style="margin-right: 5px;">mdi-check-circle-outline</v-icon>
                            </v-btn>
                        </template>
                        <span>Auto modeling completed</span>
                    </v-tooltip>

                    <slot name="buttons"></slot>
                </div>

                <v-tabs v-model="userPanel">
                    <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;">Input</v-tab>
                    <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;">Output</v-tab>
                    <!-- <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;">TEST</v-tab> -->
                </v-tabs>

                <v-expansion-panels v-model="autoModelDialog">
                    <v-expansion-panel style="padding:0px;">
                        <v-expansion-panel-header disable-icon-rotate style="position:absolute;">
                            <template v-slot:actions>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn @click="isExpanded = !isExpanded"
                                            icon small
                                            v-bind="attrs"
                                            v-on="on"
                                            style="position:absolute; top:-38px; right:0px; z-index:2"
                                        >
                                            <v-icon>mdi-unfold-more-horizontal</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Panel folding/unfolding</span>
                                </v-tooltip>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="auto-modeling-dialog">
                            <v-tabs-items v-model="userPanel">
                                <v-tab-item>
                                    <v-card flat>
                                        <v-textarea v-if="input"
                                            v-model="input.userStory"
                                            class="auto-modeling-dialog-textarea"
                                            style="font-size: small; padding-top:0px; height: 100%;"
                                        >
                                        </v-textarea>
                                    </v-card>
                                </v-tab-item>

                                <v-tab-item>
                                    <v-card flat>
                                        <v-textarea
                                            v-model="displayResult"
                                            @scroll="handleScroll" id="scroll-text"
                                            class="auto-modeling-dialog-textarea"
                                            style="font-size: small; padding-top:0px; height: 100%;"
                                        >
                                        </v-textarea>
                                    </v-card>
                                </v-tab-item>
                                <!-- <v-tab-item>
                                    <v-card flat>
                                        <v-textarea
                                            v-model="test"
                                            @scroll="handleScroll" id="scroll-text"
                                            class="auto-modeling-dialog-textarea"
                                            style="font-size: small; padding-top:0px; height: 100%;"
                                        >
                                        </v-textarea>
                                    </v-card>
                                </v-tab-item> -->
                            </v-tabs-items>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
        </v-card>
    </v-row>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import ESGenerator from './ESGenerator.js'
    import BigPictureESGenerator from './BigPictureESGenerator.js'
    import EventOnlyESGenerator from './EventOnlyESGenerator.js'
    import CJMGenerator from './CJMGenerator.js'
    import UMLGenerator from './UMLGenerator.js'
    import BMGenerator from './BMGenerator.js'
    
    //import UserStoryGenerator from './UserStoryGenerator.js'

    export default {
        name: 'es-generator-ui',
        props: {
            generator: String,
            generatorParameter: Object,
            modelerValue: Object
        },

        created(){
            if(this.createGenerator()){
                this.generate();
            }
        },
        watch: {
            result() {
                this.$nextTick(() => {
                    if (this.autoScroll) {
                        this.scrollToBottom();
                    }
                });
            }
        },

        data() {
            return {
                test: "",
                input: null,
                result: '',
                generatorName: null,
                generatorComponent: null,
                generatorUIComponent: null,
                autoModelDialog: 0,
                generationStopped:true,
                autoScroll: true,
                userPanel: 1,
                isExpanded: false,
                modelCreationCompleted: true,
            }
        },
        computed: {
            displayResult() {
                return (this.savedResult != '' && !this.generationStopped) ? this.savedResult : this.result;
            }
        },
        updated() {
            this.$nextTick(() => {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText && this.autoScroll) {
                    this.scrollToBottom();
                }
            });
        },
        methods: {


            createGenerator(){

                if(!this.generator){
                    let prevStateJson = localStorage["gen-state"];

                    if(prevStateJson){
                        let prevState = JSON.parse(prevStateJson);

                        if(!prevState.generator) throw new Error("No generator information inside localstroage.gen-state");

                        this.generatorName = prevState.generator;
                        this.input = prevState;

                        localStorage["gen-state"] = null;
                    }
                }else{
                    this.generatorName = this.generator;
                    this.input = this.generatorParameter;
                }

                try{
                    //this.generator = eval("new " + prevState.generator + "(this)");

                    switch(this.generatorName){
                        case "ESGenerator": this.generatorComponent = new ESGenerator(this); break;
                        case "BigPictureESGenerator": this.generatorComponent = new BigPictureESGenerator(this); break;
                        case "EventOnlyESGenerator": this.generatorComponent = new EventOnlyESGenerator(this); break;
                        case "CJMGenerator": this.generatorComponent = new CJMGenerator(this); break;
                        case "UMLGenerator": this.generatorComponent = new UMLGenerator(this); break;
                        case "BMGenerator": this.generatorComponent = new BMGenerator(this); break;

                    }

                    return this.generatorComponent;

                }catch(e){
                    console.log(e);

                    throw new Error("No proper generator for " + prevState.generator);
                }
            
            },
            finishModelCreation() {
                this.$EventBus.$emit('modelCreationFinished');

                this.generationStopped = false;
                this.modelCreationCompleted = false;
            },
            scrollToBottom() {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText) {
                    scrollText.scrollTop = scrollText.scrollHeight;
                }
            },
            handleScroll() {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText) {
                    const isScrolledToBottom = scrollText.scrollHeight - scrollText.scrollTop <= scrollText.clientHeight;
                    this.autoScroll = isScrolledToBottom;
                }
            },
            onReceived(content){
                this.result = content;
            },
            // onGenerationFinished(){
                // console.log("Finished")
                // this.generator.onGenerationFinished();
            // }, 

            generate(changedInput){
                if(changedInput)
                    this.input = changedInput;

                this.result = '';
                this.$emit("clearModelValue")
                this.generatorComponent.generate();
                this.generationStopped = true;
            },

            continueGenerator(){
                // this.generator.continue();
            },

            stop(){
                this.generatorComponent.stop();
                this.savedResult = this.result;
                this.generationStopped = false;
            },

            onModelCreated(model){
                this.$emit("createModel", model)
            },

            onGenerationFinished(model){
                this.generationStopped = false;
                this.savedResult = this.result;
                this.$emit("onGenerationFinished")

                
                this.publishModelChanges(model)

            },

            publishModelChanges(model){
                const channel = new BroadcastChannel('ai-generator');

                channel.postMessage({
                    generator: this.generatorName,
                    model: model
                });
            }


        }
    }
</script>
<style>
.expanded {
  width: 200px;
}

.collapsed {
  width: 450px; /* 원하는 가로 길이로 조정 */
}
</style>


