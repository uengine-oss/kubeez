<template>
    <v-row>
        <v-dialog v-model="showDialog" @click:outside="closeJavaParseDialog()" width="auto">
            <v-card fluid style="background-color: white; width: 500px;">
                <div>
                    <v-menu
                        v-model="openaiPopup"
                        :close-on-click="false"
                        :close-on-content-click="false"
                        offset-y
                    >
                        <template v-slot:activator="{ on: menu, attrs }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on: tooltip }">
                                    <v-btn
                                        class="code-preview-left-re-size-btn"
                                        icon x-small
                                        v-bind="attrs"
                                        v-on="{ ...tooltip, ...menu }"
                                        style="margin:10px 0px 0px 10px;"
                                    >
                                        <v-icon size="20" :color="openaiPopup ? 'primary':''">
                                            mdi-auto-fix
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>input openai token</span>
                            </v-tooltip>
                        </template>
                        <div v-if="openaiPopup">
                            <v-container fluid style="background-color: white;">
                                <v-btn style="float: right; margin-top: -17px; margin-right: -17px;" icon @click="closeOpenaiPopup()">
                                    <v-icon small>mdi-close</v-icon>
                                </v-btn>
                                <v-text-field
                                        v-model="openaiToken"
                                        style="width: 400px; font-size: small;"
                                        :append-icon="showOpenaiToken ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showOpenaiToken ? 'text' : 'password'"
                                        name="openaiToken"
                                        label="openAI Token"
                                        @click:append="showOpenaiToken = !showOpenaiToken"
                                ></v-text-field>
                                <div style="font-size: small;">
                                    <v-icon small style="margin-right: 5px;">mdi-help-circle-outline</v-icon>
                                    <a href="https://beta.openai.com/account/api-keys" target="_blank">how to get token</a>
                                </div>
                            </v-container>
                        </div>
                    </v-menu>
                </div>
                <!-- <v-btn style="float: right; margin-top: -17px; margin-right: -17px;" icon @click="close()">
                    <v-icon small>mdi-close</v-icon>
                </v-btn> -->
                <div v-if="isListening"><b>listening ...</b></div>
                <div>
                    <v-textarea
                        v-model="openAiPrompt"
                        label="prompt"
                        dense
                        clearable
                        style="white-space: pre; margin: 10px;"
                        filled
                        auto-grow
                        rows="2"
                    >
                        <template v-slot:prepend> 
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" @click="startSpeechRecon()" :color="isListening ? '':'error'">
                                        {{ isListening ? 'mdi-microphone':'mdi-microphone-off' }}
                                    </v-icon>
                                </template>
                                <span>{{ isListening ? 'Stop speech recognition':'Start speech recognition' }}</span>
                            </v-tooltip>
                        </template>
                    </v-textarea>
                    <v-btn style="margin: -30px 0px 10px 10px;" :loading="startTemplateGenerate" text @click="processTemplateUseOpenAi(openAiPrompt)">generate</v-btn>
                </div>
                <!-- v-if="openAiResult" -->
                <div style="margin-top: 10px;">
                    <v-textarea
                        v-model="openAiResult"
                        style="white-space: pre; margin: 10px; margin-bottom: -10px;"
                        dense
                        rows="23"
                        filled
                    >
                    </v-textarea>
                    <v-btn v-if="mode == 'uml'" style="margin-top: -25px;" text @click="javaParse()">parse</v-btn>
                    <v-btn v-if="mode == 'es'" style="margin-top: -25px;" text @click="createModel()">Create Model</v-btn>
                </div>
            </v-card>
        </v-dialog>
    </v-row>

</template>

