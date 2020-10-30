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
                <div v-for="(element, index) in value.definition" :key="'definition'+index">
                    <component
                            v-if="index != null && element != null && element.elementView != undefined"
                            :is="getComponentByClassName(element._type)"
                            :value.sync="element"
                            :ref="element.elementView.id"
                    ></component>
                </div>
                <div v-for="(element, index) in value.relation" :key="'relation'+index">
                    <component
                            v-if="element != null"
                            :is="getComponentByClassName(element._type)"
                            :value.sync="element"
                            :ref="element.relationView.id"
                    ></component>
                </div>

            </opengraph>

            <v-flex style="justify:end; align:start;">
                <v-row justify="end" align="start" style="margin-right: 10px;">
                    
                    <v-text-field
                            style="margin-right: 10px; margin-top: 20px; max-width: 180px"
                            label="Project Name"
                            v-model="projectName"
                            dense
                    ></v-text-field>
                    
                    <v-btn
                            style="margin-right: 5px; margin-top: 15px;"
                            color="cyan" dark
                            @click="clusterDialog = true">
                        <v-icon>settings</v-icon>
                        {{ clusterInfo ? clusterInfo.name : '' }}
                    </v-btn>
                    
                    <v-btn
                            style="margin-right: 5px; margin-top: 15px;"
                            color="primary" dark
                            @click="deployDialog = true">
                        <v-icon>{{ files.version }}</v-icon>
                        Deploy
                    </v-btn>
                
                    <v-menu class="pa-2" style="margin-right: 3px" open-on-hover offset-y>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    style="margin-right: 5px;margin-top: 15px;"
                                    color="orange" dark
                                    @click="codeModalShow()"
                                    v-on="on">
                                <v-icon> {{ files.code }}</v-icon>
                                CODE
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item
                                    v-for="(item, index) in codeItems" :key="index"
                                    @click="functionSelect(item.title)">
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    
                </v-row>
            </v-flex>

            <!-- <v-card class="search-tool" max-height="45">
                <span class="search-tool-icon">
                    <v-icon @click="onSearchBox()" large>search</v-icon>
                </span>
            </v-card>
             -->
            <!-- <v-card class="tools" style="top:150px; text-align: center;" max-height="400">
                <span class="bpmn-icon-hand-tool" v-bind:class="{ icons : !dragPageMovable, hands : dragPageMovable }"
                        v-on:click="toggleGrip">
                </span>

                <v-tooltip right v-for="(item, key) in filterElementTypes" :key="key">
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
            </v-card> -->

            <v-card class="tools"
                    style="top:100px; text-align: center;"

            >
                <v-tooltip right v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">

                    <template v-slot:activator="{ on }">
                         <span
                                 @mouseover="changeCategory(categoryIndex)"
                                 align="center"
                                 :_component="category[0].component"
                                 :_width="category[0].width"
                                 :_height="category[0].height"
                                 :_description="category[0].description"
                                 :_label="category[0].label"
                         >
                             <img height="30px" width="30px" :src="category[0].src" v-on="on">
                         </span>
                    </template>

                    <span>{{ category[0].component }}</span>

                </v-tooltip>


            </v-card>

            <div
                    v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">

                <div v-if="selectedCategoryIndex == categoryIndex">
           
                    <v-tooltip right v-for="(item, key) in category" :key="key">

                        <template v-slot:activator="{ on }" v-if="key>0">
                            <span
                                    class="draggable"
                                    align="center"
                                    :_component="item.component"
                                    :_width="item.width"
                                    :_height="item.height"
                                    :_description="item.description"
                                    :_label="item.label"

                                    @click="item.x = 500 + Math.random()*200; item.y=280 + Math.random()*150; addElement(item)"
                                    :style="toolStyle(key, categoryIndex, category.length)"
                            >
                                <img valign="middle" style="vertical-align:middle; border: 2 solid grey; -webkit-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);" onmouseover="this.height=this.height*1.5;this.width=this.width*1.5;this.left=this.left-this.width*0.5;this.right=this.right-this.width*0.5;" onmouseout="this.height=this.height/1.5;this.width=this.width/1.5;this.left=this.left+this.width*0.5;this.right=this.right+this.width*0.5;" height="40px" width="40px" :src="item.src" v-on="on" border=2>
                                <v-chip v-on="on">{{item.label}}</v-chip>

                            </span>
                        </template>

                        <v-card
                                class="mx-auto"
                                max-width="400"
                                max-height="400"
                                outlined
                        >
                            <v-list-item three-line>
                                <v-list-item-content>
                                    <div class="overline mb-4">{{category[0].label}}</div>
                                    <v-list-item-title class="headline mb-1">{{item.label}}</v-list-item-title>
                                    <v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
                                </v-list-item-content>

                                <v-list-item-avatar
                                        tile
                                        size="80"
                                        color="white"
                                >
                                    <v-img :src="item.src"></v-img>
                                </v-list-item-avatar>

                            </v-list-item>

                        </v-card>
                    </v-tooltip>

                </div>
            </div>


        </v-layout>

        <v-card v-if="isSearch" class="searchBox" width="200" max-height="50">
            <v-text-field
                    class="mx-3"
                    label="Search Object"
                    v-model="searchKeyword"
                    dense
            ></v-text-field>
        </v-card>

        <modal name="codeModal" :height='"auto"' :width="'80%'" scrollable>
            <v-card flat>
                <v-card-title>
                    <v-col :col="8">
                        <span class="headline">Code Preview</span>
                    </v-col>
                    <v-col :col="4">
                        <v-select
                                :items="templateTypes"
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
                                    v-if="codeView"
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
                            :items="templateTypes"
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
                            label="cluster"
                            v-model="clusterInfo.name"
                            readonly
                    ></v-text-field>
                    <v-text-field
                            label="API Server"
                            v-model="clusterInfo.apiServer"
                            readonly
                    ></v-text-field>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deployReady()">Deploy</v-btn>
                    <v-btn color="red darken-1" text @click="deployDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="clusterDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Manage Clusters</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click="clusterDialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-list three-line subheader>
                    <v-list-item>
                        <v-list-item-content>
                            <clusters @close="clusterDialog = false" v-model="clusterInfo" />
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>

    </div>

