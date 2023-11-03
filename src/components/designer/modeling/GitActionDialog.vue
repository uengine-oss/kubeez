<template>
    <div>
        <v-card flat style="height: 90vh; z-index:2;">
            <v-icon small @click="closeGitActionDialog()"
                style="font-size: 18px; position: absolute; right: 5px; top: 5px; z-index: 1;">mdi-close</v-icon>
            <div style="display: flex;">
                <div style="width: 400px; height: 88vh; overflow-y: scroll;">
                    <v-card-title style="margin-top: -10px; margin-bottom: -15px;">
                        Git Action Test Result
                    </v-card-title>

                    <div style="height: 330px;">
                        <v-list
                            nav dense
                            style="width:105%; min-width: 390px; margin:-5px -30px 0px -10px;"
                        >
                            <v-list-group
                                v-for="(file, i) in testFile" :key="i" 
                                :value="false"
                                style="margin-left: -15px;"
                                no-action
                                sub-group
                            >
                                <template v-slot:activator>
                                    <div style="cursor: pointer;">
                                        <v-row>
                                            <!-- <Icon
                                                icon="mdi:file-document-minus-outline" width="20" height="20"
                                                style="color: red; position: relative; left: -30px; top: 20px;"
                                            /> -->
                                            <v-col style="margin-left:-15px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small;">
                                                    {{ file.subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title>
                                                    {{ file.name }} 
                                                </v-list-item-title>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </template>
                                <v-list-group
                                    v-for="(test, testIdx) in siTestResults" :key="testIdx"
                                    :value="false"
                                    style="margin-left: 15px;"
                                    no-action
                                    sub-group
                                >
                                    <template v-slot:activator>
                                        <v-list-item-content style="margin-left: -10px;">
                                            <v-list-item-title>{{test.solutionType}}</v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                    <v-list-item v-for="(code, codeIdx) in test.codeChanges" :key="codeIdx" 
                                    >
                                        <div style="cursor: pointer;"
                                            @click="onSelected(test, codeIdx)"
                                        >
                                            <v-row>
                                                <Icon
                                                    icon="mdi:file-document-minus-outline" width="20" height="20"
                                                    style="color: red; position: relative; left: -30px; top: 20px;"
                                                />
                                                <v-col style="margin-left:-35px; margin-right: 25px;">
                                                    <v-list-item-title style="margin-top:10px; margin-left:10px;">
                                                        {{ code.fileName }} 
                                                    </v-list-item-title>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-list-item>
                                </v-list-group>
                            </v-list-group>
                        </v-list>
                    </div>
                </div>
                <v-divider vertical />
                <v-card-text>
                    <div>
                        <code-viewer
                            v-if="selectedFile"
                            class="gs-git-action-code-viewer"
                            :type="'diff'"
                            :isExpectedTemplate="true"
                            v-model="selectedupdateFile"
                            :create-value="selectedFile"
                            :editMode="true"
                            :readOnly="false"
                            style="padding: 0 !important;"
                        ></code-viewer>

                        <v-divider></v-divider>
                        <v-card style="width: -webkit-fill-available; margin-right: 15px; height: 25%; bottom: 3%; position: absolute;">
                            <div style="margin-top: 1%; float: right;">
                                <v-btn :disabled="startGitAction" :loading="startGitAction" @click="regenerate()" 
                                    style="margin-right: 10px; color: white;" color="green">
                                    Regenerate
                                </v-btn>
                                <v-btn v-if="errorLog" :disabled="startGitAction" :loading="startGitAction" @click="generate()" 
                                    style="margin-right: 10px; color: white;" color="green">
                                    Request fix error
                                </v-btn>
                                <v-btn v-else :disabled="startGitAction" :loading="startGitAction" @click="commitToGit()" 
                                    style="margin-right: 10px;" color="primary">
                                    Push
                                </v-btn>
                            </div>

                            <v-card-item>
                                <v-card-title>Reason for modifying the code as shown on the right.</v-card-title>
                            </v-card-item>

                            <v-card-text style="color:red">
                                {{ solution }}
                            </v-card-text>

                            <v-card-text v-if="errorLog" style="color:red">
                                {{ errorLog }}
                            </v-card-text>
                        </v-card>
                    </div>
                </v-card-text>
            </div>
        </v-card>
    </div>
</template>

<script>
    import CodeViewer from "../CodeViewer";
    import SIGenerator from './generators/SIGenerator';

    export default {
        name: 'git-action-dialog',
        mixins:[],
        components: {
            CodeViewer,
        },
        props: {
            openAiMessageList: Array,
            testFile: Array,
        },
        data() {
            return {
                selectedFile: [],
                selectedupdateFile: [],
                solution: "",
                generator: null,
                errorLog: null,
                updateList: [],
                siTestResults: [],
                startGitAction: true,
                historyNumber: 0,
                errorLogList: [],
            }
        },
        watch: {
            
        },
        computed: {
            
        },
        created:function () {
            if(this.testFile){
                this.testFile[0].subPath = this.testFile[0].fullPath.replace(this.testFile[0].name, '')
            }
        },
        beforeDestroy: function () {

        },
        mounted: function () { 
            var me = this
            me.generate();

            me.$EventBus.$on('getActionLogs', function (log) {
                console.log(log)
                me.startGitAction = false
                if(log === "All tests succeeded"){
                    alert("All tests succeeded")
                } else {
                    me.errorLogList.push(log)
                    me.errorLog = log
                }
            })
        },
        methods: {
            generate(){
                var me = this
                me.startGitAction = true
                me.generator = new SIGenerator(this);
                me.generator.generate();
            },
            regenerate(){
                for(var i = 0; i < this.updateList.length; i++){
                    this.siTestResults.pop()
                }
                this.generate()
            },
            commitToGit(){
                var me = this
                me.startGitAction = true
                me.$emit("startCommitWithSigpt", me.updateList)
            },
            onModelCreated(model){
                // console.log(model)
                // gen 된 결과 화면에 업데이트 
            },
            onGenerationFinished(model){
                var me = this

                me.startGitAction = false
                
                me.openAiMessageList.push({
                    role: "assistant",
                    content: model
                })
                
                console.log(JSON.parse(model))
                me.updateList = JSON.parse(model)
                
                let parseModel = JSON.parse(model)
                parseModel.forEach((solution) => {
                    solution['historyNumber'] = me.historyNumber
                    me.siTestResults.push(solution)
                });

                me.errorLog = null
                me.historyNumber++;
            },
            onSelected(test, codeIdx){
                var me = this
                me.solution = test.solution

                me.selectedFile = JSON.parse(JSON.stringify(me.testFile))
                me.selectedFile[0].code = test.codeChanges[codeIdx].fileCode

                me.selectedupdateFile = JSON.parse(JSON.stringify(me.testFile))
                me.selectedupdateFile[0].code = test.codeChanges[codeIdx].modifiedFileCode

                me.errorLog = me.errorLogList[test.historyNumber]
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
            closeGitActionDialog(){
                this.$emit("closeGitActionDialog")
            }
        }
    }
</script>
<style>
</style>