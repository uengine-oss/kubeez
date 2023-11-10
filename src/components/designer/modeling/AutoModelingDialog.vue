<template>
    <div v-if="showChat">
        <v-card v-if="autoModelingInput"
            class="mx-auto"
            style="max-width: 70%; background-color: aliceblue;"
        >
            <v-card-text style="font-weight: 500;">
                <v-text-field
                    style="margin-bottom: -30px;"
                    v-model="projectInfo.prompt"
                    solo
                    :placeholder="$t('autoModeling.mainClick')"
                    :label="$t('autoModeling.main1')"
                    :append-icon="startTemplateGenerate ? 'mdi-spin mdi-loading':'mdi-send'"
                    @click:append="openProjectDialog()"
                    @keydown.enter="openProjectDialog()"
                ></v-text-field>
            </v-card-text>
        </v-card>

        <v-col class="shrink">
            <v-expand-x-transition>
                <v-card @scroll="handleScroll" id="scroll-text"
                    v-show="openChatUI"
                    style="height: 100%; position: absolute; width: 100%; background-color: aliceblue; left: 0px; top: 0px;  overflow:auto; z-index:201;"
                    class="mx-auto bg-secondary"
                >   
                   
                        <v-card-text>
                            <v-row style="justify-content: space-between;">
                                <v-icon style="margin-bottom: 10px;" @click="cancelCreateModel()">mdi-arrow-left</v-icon>
                                <div>
                                    <v-icon v-if="!isServer" @click="openStorageDialog()">mdi-content-save</v-icon>
                                    <!-- PowerPoint Generate -->
                                    <v-icon v-if="isServer" @click="generatePowerPoint()">mdi-file-powerpoint-box-outline</v-icon>
                                </div>
                            </v-row>


                            <div v-if="(!openAiResult && openAiResult == '') && openaiPopup">
                                <v-text-field
                                        v-model="openaiToken"
                                        style="width: 400px; font-size: small;"
                                        :append-icon="showOpenaiToken ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showOpenaiToken ? 'text' : 'password'"
                                        name="openaiToken"
                                        label="openAI Token"
                                        :error="isErrOpenAiToken"
                                        :error-messages="isErrOpenAiTokenMessage"
                                        @click:append="showOpenaiToken = !showOpenaiToken"
                                >
                                    <template v-slot:prepend>
                                        <v-icon small>mdi-key</v-icon>
                                    </template>
                                </v-text-field>
                                <div style="font-size: small;" :style="isErrOpenAiToken ? 'margin-top: 0px;':'margin-top: -15px;'">
                                    <v-icon small style="margin-right: 5px;">mdi-help-circle-outline</v-icon>
                                    <a href="https://beta.openai.com/account/api-keys" target="_blank">how to get token</a>
                                </div>
                            </div>

                            <!-- autofocus -->
                            <v-text-field
                                v-model="projectInfo.prompt"
                                style="margin-bottom: -30px; padding: 10px; width: 80%; float: right; margin-top: 10px;"
                                :style="!openAiResult && openAiResult == '' ? 'margin-top: 15px;':''"
                                solo
                                :hint="$t('autoModeling.mainClick')"
                                persistent-hint
                                :label="$t('autoModeling.main2')"
                                :append-icon="startTemplateGenerate ? 'mdi-spin mdi-loading':'mdi-send'"
                                @click:append="startGen(genType)"
                                @keydown.enter="startGen(genType)"
                            ></v-text-field>
                            <div v-if="openChatUI" style="margin-left: 10px; margin-top: 70px;">
                                <v-col style="padding:0px;">
                                    <v-card style="display:inline-block; background-color: #DAF5FF;">
                                        <v-card-text class="auto-modeling-message">
                                            <vue-typed-js 
                                                :strings="[$t('autoModeling.selectOptions')]"
                                                :typeSpeed="5"
                                                :showCursor="false"
                                            >
                                                <span class="typing"></span>
                                            </vue-typed-js>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                
                                <v-card style="margin-top: 10px; display: inline-block; background-color: #DAF5FF;">
                                    <v-row 
                                        lg="3" md="3" sm="6" cols="12"
                                        style="padding:10px;"
                                    >
                                        <v-col style="text-align: center;">
                                            <v-card :style="genType == 'CJM' ? 'border: solid darkturquoise;':'background-color: white;'" >
                                                <div @click="genType='CJM'" style="cursor: pointer; ">
                                                    <v-avatar
                                                        class="ma-3"
                                                        size="125"
                                                        rounded="0"
                                                    >
                                                        <v-img src="https://miro.medium.com/v2/resize:fit:0/1*GeerSkalcxLlE3bp83i1XA.png"></v-img>
                                                    </v-avatar>
                                                    
                                                    <v-card-text style="justify-content: center; margin-top: -10px;">
                                                        <div :style="genType == 'CJM' ? 'background-color: #DAF5FF;':''" style="font-weight: 500; font-size: 12px; margin-left: -5px; border-radius: 10px; margin-right: -10px;">
                                                            <v-icon v-if="genType == 'CJM'" small color="success">mdi-check</v-icon>
                                                            Customer Journey Map
                                                        </div>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </v-col>
                                        <v-col style="text-align: center;">
                                            <v-card :style="genType == 'BM2' ? 'border: solid darkturquoise;':'background-color: white;'">
                                                <div @click="genType='BM2'" style="cursor: pointer;">
                                                    <v-avatar
                                                        class="ma-3"
                                                        size="125"
                                                        rounded="0"
                                                    >
                                                        <v-img src="https://user-images.githubusercontent.com/92732781/233012222-d0662c4b-5546-4e7b-af28-c07617a57ef0.png"></v-img>
                                                    </v-avatar>
                                                    
                                                    <v-card-text style="justify-content: center; margin-top: -10px;">
                                                        <div :style="genType == 'BM2' ? 'background-color: #DAF5FF;':''" style="font-weight: 500; font-size: 12px; margin-left: -5px; border-radius: 10px; margin-right: -10px;">
                                                            <v-icon v-if="genType == 'BM2'" small color="success">mdi-check</v-icon>
                                                            Business Model Canvas
                                                        </div>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </v-col>
                                        <v-col style="text-align: center;">
                                            <v-card :style="genType == 'ES2' ? 'border: solid darkturquoise;':'background-color: white;'">
                                                <div @click="genType='ES2'" style="cursor: pointer;">
                                                    <v-avatar
                                                        class="ma-3"
                                                        size="125"
                                                        rounded="0"
                                                    >
                                                        <v-img src="https://user-images.githubusercontent.com/113568664/208291359-e7ce6d88-776b-4447-a236-d7a1cddadcf4.png"></v-img>
                                                    </v-avatar>
                                    
                                                    <v-card-text style="justify-content: center; margin-top: -10px;">
                                                        <div :style="genType == 'ES2' ? 'background-color: #DAF5FF;':''" style="font-weight: 500; font-size: 12px; margin-left: -5px; border-radius: 10px; margin-right: -10px;">
                                                            <v-icon v-if="genType == 'ES2'" small color="success">mdi-check</v-icon>
                                                            Event Storming Model
                                                        </div>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </v-col>
                                        <v-col style="text-align: center;">
                                            <v-card :style="genType == 'UI' ? 'border: solid darkturquoise;':'background-color: white;'">
                                                <div @click="genType='UI'" style="cursor: pointer;">
                                                    <v-avatar
                                                        class="ma-3"
                                                        size="125"
                                                        rounded="0"
                                                    >
                                                        <v-img style="opacity: 0.8;" src="/static/image/brandUi.png"></v-img>
                                                    </v-avatar>
                                    
                                                    <v-card-text style="justify-content: center; margin-top: -10px;">
                                                        <div :style="genType == 'UI' ? 'background-color: #DAF5FF;':''" style="font-weight: 500; font-size: 12px; margin-left: -5px; border-radius: 10px; margin-right: -10px;">
                                                            <v-icon v-if="genType == 'UI'" small color="success">mdi-check</v-icon>
                                                            Brands & UIs
                                                        </div>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card>
                                <div v-if="startCrateModel && genType == 'BM'" style="margin-top: 10px; margin-left: 5px;">
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                    ></v-progress-circular>
                                </div>
                            </div>
                            <div :key="reGenKey">
                                <ESDialoger ref="esDialoger" v-model="projectInfo.eventStorming" :projectId="projectId" :prompt="projectInfo.prompt" :cachedModels="cachedModels" :uiStyle="uiStyle" v-if="genType == 'ES2'" @change="backupProject"></ESDialoger>
                                <CJMDialoger ref="cjMDialoger" v-model="projectInfo.customerJourneyMap" :projectId="projectId" :prompt="projectInfo.prompt" :cachedModels="cachedModels" v-if="genType == 'CJM'" @change="backupProject"></CJMDialoger>
                                <BMDialoger ref="bmDialoger" v-model="projectInfo.businessModel" :projectId="projectId"  :prompt="projectInfo.prompt" :cachedModels="cachedModels" v-if="genType == 'BM2'" @change="backupProject"></BMDialoger>
                                <UIWizardDialoger v-model="projectInfo.ui" :projectId="projectId"  :prompt="projectInfo.prompt" :cachedModels="cachedModels" @selected="onUIStyleSelected" v-if="genType == 'UI'" @change="backupProject"></UIWizardDialoger>
                            </div>
                        </v-card-text>
                    <!-- </div> -->
                </v-card>
            </v-expand-x-transition>

            <ModelStorageDialog
                    :showDialog="showStorageDialog"
                    :condition="storageCondition"
                    @save="saveProject"
                    @close="closeStorageDialog()"
            ></ModelStorageDialog>
        </v-col>


        <v-snackbar v-model="snackbar.show"
                outlined
                :color="snackbar.color"
                :multi-line="snackbar.multi"
                :timeout="snackbar.timeout"
                style="z-index: 100000;"
        >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn
                        v-bind="attrs"
                        small
                        icon
                        @click="snackbar.show = false" 
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>



    </div>