<script src="./speechRecognition.js"></script>
<script>
    import CodeGenerator from "./CodeGenerator.vue";
    const axios = require('axios');
    export default {
        name: 'uml-java-parser',
        props: {
            mode: String,
            showDialog:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
        },
        computed: {
        },
        created(){
        },
        mounted(){
            var me = this
            if(localStorage.getItem("openaiToken")){
                me.openaiToken = localStorage.getItem("openaiToken")
            }
        },
        data() {
            return {
                openAiPrompt: "",
                isListening: false,
                openAiResult: "",
                speechRecognition: null,
                startTemplateGenerate: false,
                openaiToken: null,

                //token
                openaiPopup: false,
                showOpenaiToken: false,
            }
        },
        methods: {
            closeOpenaiPopup(){
                var me = this
                me.openaiPopup = false
                me.showOpenaiToken = false
                localStorage.setItem("openaiToken", me.openaiToken)
            },
            async processTemplateUseOpenAi(prompt){
                var me = this
                me.startTemplateGenerate = true
                var content
                var startGen = false
                if(prompt != '' && prompt != null){
                    if(me.mode == 'uml'){
                        content = prompt + "that response must be Java code without natural language."
                    } else {
                        content = `Please create an event storming model in json for a ` + prompt + `\nThe format must be as follows:\n
{
    "boundedContext": {
        "BoundedContext Name": {
            "aggregates": [
                {
                    "name": "Aggregate Name",
                    "properties": [
                        {
                            "name": "Property Name",
                            "type": "Property Type"
                        }
                    ],
                    "events": [
                        {
                            "name": "Event Name",
                            "properties": [
                                {
                                    "name": "Property Name",
                                    "type": "Property Type"
                                }
                            ]
                        }
                    ],
                    "commands": [
                        {
                            "name": "Command Name",
                            "properties": [
                                {
                                    "name": "Property Name",
                                    "type": "Property Type"
                                }
                            ]
                        }
                    ],
                    "policies": [
                        {
                            "name": "Policy Name",
                            "sourceEvent": "Event Name"
                        }
                    ]
                }
            ]
        }
    }
}\n
That result must to split the mode with two different bounded context so that the model have to be separated with a core domain from supporting domain. and that response must be json code only without natural language.`
                    } 
                    startGen = true
                }
                if(me.openaiToken && startGen){
                    let tokenLength = 4092 - Math.round(content.length/2.5)
                    let data = {
                        model: "text-davinci-003",
                        prompt: content,
                        temperature: 0.5,
                        max_tokens: tokenLength ? tokenLength : 3000, 
                    }
                    let header = {
                        Authorization: `Bearer ${me.openaiToken}`,
                        'Content-Type': 'application/json'
                    }

                    let respones = await axios.post(`https://api.openai.com/v1/completions`, data, { headers: header })
                    .catch(function (error) {
                        me.startTemplateGenerate = false
                        if(error.response && error.response.data && error.response.data.error && error.response.data.error.message){
                            var errText = error.message + '\n' + error.response.data.error.message
                            alert(errText)
                        } else {
                            alert(error.message)
                        }
                    }); 
                    if(respones.data.choices[0].text){
                        if(me.mode == 'uml'){
                            var CodeGen = Vue.extend(CodeGenerator);
                            let codeGenComponent = new CodeGen()
                            me.openAiResult = codeGenComponent.codeAlign(respones.data.choices[0].text)
                        } else {
                            me.openAiResult = respones.data.choices[0].text
                        }
                        me.startTemplateGenerate = false
                    }

                } else {
                    me.startTemplateGenerate = false
                    if(!me.openaiToken){
                        alert("input Token")
                    }
                }
            },
            startSpeechRecon(){
                var me = this
                me.isListening = !me.isListening
                if(me.isListening){
                    if ("webkitSpeechRecognition" in window) {
                        var prompt
                        if(me.openAiPrompt && me.openAiPrompt.length > 0){
                            prompt = me.openAiPrompt + " "
                        } else {
                            prompt = ""
                        }
                        me.speechRecognition = null
                        me.speechRecognition = new webkitSpeechRecognition();
                        let final_transcript = "";

                        me.speechRecognition.continuous = true;
                        me.speechRecognition.interimResults = true;
                        me.speechRecognition.lang = "en-US"

                        // me.speechRecognition.onstart = () => {
                            // document.querySelector("#status").style.display = "block";
                        // };
                        // me.speechRecognition.onerror = () => {
                            // document.querySelector("#status").style.display = "none";
                        // };
                        // me.speechRecognition.onend = () => {
                            // document.querySelector("#status").style.display = "none";
                        // };

                        me.speechRecognition.onresult = (event) => {
                            let interim_transcript = "";
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) {
                                    final_transcript += event.results[i][0].transcript;
                                } else {
                                    interim_transcript += event.results[i][0].transcript;
                                }
                            }
                            me.openAiPrompt = prompt + interim_transcript;
                            if(final_transcript && final_transcript.length > 0){
                                me.openAiPrompt = prompt + final_transcript;
                            }
                        };

                    } else {
                        console.log("Speech Recognition Not Available");
                    }
                    me.speechRecognition.start();
                } else {
                    me.speechRecognition.stop();
                }
            },
            createModel(){
                var me = this
                me.$emit("createModel", me.openAiResult)
            },
            javaParse(){
                this.$emit('java-parse', this.openAiResult)
            },
            closeJavaParseDialog() {
                this.$emit('closeJavaParseDialog')
            }
        }
    }
</script>