</template>

<script>
    import { saveAs } from 'file-saver'
    import * as io from 'socket.io-client'
    import yaml from 'js-yaml'
    import json2yaml from 'json2yaml'

    var fs = require('fs');
    var _ = require('lodash');
    var FileSaver = require('file-saver');
    var JSZip = require('jszip')


    export default {
        name: 'kube-modeling-designer',
        components: {
            saveAs,
            io
        },
        props: {
            elementTypes: Array
        },
        data() {
            return {
                // clusters
                clusterInfo: {},
                clusterDialog: false,
                // search object
                isSearch: false,
                searchKeyword: '',
                // code view
                codeView: false,
                codeItems: [
                    {title: 'Code Preview'},
                    {title: 'Download Archive'},
                ],
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
                projectName: '',
                generateZipDialog: false,
                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
                //스낵바 옵션
                snackbar: false,
                color: 'error',
                mode: 'multi-line',
                timeout: 6000,
                text: '수정중입니다.',
                // data structure
                treeList: [],
                openCode: [],
                template: '',
                templateTypes: [ 'Separate File', 'Single File', 'Separate File per kind', 'Helm' ],
                treeOpen: true,
                // Children
                drawer: false,
                //deploy
                deployDialog: false,
                getStatus: null,
                // 
                parmType: '',
                parmProjectId: '',
                parmUid: '',
                //edit
                isRead: false,
                //helm chart
                chartJson: {},
                valuesYaml: '',
                selectedCategoryIndex: null,
                deployResult: null,
            }
        },
        beforeDestroy: function () {
            var me = this

            //일정 시간 마다 가져오는 함수 멈추기
            clearInterval(me.connetServer);

            localStorage.removeItem('projectId')
            localStorage.removeItem('sharedMultiTimeStamp')
            // me.$EventBus.$emit('showSave')
        },
        computed: {
            id: {
                get: function () {
                    return this.projectName
                }
            },
            // filterElementTypes () {
            //     var me = this
            //     var result = me.elementTypes.filter(function (el) {
            //         var name = el.label.toLowerCase()
            //         var keyword = me.searchKeyword.toLowerCase()
            //         return name.indexOf(keyword) != -1
            //     })
            //     if(result.length == 0) {
            //         result = me.elementTypes
            //     }
            //     return result
            // }

        },
        created: function () {
            var me = this
            window.io = io

            var userUid = localStorage.getItem('uid')

            me.load();
        },
        mounted: function () {
            var me = this

            if (localStorage.getItem('kuberToken')) {
                me.clusterInfo = {
                    'name': localStorage.getItem('clusterName'),
                    'apiServer': localStorage.getItem('clusterAddress'),
                    'token': localStorage.getItem('kuberToken')
                }
            }

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
            value: {
                deep: true,
                handler: _.debounce(function () {
                        this.save();
                    }, 300)

            },
            "value.definition": {
                deep: true,
                handler: _.debounce(function() {
                    var me = this;
                    var reqUrl = "";
                    me.value.definition.forEach(function (item) {
                        reqUrl = me.getReqUrl(item) + item.object.metadata.name;
                        if(item.object.metadata.name && item.status) {
                            me.getStatusData(reqUrl, item);
                        }
                    })
                }, 500)
            },
            "projectName":
                _.debounce(
                    function (newVal) {
                        this.$EventBus.$emit('storage')
                    }, 200
                ),
            async template() {
                var me = this
                me.getListSetting();

                me.$nextTick(function () {
                    me.treeOpen = true
                })
            }
        },
        methods: {

            load(){
                var me = this;
                localStorage.setItem('projectId', me.parmProjectId)
                me.projectName = localStorage.getItem('localSaveProjectName') != null ? localStorage.getItem('localSaveProjectName') : 'local'

                me.isRead = false
                if (localStorage.getItem('localLoadData') != null) {
                    me.value = JSON.parse(localStorage.getItem('localLoadData'));

                }

            },

            save() {
                var me = this;
                var saveData = JSON.parse(JSON.stringify(me.value))
                saveData.definition = saveData.definition.filter(n => n)
                saveData.relation = saveData.relation.filter(n => n)

                //로컬 저장
                localStorage.removeItem('localLoadData')
                localStorage.removeItem('localSaveTime')
                localStorage.removeItem('localSaveProjectName')

                //local save
                localStorage.setItem('localLoadData', JSON.stringify(saveData))
                localStorage.setItem('localSaveTime', new Date())
                localStorage.setItem('localSaveProjectName', me.projectName)

            },

            changeCategory(key) {
                // console.log(key)
                var me = this
                if (me.selectedCategoryIndex == key)
                    me.selectedCategoryIndex = null;
                else
                    me.selectedCategoryIndex = key
            },

            toolStyle(cardIndex, categoryIndex, cardLength) {
                var me = this
                var angle =  (cardIndex - categoryIndex/10) * 40 / (cardLength +1) - 10;
                var angle2 = cardIndex * 10 / cardLength - 3;
                var radians = (Math.PI/ 180) * angle;

                var curvedX = Math.cos(radians) * 500 - 500;
                var curvedY = Math.sin(radians) * 700 + categoryIndex * 10 + 50;
                
                return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg);`;
            },

            functionSelect(title) {
                var me = this
                if (title == 'Code Preview') {
                    me.codeModalShow()
                } else if (title == 'Download Archive') {
                    me.generateZipDialog = true
                } else if (title == 'Deploy to Server') {
                    me.deployDialog = true
                }
            },
            async codeModalShow() {
                var me = this
                
                await me.getListSetting()

                me.$modal.show('codeModal');
                me.codeView = true;
            },
            codeModalhide() {
                this.codeView = false;
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
                                width: me.$store.getters.getWidth(componentInfo.component),
                                height: me.$store.getters.getHeight(componentInfo.component),
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
                        component: 'kube-relation',
                        sourceElement: from.$parent,
                        targetElement: to.$parent,
                        vertices: vertices,
                        isFilled: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }

                    var result = me.modifyRelation({
                        sourceElement: from.$parent.value,
                        targetElement: to.$parent.value
                    })

                    // relation component
                    if (result != false && from.$parent.value.relationComponent) {
                        componentInfo.component = from.$parent.value.relationComponent
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
            },
            modifyRelation(element) {
                // console.log(element)
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

                if (componentInfo.relationView) {
                    //relation info setting before makexxxx
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.sourceElement.value,
                        componentInfo.targetElement.value,
                        componentInfo.vertices,
                    );
                    var result = me.modifyRelation(element);

                    if(result == false) {
                        element.style = {
                            'stroke-dasharray': '- '
                        }
                        // return;
                    }

                } else {
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        me.$store.getters.getWidth(componentInfo.component),
                        me.$store.getters.getHeight(componentInfo.component)
                    );

                }

                if (me.value == null) {
                    me.value = {
                        'definition': [],
                        'relation': []
                    }
                }

                if (element.relationView) {
                    if (bounded != undefined) {
                        if (bounded) {
                            console.log("bounded")
                            return element
                        }
                    } else {
                        me.value['relation'].push(element);
                        console.log("============== Storage Location Search Test 5-1 (Add Relation) ============= ")
                        // this.$EventBus.$emit('storage')
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

                $.each(window.Vue.KubeModelingComponents, function (i, component) {
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
                    var template = 'Separate File per kind';
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
                    var yaml = ''
                    
                    me.value.definition.forEach(function (item) {
                        yaml += json2yaml.stringify(item.object)
                    })

                    var codeValue = {
                        'key': 'local',
                        'name': 'local.yaml',
                        'code': yaml,
                        'file': me.fileType('.yaml')
                    }

                    me.treeList.push(codeValue)

                } else if (template == 'Separate File per kind') {
                    me.setYamlPerKind(me.treeList)
                } else if (template == 'Helm') {
                    me.setHelmChart()
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
                yaml_text = yaml_text.replace(/\"/g, '')
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

                        saveAs(file);
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
            setYamlPerKind(treeList) {
                var me = this

                me.value.definition.forEach(function (item) {
                    var name = (item._type).toLowerCase()
                    
                    var codeValue = {
                        'key': item.elementView.id,
                        'name': name + '.yaml',
                        'code': json2yaml.stringify(item.object),
                        'file': me.fileType('.yaml')
                    }

                    var index = treeList.findIndex(function (val) {
                        if(val.name == codeValue.name) {
                            val.code += codeValue.code
                        }
                        return val.name == codeValue.name
                    })
                        
                    if (index == -1) {
                        treeList.push(codeValue)
                    }
                })
            },
            setHelmChart() {
                var me = this
                var templates = []
                var notes = {
                    'key': 'notes',
                    'name': 'NOTES.txt',
                    'code': '',
                    'file': 'txt'
                }
                templates.push(notes)
                me.setYamlPerKind(templates)

                me.chartJson = {
                    "apiVersion": "v1",
                    "name": me.projectName,
                    "version": "0.1.0",
                    "description": "A Helm chart for Kubernetes"
                }

                var folder = {
                    'name': me.projectName,
                    'children': [
                        {
                            'key': 'chart',
                            'name': 'Chart.yaml',
                            'code': me.yamlFilter(json2yaml.stringify(me.chartJson)),
                            'file': me.fileType('.yaml')
                        },
                        {
                            'name': 'templates',
                            'children': templates
                        },
                        {
                            'key': 'values',
                            'name': 'values.yaml',
                            'code': me.valuesYaml,
                            'file': me.fileType('.yaml')
                        }
                    ]
                }
                me.treeList.push(folder)
            },
            async deployReady() {
                var me = this
                if (localStorage.getItem('clusterAddress') && localStorage.getItem('kuberToken')) {
                    await me.deploy();
                    me.deployDialog = false;
                    if(!me.deployResult) {
                        alert("Deploy failed");
                    }
                } else {
                    alert("To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.");
                    me.deployDialog = false;
                }
            },
            deploy() {
                var me = this
                me.value.definition.forEach(function (item) {
                    var reqUrl = me.getReqUrl(item)
                    var params = {
                        "apiServer": me.clusterInfo.apiServer,
                        "token": me.clusterInfo.token,
                        "data": item.object
                    }
                    
                    if (!item.status) {
                        me.$http.post(reqUrl, params).then(function (res) {
                            console.log(res.status);
                            reqUrl += item.object.metadata.name;
                            me.getStatusData(reqUrl, item);
                        }).catch(function (err) {
                            console.log(err);
                            me.deployResult = false;
                        })
                    }
                })
            },
            deleteObj(item) {
                var me = this
                var reqUrl = me.getReqUrl(item)
                var params = {
                    "apiServer": me.clusterInfo.apiServer,
                    "token": me.clusterInfo.token,
                    "data": item.object
                }
                
                me.$http.delete(reqUrl, params).then(function (res) {
                    item.status = null
                    console.log(res.status)
                }).catch(function (err) {
                    console.log(err)
                })
            },
            getReqUrl(item) {
                var me = this
                var reqUrl = ''
                var type = (item._type).toLowerCase()
                var lastChar = type.charAt(type.length-1)

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
                
                if (type == 'persistentvolumes' || type == 'clusterroles' || type == 'clusterrolebindings') {
                    reqUrl = `${API_HOST}` + '/' + apiVersion + '/' + type + '/'
                }

                return reqUrl
            },
            getStatusData(reqUrl, element) {
                var me = this;
                reqUrl += '?apiServer=' + me.clusterInfo.apiServer + '&token=' + me.clusterInfo.token;

                me.$http.get(reqUrl).then(function (res) {
                    var obj = {
                        action: "getStatus",
                        element: res.data
                    }
                    me.$EventBus.$emit(`${element.elementView.id}`, obj)
                }).catch(function (err) {
                    // console.log(err)
                })
            },
            onSearchBox() {
                var me = this
                me.isSearch = !me.isSearch
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .input-name {
        background-color: #ffffff;
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
            width: 60px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow-x: hidden;
            overflow-y: auto;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .search-tool {
            position: absolute;
            width: 50px;
            height: 45px;
            top: 90px;
            left: 20px;
            text-align: center;
            overflow-x: hidden;
            overflow-y: hidden;

            .search-tool-icon > .v-icon {
                font-size: 32px;
                margin-top: 5px;
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

    .searchBox {
        top: 90px;
        left: 80px;
        position: absolute;
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
