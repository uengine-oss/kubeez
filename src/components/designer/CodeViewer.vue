<template>
    <div>
        <div v-if="isHighlightMode"
            id="monaco-editor-id"
            style="max-height: 100%; height: 92vh !important;"
        >
        </div>
        <div v-else-if="codeObj && codeValue"
                style="width:99.8%;"
        >
            <v-card-text
                id="scroll-target"
            >
                <v-btn v-if="!editMode" @click="explain()"
                    small style="position:absolute; top:70px; right:15px; z-index: 999;" text
                >
                    Explain code<v-icon x-small>mdi-send</v-icon>
                </v-btn>
                <v-row>
                    <v-col v-if="!showGpt" :cols="explainedResult == '' ? '12' : '6'"
                        style="padding:0px; height:100%;"
                    >
                        <vue-markdown
                                v-if="!isExpectedTemplate && codeLanguage=='markdown' && (!editMode || (editMode && readOnly))"
                                class="markdown-body gs-inside-markdown-body"
                                :source="codeValue"
                                @editorDidMount="editorDidMount"
                                style="overflow:auto; padding:0px 10px 10px 0px;"
                        ></vue-markdown>
                        <MonacoEditor
                                v-else
                                :key="monacoIds"
                                ref="monaco-editor"
                                class="monaco-editor gs-inside-monaco-editor"
                                :options="options"
                                v-model="codeValue"
                                :style="isExpectedTemplate ? '':''"
                                theme="light"
                                :diffEditor="isDiffEditor"
                                :language="codeLanguage"
                                :original="getOriginal"
                                @editorDidMount="editorDidMount"
                                @change="onCmCodeChange"
                        ></MonacoEditor>
                    </v-col>
                    <v-col v-if="!showGpt && explainedResult !=''" cols="6">
                        <v-row>
                            <v-card @scroll="handleScroll" id="scroll-text" style="width: 100%; max-height: 86vh; z-index: 1000; overflow-y: scroll; background-color: #FFFFFF; margin-top: -4px;">
                                <vue-markdown
                                    class="markdown-body"
                                    style="padding: 15px; font-size: 13px; color: #434853;"
                                    :source="explainedResult"
                                >
                                </vue-markdown>
                                <div style="z-index:1001; position: absolute; right: 0px; top: -8px;">
                                    <v-btn v-if="explainedResult !=''" @click="closeExplainCode()" style="z-index:999; color: black;" icon><v-icon>mdi-close</v-icon></v-btn>
                                </div>
                                <div style="position: absolute; z-index:1001; top:-23px; right: 25px; display: flex; justify-content: center; align-items: center;">
                                    <v-btn v-if="generationStopped"
                                        @click="explain(true)"
                                        style="z-index:999; margin-top: 15px; color: black;" icon>
                                            <v-icon>mdi-refresh</v-icon>
                                    </v-btn>
                                    <v-btn v-else @click="stopExplainCode()" style="z-index:999; margin-top: 15px; color: black;" icon>
                                        <v-icon>mdi-stop-circle-outline</v-icon>
                                    </v-btn>
                                </div>
                                <v-text-field
                                    v-model="chatPrompt"
                                    style="width:100%; background-color: #FFFFFF; color: white;"
                                    solo
                                    outlined
                                    class="question-box"
                                    append-icon="mdi-send"
                                    @click:append="removeDuplicateChatPrompt"
                                    @keydown.enter="removeDuplicateChatPrompt"
                                ></v-text-field>
                            </v-card>
                        </v-row>
                    </v-col>
                    <v-col v-if="showGpt" cols="12">
                        <v-row>
                            <v-card @scroll="handleScroll" id="scroll-text" style="width: 100%; max-height: 86vh; z-index: 1000; overflow-y: scroll; background-color: #FFFFFF; margin-top: -4px;">
                                <v-alert closable   
                                    title="Ask ChatGPT"
                                    icon="mdi-auto-fix"
                                    type="info"
                                    v-if="!explainError && showGpt"
                                >
                                    Ask anything about the code below this selection. i.e. How can I run this app? Where is the port number? how can I change the database product to MySQL.
                                </v-alert>
                                <v-alert closable   
                                    title="OOps"
                                    type="error"
                                    v-if="explainError && showGpt"
                                >
                                    {{explainError}}
                                    <v-btn @click="explainError = null">DISMISS</v-btn>
                                </v-alert>
                                <vue-markdown
                                    class="markdown-body"
                                    style="padding: 15px; font-size: 13px; color: #434853;"
                                    :source="explainedResult"
                                >
                                </vue-markdown>
                                <div style="position: fixed;  z-index:1001;  position: absolute; right: 10px; top: 80px">
                                    <v-btn v-if="showGpt" @click="closeExplainCode()" style="z-index:999; color: black;" icon><v-icon>mdi-close</v-icon></v-btn>
                                </div>
                                <div v-if="explainedResult !=''" style="position: absolute; z-index:1001; top:65px; right: 35px; z-index:1001; display: flex; justify-content: center; align-items: center; ">
                                    <v-btn v-if="generationStopped"
                                        @click="explain(true)"
                                        style="z-index:999; margin-top: 15px; color: black;" icon>
                                            <v-icon>mdi-refresh</v-icon>
                                    </v-btn>
                                    <v-btn v-else @click="stopExplainCode()" style="z-index:999; margin-top: 15px; color: black;" icon>
                                        <v-icon>mdi-stop-circle-outline</v-icon>
                                    </v-btn>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <v-text-field
                                        v-model="chatPrompt"
                                        ref="input"
                                        style="width:100%; background-color: #FFFFFF; color: white;"
                                        solo
                                        outlined
                                        autofocus
                                        class="question-box"
                                        append-icon="mdi-send"
                                        @click:append="removeDuplicateChatPrompt"
                                        @keydown.enter="removeDuplicateChatPrompt"
                                    ></v-text-field>                                     
                                </div>
                            </v-card>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
        </div>
    </div>