</template>
<script src="./speechRecognition.js"></script>
<script>
    import { VueTypedJs } from 'vue-typed-js'
    // import UMLDialoger from './generators/UMLDialoger'
    // import CJMDialoger from './generators/CJMDialoger'
    // import ESDialoger from './generators/ESDialoger'
    // import BMDialoger from './generators/BMDialoger'
    // import UIWizardDialoger from './generators/UIWizardDialoger'
    // import PowerPointGenerator from "./generators/PowerPointGenerator";
    import StorageBase from "../../CommonStorageBase";
    import ModelStorageDialog from "./ModelStorageDialog";
    import getParent from '../../../utils/getParent'
    // const axios = require('axios');
    let partialParse = require('partial-json-parser');
    let changeCase = require('change-case');
    export default {
        name: 'auto-modeling-dialog',
        props: {
            projectId: String,
            projectInfo: {
                type: Object,
                default: function(){
                    return {
                        eventStorming: null,
                        customerJourneyMap: null,
                        prompt: ''
                    }
                }
            },
            isServer: Boolean,
            mode: String,
            showDialog:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
            showChat:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
        },
        mixins: [StorageBase],
        components: {
            VueTypedJs,
            // ESDialoger,
            // UMLDialoger,
            // CJMDialoger,
            // BMDialoger,
            // UIWizardDialoger,
            ModelStorageDialog
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
            this.setUserInfo()
        },
        watch: {
        },
        beforeDestroy() {},
        async mounted(){
            var me = this
            if(me.mode == "project"){
                me.openChatUI = true
                if(me.projectId){
                    await me.open();
                }
            }
            me.scrollToBottom();

            //// listen to generators done to save the cacheModels
            const aiGeneratorChannel = new BroadcastChannel('ai-generator');
            aiGeneratorChannel.onmessage = function(e) {
                if (e.data) {
                    me.cachedModels[e.data.generator] = Object.assign([], e.data.model)
                }
            };

            const eventStormingCanvasChannel = new BroadcastChannel('event-storming-model-canvas')//this.$vnode.tag);

            eventStormingCanvasChannel.onmessage = function(e) {
                if (e.data) {
                    me.cachedModels["ESGenerator"] = Object.assign([], e.data.model)
                }
            };

            const modelCanvasChannel = new BroadcastChannel('model-canvas')//this.$vnode.tag);

            modelCanvasChannel.onmessage = async function(e) {
                if (e.data && e.data.event === "ProjectIdChanged") {
                    me.modifyModelList(e.data)
                } else if (e.data && e.data.event === "ScreenShot") {
                    await me.putString(`storage://definitions/${me.projectId}/information/image`, e.data.image);
                }
            };
        },
        data() {
            return {
                disableSaveBtn: false,
                // projectInfo: {
                //     eventStorming: null,
                //     customerJourneyMap: null,
                //     prompt: ""
                // },
                cachedModels: {},
                uiStyle: null,
                reGenKey: 0,
                autoScroll: true,
                bmName: null,
                genType: null,
                autoModelDialog: 0,
                gptResponseId: null,
                userPanel: 1,
                modelJson: null,
                //type-js
                firstMessageIsTyping: true,
                secondMessageIsTyping: true,
                //
                createModelErrMessage: null,
                modelCreationStopped: false,
                lastBCView: null,
                bcPosition: {},
                userUid: null,
                // chat
                isCheckedErr: false,
                startCrateModel: false,
                openChatUI: false, 
                modelScenario: "",
                // dailog
                isErrOpenAiTokenMessage: null,
                isErrOpenAiToken: false,
                pageNum: '1',
                openAiPromptForBC: "",
                openAiPrompt: "",
                isListening: false,
                openAiResult: "",
                speechRecognition: null,
                startTemplateGenerate: false,
                generateStatusValue: 0,
                bufferInterval: null,
                openaiToken: "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",
                //token
                openaiPopup: false,
                showOpenaiToken: false,
                sequenceForUUID: 0,
                autoModelingInput: true,
                //snackbar
                snackbar: {
                    show: false,
                    multi: false,
                    text: "",
                    color: "",
                    timeout: -1,
                },
                storageCondition: null,
                showStorageDialog: false,
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
            openStorageDialog(){
                this.storageCondition = {
                    action: 'save',
                    title: 'Save Project',
                    comment: '',
                    projectName: this.projectInfo.prompt,
                    projectId: this.uuid(),
                    error: null,
                    loading: false,
                    type: 'project'
                }
                this.showStorageDialog = true;
            },
            closeStorageDialog(){
                this.storageCondition = null;
                this.showStorageDialog = false
            },
            async saveProject(){
                var me = this

                let validate = await me.validateStorageCondition(me.storageCondition, 'save');
                if(validate) {
                    var originProjectId = me.projectId
                    var settingProjectId = me.storageCondition.projectId.replaceAll(' ', '-').trim();

                    me.projectInfo.projectId =settingProjectId
                    me.projectInfo.projectName = me.storageCondition.projectName ? me.storageCondition.projectName : me.projectInfo.prompt;
                    me.projectInfo.prompt =  me.projectInfo.prompt ? me.projectInfo.prompt : me.projectInfo.projectName
                    me.projectInfo.type = me.storageCondition.type;
                    me.projectInfo.createdTimeStamp = Date.now();
                    me.projectInfo.lastModifiedTimeStamp = Date.now();

                    await me.putObject(`db://definitions/${settingProjectId}/information`, me.projectInfo)
                    me.isServer = true;
                    if( settingProjectId != me.projectId ) me.$router.push({path: `/${me.projectInfo.type}/${settingProjectId}`});
                    me.$emit('forceUpdateKey')
                } else{
                    me.storageCondition.loading = false
                }
            },
            async validateStorageCondition(condition, action){
                var me = this

                if( !this.isLogin ) {
                    var otherMsg = 'Please check your login.';
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                if( !condition.projectId || condition.projectId.includes('/') ){
                    var otherMsg = 'ProjectId must be non-empty strings and can\'t contain  "/"'
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                // checked duplicate projectId
                var validateInfo = await me.isValidatePath(`db://definitions/${condition.projectId}/information`);
                if( !validateInfo.status ){
                    var obj ={
                        'projectId': validateInfo.msg,
                    }
                    condition.error = obj
                    return false;
                }

                var information = await me.list(`db://definitions/${condition.projectId}/information`)
                if(information){
                    var obj ={
                        'projectId': 'This project id already exists.'
                    }
                    condition.error = obj
                    return false;
                }


                return true;
            },
            generatePowerPoint() {
                const me = this;
                const modelData = [];
                const genTypes = Object.keys(me.cachedModels);

                if (genTypes.length > 0) {
                    genTypes.forEach((type) => {
                        if (type.includes("ES")) {
                            modelData.push({
                                canvasType: "es",
                                value: {
                                    elements: me.cachedModels[type].elements,
                                    relations: me.cachedModels[type].relations,
                                }
                            });
                        } else if (type.includes("BM")) {
                            const bmElements = me.cachedModels[type];
                            modelData.push({
                                canvasType: "bm",
                                value: {
                                    elements: bmElements,
                                }
                            });
                        } else if (type.includes("CJM")) {
                            modelData.push({
                                canvasType: "cjm",
                                value: {
                                    elements: me.cachedModels[type].elements,
                                    relations: me.cachedModels[type].relations,
                                }
                            });
                        }
                    });

                    const generator = new PowerPointGenerator(me.projectInfo.prompt);
                    generator.createPowerPoint(modelData);

                } else {
                    me.snackbar = {
                        show: true,
                        text: "Before generate PPT, create at least one Canvas Model.",
                        multi: false,
                        color: "red",
                        timeout: -1
                    };
                }
            },

            modifyModelList(changedInfo){
                var me = this
                let saveType
                // event: "ProjectIdChanged",
                // type: me.canvasType,
                // old: originProjectId,
                // new: settingProjectId
                if(changedInfo.type == 'es'){
                    saveType = "eventStorming"
                    var oldModelIndex = me.projectInfo.eventStorming.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.eventStorming.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.eventStorming.modelList.__ob__.dep.notify()
                }
                if(changedInfo.type == 'bm'){
                    saveType = "businessModel"
                    var oldModelIndex = me.projectInfo.businessModel.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.businessModel.modelList[oldModelIndex] = changedInfo.new
                }
                // if(changedInfo.type == 'cjm'){
                //     saveType = null
                //     var oldModelIndex = me.projectInfo.customerJourneyMap.modelList.findIndex(x => x == changedInfo.old)
                //     me.projectInfo.eventStorming.modelList[oldModelIndex] = changedInfo.new
                // }
                me.backupProject(saveType);
            },
            openProjectDialog(){
                var me = this
                me.openChatUI = true
                me.genType = null
                me.projectId = me.uuid();
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
            cancelCreateModel(val){
                var me = this
                if(!val){
                    me.openChatUI = false
                    me.openaiPopup = false

                    me.projectInfo = {
                        eventStorming: null,
                        customerJourneyMap: null,
                        prompt: ""
                    },
                    me.modelScenarioPrompt = ""
                    me.openAiResult = ""
                } 
                me.startTemplateGenerate = false
                if(me.mode == 'project'){
                    this.$emit("closeDialog")
                }
                this.$emit("changeFieldStatus", false)
            },
            async open(){
                let me = this;
                // me.projectInfo = await me.getObject(`db://definitions/${me.projectId}/information`)
                // if(me.projectInfo && me.projectInfo.type){
                //     me.disableSaveBtn = true
                // }

                // mounted 랑 중복.
                // const modelCanvasChannel = new BroadcastChannel('model-canvas')//this.$vnode.tag);
                // modelCanvasChannel.onmessage = function(e) {
                //     if (e.data && e.data.event === "ProjectIdChanged") {
                //         me.modifyModelList(e.data)
                //     }
                // };
                  
            },
            async backupProject(){
                // type: eventStorming,  businessModel, customerJourneyMap
                var me = this

                if( me.isServer ) {
                    if( me.isLogin ){
                        me.putObject(`db://definitions/${me.projectId}/information`, {
                            eventStorming: me.projectInfo.eventStorming,
                            businessModel: me.projectInfo.businessModel,
                            customerJourneyMap: me.projectInfo.customerJourneyMap,
                        })
                    }
                } else  {
                    // local
                    let lists = await me.getObject(`localstorage://localLists`)
                    lists = lists ? lists : [];
                    var index = lists.findIndex(list => list.projectId == me.projectId)
                    if( index == -1 ){
                        // new
                        lists.push(me.projectInfo)
                    } else {
                        lists[index] = me.projectInfo
                    }
                    me.putObject(`localstorage://localLists`, lists);
                }
            },
            onUIStyleSelected(uiStyle){
                this.uiStyle = uiStyle;
            },
            handleContentChange() {
                this.$nextTick(() => {
                    if (this.autoScroll) {
                        this.scrollToBottom();
                    }
                });
            },
            startGen(){
                this.reGenKey++;
            },
            show(options){
                ///
                this.reGenKey++;
                this.modelScenarioPrompt = options && options.title ? options.title:options.projectName
                this.showChat = true;
                this.openChatUI = true;
                this.$emit("changeFieldStatus", true)
                //this.showDialog = true;
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
            openChatDialog(options){
                if(options && options.prompt)
                    this.modelScenarioPrompt = options.prompt;
                this.openChatUI = true;
            },
            onReceive(content){
                console.log(content);
            },
            openCanvas(val){
                var me = this
                var dbuid = me.dbuid()
                localStorage.setItem(dbuid + '-model-info', JSON.stringify(val))
                localStorage.setItem(dbuid + '-Project-Name', val.name)
                // localStorage.setItem(dbuid + '-Scenario', val.result)
                if(val.type == 'ES'){
                    me.$router.push({path: `storming/${dbuid}`});
                } else if(val.type == 'BM'){
                    me.$router.push({path: `business-model-canvas/${dbuid}`});
                }
            },  
        }
    }
</script>
<style>
</style>
<style lang="scss">
</style>