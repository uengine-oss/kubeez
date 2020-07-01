<template xmlns:v-on="http://www.w3.org/1999/xhtml">

    <div class="canvas-panel">

        <v-layout right>

            <opengraph ref="opengraph" focus-canvas-on-select wheelScalable :labelEditable="true"
                       :dragPageMovable="dragPageMovable" :enableContextmenu="false" :enableRootContextmenu="false"
                       :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                       :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" :enableHotkeyCtrlD="false"
                       :enableHotkeyCtrlG="false" :slider="true" :movable="!isRead" :resizable="true" :selectable="true"
                       :connectable="!isRead" v-if="value" v-on:canvasReady="bindEvents" :autoSliderUpdate="true"
                       v-on:connectShape="onConnectShape" :imageBase="imageBase">
                <!--엘리먼트-->
                <div v-for="(element, index) in value.definition">
                    <component
                            v-if="index != null && element != null && element.elementView != undefined"
                            :is="getComponentByClassName(element._type)"
                            :value.sync="value.definition[index]"
                            :ref="element.elementView.id"
                    ></component>
                </div>
                <div v-for="(element, index) in value.relation">
                    <component
                            v-if="element != null"
                            :is="getComponentByClassName(element._type)"
                            :value.sync="value.relation[index]"
                            :ref="element.relationView.id"
                    ></component>
                </div>

            </opengraph>

            <v-layout>
                <div id="terminal"></div>
            </v-layout>

            <v-flex style="justify:end; align:start;">
                <v-row justify="end" align="start" style="margin-right: 10px;">

                    <v-menu
                            v-if="!isDeploy"
                            class="pa-2"
                            style="margin-right: 3px"
                            open-on-hover
                            offset-y
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    style="margin-right: 5px;margin-top: 15px;"
                                    color="primary"
                                    dark
                                    @click="deployDialogReady()"
                                    v-on="on"
                            >
                                <v-icon>{{ files.version }}</v-icon>
                                Deploy
                            </v-btn>
                        </template>
                    </v-menu>
                    <v-menu
                            v-if="isDeploy"
                            class="pa-2"
                            style="margin-right: 3px"
                            open-on-hover
                            offset-y
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    style="margin-right: 5px;margin-top: 15px;"
                                    color="green"
                                    dark
                                    @click="deployDialogReady()"
                                    v-on="on"
                            >
                                <v-icon>{{ files.version }}</v-icon>
                                Update
                            </v-btn>
                        </template>
                    </v-menu>

                    <v-menu
                            class="pa-2"
                            style="margin-right: 3px"
                            open-on-hover
                            offset-y
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    style="margin-right: 5px;margin-top: 15px;"
                                    color="orange"
                                    dark
                                    @click="codeModalShow()"
                                    v-on="on"
                            >
                                <v-icon> {{ files.code }}</v-icon>
                                CODE
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item
                                    v-for="(item, index) in codeItems"
                                    :key="index"
                                    @click="functionSelect(item.title)"
                            >
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-row>
            </v-flex>

            <v-card class="tools" style="top:100px; text-align: center;">
                <span class="bpmn-icon-hand-tool" v-bind:class="{ icons : !dragPageMovable, hands : dragPageMovable }"
                      _width="30"
                      _height="30" v-on:click="toggleGrip">
                     <v-tooltip md-direction="right">Hands</v-tooltip>
                </span>
                <v-tooltip v-if="!isRead" right v-for="(item, key) in elementTypes" :key="key">
                    <template v-slot:activator="{ on }">
                        <span
                                class="icons draggable"
                                align="center"
                                :_component="item.component"
                                :_width="item.width"
                                :_height="item.height">
                        <img height="30px" width="30px" :src="item.src" v-on="on">
                        </span>
                    </template>
                    <span>{{item.label}}</span>
                </v-tooltip>
            </v-card>

        </v-layout>

        <modal name="codeModal" :height='"auto"' :width="'80%'" scrollable>
            <v-card flat>
                <v-card-title>
                    <v-col :col="8">
                        <span class="headline">Code Preview</span>
                    </v-col>
                    <v-col :col="4">
                        <v-select
                                :items="templateList"
                                v-model="template"
                                label="Select Template"
                                hide-details
                                class="pa-0"
                        ></v-select>
                    </v-col>
                </v-card-title>
                <v-divider></v-divider>                
                <v-card-text style="width: auto; height: auto;">
                    <v-row class="mb-6" no-gutters>
                        <v-col
                                style="margin-right: 15px; border-right: 1px solid black; max-height: 700px; max-width: 400px;"
                                id="scroll-target"
                                class="overflow-auto"
                        >
                            <v-treeview
                                    :items.sync='treeList'
                                    :active.sync="openCode"
                                    activatable
                                    item-key="key"
                                    return-object
                                    open-all
                                    :transition="treeOpen"
                                    open-on-click
                                    transition
                                    dense
                            >
                                <template v-slot:prepend="{ item, open }">
                                    <v-icon v-if="!item.file">
                                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                    </v-icon>
                                    <v-icon v-else>
                                        {{ files[item.file] }}
                                    </v-icon>
                                </template>
                            </v-treeview>
                        </v-col>
                        <v-col>
                            <code-viewer
                                    v-if="codeViewing"
                                    v-model="openCode"
                            ></code-viewer>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </modal>

        <v-snackbar v-model="snackbar" :color="color" :multi-line="mode === 'multi-line'" :timeout="timeout"
                    :vertical="mode === 'vertical'">
            {{ text }}
            <v-btn dark @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>

        <v-dialog v-model="generateZipDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Generate Zip Archive</v-card-title>
                <v-card-text>
                    <v-select
                            :items="templateList"
                            v-model="template"
                            label="Select Template"
                            hide-details
                            class="pa-0"
                    ></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="generateZip()">Download</v-btn>
                    <v-btn color="red darken-1" text @click="generateZipDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deployDialog" max-width="350">
            <v-card>
                <v-card-title class="headline">Deploy</v-card-title>
                <v-card-text>
                    <v-text-field
                            v-model="projectName"
                            label="projectName"
                    ></v-text-field>
                    <v-text-field
                            label="cluster"
                            :value="clusterName"
                            readonly
                    ></v-text-field>
                    <v-text-field
                            label="API Server"
                            :value="clusterAddress"
                            readonly
                    ></v-text-field>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deploy()">Deploy</v-btn>
                    <v-btn color="red darken-1" text @click="deployDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


    </div>