</template>
<script>
    import AIGenerator from './modeling/generators/AIGenerator'
    import DiffMatchPatch from "diff-match-patch";
    import MonacoEditor from 'vue-monaco';
    import VueMarkdown from 'vue-markdown';
    import Clipboard from 'clipboard';
    import getParent from '../../utils/getParent'
    
    const _ = require('lodash');

    window.diff_match_patch = DiffMatchPatch
    window.DIFF_DELETE = -1
    window.DIFF_INSERT = 1
    window.DIFF_EQUAL = 0
    export default {
        name: 'code-viewer',
        props: {
            codeSuggestionObj: Object,
            readOnly: Boolean,
            editMode: Boolean,
            isExpectedTemplate: Boolean, 
            value: Array,
            type: String,
            diffValue: {
                type: Array,
                default: function () {
                    return []
                }
            },
            createValue: {
                type: Array,
                default: function () {
                    return []
                }
            },
            showGpt: Boolean
        },
        data() {
            return {
                currentRange: null,
                oldPrompt: null,
                generator: null,
                isGenerating:false,
                preferredLanguge: '',
                questionList: {},
                autoScroll: true,
                generationStopped: false,
                chatList: [],
                chatPrompt: '',
                explainedResult:'',
                explainError:'',
                codeSuggestionList: [],
                editorInfo: null,
                codeLensProvider: null,
                completionItemProvider: null,
                debuggerPoint: [],
                templateErrMsg: null,
                isRender: true,
                renderKey: null,
                theme: 'vs',
                monacoIds: 0,
                options: {},
                generateCode: null,
            }
        },
        components: {
            MonacoEditor,
            'vue-markdown': VueMarkdown
        },
        mixins:[MonacoEditor],
        computed: {
            codeObj(){
                var me = this
                if(me.readOnly){
                    me.options = {
                        readOnly: true,
                        // renderSideBySide: false,
                        // enableSplitViewResizing: false,
                    }
                } 
                // else {
                //     me.options = {
                //         renderSideBySide: false,
                //         enableSplitViewResizing: false,
                //     }
                // }
                return this.value && this.value[0] ? this.value[0] : null
            },
            codeValue(){
                if(this.codeObj){
                    if(this.codeObj.code){
                        var filteredCode = this.codeObj.code.split("\n")
                        var replaceRoof = true 
                        while(replaceRoof){
                            if(filteredCode[0] == ""){
                                filteredCode.splice(0, 1)
                            } else {
                                replaceRoof = false
                            }
                        }
                        this.codeObj.code = filteredCode.join("\n")
                    }
                }
                return this.codeObj && this.codeObj.code ? this.codeObj.code : " "
            },
            filteredCode(){
              return this.generateCode ? this.generateCode : null
            },
            isHighlightMode(){
                var me = this
                if( me.codeObj
                    && me.codeObj.highlightLists
                    && Object.keys(me.codeObj.highlightLists).length > 0){
                    return true
                }
                return false;
            },
            isDiffEditor(){
                this.editor = null
                if( this.type == 'diff' && !this.isHighlightMode){
                    if(this.createValue && this.createValue.length > 0){
                        return true
                    }
                }
                return false
            },
            getOriginal(){
                var me = this
                if(this.isRender){
                    me.monacoIds = me.monacoIds + 1
                }
                if(me.createValue && me.createValue[0]){
                    return this.createValue[0].code
                }
                this.$emit('type', undefined)
                return ''
            },
            getCodeTheme() {
                return this.theme
            },
            codeLanguage() {
                try{
                    if (this.codeObj) {
                        var path = this.codeObj.path ? this.codeObj.path : this.codeObj.fileName
                        if (path.endsWith('.java')) {
                            return 'java'
                        } else if (path.endsWith('.yml') || path.endsWith('.yaml')) {
                            return 'yaml'
                        } else if (path.endsWith('.md')) {
                            return 'markdown'
                        } else if (path.endsWith('.properties')) {
                            return 'yaml'
                        } else if (path.endsWith('mvnw') || path.endsWith('sh')) {
                            return 'shell'
                        } else if (path.endsWith('.xml')) {
                            return 'xml';
                        } else if (path.endsWith('Dockerfile')) {
                            return 'dockerfile'
                        } else if (path.endsWith('.json')) {
                            return 'json'
                        } else if (path.endsWith('.py')) {
                            return 'python'
                        } else if (path.endsWith('.go')) {
                            return 'go'
                        } else if (path.endsWith('.vue')) {
                            return 'javascript'
                        } else if (path.endsWith('.js')) {
                            return 'javascript'
                        } else if (path.endsWith('gitignore')) {
                            return 'plaintext'
                        } else if (path.endsWith('.msaez')) {
                            return 'json'
                        } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                            return `data:image/png;base64,${this.codeObj.code}`
                        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                            return `data:image/jpg;base64,${this.codeObj.code}`
                        }else{
                            return 'txt'
                        }
                    }else{
                        return 'txt'
                    }
                } catch (e) {
                    return 'txt'
                }
            },
        },
        watch: {
            "codeObj":{
                    deep:true,
                    handler: function (newVal, oldVal) {
                        var me = this
                        if(me.editMode){
                            if(oldVal){
                                if(newVal && (newVal.key != oldVal.key)){
                                    this.isRender = true
                                } else {
                                    this.isRender = false
                                }
                            } else {
                                this.isRender = true
                            }
                        } else {
                            this.isRender = true
                        }
                        me.generateHighlightArray(me.codeObj)
                    }
            },
            codeValue(){
                this.$nextTick(function () {
                    this.instructionCodeBlockClipBoard()
                });
            },
            showGpt(newVal){
                var me = this;
                if(!newVal){
                    if(me.generator){
                        me.generator.stop()
                    }
                    me.explainedResult = ''
                    me.chatList = []
                    me.promptList = []
                }
            },
            value(newVal){
                var me = this;
                if(newVal){
                    if(me.generator){
                        me.generator.stop()
                    }
                    me.explainedResult = ''
                    me.chatPrompt = ''
                    me.chatList = []
                    me.promptList = []
                    me.$nextTick(() => {
                        if (me.$refs.input){
                            me.$refs.input.focus();
                        }
                    });
                }
            },
            // "value": {
            //     deep: true,
            //     handler: function (newVal, oldVal) {
            //         var me = this
            //         console.log("==========value==========")
            //         // me.$refs.meditor.init
            //         // me.codeValue = newVal
            //
            //
            //     }
            // },
            diffValue(newVal) {
                // console.log("=========diffvalue=======");
                // console.log(newVal);
            },
            createValue(newVal) {
                // console.log("=========created=======");
                // console.log(newVal);
            },
        },
        mounted() {
            var me = this
            switch(window.countryCode){
                case 'ko': this.preferredLanguge = 'Korean'; break;
                case 'en': this.preferredLanguge = 'English'; break; 
            }
            this.scrollToBottom();
            // Vue markdown이 마운트된 후, md파일의 각 타이틀 element에 동적으로 ID 할당
            var tags = document.getElementsByTagName('h3')
            Object.keys(tags).forEach(function(key, index){
                tags[key].id = index
            })
            if(me.editMode && !me.readOnly){
                me.$EventBus.$on('pasteModelValue', function (data) {
                    me.pasteModelValue(data)
                })
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
            stopExplainCode(){
                let me = this;
                me.generator.stop();
                this.generationStopped = true;
            },
            closeExplainCode(){
                let me = this;
                me.showGpt = false;
                me.generator.stop();
                me.chatList = []
                me.promptList = []
                me.explainedResult = ''
            },
            // 경련현상 제거 메소드 (text-field로 keydown.enter시 간헐적으로 prompt가 두 번이 들어가는 문제 발생하여 처리)
            removeDuplicateChatPrompt(){
                let me = this;
                if(!me.isGenerating){
                    me.isGenerating = true;
                    me.explain()
                }else{
                    me.chatPrompt = ''
                }
            },
            explain(retry){
                let me = this;
                let prompt
                this.explainError = ''
                this.generationStopped = false;
                
                let codeGenerator = getParent(me.$parent, "code-generator")
                let collectedCodes = codeGenerator.getSelectedFilesDeeply()
                
                if(!retry){
                    // 폴더에 대한 openAi
                    if(me.showGpt){
                        if(Array.isArray(collectedCodes) && collectedCodes.length > 0){
                            prompt = collectedCodes.join("\n\n") + me.chatPrompt;
                        }
                        me.oldPrompt = me.chatPrompt
                        // 단일 file에 대한 openAi
                    }else{
                        // 단일 file로 openAi할 때, chatPrompt로 질문 입력할 경우
                        if(me.chatPrompt != ''){
                            prompt = me.value[0].code + me.chatPrompt
                        }else{
                            prompt = "explain this code with markdown format" + me.value[0].code
                        }
                        me.oldPrompt = prompt
                    }
                    me.chatPrompt = ''
                // reGenerate
                }else{
                    if(me.showGpt){
                        prompt = collectedCodes.join("\n\n") + me.oldPrompt
                    }else{
                        prompt = me.oldPrompt
                    }
                }
                me.generator = new AIGenerator(this, {prompt: prompt});
                //me.generator.model = "gpt-4-32k" //payment issue
                me.generator.generate();
            },
            onReceived(result){
                this.explainedResult = result;
            },
            onGenerationFinished(){
                this.generationStopped = true;
                this.isGenerating = false;
                if(!this.isGenerating){
                    this.chatList.push(this.explainedResult);
                }
            },
            onError(error){
                this.explainError = error.message;
            },
            resetSuggestionList(){
                var me = this 
                if(me.completionItemProvider != null) me.completionItemProvider.dispose();
                if(me.codeLensProvider != null) me.codeLensProvider.dispose();
            },
            addTrigger(editor, content){
                var me = this
                var lensesAry = []
                if(me.codeLensProvider != null) me.codeLensProvider.dispose();
                
                // var commandId = editor.addCommand(0, function () { 
                //     me.$emit('startAutoGenerate') 
                // }, ''); 
                var splitContent = content.split('\n')
                var test = {}
                var test2 = {}
                splitContent.forEach(function (lineContent, idx){
                    if(lineContent.includes("// implement") || lineContent.includes("//implement")){
                        test[idx] = editor.addCommand(0, function () { 
                            me.$emit('startAutoGenerate', idx, '1') 
                        }, ''); 
                        test2[idx] = editor.addCommand(0, function () { 
                            me.$emit('startAutoGenerate', idx, '2') 
                        }, ''); 
                        var lensesObj = {
                            range: {
                                startLineNumber: idx + 1,
                                startColumn: 1,
                                endLineNumber: idx + 1,
                                endColumn: 1
                            },
                            id: 'Start Generate',
                            command: {
                                id: test[idx],
                                title: 'Start Generate'
                            }
                        }
                        lensesAry.push(lensesObj)
                        var lensesObj = {
                            range: {
                                startLineNumber: idx + 1,
                                startColumn: 1,
                                endLineNumber: idx + 1,
                                endColumn: 1
                            },
                            id: 'Start Generate with domain class',
                            command: {
                                id: test2[idx],
                                title: 'Start Generate with domain class'
                            }
                        }
                        lensesAry.push(lensesObj)
                    }
                })
                me.codeLensProvider = monaco.languages.registerCodeLensProvider(this.codeLanguage, {
                    provideCodeLenses: function (model, token) {
                        return {
                            lenses: lensesAry
                        };
                    },
                    resolveCodeLens: function (model, codeLens, token) {
                        return codeLens;
                    }
                });
            },
            pasteModelValue(data){
                if(data && this.currentRange){
                    var code = this.codeValue.split("\n")
                    var splitData = data.split("/")
                    var dataPath = []
                    var dataName
                    splitData.forEach(function (data){
                        if(!/[0-9]/.test(data)){
                            dataPath.push(data)
                            dataName = data
                        }
                    })
                    dataPath = dataPath.join("/").replaceAll("//", "/").replace(`/${dataName}`, "").replaceAll("/", ".")
                    code[this.currentRange.startLineNumber - 1] = code[this.currentRange.startLineNumber - 1] + `{{#${dataPath}}} {{${dataName}}} {{/${dataPath}}}`
                    this.codeObj.code = code.join("\n")
                    this.$emit('editCode', this.codeObj.code)
                }
            },
            autoComplete(option){
                var me = this 
                me.completionItemProvider = monaco.languages.registerCompletionItemProvider(this.codeLanguage, {
                    provideCompletionItems: function (model, position) {
                        var word = model.getWordUntilPosition(position);
                        var range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn
                        };
                        var suggestions = me.createDependencyProposals(range, model)
                        return { suggestions: suggestions };
                    }
                });
            },
            createDependencyProposals(range, model) {
                var me = this
                if(me.codeSuggestionObj){
                    var objPath = []
                    var currentCode = me.value[0].code.split('\n')
                    currentCode.some(function (line, idx){
                        if(line.includes("{{#")){
                            objPath.push(line)
                        } 
                        if(line.includes("{{/")){
                            objPath.pop(line)
                        } 
                        if(idx + 1 == range.startLineNumber){
                            return true;
                        }
                    })
                    // console.log(objPath)
                    // console.log(me.codeSuggestionObj)
                    var test
                    var objList
                    me.codeSuggestionList = []
                    objPath.forEach(function (objName){
                        if(objName.includes(".")){
                            objName.split('.').forEach(function (val){
                                objList = objList ? objList : me.codeSuggestionObj
                                Object.keys(objList).some(function (key){
                                    if(val.includes(key)){
                                        if(test){
                                            if(objList[key][0]){
                                                test = objList[key][0]
                                                objList = objList[key][0]
                                            } else {
                                                test = objList[key]
                                                objList = objList[key]
                                            }
                                        } else {
                                            if(objList[key][0]){
                                                test = objList[key][0]
                                                objList = objList[key][0]
                                            } else {
                                                test = objList[key]
                                                objList = objList[key]
                                            }
                                        }
                                        return true;
                                    }
                                })
                            })
                        } else {
                            objList = objList ? objList : me.codeSuggestionObj
                            Object.keys(objList).some(function (key){
                                if(objName.includes(key)){ 
                                    if(test){
                                        if(objList[key][0]){
                                            test = objList[key][0]
                                            objList = objList[key][0]
                                        } else {
                                            test = objList[key]
                                            objList = objList[key]
                                        }
                                    } else {
                                        if(objList[key][0]){
                                            test = objList[key][0]
                                            objList = objList[key][0]
                                        } else {
                                            test = objList[key]
                                            objList = objList[key]
                                        }
                                    }
                                    return true;
                                    // me.codeSuggestionList.push()
                                }
                            })
                        }
                    })
                    Object.keys(test).forEach(function (key){
                        me.codeSuggestionList.push(key)
                    })
                }
                if(me.codeSuggestionList && me.codeSuggestionList.length > 0){
                    var returnArray = []
                    me.codeSuggestionList.forEach(function (ele){
                        var eleObj = {
                            label: `{{${ele}}}`,
                            kind: monaco.languages.CompletionItemKind.Function,
                            documentation: 'The Lodash library exported as Node.js modules.',
                            insertText: `{{${ele}}}`,
                            range: range
                        }
                        var fullEleObj = {
                            label: `{{#${ele}}}{{/${ele}}}`,
                            kind: monaco.languages.CompletionItemKind.Function,
                            documentation: 'The Lodash library exported as Node.js modules.',
                            insertText: `{{#${ele}}}{{/${ele}}}`,
                            range: range
                        }
                        returnArray.push(eleObj)
                        returnArray.push(fullEleObj)
                    })
                }
                return returnArray
            },
            generateHighlightArray(codeObj){
                var me = this
                try {
                    if(me.isHighlightMode){
                        me.$nextTick(function () {
                            if(codeObj && monaco && monaco.editor && monaco.editor.create){
                                // refresh for document
                                document.getElementById('monaco-editor-id').innerText = ''
                                var copyCodeObj = JSON.parse(JSON.stringify(codeObj));
                                // DOM 이전 템플릿을 저장 하위한 초기 모델 저장.
                                var removePatternLists = copyCodeObj.code.split('\n').filter(function(x) {
                                    if( x.includes('//<<<')  || x.includes('//>>>') || x.includes('//--<') || x.includes('//-->') || x.includes('##--<')  || x.includes('##-->') )
                                        return true;
                                    return false;
                                });
                                if(removePatternLists.length > 0){
                                    removePatternLists.forEach(function (removePattern) {
                                        copyCodeObj.code = copyCodeObj.code.replaceAll(`${removePattern}\n` , '')
                                    })
                                }
                                // Set editor of remove pattern. (only code)
                                var editor = monaco.editor.create(document.getElementById('monaco-editor-id'), {
                                    value: copyCodeObj.code,
                                    language: me.codeLanguage
                                });
                                // re-setting 하이라이팅 기능
                                copyCodeObj = JSON.parse(JSON.stringify(codeObj));
                                var patternName = copyCodeObj.pattern;
                                let patternSearch = copyCodeObj.patternRef ? copyCodeObj.patternRef.search : patternName;
                                if( copyCodeObj.fullPath.endsWith('.java') || copyCodeObj.fullPath.endsWith('.properties')){
                                    var patterns = [];
                                    let patternStr = copyCodeObj.code.split('\n').filter(x=>x.includes(patternName))[0].trim();
                                    let removePatternLists = [];
                                    if(copyCodeObj.fullPath.endsWith('.java')){
                                        patterns = [{start: '//<<<', end:'//>>>'}, {start: '//--<', end:'//-->'}];
                                        let patternType = patterns.find(x=> patternStr && patternStr.startsWith(x.start));
                                        var openPattern = `${patternType.start} ${patternSearch}`;
                                        var closePattern = `${patternType.end} ${patternSearch}`;
                                        // Remove other pattern
                                        removePatternLists = copyCodeObj.code.split('\n').filter(function(x){
                                            if( ( (x.includes('//<<<')||x.includes('//--<')) && !x.trim().includes(openPattern)) || ( (x.includes('//>>>')||x.includes('//-->')) && !x.trim().includes(closePattern)) ){
                                                return true;
                                            }
                                            return false;
                                        });
                                    } else if(copyCodeObj.fullPath.endsWith('.properties') ){
                                        patterns = [{start: '##--<', end:'##-->'}];
                                        let patternType = patterns.find(x=> patternStr && patternStr.startsWith(x.start));
                                        var openPattern = `${patternType.start} ${patternSearch}`;
                                        var closePattern = `${patternType.end} ${patternSearch}`;
                                        // Remove other pattern
                                        removePatternLists = copyCodeObj.code.split('\n').filter(function(x){
                                            if( (x.includes('##--<') && !x.trim().includes(openPattern)) || (x.includes('##-->') && !x.trim().includes(closePattern)) ){
                                                return true;
                                            }
                                            return false;
                                        });
                                    }
                                    if(removePatternLists.length > 0){
                                        removePatternLists.forEach(function (removePattern) {
                                            copyCodeObj.code = copyCodeObj.code.replaceAll(`${removePattern}\n` , '')
                                        })
                                    }
                                    // check patternName Line Number
                                    copyCodeObj.highlightLists[patternName].forEach(function(item){
                                        // start
                                        item.start = copyCodeObj.code.split('\n').findIndex((line)=>line ? line.includes(openPattern) : false)
                                        item.start = item.start + 1
                                        copyCodeObj.code = copyCodeObj.code.replace(`${openPattern}\n` , '')
                                        // end
                                        item.end = copyCodeObj.code.split('\n').findIndex((line)=>line ? line.includes(closePattern) : false)
                                        item.end = item.end
                                        copyCodeObj.code = copyCodeObj.code.replace(`${closePattern}\n` , '')
                                    })
                                }
                                if(copyCodeObj.highlightLists[patternName]){
                                    copyCodeObj.highlightLists[patternName].forEach(function(highlight){
                                        var startNum = highlight.start;
                                        var endNum = highlight.end
                                        editor.deltaDecorations(
                                            [],
                                            [
                                                {
                                                    range: new monaco.Range( startNum, 1, endNum , 1),
                                                    options: {
                                                        isWholeLine: true,
                                                        className: 'myContentClass',
                                                    }
                                                }
                                            ]
                                        );
                                        // }
                                    })
                                }
                            }
                        })
                    } else {
                        if( document.getElementById('monaco-editor-id') )
                            document.getElementById('monaco-editor-id').innerText = ''
                    }
                } catch (e) {
                    return []
                } finally {
                    if(this.isRender){
                        me.monacoIds ++;
                    }
                }
            },
            changeCodeViewerTheme() {
                if (this.theme == 'vs') {
                    this.theme = 'vs-dark'
                } else {
                    this.theme = 'vs'
                }
            },
            onScroll(e) {
                // this.offsetTop = e.target.scrollTop
            },
            onCmReady(cm) {
                // // console.log('the editor is readied!', cm)
            },
            onCmFocus(cm) {
                // // console.log('the editor is focus!', cm)
            },
            editorDidMount(editor){
                var me = this 
                // var editor = this.$refs.monacoEditor.getEditor()
                me.editorInfo = editor
                if(me.type == 'diff' && !me.isExpectedTemplate){
                    me.editorInfo.updateOptions({ renderSideBySide: false });
                    let elementOriginal = document.querySelector(".editor.original");
                    if(elementOriginal){
                        elementOriginal.style.display = "none";
                    } 
                    let elementModified = document.querySelector(".editor.modified");
                    if(elementModified){
                        elementModified.style.display = "contents";
                    }
                }
                if(me.codeValue.includes("// implement") || me.codeValue.includes("//implement")){
                    me.addTrigger(me.editorInfo, me.codeValue)
                } else {
                    if(me.codeLensProvider != null) me.codeLensProvider.dispose();
                }
                
                if(me.editMode && me.readOnly == false){
                    me.resetSuggestionList()
                    me.autoComplete()
                    
                    editor.onMouseDown(function (e) {
                        if(me.editMode && !me.readOnly){
                            me.currentRange = e.target.range
                        }
                        if(e.target.element.className == 'line-numbers'){
                            var inFunc = false
                            var code = me.codeValue.split("\n")
                            code.some(function (data, index){
                                if(e.target.position.lineNumber > index){
                                    if(data.includes("<function")){
                                        inFunc = true
                                        var debugPosition = e.target.position.lineNumber - index
                                        if(!me.debuggerPoint.find(debug => debug == debugPosition)){
                                            me.debuggerPoint.push(debugPosition)
                                            e.target.element.style.backgroundColor = "#5489e9"
                                            e.target.element.style.color = "white"
                                        } else {
                                            var num = me.debuggerPoint.findIndex(arr => arr == debugPosition)
                                            me.debuggerPoint.splice(num, 1)
                                            e.target.element.style.backgroundColor = ""
                                            e.target.element.style.color = ""
                                        }
                                        return true
                                    } 
                                } else {
                                    return true
                                }
                            })
                            if(inFunc){
                                me.$emit('editBreakPoint', me.debuggerPoint)
                            } 
                        }
                    });
                } else if(me.readOnly == false){
                    var myBinding = editor.addCommand(monaco.KeyCode.F2, function (e) {
                        var cursorPosition = editor.getPosition() 
                        me.$emit('startAutoGenerate', cursorPosition.lineNumber - 1, '1') 
                    });
                }
            },
            instructionCodeBlockClipBoard() {
                const pres = document.getElementsByTagName("pre")
                if (pres !== null) {
                    for (let i = 0; i < pres.length; i++) {
                        if (!this.opentextfield) {
                            pres[i].innerHTML = `<div class="markdown-body instruction-copy-btn"><i class="instruction-copy-icon far fa-copy"></i><div class="success-clipboard">Copied</div></div></div>${pres[i].innerHTML}`
                        }
                    }
                }
                const clipboard = new Clipboard('.instruction-copy-btn', {
                    target: (trigger) => {
                        return trigger.nextElementSibling;
                    }
                });
                // do stuff when copy is clicked
                clipboard.on('success', (event) => {
                    $(".success-clipboard").fadeIn();
                    setTimeout(() => {
                        event.clearSelection();
                        $(".success-clipboard").fadeOut();
                    }, 700);
                });
            },
            onCmCodeChange: _.debounce(function (newCode, e) {
                var me = this 
                if(!this.readOnly){
                    this.$emit('editCode', newCode)
                    if(newCode.includes("// implement") || newCode.includes("//implement")){
                        me.addTrigger(me.editorInfo, newCode)
                    } else {
                        if(me.codeLensProvider != null) me.codeLensProvider.dispose();
                    }
                }
            }, 0),           
        },
        beforeDestroy() {
            var me = this 
            if(me.completionItemProvider != null) me.completionItemProvider.dispose();
            if(me.codeLensProvider != null) me.codeLensProvider.dispose();
        }
    }
</script>
<style>
    .code-viewer {
        position: absolute;
        left: 315px;
        top: -15px;
        margin: 0 0 0 -150px;
    }
    .merge-viewer {
        position: absolute;
        left:178px;  /*left:190px;*/
        top:-44px;  /*top:10px;*/
        font-size: 15px;
        margin: 28px 0 0 -150px;
    }
    @media only screen and (max-width: 900px) {
        /* codePreview 창 줄였을 때 파일명 하단으로 내려가는 부분 */
        /* .code-viewer {
            position: absolute;
            left:165px;
            top:15px;
            margin: 30px 0 0 -150px;
        } */
    }
    .markdown-body pre code {
        font-size: 16px !important;
        font-weight: 700 !important;
    }
    .markdown-body li img:hover,
    .markdown-body p img:hover {
        cursor: -webkit-zoom-in;
    }
    .success-clipboard {
        height:22px;
        width:60px;
        font-weight:700;
        background-color:#1976d2;
        opacity: 0.8;
        margin-right: 5px;
        border-radius: 5px;
        float:left;
        text-align: center;
        color:white;
        display:none;
    }
    .instruction-copy-btn {
        float:right;
        margin:-15px -15px 0 0;
        display: none;
        cursor: pointer;
    }
    .markdown-body pre:hover .instruction-copy-btn {
        display: block;
    }
    .gpt-answer-box:nth-child(1) {
        margin-bottom: -85px !important;
    }
    .v-application ol, .v-application ul {
        padding-left: 0px;
    }
    .question-box .v-input__control .v-input__slot {
        margin-top: 20px;
    }
    .question-box .v-input__control .v-text-field__details {
        margin-top: -28px;
    }
    .prompt_field .v-input__control .v-text-field__details {
        margin-top: -28px;
    }
</style>