</template>

<script>
    import TextReader from "@/components/yaml.vue";
    import {
        saveAs
    } from 'file-saver';
    import firebase from 'firebase'
    import * as io from 'socket.io-client'
    import {codemirror} from 'vue-codemirror'
    import yaml from 'js-yaml'
    import json2yaml from 'json2yaml'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/darcula.css'
    import 'codemirror/mode/yaml/yaml.js'
    import axios from 'axios'

    var fs = require('fs');
    var _ = require('lodash');
    var Minio = require('minio');
    var Base64 = require('js-base64').Base64;
    var yamlpaser = require('js-yaml');
    var FileSaver = require('file-saver');
    var changeCase = require('change-case');
    var pluralize = require('pluralize');
    var JSZip = require('jszip')


    export default {
        name: 'modeling-designer',
        components: {
            TextReader,
            saveAs,
            io,
            codemirror
        },
        props: {
            elementTypes: Array
        },
        data() {
            return {
                types: 'deployment',
                plainText: "",
                dashOpen: false,
                //db permmsion
                isMultiShare: false,
                isMultiShareType: 'ReadOnly',
                isMultiShareTypeList: ['ReadOnly', 'Write'],
                shareDialog: false,
                participantsUid: '',
                participantsEmail: '',
                participantsLists: [],
                shareEveryOne: false,

                isMyEdit: false,
                isOtherEdit: false,

                isShareSave: false,
                loadingDialog: true,
                codeViewing: false,
                versionItems: [
                    {title: 'Versions'},
                ],
                shareItems: [
                    {title: 'Share'},
                ],
                saveItems: [
                    {title: 'Save to Server'},
                    {title: 'Download model File'}
                ],
                openItems: [
                    {title: 'Open from Files'},
                    // {title: 'open from Local'},
                ],
                codeItems: [
                    {title: 'Code Preview'},
                    {title: 'Download Archive'},
                ],
                onlineSaveDialog: false,
                onlineSaveComfirmDialog: false,
                isLoadVersion: false,
                //server
                author: '', //uid
                serverComment: '',
                shareComment: '',
                serverDate: '',
                editing: true,
                files: {
                    version: 'mdi-server',
                    code: 'mdi-code-array',
                    save: 'mdi-content-save',
                    open: 'mdi-book-open',
                    md: 'mdi-markdown',
                    txt: 'mdi-file-document-outline',
                    java: 'mdi-language-java',
                    xml: 'mdi-xml',
                    shell: 'mdi-powershell',
                    docker: 'mdi-docker',
                    png: 'mdi-file-image',
                    json: 'mdi-json',
                    python: 'mdi-language-python',
                    fork: ' mdi-silverware-fork',
                    share: 'mdi-share-variant'
                },
                canvas: null,
                dragPageMovable: false,
                value: {
                    'definition': [],
                    'relation': []
                },
                previewValue: {
                    'definition': [],
                    'relation': []
                },
                projectName: '',
                duplicateprojectName: false,
                generateZipDialog: false,
                //undo Redo
                undoRedoStorage: 100,
                undoRedoArray: [],
                undoRedoIndex: 0,
                undoRedoLastIndex: 0,
                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
                //스낵바 옵션
                snackbar: false,
                color: 'error',
                mode: 'multi-line',
                timeout: 6000,
                text: '수정중입니다.',
                //Zip
                pathTmp: [],
                gitCodeUrl: {},
                //data structure
                model: [],
                fullPathList: [],
                treeList: [],
                getCodeList: [],
                openCode: [],
                template: '',
                templateList: ['Separate File', 'Single File', 'Separate File per kind', 'Helm'],
                treeOpen: true,
                gitUrl: '',
                gitPath: [],
                gitCode: [],
                checkName: true,
                // Children
                drawer: false,
                chatUid: '',
                messageRef: {},
                //version
                versionList: [],
                version: '',
                revisionInfo: {},
                showVersionsDialog: false,
                //cluster
                clusterName: '',
                clusterAddress: '',
                kuberToken: '',
                //deploy
                isDeploy: false,
                getStatus: null,
                deployDialog: false,
                projectAuthor: '',
                parmVersion: '',
                parmType: '',
                parmProjectId: '',
                parmUid: '',

                //save projectId
                newProjectId: '',
                //view
                viewSelect: {},
                viewOpenId: '',
                // viewRowAddDialog: false,
                viewSelectType: 'cqrs',
                entityActionList: ['create', 'update', 'delete'],
                entityAction: '',
                //view create
                viewColumnTypeList: ['String', 'Integer', 'Double'],
                selectEvent: [],
                viewColumnType: '',
                viewColumn: '',
                sourceEventColumn: '',
                defaultValue: '',
                //edit
                isRead: false,
                //fork
                forkDialog: false,
                isUndoRedo: false,
                connetServer: '',
                roomId: "masez",
                // img: null,
                rtcLogin: false,
                webrtcDialog: false,

                //multi Edit
                // isYourValueChange: true,
                database: null,

                isSelfEdit: true,
                isLoad: false,
                sharedCount: 0

            }
        },
        beforeDestroy: function () {
            var me = this

            //rtc
            // me.onLeave()

            // me.database
            //     .ref("/saver/sharedMulti/" + me.parmProjectId + "/" + me.parmVersion + '/participants')
            //     .child(localStorage.getItem('uid'))
            //     .remove()

            //recevie off
            //me.database.ref('value').off()

            //일정 시간 마다 가져오는 함수 멈추기
            clearInterval(me.connetServer);

            localStorage.removeItem('projectId')
            localStorage.removeItem('sharedMultiTimeStamp')
            // me.$EventBus.$emit('showSave')

        },
        computed: {

            shareIconTypes() {
                var me = this
                if (me.isMultiShareType == 'ReadOnly') {
                    return 'mdi-eye'
                } else {
                    return 'mdi-pencil'
                }

            },
            id: {
                get: function () {
                    return this.projectName
                }
            },
        },
        created: function () {
            var me = this

            //database db setting
            me.database = firebase.database()
            window.io = io


            me.roomId = 'msaez_' + me.parmProjectId


            var valueInit = {"definition": [], "relation": []}

            var userUid = localStorage.getItem('uid')


            if (me.parmType == 'local') {
                localStorage.setItem('projectId', me.parmProjectId)
                me.projectName = localStorage.getItem('localSaveProjectName') != null ? localStorage.getItem('localSaveProjectName') : 'local'

                me.isRead = false
                if (localStorage.getItem('localLoadData') != null) {
                    me.value = JSON.parse(localStorage.getItem('localLoadData'));

                } else {
                    me.value = valueInit


                }
            }

        },
        mounted: function () {
            var me = this

            me.$EventBus.$on('saveDialog', function () {
                me.uploadServerDialog()
            })

            me.$EventBus.$on('login', function (newVal) {
                if (newVal != null) {
                    me.parmUid = localStorage.getItem('uid')
                }


            })

            //중간저장
            me.$EventBus.$on('storage', function (newVal) {
                var saveDate = JSON.parse(JSON.stringify(me.value))
                saveDate.definition = saveDate.definition.filter(n => n)
                saveDate.relation = saveDate.relation.filter(n => n)

                if (me.parmType == 'local') {
                    //로컬 저장
                    localStorage.removeItem('localLoadData')
                    localStorage.removeItem('localSaveTime')
                    localStorage.removeItem('localSaveProjectName')

                    //local save
                    localStorage.setItem('localLoadData', JSON.stringify(saveDate))
                    localStorage.setItem('localSaveTime', me.getNowTime())
                    localStorage.setItem('localSaveProjectName', me.projectName)

                }

            });

            this.$nextTick(function () {
                // me.messageRef.on('child_added', function (value) {
                //     // console.log(value.val())
                // });

                let startTime = new Date().getTime()

                this.canvas._CONFIG.FAST_LOADING = false;


                this.$refs.opengraph.printTimer(startTime, new Date().getTime());

                $(document).keydown((evt) => {
                    // var drawerCheck = false;
                    // me.value.definition.forEach(function (item) {
                    //     console.log(item)
                    //     if (item != null) {
                    //         // if (item.drawer) {
                    //         //     //Drawer가 있으면 true
                    //         //     drawerCheck = true;
                    //         //
                    //         // }
                    //     }
                    // })
                    // if (drawerCheck) {
                    //     return;
                    // }
                    if (evt.keyCode == 67 && (evt.metaKey || evt.ctrlKey)) {
                        me.copy();
                    } else if (evt.keyCode == 86 && (evt.ctrlKey || evt.metaKey)) {
                        me.paste();

                    } else if (evt.keyCode == 90 && (evt.metaKey || evt.ctrlKey)) {
                        if (evt.shiftKey) {
                            me.redo();
                        } else {
                            me.undo();

                        }
                    }

                });

                // if (this.$route.params.projectName && this.$route.params.author) {
                //     me.projectName = this.$route.params.projectName;
                //
                //     if (window.localStorage.getItem("author") == null) {
                //         me.author = this.$route.params.author
                //     } else {
                //         me.author = window.localStorage.getItem("author")
                //     }

                // me.$http.get(`http://34.84.25.76:8081/getEvent?author=${this.$route.params.author}&projectName=${this.$route.params.projectName}`).then(function (result) {
                //     // // console.log(result.data)
                //     me.loadAddElement(result.data);
                // })
                // }

            });

        },
        watch: {

            checkValueRelation: {
                deep: true,
                handler: function (newVal, oldVal) {
                    var me = this
                    var delta


                    if (me.isLoad == false) {
                        if (me.isUndoRedo == false) {
                            delta = jsondiffpatch.diff(oldVal, newVal);
                            if (delta != undefined) {
                                console.log("UndoRedo>>", delta)

                                if (me.parmType != 'local') {
                                    me.$EventBus.$emit('undoRedo', delta)

                                } else {
                                    me.$EventBus.$emit('undoRedo', delta)
                                    me.$EventBus.$emit('storage')
                                }
                            }
                        }
                        me.isUndoRedo = false
                    } else {
                        me.isLoad = false
                    }

                }
            },
            "projectName":
                _.debounce(
                    function (newVal) {
                        this.$EventBus.$emit('storage')
                    }, 200
                ),
            messageRef:

                function (newVal) {
                    // var me = this
                    // newVal.on('child_added', function (value) {
                    //     // console.log(value.val())
                    //     if (value.val().uid != localStorage.getItem('uid')) {
                    //         var element = JSON.parse(value.val().value)
                    //         me.editing = false;
                    //         me.$EventBus.$emit(`${element.elementView.id}`, element)
                    //     }
                    // });
                },
            async template() {
                var me = this
                me.getListSetting();

                me.$nextTick(function () {
                    me.treeOpen = true
                })
            }
        },
        methods: {
            functionSelect(title) {
                var me = this
                if (title == 'Code Preview') {
                    me.codeModalShow()
                } else if (title == 'Download Archive') {
                    me.generateZipDialog = true
                } else if (title == 'Deploy to Server') {
                    me.deployDialogReady()
                }
            },
            async codeModalShow() {
                var me = this
                
                await me.getListSetting()

                me.$modal.show('codeModal');
                me.codeViewing = true;
            },
            codeModalhide() {
                this.codeViewing = false;
                this.$modal.hide('code-modal');
            },
            copy: function () {
                var me = this
                if (!me.drawer) {
                    me.tempValue = []
                    me.value.definition.forEach(function (tmp, idx) {
                        if (tmp != null) {
                            if (tmp.selected == true) {
                                me.tempValue.push(tmp)
                            }
                        }

                    })
                    me.value.relation.forEach(function (tmp, idx) {
                        if (!tmp) {
                            if (tmp.selected == true) {
                                me.tempValue.push(tmp)
                            }
                        }

                    })
                    // this.syncOthers(tmp);
                }
            },
            b64toBlob: function (b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, {type: contentType});
                return blob;
            },
            //붙여넣기
            paste: function () {
                var me = this
                if (!me.drawer) {
                    var temp = JSON.parse(JSON.stringify(me.tempValue))

                    if (me.tempValue.length > 0) {
                        temp.forEach(function (tmp, idx) {
                            tmp.elementView.id = me.uuid();
                            tmp.elementView.x = tmp.elementView.x + 10
                            tmp.elementView.y = tmp.elementView.y + 10
                            me.value.definition.push(JSON.parse(JSON.stringify(tmp)));


                        })
                        // this.syncOthers(tmp);
                        //초기화
                    }
                }
            },
            download: function () {
                var me = this;
                // var text = JSON.stringify(me.value)
                if (me.projectName.length < 1) {
                    me.projectName = window.prompt("Please input your ProjectName")
                }
                var filename = this.projectName + '.json';
                // localStorage.setItem('projectName', me.projectName)
                // localStorage.setItem('loadData', JSON.stringify(me.value))

                me.modelSetting().then(function () {
                    var file = new File([JSON.stringify(me.model)], filename, {
                        type: "text/json;charset=utf-8"
                    });
                    FileSaver.saveAs(file);
                });


            },
            toggleGrip: function () {
                this.dragPageMovable = !this.dragPageMovable;

                if (this.dragPageMovable) {
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else {
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            bindEvents: function (opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
                this.canvas = opengraph.canvas;
                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start: function () {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height')
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });

                canvasEl.droppable({
                    drop: function (event, ui) {
                        var componentInfo = canvasEl.data('DRAG_SHAPE'),
                            shape, element;
                        if (componentInfo) {
                            var dropX = event.pageX - canvasEl.offset().left + canvasEl[0].scrollLeft;
                            var dropY = event.pageY - canvasEl.offset().top + canvasEl[0].scrollTop;
                            var scale = opengraph.canvas._CONFIG.SLIDER[0].innerText / 100

                            // dropX = dropX / opengraph.scale;
                            // dropY = dropY / opengraph.scale;


                            dropX = dropX / scale;
                            dropY = dropY / scale;

                            componentInfo = {
                                component: componentInfo.component,
                                x: dropX,
                                y: dropY,
                                width: parseInt(componentInfo.width, 10),
                                height: parseInt(componentInfo.height, 10),
                                label: ''
                            }

                            me.addElement(componentInfo);
                            // me.addElementServer(componentInfo)
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            onConnectShape: function (edge, from, to) {

                var me = this;
                //존재하는 릴레이션인 경우 (뷰 컴포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
                //=> 바뀌어야 함.
                //신규 릴레이션인 경우에는 릴레이션 생성
                var edgeElement, originalData;
                var isComponent = false;
                if (edge.shape) {
                    edgeElement = edge;
                } else {
                    isComponent = true;
                    edgeElement = edge.element;
                }
                // console.log(from, to)

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var componentInfo = {
                        component: 'class-relation',
                        sourceElement: from.$parent,
                        targetElement: to.$parent,
                        vertices: vertices,
                        isFilled: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }

                    from.$parent.value.elementView.id = from.id;
                    to.$parent.value.elementView.id = to.id;

                    if (isComponent) {
                        me.canvas.removeShape(edgeElement, true);
                        //this.removeComponentByOpenGraphComponentId(edgeElement.id);
                        //기존 컴포넌트가 있는 경우 originalData 와 함께 생성
                        this.addElement(componentInfo)
                    } else {
                        me.canvas.removeShape(edgeElement, true);
                        //기존 컴포넌트가 없는 경우 신규 생성
                        this.addElement(componentInfo);
                    }
                    // this.syncOthers();
                }
            }
            ,
            modifyRelation(element) {
                console.log(element)
                if(element.sourceElement.connectableType != undefined) {
                    if(element.sourceElement.connectableType.indexOf(element.targetElement._type) != -1) {
                        return element
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            },
            addElement: function (componentInfo, bounded) {
                this.enableHistoryAdd = true;
                var me = this;
                var additionalData = {};
                var vueComponent = me.getComponentByName(componentInfo.component);
                var element;

                if (componentInfo.component == 'class-relation') {
                    //relation info setting before make
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.sourceElement.value,
                        componentInfo.targetElement.value,
                        componentInfo.vertices,
                    );
                    var result = me.modifyRelation(element);

                    if(result == false) {
                        return;
                    }

                } else {
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height
                    );

                }

                if (me.value == null) {
                    me.value = {
                        'definition': [],
                        'relation': []
                    }
                }

                if (element._type == 'org.uengine.modeling.model.Relation') {
                    if (bounded != undefined) {
                        if (bounded) {
                            console.log("bounded")
                            return element
                        }
                    } else {
                        me.value['relation'].push(element);
                        console.log("============== Storage Location Search Test 5-1 (Add Relation) ============= ")
                        this.$EventBus.$emit('storage')
                    }
                } else {
                    if (bounded != undefined) {
                        if (bounded) {
                            console.log("bounded")
                            return element
                        }
                    } else {
                        me.value['definition'].push(element);
                        console.log("============== Storage Location Search Test 5-2 (Add Definition) ============= ")
                        this.$EventBus.$emit('storage')
                    }
                }
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
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                $.each(window.Vue.classModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
            recursiveDeepCopy(o) {
                var me = this
                var newO,
                    i;

                if (typeof o !== 'object') {
                    return o;
                }
                if (!o) {
                    return o;
                }

                if ('[object Array]' === Object.prototype.toString.apply(o)) {
                    newO = [];
                    for (i = 0; i < o.length; i += 1) {
                        newO[i] = me.recursiveDeepCopy(o[i]);
                    }
                    return newO;
                }

                newO = {};
                for (i in o) {
                    if (o.hasOwnProperty(i)) {
                        newO[i] = me.recursiveDeepCopy(o[i]);
                    }
                }
                return newO;
            },

            fileType(file) {
                var type;

                if (file.includes('.java')) {
                    type = 'java'
                } else if (file.includes('Dockerfile')) {
                    type = 'docker'
                } else if (file.includes('.xml')) {
                    type = 'xml'
                } else if (file.includes('.yaml') || file.includes('.yml') || file.includes('.properties') || file.includes('mvnw') || file.includes('.groovy')) {
                    type = 'txt'
                } else if (file.includes('md')) {
                    type = 'md'
                } else if (file.includes('.jpg') || file.includes('.png') || file.includes('.jpeg')) {
                    type = 'png'
                } else if (file.includes('.json')) {
                    type = 'json'
                } else if (file.includes('.py')) {
                    type = 'python'
                }

                return type
            },
            getListSetting() {
                var me = this
                me.treeList = []
                me.openCode = []

                if (me.template.length > 0) {
                    var template = me.template;
                } else {
                    var template = 'Separate File';
                }

                if (template == 'Separate File') {
                    var codeValue = {}
                    
                    me.value.definition.forEach(function (item) {
                        codeValue = {
                            'key': item.elementView.id,
                            'name': item.object.metadata.name + '.yaml',
                            'code': me.yamlFilter(json2yaml.stringify(item.object)),
                            'file': me.fileType('.yaml')
                        }
                        me.treeList.push(codeValue)
                    })

                } else if (template == 'Single File') {                    
                    if(!me.projectName) {
                        var name = 'local'
                    } else {
                        var name = me.projectName
                    }
                    
                    let yaml = ''
                    me.value.definition.forEach(function (item) {
                        yaml += json2yaml.stringify(item.object)
                    })

                    var codeValue = {
                        'key': name,
                        'name': name + '.yaml',
                        'code': yaml,
                        'file': me.fileType('.yaml')
                    }

                    me.treeList.push(codeValue)
                
                } else if (template == 'Separate File per kind') {

                    me.value.definition.forEach(function (item) {
                        var codeValue = {
                            'key': item.elementView.id,
                            'name': item.elementView._type + '.yaml',
                            'code': json2yaml.stringify(item.object),
                            'file': me.fileType('.yaml')
                        }                        
                        var index = me.treeList.findIndex(function (val) {
                            if(val.name == codeValue.name) {
                                val.code += codeValue.code
                            }
                            return val.name == codeValue.name
                        })
                        
                        if (index == -1) {
                            me.treeList.push(codeValue)
                        }
                    })

                } else if (template == 'Helm') {
                    me.getHelmChartSetting()
                }
                
            },
            yamlFilter(yaml_text) {
                let lines = yaml_text.split('\n')
                lines.splice(0, 1)
                for (let i in lines) {
                    lines[i] = lines[i].substring(2, lines[i].length)
                }
                yaml_text = lines.join('\n')
                yaml_text = yaml_text.replace(/ null/g, ' ')
                return yaml_text
            },
            async generateZip() {
                var me = this

                if (me.treeList.length > 0) {
                    var zip = new JSZip();
                    
                    if(!me.projectName) {
                        var name = 'local'
                    } else {
                        var name = me.projectName
                    }

                    if(me.template == 'Single File') {
                        var filename = name + '.yaml'
                        var code = me.treeList[0].code
                        var file = new File([code], filename, {type: "text/yaml;charset=utf-8"})

                        FileSaver.saveAs(file);
                    } else if (me.template == 'Helm') {
                        var name = me.treeList[0].name
                        var templates = []

                        me.treeList[0].children.forEach(function (item) {
                            if(item.name == 'templates') {
                                templates = item
                            } else {
                                zip.folder(name).file(item.name, item.code)
                            }
                        })

                        templates.children.forEach(function (item) {
                            zip.folder(name).folder('templates').file(item.name, item.code)
                        })

                        zip.generateAsync({type: "blob"})
                            .then(function (content) {
                                saveAs(content, `${name}.zip`);
                            });

                    } else {
                        me.treeList.forEach(function (item) {
                            zip.folder(name).file(item.name, item.code)
                        })

                        zip.generateAsync({type: "blob"})
                            .then(function (content) {
                                saveAs(content, `${name}.zip`);
                            });
                    }
                }

            },
            getHelmChartSetting() {
                var me = this
                var templates = []

                if(me.projectName) {
                    var name = me.projectName
                } else {
                    var name = 'kubernetes'
                }

                templates.push({
                    'key': 'notes',
                    'name': 'NOTES.txt',
                    'code': '',
                    'file': 'txt'
                })

                me.value.definition.forEach(function (item) {
                    var codeValue = {
                        'key': item.elementView.id,
                        'name': item.object.metadata.name + '.yaml',
                        'code': me.yamlFilter(json2yaml.stringify(item.object)),
                        'file': me.fileType('.yaml')
                    }
                    templates.push(codeValue)
                })
                
                var chartJson = {
                    "apiVersion": "v1",
                    "name": name,
                    "version": "0.1.0",
                    "description": ""
                }

                var valuesJson = {}

                var folder = {
                    'name': name,
                    'children': [
                        {
                            'key': 'chart',
                            'name': 'Chart.yaml',
                            'code': me.yamlFilter(json2yaml.stringify(chartJson)),
                            'file': me.fileType('.yaml')
                        },
                        {
                            'name': 'templates',
                            'children': templates
                        },
                        {
                            'key': 'values',
                            'name': 'values.yaml',
                            'code': me.yamlFilter(json2yaml.stringify(valuesJson)),
                            'file': me.fileType('.yaml')
                        }
                    ]
                }
                me.treeList.push(folder)

            },
            deployDialogReady() {
                var me = this

                if (localStorage.getItem('kuberToken')) {
                    me.clusterName = localStorage.getItem('clusterName')
                    me.clusterAddress = localStorage.getItem('clusterAddress')
                    me.kuberToken = localStorage.getItem('kuberToken')

                    me.deployDialog = true
                } else {
                    alert("클러스터 정보가 없습니다")
                }
            },
            async deploy() {
                var me = this

                await me.value.definition.forEach(function (item) {
                    var reqUrl = me.getReqUrl(item)
                    
                    if (item.status) {
                        reqUrl += item.object.metadata.name

                        me.$http.put(reqUrl, item.object).then(function (res) {
                            console.log(res.status)
                            me.getStatusData(reqUrl, item)
                        }).catch(function (err) {
                            console.log(err)
                        })
                    } else {
                        me.$http.post(reqUrl, item.object).then(function (res) {
                            me.isDeploy = true
                            console.log(res.status)
                            reqUrl += item.object.metadata.name
                            me.getStatusData(reqUrl, item)
                        }).catch(function (err) {
                            console.log(err)
                        })
                    }
                    
                })

                me.deployDialog = false
            },
            getReqUrl(item) {
                var me = this
                var reqUrl = ''
                var type = (item._type).toLowerCase()
                var lastChar = type.charAt(type.length-1);

                if(lastChar == 's') {
                    type += 'es'
                } else {
                    type += 's'
                }

                if(item.object.apiVersion == 'v1') {
                    var apiVersion = 'api/' + item.object.apiVersion
                } else {
                    var apiVersion = 'apis/' + item.object.apiVersion
                }

                if(item.object.metadata.namespace) {
                    var namespace = item.object.metadata.namespace
                } else {
                    var namespace = 'default'
                }

                reqUrl = `${API_HOST}` + '/' + apiVersion + '/namespaces/' + namespace + '/' + type + '/'
                
                if (type == 'persistentvolumes') {
                    reqUrl = `${API_HOST}` + '/' + apiVersion + '/' + type + '/'
                }

                return reqUrl
            },
            getStatusData(reqUrl, element) {
                var me = this
                var jsonData = element.object
                
                me.getStatus = setInterval(function() {
                    me.$http.get(reqUrl, jsonData).then(function (res) {
                        // console.log(res.data.status)
                        var obj = {
                            state: "get",
                            element: res.data
                        }
                        me.$EventBus.$emit(`${element.elementView.id}`, obj)
                    }).catch(function (err) {
                        console.log(err)
                        clearInterval(me.getStatus)
                    })
                }, 200)

            },
            terminal() {
                var me = this
                var url = "api/kube-token"
                
                var item = {
                    "type": "Token",
                    "name" : localStorage.getItem('clusterName'),
                    "apiServer" : localStorage.getItem('clusterAddress'),
                    "token": localStorage.getItem('kuberToken'),
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post(url, item).then(function (response) {
                    me.$EventBus.$emit('terminalOn', response.data.token)
                })
            },
            
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .input-name {
        background-color: #ffffff;
        full-width: 10px;
    }

    .canvas-panel {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: absolute;
        overflow: hidden;

        .fullcanvas {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
        }

        .fullcanvashands {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
            cursor: url('../../../../public/static/image/symbol/hands.png'), auto;
        }

        .tools {
            position: absolute;
            width: 48px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow: hidden;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .zoom {
            position: absolute;
            width: 42px;
            right: 20px;
            bottom: 120px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .icons {
            cursor: pointer;
            font-size: 30px;

            &:hover {
                color: #ffc124;
            }
        }

        .hands {
            cursor: pointer;
            font-size: 30px;
            color: #ffc124;
        }

        .export,
        .history,
        .import,
        .save {
            position: absolute;
            padding: 8px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
            }
        }

        .import {
            left: 80px;
            bottom: 20px;
        }

        .export {
            left: 180px;
            bottom: 20px;
        }

        .history {
            left: 280px;
            bottom: 20px;
        }
    }

    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    /* The whole thing */
    .custom-menu {
        display: none;
        z-index: 1000;
        position: absolute;
        overflow: hidden;
        border: 1px solid #CCC;
        white-space: nowrap;
        font-family: sans-serif;
        background: #FFF;
        color: #333;
        border-radius: 5px;
        padding: 0;
    }

    /* Each of the items in the list */
    .custom-menu li {
        padding: 8px 12px;
        cursor: pointer;
        list-style-type: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #DEF;
    }

    /*.moveable-line.moveable-rotation-line {*/
    /*    height: 40px;*/
    /*    width: 1px;*/
    /*    transform-origin: 0.5px 39.5px;*/
    /*}*/

    /*.moveable {*/
    /*    font-family: "Roboto", sans-serif;*/
    /*    position: relative;*/
    /*    width: 400px;*/
    /*    height: 130px;*/
    /*    text-align: center;*/
    /*    font-size: 40px;*/
    /*    margin: 0 auto;*/
    /*    font-weight: 100;*/
    /*    letter-spacing: 1px;*/
    /*    background: white;*/
    /*}*/


    .video-list {
        height: 160px;
        width: auto;
        margin-left: 2px;
        background: transparent;
    }

    .video-list div {
        padding: 2px;
    }

    .video-item {
        display: inline-block;
        padding: 2px;
    }
</style>
