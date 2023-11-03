<template>
    <v-dialog v-model="showLoginCard">
        <Login :onlyGitLogin="true" @login="showLoginCard = false" />
    </v-dialog>
</template>


<script>
    import StorageBase from "./ModelStorageBase";
    import Login from "../../oauth/LoginByAcebase";

    import * as io from 'socket.io-client';
    
    function Queue() {
        this.elements = [];
    }

    Queue.prototype.enqueue = function (e) {
        this.elements.push(e);
    };

    Queue.prototype.dequeue = function () {
        return this.elements.shift();
    };

    Queue.prototype.isEmpty = function () {
        return this.elements.length == 0;
    };

    Queue.prototype.peek = function () {
        return !this.isEmpty() ? this.elements[0] : undefined;
    };

    Queue.prototype.clear = function () {
        this.elements = [];
    };

    Queue.prototype.removeByIndex = function (index) {
        this.elements.splice(index, 1);
    }

    Queue.prototype.findIndexByChildKey = function (key) {
        return this.elements.findIndex(element => element.childKey == key)
    }

    Queue.prototype.length = function () {
        return this.elements.length;
    }

    var queueFifo = new Queue();

    var _ = require('lodash');
    var FileSaver = require('file-saver');

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash(obj, index) {
            return '$$index:' + index;
        },
    });


    export default {
        mixins: [StorageBase],
        name: 'model-canvas',
        components: {
            io,
            Login
        },
        props: {
            renderCount:{
                type: Number,
                default: 0
            },
            sliderLocationScale: {
                type: Number,
                default() {
                    return 1;
                }
            },
            value: {
                type: Object,
                default() {
                    return {
                        'elements': {},
                        'relations': {},
                        'basePlatform': null,
                        'basePlatformConf': {},
                        'toppingPlatforms': null,
                        'toppingPlatformsConf': {},
                        'scm': {}
                    }
                }
            },
            fork:{
                type: Boolean,
                default() {
                    return false;
                }
            },
            projectId: {
                type: String,
                default() {
                    return null;
                }
            },
            projectVersion: {
                type: String,
                default() {
                    return null;
                }
            },
            projectTitle: {
                type: String,
                default() {
                    return ''
                }
            },
            // projectName: {
            //     type: String,
            //     default() {
            //         return ''
            //     }
            // },
            dragPageMovable: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            automaticGuidance: {
                default() {
                    return false;
                },
                type: Boolean
            },
            readOnly: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            disableModel: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            isQueueModel: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            embedded: {
                type: Boolean,
                default() {
                    return false;
                }
            },
        },
        data() {
            return {
                //schedule
                sortScheduleId: null,
                queueScheduleId: null,
                isLoadedInitMirror: false,
                isLoadedMirrorQueue: false,
                projectInformation: null,
                mirrorValue: {
                    'elements': {},
                    'relations': {},
                    'basePlatform': null,
                    'basePlatformConf': {},
                    'toppingPlatforms': null,
                    'toppingPlatformsConf': {},
                    'scm': {}
                },
                mirrorQueueCount: 0,
                showLoginCard: false,
                //Version
                versionLists: null,
                viewLists : null,
                //sep
                paneLengthPercent:100,
                mainSeparatePanel:{
                    min:5,
                    max:95,
                    current:100
                },
                // Template Code
                changedTemplateCode: false,
                autoSyncTemplateId: null,
                oldTreeHashLists: null,
                newTreeHashLists: null,
                showTemplatePath: false,
                changedPathLists: [],
                changedPathListsBucket: [],
                showChangedPathLists: false,
                isChangedPathLists: false,

                //base
                fab: false,
                windowWidth: window.innerWidth,
                // user: {},
                app: null,
                fullPath: null,
                params: null,
                paramKeys: null,
                canvas: null,
                canvasType: 'k8s',
                isAutoForkModel:  false,
                canvasValidationResults: [],

                //overlay
                overlayText: null,

                //invite
                invitationLists: null,
                inviteDialog: false,
                participantLists: [],
                information: null,
                // specVersion: '1.0',
                joinRequested: false,

                storageDialog: false,
                undoDisable: false,
                redoDisable: false,

                //firebase
                lastSnapshotKey: null,
                lastSnapQueueKey: null,
                latestQueueKey: null,
                receivedQueueExistValue: false,
                changedByMe: false,
                changedByMeKeys: [],
                receivedQueueItemCountAfterLastSnapshot: 0,
                snapshotFrequency: 50,

                //share - invitationLists
                showPublicModel: false,
                permissionTypes: ['ReadOnly', 'Write'],
                showParticipantPanel: false,

                //project
                projectName: '',
                modelChanged: false,
                initLoad: false,
                title: '',
                isMineProject: false,
                isServerModel: false,

                //Save,fork
                defaultVersion: 'v0.0.1',
                storageCondition: null,
                /*
                    forkLatest : 원본모델 접근시 ( 해당 유저가 최근에 포크한 모델 ID)
                    forkOrigin : 포크모델 접근시 ( 해당 유저가 해당 모델의 원본 모델 ID)
                */
                forkInformation:{
                    forkOrigin: null,
                    forkLatest : null,
                },
                purchaseItemDialog: false,
                purchaseItemDialogInfo: {
                    mainTitle: null,
                    title: null,
                    subTitle: null,
                    itemId: null,
                    thumbnailText: null,
                    thumbnailImg: null,
                    resourceType: null,
                    className: null,
                    labName: null,
                    period: 90,
                    count: 0,
                    amount: 0,
                },

                //undo,Redo
                undoRedoArray: [],
                undoRedoIndex: 0,
                changedByUndoRedo: false,
                undoRedoState: null,

                //rtc
                rtcRoomId: 'room',

                //icon
                icon: {
                    version: 'mdi-server',
                    code: 'mdi-code-array',
                    save: 'mdi-content-save',
                    open: 'mdi-book-open',
                    md: 'mdi-language-markdown',
                    txt: 'mdi-file-document-outline',
                    java: 'mdi-language-java',
                    xml: 'mdi-xml',
                    shell: 'mdi-powershell',
                    docker: 'mdi-docker',
                    png: 'mdi-file-image',
                    json: 'mdi-code-json',
                    python: 'mdi-language-python',
                    fork: ' mdi-silverware-fork',
                    share: 'mdi-share-variant',
                    join: 'mdi-account-multiple-plus',
                    vue: 'mdi-vuejs',
                    js: 'mdi-language-javascript',
                    html: 'mdi-language-html5',
                    go: 'mdi-language-go',
                    properties: 'mdi-cog'
                },
                debounceTime: 0,
                //스낵바 옵션
                snackbar: {
                    show: false,
                    color: 'error',
                    mode: 'multi-line',
                    timeout: 6000,
                    text: '',
                    top: true,
                    bottom: false,
                    centered: false,
                    closeBtn: true,
                },
                alertInfo: {
                    show: false,
                    type: 'warning',
                    border: 'left',
                    maxWidth: 550,
                    text: '확인',
                    submit: null,
                    fnNum: 0,
                    color: 'orange',
                    link: null
                },
                codeModalCheck: false,
                checkingBilling: false,

                // rtc
                rtcLogin: false,
                webRtcDialog: false,

                //internet
                disconnect: false,

                searchForFile:{
                    onOff: false,
                    search: null,
                },
                searchForContent:{
                    onOff: false,
                    search: '',
                },
                // mouseEvents: {
                //     moves:[],
                //     totalTime: 0,
                // },
                // mouseEvents:{
                //     clientX: 0,
                //     clientY: 0,
                // },
                mouseEventHandlers: {},
                mouseEventCnt :0,
                valueChangedTimer: null,
                modelCanvasChannel: null,

            }
        },
        beforeDestroy() {
            this.executeBeforeDestroy();
        },
        computed: {
            projectSendable(){
                return false
            },
            scmTag(){
                if(this.value && this.value.scm && this.value.scm.tag){
                    return this.value.scm.tag;
                }
                return null;
            },
            scmOrg(){
                if(this.value && this.value.scm && this.value.scm.org){
                    return this.value.scm.org;
                }
                return null;
            },
            scmRepo(){
                if(this.value && this.value.scm && this.value.scm.repo){
                    return this.value.scm.repo;
                }
                return null;
            },
            scmForkedOrg(){
                if(this.value && this.value.scm && this.value.scm.forkedOrg){
                    return this.value.scm.forkedOrg;
                }
                return null;
            },
            scmForkedRepo(){
                if(this.value && this.value.scm && this.value.scm.forkedRepo){
                    return this.value.scm.forkedRepo;
                }
                return null;
            },
            filteredMouseEventHandlers(){
                try{
                    let objs = JSON.parse(JSON.stringify(this.mouseEventHandlers));
                    if(this.userInfo.email){
                        let myself = this.userInfo.email.replace(/\./gi, '_');
                        delete objs[myself];
                    }
                    return objs;
                }catch (e) {
                    return this.mouseEventHandlers
                }
            },
            filteredCanvasValidationResults(){
                var me = this
                var levelSort = ['error','warning','info']
                try{
                    return me.canvasValidationResults.sort(function compare(a, b) {
                        var aIdx = levelSort.findIndex(x=>x == a.level)
                        var bIdx = levelSort.findIndex(x=>x == b.level)
                        return aIdx - bIdx;
                    });
                }catch (e) {
                    return me.canvasValidationResults
                }
            },
            isInitRender(){
                if(this.renderCount == 0 ){
                    return true
                }
                return  false
            },
            getScale: {
                getter() {
                    return this.sliderLocationScale
                }
            },
            isForeign() {
                if (window.countryCode == 'ko') {
                    return true
                }
                return true
            },
            modelingProjectId(){
                return this.projectId
            },
            modelingProjectVersion(){
                return this.projectVersion
            },
            isCustomMoveExist() {
                return this.isServerModeling && this.isQueueModeling
            },
            isInitialLoading(){
                return this.initLoad;
            },
            isQueueModeling() {
                return this.isQueueModel
            },
            isServerModeling() {
                return this.isServerModel
            },
            isDisableModeling() {
                return this.disableModel
            },
            isReadOnlyModeling() {
                // true: 쓰기x, false(default): 쓰기o,
                if(this.disableModel){
                    return true;
                }
                if(this.readOnly || this.projectVersion){
                    return true;
                }

                return false;
            },
            isClazzModeling() {
                if (this.paramKeys && this.paramKeys.includes('classId')) {
                    return true
                }
                return false
            },
            isEmbeddedModeling(){
                return this.embedded
            },
            isVersionMode(){
                return this.modelingProjectVersion ? true : false
            },
            filteredVersionLists(){
                if(this.versionLists){
                    let versionListsCopy = this.versionLists.slice();
                    versionListsCopy.push({version:"latest"})
                    return versionListsCopy;
                }else{
                    return []
                }
            },
            isForkedModeling(){
                // fork 했던 모델.
                if(this.forkInformation && this.forkInformation.forkOrigin){
                    return true
                }
                return false
            },
            joinRequestedText() {
                var obj = {
                    show: true,
                    text: 'Join',
                }

                if (this.joinRequested) {
                    obj.show = false
                    obj.text = 'Join Requested'
                    return obj
                }
                return obj
            },
            requestCount() {

                if (this.information && this.information.permissions) {
                    var array = Object.values(this.information.permissions)
                    return array.filter((word) => {
                        if (word)
                            return word.request == true
                    }).length
                }

                return null
            },
            isClosedTemplateCode() {
                if (this.mainSeparatePanel.current > 98) {
                    return true
                }
                return false
            },
            isMobile() {
                if (this.mainSeparatePanel.current < 96)
                    return true
                return this.windowWidth <= 1093
            },
            showOverlay() {
                return this.overlayText
            },
            storage() {
                var me = this
                if (me.isServerModeling) {
                    return 'db'
                } else {
                    return 'localstorage'
                }
            },
            fixedDefalutStroage() {
                return 'db'
            },
            checkUndo() {
                var me = this
                if (!me.isServerModeling) {
                    if (me.undoRedoIndex == 0) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return me.undoDisable
                }
            },
            checkRedo() {
                var me = this
                if (!me.isServerModeling) {
                    if (me.undoRedoIndex == me.undoRedoArray.length) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return me.redoDisable
                }
            },
            copyValue() {
                return _.cloneDeep(this.value)
            },
            inviteLists() {
                return this.invitationLists
            },
            showStorageDialog() {
                return this.storageDialog
            },
        },
        created: async function () {
            var me = this;

            if (me.embedded) {
                return;
            }
            // URL
            me.fullPath = me.$route.fullPath.split('/');
            me.params = me.$route.params;
            me.paramKeys = Object.keys(me.params);

            me.$EventBus.$emit('showNewButton', false);

            //set userInfol
            await me.loginUser();
            window.io = io;
            me.app = this.getComponent('App');

            if (me.isMobile) {
                me.sliderLocationScale = 0.7;
            }

            //initialize if never initialized before
            if (!me.value || !me.value.relations) {
                me.value = {};
                me.value.relations = {};
            }
            if (!me.value || !me.value.elements) {
                me.value.elements = {};
            }

            await me.loadDefinition();

            if (me.information.associatedProject) {
                me.receiveAssociatedProject(me.information.associatedProject);
            }

            if (!me.disableModel &&
                    ((me.isServerModeling && !me.isAutoForkModel) || me.isVersionMode)
            ) {
                me.watchInformation();
                me.onEventHandler();
            }

            if (me.isServerModeling) {
                me.receiveValueSpecOne();
                me.initLoad = true;
                me.$EventBus.$emit('progressValue', false);
            }
        },
        mounted() {
            var me = this;
            me.$EventBus.$emit('isMounted-ModelCanvas', 'true');

            if (!me.value.relations) {
                me.value.relations = {};
            }
            if (!me.value.elements) {
                me.value.elements = {};
            }

            me.debounceTime = 1000;

            me.$EventBus.$on('participantPanel', function (newVal) {
                me.showParticipantPanel = newVal;
            })

            me.$EventBus.$on('snackbar', function (newVal) {
                me.snackbar.color = newVal.color ? newVal.color : '#000000';
                me.snackbar.mode = newVal.mode ? newVal.mode : 'multi-line';
                me.snackbar.timeout = newVal.timeout ? newVal.timeout : 2000;
                me.snackbar.text = newVal.text ? newVal.text : '';
                me.snackbar.top = newVal.top ? newVal.top : false;
                me.snackbar.bottom = newVal.bottom ? newVal.bottom : false;
                me.snackbar.show = newVal.show ? newVal.show : false;
                me.snackbar.centered = newVal.centered ? newVal.centered : false;
                me.snackbar.closeBtn = newVal.closeBtn ? newVal.closeBtn : false;
            });

            me.$nextTick(() => {
                window.addEventListener('resize', this.onResize);
            });

            //새로고침 감지 && 탭 닫기
            window.onbeforeunload = function (e) {
                console.log('reload');
                me.exitUser();
                me.releaseMoveEvents();
            }

            try {
                me.isConnection('db://', function (connection) {
                    if (!connection && me.isServerModeling) {
                        me.disconnect = true;
                        alert("현재 네트워크에 연결되어 있지 않습니다. \n" +
                            "현재 동시편집 기능을 이용중 이라시면 동시편집의 전체적인 데이터 손실이 될수 있습니다.\n" +
                            "네트워크 연결 후에 작업 해주시길 바랍니다. "
                        );
                    }
                });
            } catch (e) {
                console.log("failed to connect to db");
            }

            me.$EventBus.$on('login', async function (newVal) {
                if (newVal) {
                    await me.setUserInfo();
                    if (me.information && me.isServerModeling) {
                        me.settingPermission(me.information);
                    }
                }
            });

            this.$nextTick(() => {
                let startTime = Date.now();

                if (this.canvas) {
                    this.canvas._CONFIG.FAST_LOADING = false;
                }

                if (this.$refs.opengraph) {
                    this.$refs.opengraph.printTimer(startTime, Date.now());
                }

                $(document).keydown((evt) => {
                    var CkeyCode = 67;
                    var FkeyCode = 70;
                    var PkeyCode = 80;
                    var VkeyCode = 86;
                    var ZkeyCode = 90;

                    if (evt.keyCode == CkeyCode && (evt.metaKey || evt.ctrlKey)) {
                        me.copy();
                    } else if (evt.keyCode == VkeyCode && (evt.ctrlKey || evt.metaKey)) {
                        me.paste();

                    } else if (evt.keyCode == ZkeyCode && (evt.metaKey || evt.ctrlKey)) {
                        if (evt.shiftKey) {
                            if (!me.readOnly) {
                                // me.redo();
                            }
                        } else {
                            if (!me.readOnly) {
                                // me.undo();
                            }

                        }
                    }
                    // else if (evt.keyCode == PkeyCode && (evt.metaKey || evt.ctrlKey)) {
                    //     if( me.mainSeparatePanel.current < 99 ){
                    //         var result = me.searchForReady('files')
                    //         return result  == true ? true : false;
                    //     }
                    // } else if (evt.keyCode == FkeyCode && (evt.metaKey || evt.ctrlKey)) {
                    //     if(me.mainSeparatePanel.current < 99 ){
                    //         var result = me.searchForReady('contents')
                    //         return result == true ? true : false;
                    //     }
                    // }

                });

            });
        },
        watch: {
            "isInitialLoading":function(newVal){
                if(newVal){
                    this.afterLoad();
                    this.syncMirrorElements();
                }
            },
            "isLoadedInitMirror"(newVal) {
                var me = this;
                if (newVal && me.isInitialLoading) {
                    // changed MirrorValue and init definition load
                    me.syncMirrorElements();
                }
            },
            "isLoadedMirrorQueue"(newVal) {
                var me = this;
                if (newVal && me.isLoadedInitMirror) {
                    // changed MirrorValue and init definition load
                    me.syncMirrorElements();
                }
            },
            // "mouseEvents": {
            //     deep: true,
            //     handler: _.debounce(function (newVal, oldVal) {
            //         this.sendMoveEvents();
            //     }, 300)
            // },
            // "mouseEvents.moves": {
            //     deep: true,
            //     handler: _.debounce(function (newVal, oldVal) {
            //         if(newVal.length > 0){
            //             this.sendMoveEvents();
            //         }
            //     }, 300)
            // },
            "sliderLocationScale"(newVal) {
                // console.log(newVal)
            },
            "projectName":{
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    if (me.initLoad) {
                        me.modelChanged = true;
                        if (me.information && me.information.projectName != newVal) {
                            var informationObj = {
                                projectName : newVal
                            };
                            me.updateInformation(informationObj);
                        }
                    }
                }, 500)
            },
            webRtcDialog(newVal, oldVal) {
                if (newVal == false) {
                    this.onLeave();
                }
            },
            participantLists: {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    this.$EventBus.$emit('participant', newVal);
                }, 1000)
            },
            "value.scm": {
                deep: true,
                handler(newVal, oldVal) {
                    if(this.initLoad){
                        this.changedByMe = true;
                    }
                }
            },
            "copyValue": {
                deep: true,
                handler(newVal, oldVal) {
                    this.onValueChanged(oldVal, newVal);
                }
            },
        },
        methods: {
            overrideElements(elementValues) {
                // use code core.
                return elementValues;
            },
            afterSnapshotLoad() {
                // Loading initial snapshot
            },
            afterLoad() {
                // Loading initial snapshot + init queue;
            },
            alertReLogin() {
                alert("You need to re-login because session is expired");
                this.showLoginCard = true;
            },
            publishScreenShot() {
                var me = this;
                if(!me.isServerModeling) {
                    clearTimeout(me.valueChangedTimer);
                    me.valueChangedTimer = setTimeout(async function () {
                        let image = await me.screenshot();
                        await me.putString(`localstorage://image_${me.projectId}`, image);

                        me.modelCanvasChannel.postMessage({
                            event: "ScreenShot",
                            model: me.projectId,
                            image: image,
                        });
                    },1000)
                }
            },
            onValueChanged(oldVal, newVal) {
                var me = this;
                var diff = jsondiffpatch.diff(oldVal, newVal);
                if (me.initLoad && diff) {
                    me.modifiedElement(diff);
                }
            },
            async executeBeforeDestroy() {
                var me = this;

                if (me.embedded) {
                    return;
                }
                
                localStorage.removeItem('projectId');

                me.$EventBus.$emit('isMounted-ModelCanvas', 'false');
                me.$EventBus.$emit('participant', []);

                if (window.opener) {
                    window.opener = null;
                }

                if (me.rtcLogin){
                    me.onLeave();
                }

                if (me.sortScheduleId) {
                    clearTimeout(me.sortScheduleId);
                }

                window.removeEventListener('resize', this.onResize);

                if (me.initLoad) {
                    let base64Img = await me.screenshot();
                    console.log("****************");
                    console.log(me.projectId);
                    console.log("****************");

                    if (me.isServerModeling) {
                        // save image in cloud storage
                        await me.putString(`storage://definitions/${me.projectId}/information/image`, base64Img);
                    } else {
                        await me.putString(`localstorage://image_${me.projectId}`, base64Img);

                        // save iage in localstoage.
                        // let imageObjects = await me.getObject(`localstorage://serverImageLists`);
                        // if( !imageObjects ) imageObjects = {}
                        //
                        // imageObjects[me.projectId] = img
                        // await me.putObject(`localstorage://serverImageLists`, imageObjects);
                    }
                }

                await me.exitUser();
                await me.releaseMoveEvents();

                if (me.isServerModeling  && !me.isReadOnlyModeling) {
                    // server && permission O
                    if (me.initLoad && me.modelChanged) {
                        var putObj = {
                            lastModifiedTimeStamp: Date.now(),
                            lastModifiedUser: me.userInfo.uid,
                            lastModifiedEmail: me.userInfo.email,
                            projectName: me.projectName,
                        };
                        await me.putObject(`db://definitions/${me.projectId}/information`, putObj);
                    }

                } else if (!me.isServerModeling) {
                    // local
                    if (me.initLoad && me.modelChanged) {
                        var lists = localStorage.getItem('localLists')
                        if (lists) {
                            lists = JSON.parse(lists);
                            var index = lists.findIndex(list => list.projectId == me.projectId);
                            if (index != -1) {
                                if (localStorage.getItem(me.projectId)) {
                                    lists[index].projectName = me.projectName;
                                    lists[index].lastModifiedTimeStamp = Date.now();
                                } else {
                                    lists.splice(index, 1);
                                }
                                await me.putObject(`localstorage://localLists`, lists);
                            }
                        }
                    }
                }
            },
            async screenshot(canvasInfo) {
                var me = this;
                if (me.$refs['modeler-image-generator']) {
                    let canvas =  canvasInfo ? canvasInfo : me.canvas;
                    let base64Img = await me.$refs['modeler-image-generator'].save(me.projectName, canvas);
                    return base64Img;
                }
                return null;
            },
            convertTimeStampToDate(timeStamp) {
                if (timeStamp) {
                    if (typeof timeStamp == 'string')
                        timeStamp = Number(timeStamp)
                    var date = new Date(timeStamp);
                    return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분";
                } else {
                    return null;
                }
            },
            moveToView(item) {
                if (item) {
                    let route = this.$router.resolve(`${this.modelingProjectId}/${item.viewId}`);
                    window.open(route.href, '_blank');
                }
            },
            moveToVersion(item) {
                if (item) {
                    let lastIndex = this.filteredVersionLists.findIndex(x=>x.version == 'latest')
                    let lateVersion = this.filteredVersionLists[lastIndex - 1]
                    let version = item.version == 'latest' ? lateVersion.version : item.version
                    let route = this.$router.resolve(`${this.modelingProjectId}:${version}`);
                    window.open(route.href, '_blank');
                }
            },
            async onCreateGitTagName(storageCondition){
                var me = this
                // TODO: Gitlab Github 분리 필요함
                try {
                    var gitToken = localStorage.getItem('gitToken');

                    if(gitToken && me.scmOrg && me.scmRepo && me.scmTag){
                        const axios = require('axios');

                        var gitHeaders = {
                            Authorization: 'token ' + gitToken,
                            Accept: 'application/vnd.github+json'
                        }
                        var obj ={
                            owner: me.scmOrg,
                            repo: me.scmRepo,
                            tag_name: me.scmTag,
                            body: storageCondition && storageCondition.comment ? storageCondition.comment : '',
                        }
                        await axios.post(`https://api.github.com/repos/${me.scmOrg}/${me.scmRepo}/releases`, obj, { headers: gitHeaders }).then(function(){})
                        .catch(function (error) {
                            if(error.response.status === 401){
                                me.alertReLogin()
                            }
                            alert(error)
                        })
                    }
                } catch(e) {
                    console.log(e);
                }
            },
            settingChangedByMe(value){
                this.changedByMe = value
            },
            openSeparatePanel(){
                var me = this
                var separatePanel = localStorage.getItem("separatePanel")
                if(separatePanel) {
                    var separatePanelInfo = JSON.parse(separatePanel)
                    me.mainSeparatePanel.current = me.mainSeparatePanel.max < separatePanelInfo.mainSeparatePanel ? 50 : separatePanelInfo.mainSeparatePanel
                } else {
                    me.mainSeparatePanel.current = 30
                }
            },
            closeSeparatePanel(){
                var me = this

                var separatePanel = localStorage.getItem("separatePanel")
                var separatePanelInfo = {}
                if(separatePanel){
                    separatePanelInfo = JSON.parse(separatePanel);
                    separatePanelInfo.mainSeparatePanel =  me.mainSeparatePanel.current
                } else {
                    separatePanelInfo['mainSeparatePanel'] = me.mainSeparatePanel.current
                }
                var objString = JSON.stringify(separatePanelInfo)
                me.putObject(`localstorage://separatePanel`, objString)

                me.mainSeparatePanel.current = 100
            },
            filteredProjectName(projectName) {
                var me = this

                var getProjectName = projectName ? projectName : me.projectName
                var filteredName =  JSON.parse(JSON.stringify(getProjectName))
                var pattern1 = /[\{\}\[\]\/?.,;:|\)*~`!^+<>@\#$%&\\\=\(\'\"]/gi; //특수문자 제거
                var pattern2 = /[0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+|-|<>?:{}]/gi; // 한글 제거


                if (filteredName) {

                    if (pattern1.test(filteredName)) {
                        filteredName = filteredName.replace(pattern1, '');
                    }
                    if (pattern2.test(filteredName)) {
                        filteredName = filteredName.replace(pattern2, '');
                    }
                    filteredName = filteredName.toLowerCase()
                } else{
                    return 'untitled';
                }
                return filteredName == '' ? 'untitled' : filteredName;
            },
            updateInformation(informationObj){
                var me = this
                try {
                    if( me.modelingProjectId && me.isServerModeling && !me.isReadOnlyModeling ){
                        me.putObject(`db://definitions/${me.modelingProjectId}/information`,informationObj)
                    }
                } catch (e) {
                    console.error(`Update information Exception: ${e}`);
                }

            },
            exceptionError(message, options){
                var me = this
                var msg = message ? message : '[Model] Exception Error.'
                var showSnackbar = options && (options.show == false) ?  false : true

                if(showSnackbar){
                    me.snackbar.show         = true
                    me.snackbar.text         = msg
                    me.snackbar.color        = options && options.color    ? options.color : 'primary'
                    me.snackbar.mode         = options && options.mode     ? options.mode : 'multi-line'
                    me.snackbar.timeout      = options && options.timeout  ? options.timeout : 2000
                    me.snackbar.bottom       = options && options.bottom   ? options.bottom : false
                    me.snackbar.top          = !me.snackbar.bottom
                    me.snackbar.centered     = options && options.centered ? options.centered : false
                    me.snackbar.closeBtn     = options && options.closeBtn ? options.closeBtn : false
                }

                console.error(`Model Exception: ${msg}`);
            },
            clearChangedPathListsBucket(){
                this.changedPathListsBucket = []
                this.showChangedPathLists = false
            },

            autoForkModel(){
                var me = this

                // labs 모델 파악.
                if(me.isServerModel){
                    if(
                        me.information &&
                        ( me.information.author == me.userInfo.uid )
                        || ( me.information.permissions && me.information.permissions['everyone'])
                    ){
                        //server - everyone공유된거만.
                        if(me.isLogin){
                            me.checkedForkModel()
                        }else{
                            me.$EventBus.$emit('showLoginDialog')
                        }
                    }else{
                        alert('권한이 없는 모델입니다.( Public에 존재하는 모델만 가능 합니다.) ')
                    }

                }else{
                    //local
                    alert('로컬 모델로 해당기능 준비중 입니다.')
                }
            },
            onEventHandler(){
                var me = this
                try{
                    let opengraph = me.$refs['opengraph']

                    if ( opengraph && me.isLogin && me.isServerModeling && !me.isClazzModeling && !me.isReadOnlyModeling) {
                       let canvasEl = $(opengraph.container);

                       me.watch(`db://definitions/${me.modelingProjectId}/eventHandler`,function (callback) {
                           if(callback ) {
                               me.mouseEventHandlers = callback;

                               for(let email in callback){
                                   if( me.userInfo.email && me.userInfo.email.replace(/\./gi, '_') != email) {
                                       const point = document.getElementById(email);
                                       if (point) {
                                           let scale = opengraph.canvas._CONFIG.SLIDER[0].innerText / 100
                                           let offsetX = (callback[email].clientX * scale) - canvasEl[0].scrollLeft + canvasEl.offset().left
                                           let offsetY = (callback[email].clientY * scale) - canvasEl[0].scrollTop + canvasEl.offset().top
                                           point.style.left = `${offsetX}px`;
                                           point.style.top = `${offsetY}px`;
                                           point.style['background-color'] = callback[email].color;
                                       }
                                   }
                               };
                           }
                       });
                    }
                } catch (e){
                    console.log(`Error] onMoveMouse : ${e}`)
                }
            },
            sendMoveEvents(x, y){
                var me = this
                try{
                    if (me.isLogin && me.isServerModeling && !me.isClazzModeling && !me.isReadOnlyModeling) {
                        let myEmail = me.userInfo && me.userInfo.email ? me.userInfo.email.replace(/\./gi, '_') : null;
                        if(myEmail){

                            if( !me.mouseEventHandlers[myEmail] || Object.keys(me.mouseEventHandlers).length > 1){
                                let obj = {
                                    clientX: x,
                                    clientY: y,
                                }

                                if( !me.mouseEventHandlers[myEmail] ){
                                    obj.color = '#' + Math.round(Math.random() * 0xffffff).toString(16);
                                    obj.name = me.userInfo.name
                                }


                                me.putObject(`db://definitions/${me.modelingProjectId}/eventHandler/${me.userInfo.email.replace(/\./gi, '_')}`, obj)
                            }
                        }
                    }
                } catch (e){
                    console.log(`Error] Send MoveEvents : ${e}`)
                }
            },
            releaseMoveEvents(){
                var me = this
                try{
                    if (me.isLogin && me.isServerModeling && !me.isClazzModeling && !me.isReadOnlyModeling) {
                        me.watch_off(`db://definitions/${me.modelingProjectId}/eventHandler`);
                        me.delete(`db://definitions/${me.modelingProjectId}/eventHandler/${me.userInfo.email.replace(/\./gi, '_')}`)
                    }
                } catch (e){
                    console.log(`Error] Release MoveEvents : ${e}`)
                }
            },
            onMoveElementById(id, newValueStr) {
                var me = this

                if (me.value && me.value.elements && me.value.elements[id]) {
                    var newValueObj = JSON.parse(newValueStr)
                    // minus element
                    newValueObj.x =  newValueObj.x < 0 ? Math.abs(newValueObj.x) : newValueObj.x
                    newValueObj.y =  newValueObj.y < 0 ? Math.abs(newValueObj.y) : newValueObj.y
                    me.value.elements[id].elementView.x = newValueObj.x
                    me.value.elements[id].elementView.y = newValueObj.y
                    me.value.elements[id].elementView.width = newValueObj.width
                    me.value.elements[id].elementView.height = newValueObj.height
                }
            },
            onMoveRelationById(id, newValueObj) {
                var me = this

                if (me.value && me.value.relations && me.value.relations[id]) {
                    // minus relation
                    me.value.relations[id].relationView.value = newValueObj.includes('-') ? newValueObj.replaceAll('-','') : newValueObj
                }
            },
            functionCluster(title) {
                var me = this
                if (title == 'Terminal') {
                    me.loadTerminal = true;
                    me.$EventBus.$once('loadTerminal', function () {
                        me.loadTerminal = false
                    })
                    me.terminal()
                } else if (title == 'Sync') {
                    me.deployDialog = true
                } else if (title == 'Cluster') {
                    me.clusterDialog = true
                } else if (title == 'Workflow Dashboard') {
                    me.openArgoDashboard();
                } else if (title == 'ArgoCD Dashboard') {
                    me.openArgoCdDashboard();
                }
            },
            track() {
                this.$gtag.pageview(
                    {
                        page_title: `${this.canvasType} 모델링`,
                        page_path: this.$route.path
                    }
                )
            },
            onJoin() {
                this.webRtcDialog = true
                this.rtcLogin = true
                if (this.$refs)
                    this.$refs.webrtc.join();
            },
            onLeave() {
                this.rtcLogin = false
                if (this.$refs)
                    this.$refs.webrtc.leave();
            },
            onCapture() {
                if (this.$refs)
                    this.img = this.$refs.webrtc.capture();
            },
            onShareScreen() {
                if (this.$refs)
                    this.img = this.$refs.webrtc.shareScreen();
            },
            enterUser() {
                var me = this
                if ( me.isServerModeling && me.isQueueModeling && me.isInitRender && !me.isReadOnlyModeling && !me.isClazzModeling ) {
                    var postObj = {
                        action: 'userEntrance',
                        picture: me.userInfo.profile,
                        editUid: me.userInfo.uid,
                        email: me.userInfo.email,
                        userName: me.userInfo.name,
                        timeStamp: Date.now(),
                    }
                    me.pushObject(`db://definitions/${me.projectId}/queue`, postObj)
                }
            },
            exitUser() {
                var me = this
                if ( me.isServerModeling && me.isQueueModeling && me.isInitRender && !me.isReadOnlyModeling && !me.isClazzModeling  ) {
                    var pushObj = {
                        action: 'userExit',
                        editUid: me.userInfo.uid,
                        email: me.userInfo.email,
                        userName: me.userInfo.name,
                        timeStamp: Date.now(),
                    }
                    me.pushObject(`db://definitions/${me.projectId}/queue`, pushObj)
                }
            },
            settingPermission(information, init) {
                var me = this
                // Only Save Server Model
                me.isMineProject = false
                me.information = information ? information : me.information

                if( !me.isVersionMode ){
                    me.projectName = me.information && me.information.projectName ? me.information.projectName : 'untitled'
                    me.isAutoForkModel = me.isClazzModeling ? false : Object.keys(this.$route.query).includes('fork')
                }

                // console.log('project Author:', me.information.author,' Login Id: ', me.userInfo.uid)

                if ( me.isClazzModeling ) {
                    // clazz Modeling
                    if( me.information ){
                        if ( me.information.author == me.userInfo.uid ) {
                            me.isMineProject = true
                            me.readOnly = false
                        } else if( me.information.permissions && me.information.permissions['everyone'] ){
                            me.readOnly = true
                        } else {
                            me.readOnly = true
                            me.alertInfo.show = true
                            me.alertInfo.text = 'This is a non-authorized or non-shared model.'
                            me.alertInfo.fnNum = 1
                            me.alertInfo.submit = 'Request'
                        }
                    } else {
                        me.readOnly = true
                        me.alertInfo.show = true
                        me.alertInfo.text = 'Failed to load model. Try again.'
                        me.alertInfo.fnNum = 1
                        me.alertInfo.submit = 'Close'
                    }
                } else {
                    // Base Modeling
                    if (me.information.author == me.userInfo.uid) {
                        //my project
                        me.isMineProject = true
                        me.readOnly = false
                    } else {
                        if (me.isLogin) {
                            if (me.information.permissions) {
                                var isPublic = false
                                if (me.information.permissions['everyone']) {
                                    isPublic = true
                                }
                                if (me.information.permissions[me.userInfo.uid]) {
                                    if (Object.keys(me.information.permissions[me.userInfo.uid]).includes('request')) {
                                        if (me.information.permissions[me.userInfo.uid].request == false) {
                                            me.alertInfo.show = true
                                            me.alertInfo.text = 'After requesting access permission, it was not accepted.'
                                            me.alertInfo.type = 'info'
                                            if (isPublic) {
                                                me.readOnly = true
                                                me.alertInfo.fnNum = 0
                                            } else {
                                                me.disableModel = true
                                                me.alertInfo.fnNum = 1
                                                me.alertInfo.submit = 'Request again'
                                            }
                                        } else if (me.information.permissions[me.userInfo.uid].request == true) {
                                            me.joinRequested = true
                                            me.alertInfo.show = true
                                            me.alertInfo.text = 'After the request, the authority is unconfirmed.'
                                            me.alertInfo.type = 'info'

                                            if (isPublic) {
                                                me.readOnly = true
                                                me.alertInfo.fnNum = 0
                                            } else {
                                                me.disableModel = true
                                                me.alertInfo.fnNum = 1
                                                me.alertInfo.submit = 'Request again'
                                            }
                                        }
                                    } else if (me.information.permissions[me.userInfo.uid].write) {
                                        me.readOnly = false
                                    } else {
                                        me.readOnly = true
                                    }
                                } else {
                                    if (isPublic) {
                                        me.readOnly = true
                                    } else {
                                        // me.readOnly = true
                                        me.disableModel = true
                                        me.alertInfo.show = true
                                        me.alertInfo.text = 'This is an unauthorized model.(Permission list does not exist)'
                                        me.alertInfo.type = 'info'
                                        me.alertInfo.fnNum = 1
                                        me.alertInfo.submit = 'Request'
                                    }
                                }
                            } else {
                                // me.readOnly = true
                                me.disableModel = true
                                me.alertInfo.show = true
                                me.alertInfo.text = 'This is an unauthorized model.(personal model)'
                                me.alertInfo.type = 'info'
                                me.alertInfo.fnNum = 1
                                me.alertInfo.submit = 'Request'
                            }
                        } else {
                            me.disableModel = true

                            me.alertInfo.show = true
                            me.alertInfo.text = 'This is an unauthorized model.(No login)'
                            me.alertInfo.fnNum = 1
                            me.alertInfo.submit = 'Request'

                            // if (me.information && me.information.permissions && me.information.permissions['everyone']) {
                            //     me.readOnly = true
                            // } else {
                            //     // me.readOnly = true
                            //     me.alertInfo.show = true
                            //     me.alertInfo.text = 'This is an unauthorized model.(No login)'
                            //     me.alertInfo.fnNum = 1
                            //     me.alertInfo.submit = 'Request'
                            // }

                        }
                    }
                }
            },
            alertClose(fnNum) {
                var me = this

                if(fnNum  == -1){
                    me.$router.push('/')
                }

                if (fnNum == 1) {
                    // me.$router.push('/')
                }

                me.alertInfo.show = false
                me.alertInfo.text = ''
            },
            alertSubmit(fnNum) {
                var me = this

                if (fnNum == 0) {
                    // just close
                    me.alertClose()
                } else if (fnNum == 1) {
                    me.requestInviteUser()
                    me.alertClose(fnNum)
                } else if (fnNum == 2) {
                    me.$EventBus.$emit('showLoginDialog')
                    me.alertClose()
                }
            },
            purchaseItemDialogSubmit(itemName) {
                console.log('root : purchaseItemDialogSubmit', itemName)
            },
            async purchaseItemDialogOpen(id) {
                var me = this
                var getItemId = id

                if (me.isLogin) {
                    var filteredProjectName = me.filteredProjectName(me.projectName)
                    if (filteredProjectName.replace(/\s/gi, "") == '') {
                        me.projectName = window.prompt("Please input your ProjectName(English Only)")
                    } else {
                        me.purchaseItemDialogInfo.mainTitle = ''
                        me.purchaseItemDialogInfo.title = '소스코드 다운'
                        me.purchaseItemDialogInfo.resourceType = 'downloadCode'
                        me.purchaseItemDialogInfo.period = 10 / (24 * 60)
                        me.purchaseItemDialogInfo.itemId = `${getItemId}`
                        me.purchaseItemDialogInfo.relatedTo = `${me.userInfo.uid}_${getItemId}`
                        me.purchaseItemDialogInfo.amount = 100
                        me.purchaseItemDialog = true
                    }
                } else {
                    me.alertInfo.show = true
                    me.alertInfo.text = '해당 기능은 로그인후 사용이 가능합니다.'
                    me.alertInfo.fnNum = 2
                    me.alertInfo.submit = 'Login'
                }

                me.generateZipDialog = false
            },
            purchaseItemDialogInfoInit() {
                this.purchaseItemDialogInfo.mainTitle = null
                this.purchaseItemDialogInfo.title = null
                this.purchaseItemDialogInfo.subTitle = null
                this.purchaseItemDialogInfo.thumbnailText = null
                this.purchaseItemDialogInfo.resourceType = null
                this.purchaseItemDialogInfo.thumbnailImg = null
                this.purchaseItemDialogInfo.relatedTo = null
                this.purchaseItemDialogInfo.period = 90
                this.purchaseItemDialogInfo.count = false
                this.purchaseItemDialogInfo.itemId = null
                this.purchaseItemDialogInfo.amount = null
                this.purchaseItemDialogInfo.className = null
                this.purchaseItemDialogInfo.labName = null
            },
            purchaseItemDialogClose(result) {
                if (result != false) {
                    this.purchaseItemDialogInfoInit()
                }
                this.purchaseItemDialog = false
                this.generateZipDialog = false
            },
            onResize() {
                this.windowWidth = window.innerWidth
            },
            _isAttached(outer, inner) {
                if (
                    //왼쪽 상단 모서리에 걸린 경우
                    (outer.x < inner.x + inner.width &&
                        outer.y < inner.y + inner.height)

                    &&

                    //우측 하단 모서리에 걸린 경우
                    (inner.x < outer.x + outer.width &&
                        inner.y < outer.y + outer.height)

                    &&

                    //오른쪽 상단 모서리에 걸린 경우
                    (inner.x < outer.x + outer.width &&
                        outer.y < inner.y + inner.height)

                    &&

                    //왼쪽 하단 모서리에 걸린 경우
                    (outer.x < inner.x + inner.width &&
                        inner.y < outer.y + outer.height)
                ) return true;

                return false;
            },
            closeOverlay() {
                this.overlayText = null
            },
            downloadModelToJson() {
                var me = this;

                if (me.projectName.length < 1) {
                    me.projectName = window.prompt("Please input your ProjectName")

                } else {
                    me.$refs['modeler-image-generator'].save(me.projectName, me.canvas).then(function (img) {

                        var cpValue = JSON.parse(JSON.stringify(me.value))
                        cpValue.type = me.information ? me.information.type : me.canvasType
                        cpValue.img = img
                        cpValue.date = Date.now()
                        cpValue.projectName = me.projectName ? me.projectName : 'undefined'

                        var filename = me.projectName + '.json';

                        var modelForJsonToTextFile = new File([JSON.stringify(cpValue)], filename, {
                            type: "text/json;charset=utf-8"
                        });
                        FileSaver.saveAs(modelForJsonToTextFile);
                        alert('Successfully Saved', me.projectName, '.')

                    })
                }

            },
            saveComposition(state) {
                var me = this
                me.storageDialogReady(state)
            },
            async storageDialogReady(state) {
                var me = this;
                var obj = {};
                var proName = me.projectName ? me.projectName : 'untitled';
                proName = JSON.parse(JSON.stringify(proName));

                var convertProjectId = proName ? me.filteredProjectName(proName) : me.dbuid();
                convertProjectId = convertProjectId.replaceAll(' ','-');

                obj= {
                    action: 'save',
                    title: 'SAVE',
                    comment: '',
                    projectName: proName,
                    editProjectName :JSON.parse(JSON.stringify(proName)),
                    projectId: convertProjectId,
                    version: me.defaultVersion,
                    error: null,
                    loading: false,
                };


                if (state == 'save') {
                    if (window.opener) {
                        obj = null;
                        me.postParentWindow();
                    } else if (me.isServerModel) {
                        obj.action = 'backup'
                        obj.title = 'Save New Version'

                        let nextVer = me.information.lastVersionName ? me.information.lastVersionName : me.defaultVersion;
                        if(me.information.lastVersionName){
                            let nextVersion = nextVer.substr(-1);
                            nextVersion =  !isNaN(Number(nextVersion)) ? Number(nextVersion)+1: ''
                            nextVer = `${nextVer.substr(0, nextVer.length - 1)}${nextVersion}`
                        }
                        obj.version = nextVer
                    } else{
                        // SAVE
                    }
                } else if (state == 'fork') {
                    var forkBy ={
                        org : me.scmOrg,
                        repo: me.scmRepo
                    }

                    obj.action = 'fork'
                    obj.title = 'FORK'
                    obj.userId = me.forkInformation.forkLatest ? me.userInfo.uid : null
                    obj.isForkModel =  me.forkInformation.forkLatest
                    obj.forkedModelInfo = JSON.stringify(forkBy)

                } else if (state == 'duplicate') {
                    obj.action = 'fork'
                    obj.title = 'Duplicate'
                    obj.userId= me.forkInformation.forkLatest ? me.userInfo.uid : null
                    obj.isForkModel = me.forkInformation.forkLatest

                } else {
                    obj = null;
                }

                this.storageCondition = obj;
                this.storageDialog = true;
            },
            storageDialogCancel() {
                this.storageCondition.loading = false
                this.storageDialog = false
            },
            async validateStorageCondition(item, action){
                var me = this

                var originProjectId = me.projectId
                if(action == 'fork'){
                    var convertProjectId = item.projectId ? item.projectId : me.dbuid();
                } else {
                    var convertProjectId = item.projectId ? item.projectId : originProjectId
                }
                // 빈칸 -> - 변경
                convertProjectId = convertProjectId.replaceAll(' ','-');

                if( convertProjectId.includes('/') ){
                    var otherMsg = 'ProjectId must be non-empty strings and can\'t contain  "/"'
                    var obj ={
                        'projectId': otherMsg
                    }
                    me.storageCondition.error = obj
                    return false;
                }

                if( item.version == 'latest'){
                    var obj ={
                        'version': 'The version name cannot be specified as "latest".'
                    }
                    item.error = obj
                    return false
                }

                // checked duplicate projectId
                if( !action.includes('backup') ){

                    var validateInfo = await me.isValidatePath(`db://definitions/${convertProjectId}/information`);
                    if( !validateInfo.status ){
                        var obj ={
                            'projectId': validateInfo.msg,
                        }
                        me.storageCondition.error = obj
                        return false;
                    }

                    var information = await me.list(`db://definitions/${convertProjectId}/information`)
                    if(information){
                        var obj ={
                            'projectId': 'This project id already exists.'
                        }
                        me.storageCondition.error = obj
                        return false;
                    }
                }

                // exists version
                if( !action.includes('fork') ){
                    // checked Version
                    if( !item.version ){
                        item.version = me.getNowDate();
                    }

                    // validate Path
                    var validate = await me.isValidatePath(`db://definitions/${originProjectId}/versionLists/${item.version.replaceAll('.','-')}`)
                    if( !(validate.status && !item.version.replaceAll('.','-').includes('/') && !item.version.replaceAll('.','-').includes(':')) ){
                        var otherMsg = 'Paths must be non-empty strings and can\'t contain  "/" or ":"'
                        var obj ={
                            'version': item.version.replaceAll('.','-').includes('/') || item.version.replaceAll('.','-').includes(':') ? otherMsg : validate.msg,
                        }
                        item.error = obj
                        return false
                    }

                    var existVersion = await me.list(`db://definitions/${originProjectId}/versionLists/${item.version.replaceAll('.','-')}`)
                    if(existVersion){
                        var otherMsg = 'This version already exists.'
                        var obj ={
                            'version': otherMsg,
                        }
                        item.error = obj
                        return false
                    }
                }

                return true
            },
            async addView(){
                var me = this

                try {
                    let validation = await me.validateStorageCondition(me.storageCondition, 'addView');
                    if( validation && me.projectId){
                        let img = await me.$refs['modeler-image-generator'].save(me.projectName, me.canvas);
                        // let imageUrl = await me.putString(`storage://definitions/${ me.projectId}/viewLists/${me.storageCondition.viewId}/image`, img);

                        var viewObj = {
                            owner: me.userInfo.uid,
                            ownerEmail: me.userInfo.email,
                        }
                        me.putObject(`db://definitions/${ me.projectId}/viewLists/${me.storageCondition.viewId}`, viewObj);
                        me.storageDialogCancel();
                    } else {
                        me.storageCondition.loading = false
                    }

                } catch(e){
                    me.storageCondition.loading = false
                }
            },
            async backupModel() {
                var me = this
                try {
                    var check = await me.validateStorageCondition(me.storageCondition, 'backup');
                    if(check){
                        var originProjectId = me.projectId;
                        var projectVersion = me.storageCondition.version.replaceAll('.','-').trim();

                        // set tag
                        if(me.value.scm.org && me.value.scm.repo){
                            me.value.scm.tag = me.storageCondition.version;
                        }

                        let img = await me.$refs['modeler-image-generator'].save(me.projectName, me.canvas);

                        // input image storage.
                        await me.putString(`storage://definitions/${originProjectId}/information/image`, img);

                        var putInformation = {
                            lastVersionName: projectVersion,
                            projectName: me.storageCondition.editProjectName,
                            comment: me.storageCondition.comment,
                        }

                        let valueUrl = await me.putString(`storage://definitions/${originProjectId}/versionLists/${projectVersion}/versionValue`, JSON.stringify(me.value));
                        let imagURL = await me.putString(`storage://definitions/${originProjectId}/versionLists/${projectVersion}/image`, img);
                        // console.log(settingProjectId, originProjectId)
                        var versionInfoObj = {
                            lastQueueKey: me.lastSnapQueueKey,
                            saveUser: me.userInfo.uid,
                            saveUserEmail: me.userInfo.email,
                            saveUserName: me.userInfo.name,
                            projectName: me.storageCondition.editProjectName,
                            img: imagURL,
                            timeStamp: Date.now(),
                            comment: me.storageCondition.comment,
                            valueUrl: valueUrl
                        }

                        me.projectName = putInformation.projectName
                        me.onCreateGitTagName(me.storageCondition);
                        await me.putObject(`db://definitions/${originProjectId}/versionLists/${projectVersion}`, versionInfoObj)
                        // await me.putObject(`db://definitions/${originProjectId}/versionLists/${projectVersion}/versionValue`, versionValueObj)

                        await me.putObject(`db://definitions/${originProjectId}/information`, putInformation)
                        // console.log(settingProjectId, originProjectId)
                        me.storageDialogCancel()
                        //alert('Success: Saved model.')

                    } else {
                        this.storageCondition.loading = false
                    }

                } catch (e) {
                    me.alertInfo.text = 'BACKUP-ERROR' + e
                    me.alertInfo.show = true
                }
            },
            async saveModel() {
                var me = this
                me.$EventBus.$emit('progressValue', true);
                await me.loadDefinitionLocal()
                try {
                    var check = await me.validateStorageCondition(me.storageCondition, 'save');
                    if(check){
                        var originProjectId =  me.projectId
                        var settingProjectId = me.storageCondition.projectId.replaceAll(' ','-').trim();
                        var projectVersion = me.storageCondition.version.replaceAll('.','-').trim();

                        me.projectName = me.storageCondition.projectName

                        if(me.value.scm.org && me.value.scm.repo){
                            me.value.scm.tag = me.storageCondition.version;
                        }

                        let img = await me.$refs['modeler-image-generator'].save(me.projectName, me.canvas);

                        // input image storage.
                        /** 
                         * TODO: 분기 처리 필요
                         * Issue: storage 자체는 설치형에서 사용 할 수 없음 (Cloud Storage)
                         * 따라서 이미지 저장 / 호출 부분을 Acebase쪽으로 이관
                         * */ 
                    
                        // await me.putString(`storage://definitions/${settingProjectId}/information/image`, img);

                        var userInfoObj = {
                            uid: me.userInfo.uid,
                            name: me.userInfo.name,
                            picture: me.userInfo.profile
                        }
                        var informationObj = {
                            author: me.userInfo.uid,
                            authorEmail: me.userInfo.email,
                            lastVersionName: projectVersion,
                            comment: me.storageCondition.comment,
                            createdTimeStamp: Date.now(),
                            lastModifiedTimeStamp: Date.now(),
                            lastModifiedUser: null,
                            lastModifiedEmail: null,
                            projectName: me.projectName,
                            type: me.canvasType,
                            projectId: settingProjectId,
                            // gitOrgName: me.information && me.information.gitOrgName ? me.information.gitOrgName:null,
                            // gitRepoName: me.information && me.information.gitRepoName ? me.information.gitRepoName:null,
                            firstCommit: me.information && me.information.firstCommit ? me.information.firstCommit:null,
                            associatedProject: me.information.associatedProject
                        }

                        let valueUrl = await me.putString(`storage://definitions/${settingProjectId}/versionLists/${projectVersion}/versionValue`, JSON.stringify(me.value));
                        let imagURL = await me.putString(`storage://definitions/${originProjectId}/versionLists/${projectVersion}/image`, img);
                        console.log(settingProjectId, originProjectId)
                        var versionInfoObj = {
                            saveUser: me.userInfo.uid,
                            saveUserEmail: me.userInfo.email,
                            saveUserName: me.userInfo.name,
                            projectName: me.storageCondition.editProjectName,
                            img: imagURL,
                            timeStamp: Date.now(),
                            comment: me.storageCondition.comment,
                            valueUrl: valueUrl
                        }


                        var snapshotObj = {
                            lastSnapshotKey: '',
                            snapshot: JSON.stringify(me.value),
                            snapshotImg: imagURL,
                            timeStamp: Date.now()
                        }


                        if(me.projectSendable){
                            // Sync connected associatedProject.
                            me.synchronizeAssociatedProject(originProjectId, settingProjectId);

                            // if channel disconnect not Sync.
                            // me.modelCanvasChannel.postMessage({
                            //     event: "ProjectIdChanged",
                            //     type: me.canvasType,
                            //     old: originProjectId,
                            //     new: settingProjectId
                            // });
                        }


                        if ( me.isQueueModeling ) {
                            me.pushObject(`db://definitions/${settingProjectId}/snapshotLists`, snapshotObj)
                            // me.putObject(`db://definitions/${settingProjectId}`, snapshotSpecObj)
                            // me.specVersion = '3.0'
                        }

                        me.onCreateGitTagName(me.storageCondition);
                        await me.putObject(`db://definitions/${settingProjectId}/information`, informationObj)
                        me.putObject(`db://userLists/${me.userInfo.uid}`, userInfoObj)


                        /* 백업용 사용자의 local에서 마지막 모델링 정보 */
                        me.putObject(`db://definitions/${settingProjectId}/versionLists/${projectVersion}`, versionInfoObj)
                        // me.putObject(`db://definitions/${settingProjectId}/versionLists/${projectVersion}/versionValue`, versionValueObj)

                        console.log(settingProjectId, originProjectId)
                        var lists = await me.getObject(`localstorage://localLists`)
                        var index = lists.findIndex(list => list.projectId == originProjectId)
                        var location = 'storming'

                        if (index != -1) {
                            await me.delete(`localstorage://${originProjectId}`)
                            if (me.canvasType == 'k8s') {
                                location = 'kubernetes'
                            }

                            lists.splice(index, 1)
                            await me.putObject(`localstorage://localLists`, lists)
                        }
                        
                        if (me.isClazzModeling) {
                            me.updateClassModelingId(settingProjectId);
                        } else {
                            // me.moveModelUrl(settingProjectId);
                            me.$router.push({path: `/${location}/${settingProjectId}`});
                            me.$emit('forceUpdateKey')
                        }

                        me.watchInformation()
                        if (me.isQueueModeling) {
                            me.receiveQueue()
                        } else {
                            me.receiveValueSpecOne()
                            me.initLoad = true
                            me.$EventBus.$emit('progressValue', false)
                        }



                        me.storageDialogCancel()

                    } else {
                        this.storageCondition.loading = false
                    }
                } catch (e) {
                    me.alertInfo.text = 'SAVE-ERROR' + e
                    me.alertInfo.show = true
                }

            },
            moveModelUrl(modelId){
                this.$router.push({path: `/${this.canvasType}/${modelId}`});
            },
            synchronizeAssociatedProject(oldId, newId){},
            async checkedForkModel(){
                var me = this
                if(me.isServerModeling){
                    if( me.forkInformation.forkLatest || me.isClazzModeling ){
                        me.saveComposition('fork')
                    }else{
                        me.forkModel()
                    }
                }else{
                    me.forkModel()
                }
            },
            updateClassModelingId(newProjectId){
                this.$emit('newProjectId',newProjectId);
            },
            async forkModel() {
                var me = this

                try {
                    me.$EventBus.$emit('progressValue', true);
                    var check = await me.validateStorageCondition(me.storageCondition, 'fork');
                    if(check){
                        var originProjectId =  me.projectId
                        if( !me.storageCondition.projectId ) me.storageCondition.projectId = me.dbuid();
                        var settingProjectId = me.storageCondition.projectId.replaceAll(' ','-').trim();
                        var projectVersion = me.storageCondition.version.replaceAll('.','-').trim();
                        var copyValue = JSON.parse(JSON.stringify(me.value));

                        // 현재 모델의 org, repo 를 저장?
                        copyValue.scm.forkedOrg = copyValue.scm.org;
                        copyValue.scm.forkedRepo = copyValue.scm.repo;
                        copyValue.scm.forkedTag = copyValue.scm.tag;
                        copyValue.scm.org = null;
                        copyValue.scm.repo = null;
                        copyValue.scm.tag = null;

                        let img = await me.$refs['modeler-image-generator'].save(me.projectName, me.canvas);

                        if (!me.isServerModeling) {
                            me.storageDialogCancel()
                            alert('준비중 입니다.')
                        } else {
                            await me.putString(`storage://definitions/${settingProjectId}/information/image`, img);

                            var userInfoObj = {
                                uid: me.userInfo.uid,
                                name: me.userInfo.name,
                                picture: me.userInfo.profile
                            }

                            var informationObj = {
                                author: me.userInfo.uid,
                                authorEmail: me.userInfo.email,
                                forkOrigin: originProjectId,
                                lastVersionName: projectVersion,
                                comment: me.storageCondition ? me.storageCondition.comment : '',
                                createdTimeStamp: Date.now(),
                                lastModifiedTimeStamp: Date.now(),
                                // img: img,
                                lastModifiedUser: null,
                                lastModifiedEmail: null,
                                projectName: me.storageCondition ? me.storageCondition.editProjectName : me.projectName,
                                type: me.information.type,
                            }


                            // var versionValueObj ={
                            //     value: JSON.stringify(copyValue),
                            // }
                            let valueUrl = await me.putString(`storage://definitions/${settingProjectId}/versionLists/${projectVersion}/versionValue`, JSON.stringify(copyValue));
                            let imagURL = await me.putString(`storage://definitions/${originProjectId}/versionLists/${projectVersion}/image`, img);

                            console.log(settingProjectId, originProjectId)
                            var versionInfoObj = {
                                saveUser: me.userInfo.uid,
                                saveUserEmail: me.userInfo.email,
                                saveUserName: me.userInfo.name,
                                projectName: me.storageCondition.editProjectName,
                                img: imagURL,
                                timeStamp: Date.now(),
                                comment: me.storageCondition.comment,
                                valueUrl: valueUrl
                            }
                            var snapshotObj = {
                                lastSnapshotKey: '',
                                snapshot: JSON.stringify(copyValue),
                                snapshotImg: imagURL,
                                timeStamp: Date.now()
                            }


                            var putProjectObj = {
                                projectId: settingProjectId,
                                forkOrigin: originProjectId,
                            }

                            if ( me.isQueueModeling) {
                                me.pushObject(`db://definitions/${settingProjectId}/snapshotLists`, snapshotObj)
                                // me.putObject(`db://definitions/${settingProjectId}`, snapshotSpecObj)
                            }
                            me.putObject(`db://definitions/${settingProjectId}/information`, informationObj)
                            me.putObject(`db://userLists/${me.userInfo.uid}`, userInfoObj)
                            me.putObject(`db://userLists/${me.userInfo.uid}/mine/${settingProjectId}`, putProjectObj)
                            // Origin Model Setting
                            me.setString(`db://definitions/${putProjectObj.forkOrigin}/forkUserLists/${me.userInfo.uid}`, settingProjectId)

                            /* 백업용 사용자의 local에서 마지막 모델링 정보 */
                            me.putObject(`db://definitions/${settingProjectId}/versionLists/${projectVersion}`, versionInfoObj)
                            // me.putObject(`db://definitions/${settingProjectId}/versionLists/${projectVersion}/versionValue`, versionValueObj)
                            console.log(settingProjectId, originProjectId)
                            if(me.isClazzModeling){
                                me.updateClassModelingId(settingProjectId);
                            }else{
                                var location = null;
                                if (me.canvasType == 'k8s') {
                                    location = 'kubernetes'
                                }

                                // me.moveModelUrl(settingProjectId);
                                me.$router.push({path: `/${location}/${settingProjectId}`});
                                me.$emit('forceUpdateKey')
                            }
                            me.storageDialogCancel()

                        }

                    } else {
                        this.storageCondition.loading = false
                    }
                } catch (e) {
                    me.alertInfo.text = 'FORK-ERROR' + e
                    me.alertInfo.show = true
                }
            },
            watchInformation(){
                var me = this
                me.watch(`db://definitions/${me.projectId}/information`, function (information) {
                    if (information) {
                        me.isServerModel = true
                        me.settingPermission(information)
                    }
                })
            },
            // async getSpecVersion() {
            //     var me = this
            //     var getItem = '1.0'
            //     return new Promise(async function (resolve) {
            //         var getSpecVersion = await me.getString(`db://definitions/${me.projectId}/specVersion`)
            //         if (getSpecVersion) {
            //             getItem = getSpecVersion
            //         }
            //         resolve(getItem)
            //     })
            // },
            async loadViewes(){
                var me = this
                let result =[]

                if( !me.viewLists || me.viewLists.length == 0 ){
                    var viewes  = await me.list(`db://definitions/${me.projectId}/viewLists`);
                    if(viewes){
                        result = Object.keys(viewes).map(function(version){
                            var rObj =  viewes[version] ? viewes[version] : {}
                            rObj['viewId'] = version.replaceAll('-','.');
                            return rObj;
                        });

                        me.viewLists = result;
                    }
                }

            },
            async loadVersions(){
                var me = this
                let result =[]

                if( !me.versionLists || me.versionLists.length == 0 ){
                    var versions  = await me.list(`db://definitions/${me.projectId}/versionLists`);
                    if(versions){
                        await me.migrateVersions(me.projectId, versions);
                        result = Object.keys(versions).map(function(version){
                            var rObj =  versions[version] ? versions[version] : {}
                            rObj['version'] = version.replaceAll('-','.');
                            return rObj;
                        });

                        me.versionLists = result.sort((a, b) => a.timeStamp - b.timeStamp );
                    }
                }
            },
            async migrateVersions(projectId, versions){
                var me = this

                for(let version in versions){
                    if( projectId && !versions[version].valueUrl ){
                        let versionInfo =  versions[version].versionInfo
                        let versionValue =  versions[version].versionValue && versions[version].versionValue.value  ? versions[version].versionValue.value : versions[version].versionValue;
                        if(!versionInfo){
                            versionInfo = {}
                        }

                        let valueUrl = await me.putString(`storage://definitions/${projectId}/versionLists/${version}/versionValue`, versionValue);
                        versionInfo.valueUrl = valueUrl;

                        // date -> timeStamp
                        versionInfo.timeStamp = versionInfo.date;
                        delete versionInfo.date;

                        await me.putObject(`db://definitions/${projectId}/versionLists/${version}`, versionInfo);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionValue`);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionInfo`);
                    }
                }

            },
            async loadDefinition() {
                var me = this
                var loadedDefinition = null

                var modelUrl = me.isClazzModeling ? me.projectId : me.params.projectId

                if(modelUrl.includes(':')){
                    me.projectId = modelUrl.split(':')[0]
                    me.projectVersion = modelUrl.split(':')[1]
                    me.projectVersion = me.projectVersion.replaceAll('.','-')
                }else{
                    me.projectId = modelUrl
                }

                if(window && window.document) window.document.title = me.projectId

                // rtc
                me.rtcRoomId = `modelRtc_${me.projectId}`
                localStorage.setItem('projectId', me.projectId)

                if (me.projectId) {
                    var information = await me.list(`db://definitions/${me.projectId}/information`);

                    me.$EventBus.$emit('progressValue', true)

                    if( information && Object.keys(information).length < 4){
                        // local model && wrong date
                        information = null;
                        me.delete(`db://definitions/${me.projectId}`);
                    }

                    if (information) {
                        me.isServerModel = true
                    } else {
                        // 로컬 일때는 로딩바 해제
                        me.$EventBus.$emit('progressValue', false)
                    }

                    if (me.isServerModel) {
                        if( information.type != me.canvasType ){
                            me.disableModel = true

                            me.alertInfo.text = 'The wrong approach. Please check the url.'
                            me.alertInfo.fnNum = 1
                            me.alertInfo.submit = 'Close'
                            me.alertInfo.show = true
                            return;
                        }

                        me.settingPermission(information);

                        if(!me.isDisableModeling){
                            // Authorization
                            var forkLatest =  await me.list(`db://definitions/${me.projectId}/forkUserLists/${me.userInfo.uid}`)
                            me.forkInformation.forkLatest = forkLatest ? forkLatest : null
                            me.forkInformation.forkOrigin = information.forkOrigin ? information.forkOrigin : null

                            await me.enterUser()
                            // me.specVersion = await me.getSpecVersion()

                            if (me.alertInfo.fnNum == 1) {
                                // permission denied
                            } else {
                                loadedDefinition = await me.loadDefinitionVersion3orAbove()

                                // if (me.specVersion == '1.0') {
                                //     loadedDefinition = await me.loadDefinitionVersion1()
                                // } else if (me.specVersion == '2.0') {
                                //     loadedDefinition = await me.loadDefinitionVersion2()
                                // } else {
                                //     loadedDefinition = await me.loadDefinitionVersion3orAbove()
                                // }
                                // console.log('specVersion:', me.specVersion, ' setSnapshot:', me.lastSnapshotKey, 'snapshotLastKey:', me.lastSnapQueueKey)
                            }
                        }
                    } else {
                        me.isMineProject = true
                        loadedDefinition = await me.loadDefinitionLocal()
                    }

                    if (loadedDefinition) {
                        me.value = me.migrate(loadedDefinition)
                    } else if (!me.value) {
                        me.value = {'elements': {}, 'relations': {}}
                        me.initLoad = true
                    }

                    me.afterSnapshotLoad();
                } else {
                    // clazz Local - minio
                    me.isMineProject = true

                    if (!me.value)
                        me.value = {'elements': {}, 'relations': {}}
                }

                if (!me.isServerModel) {
                    me.$nextTick(function () {
                        me.$EventBus.$emit('progressValue', false)
                        me.initLoad = true
                        console.log('# Done init load')
                    })
                }

            },
            loadDefinitionLocal() {
                var me = this

                return new Promise(async function (resolve, reject) {
                    let lists = await me.getObject(`localstorage://localLists`)
                    let value = await me.getObject(`localstorage://${me.projectId}`)

                    lists = lists ? lists : [];
                    let index = lists.findIndex(list => list.projectId == me.projectId)
                    let basicInformation  = {
                        author: me.userInfo.uid,
                        authorEmail: me.userInfo.email,
                        comment: "",
                        createdTimeStamp: Date.now(),
                        lastModifiedTimeStamp: Date.now(),
                        projectName: me.projectName,
                        projectId: me.projectId,
                        type: me.canvasType,
                    }

                    if( index > 0 ){
                        // 기존 정보.
                        me.information = Object.assign(basicInformation,lists[index]);
                    } else {
                        me.information = basicInformation;
                        lists.push(me.information)
                        me.putObject(`localstorage://localLists`, lists);
                    }
                    me.readOnly = false
                    me.projectName = me.information.projectName  ? me.information.projectName : 'untitled'


                    resolve(value ? value : {'elements': {}, 'relations': {}})
                })
            },
            loadDefinitionVersion1() {
                var me = this
                return new Promise(async function (resolve, reject) {

                    var getValue = await me.getString(`db://definitions/${me.projectId}/versionLists/${me.information.lastVersionName}`)

                    if (getValue && getValue.versionValue) {
                        resolve(JSON.parse(getValue.versionValue.value))
                    } else {
                        resolve({'elements': {}, 'relations': {}})
                    }


                })
            },
            loadDefinitionVersion2() {
                var me = this

                return new Promise(async function (resolve, reject) {

                    var option = {
                        sort: "desc",
                        orderBy: null,
                        size: 1,
                        startAt: null,
                        endAt: null,
                    }


                    var snapshots = await me.list(`db://definitions/${me.projectId}/snapshotLists`, option)

                    if (snapshots) {
                        var snapshotObj = snapshots[0]
                        me.lastSnapshotKey = snapshotObj.key
                        me.lastSnapQueueKey = snapshotObj.lastSnapshotKey ? snapshotObj.lastSnapshotKey : ''
                        me.value = JSON.parse(snapshotObj.snapshot)
                    } else {
                        me.lastSnapQueueKey = ''
                        me.value = {definition: [], relation: []}
                    }

                    var queueOption = {
                        sort: null,
                        orderBy: null,
                        size: null,
                        startAt: me.lastSnapQueueKey,
                        endAt: null,
                    }

                    var queueLists = await me.list(`db://definitions/${me.projectId}/queue`, queueOption)

                    if (queueLists) {

                        Object.keys(queueLists).forEach(function (key) {
                            me.latestQueueKey = key
                            var snapValue = queueLists[key]

                            var action = snapValue.action ? snapValue.action : snapValue.state

                            if (!action.includes('user')) {
                                var obj = {
                                    childKey: key,
                                    childValue: snapValue
                                }

                                me.receivedQueueDrawElement(obj)
                            }
                        })

                        resolve(me.value)
                    } else {
                        resolve(me.value)
                    }
                })
            },
            loadDefinitionVersion3orAbove() {
                var me = this
                return new Promise(async function (resolve, reject) {

                    if(me.isVersionMode){

                        if(me.projectVersion == 'latest'){
                            await me.loadVersions();

                            if(me.versionLists && me.versionLists.length  > 0){
                                me.projectVersion = me.versionLists[me.versionLists.length-1].version.replaceAll('.','-').trim();
                            } else {
                                me.snackbar.show = true
                                me.snackbar.text = "This model does not have versions."
                                me.snackbar.color = '#E57373'
                                resolve({'elements': {}, 'relations': {}})
                                return;
                            }
                        }

                        let snapshots = await me.list(`db://definitions/${me.projectId}/versionLists/${me.modelingProjectVersion}`)
                        if(snapshots){
                            var versionInfo = snapshots.versionInfo ? snapshots.versionInfo  : snapshots
                            let versionValue = {'elements': {}, 'relations': {}};
                            if( snapshots.versionInfo ){
                                versionValue = JSON.parse(snapshots.versionValue.value);
                            } else {
                                versionValue = await me.getObject(`storage://${snapshots.valueUrl}`);
                            }

                            me.projectName = versionInfo && versionInfo.projectName  ? versionInfo.projectName : 'untitled'
                            resolve(versionValue)
                        } else {
                            resolve({'elements': {}, 'relations': {}})
                        }


                    } else {
                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: 1,
                            startAt: null,
                            endAt: null,

                        }
                        var snapshots = await me.list(`db://definitions/${me.projectId}/snapshotLists`, option)

                        if (snapshots) {
                            var snapshotObj = snapshots[0]
                            me.lastSnapshotKey = snapshotObj.key
                            me.lastSnapQueueKey = snapshotObj.lastSnapshotKey ? snapshotObj.lastSnapshotKey : ''
                            var tmp = JSON.parse(snapshotObj.snapshot)
                            resolve(tmp)
                        } else {
                            me.lastSnapQueueKey = ''
                            resolve({'elements': {}, 'relations': {}})
                        }
                    }
                })
            },
            migrateQueue(action, item){
                return item;
            },
            migrate(value) {
                var me = this

                value = me.migrate1To3(value)
                value = me.migratePublic(value)
                value = me.migrateModel(value)

                return value

            },
            migrate1To3(value) {
                var me = this

                // if (me.specVersion != '3.0' && !value.version) {
                if ( !value.version ) {
                    if (!value.relations) value.relations = {}
                    if (!value.elements) value.elements = {}

                    Object.keys(value).forEach(function (key, index) {
                        if (Array.isArray(value[key])) {
                            if (key.includes('relation')) {
                                Object.values(value[key]).forEach(function (relation, index) {
                                    if (relation)
                                        me.$set(value.relations, relation.relationView.id, relation)
                                })
                            } else if (key.includes('definition')) {
                                Object.values(value[key]).forEach(function (element, index) {
                                    if (element)
                                        me.$set(value.elements, element.elementView.id, element)
                                })
                            }
                        }
                    })
                    value.version = 3
                    console.log('load 1 to3')
                }
                delete value['definition'];
                delete value['relation'];


                return value

            },
            // migrate2To3(value) {
            //     var me = this
            //
            //     // if (me.storageExist && me.specVersion != '3.0' && me.paramKeys.indexOf('classId') == -1) {
            //     // if (me.isServerModeling && me.specVersion != '3.0') {
            //     if ( me.isServerModeling ) {
            //         me.$refs['modeler-image-generator'].save(me.projectName, me.canvas).then(async function (resolve) {
            //
            //             var pushObj = {
            //                 snapshot: JSON.stringify(value),
            //                 timeStamp: Date.now(),
            //                 snapshotImg: resolve,
            //                 lastSnapshotKey: '',
            //             }
            //             // var putObj = {
            //             //     specVersion: '3.0'
            //             // }
            //
            //             await me.pushObject(`db://definitions/${me.projectId}/snapshotLists`, pushObj)
            //             await me.delete(`db://definitions/${me.projectId}/queue`)
            //             // await me.putObject(`db://definitions/${me.projectId}`, putObj)
            //             setTimeout(function () {
            //                 // me.specVersion = '3.0'
            //                 window.location.reload(true)
            //                 console.log('load 2 to3')
            //             }, 500);
            //         })
            //
            //     }
            //     return value
            // },
            migratePublic(value){
                var me = this
                if( !value.scm || Object.keys(value.scm).length == 0 ){
                    value.scm = {
                        tag: null,
                        org: null,
                        repo: null,
                        forkedOrg: null,
                        forkedRepo: null
                    }
                }

                if( me.information ){
                    if(me.information.gitOrgName && !value.scm.org ){
                        value.scm.org = me.information.gitOrgName;
                    }

                    if(me.information.gitRepoName && !value.scm.repo ){
                        value.scm.repo = me.information.gitRepoName;
                    }

                    if(me.information.forkedByModelGitOrgName && !value.scm.forkedOrg ){
                        value.scm.forkedOrg = me.information.forkedByModelGitOrgName;
                    }

                    if(me.information.forkedByModelGitRepoName && !value.scm.forkedRepo ){
                        value.scm.forkedRepo = me.information.forkedByModelGitRepoName;
                    }
                }

                return value
            },
            migrateModel(value){
              return  value
            },
            requestInviteUser() {
                var me = this
                //login check
                try {
                    me.setUserInfo()
                    if (me.isLogin) {
                        if (me.information.permissions &&
                            me.information.permissions[me.userInfo.uid] &&
                            me.information.permissions[me.userInfo.uid].request) {
                            alert('권한 요청된 상태입니다.')
                        } else {
                            var obj = {
                                email: me.userInfo.email,
                                permission: "Write",
                                request: true,
                            }
                            me.applyInviteUsers(obj, true)
                        }

                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }

                } catch (e) {
                    alert('Error: request - inviteUser :', e)
                }

            },
            async openInviteUsers() {
                var me = this
                var getPermission = await me._get(`db://definitions/${me.projectId}/information/permissions`)
                me.invitationLists = getPermission
                if (me.invitationLists) {
                    me.showPublicModel = Object.keys(me.invitationLists).indexOf('everyone') == -1 ? false : true
                }

                me.inviteDialog = true
            },
            async addPublicModel(projectId){
                let isExist = await this.isExistServerModel(projectId);
                if(isExist){
                    this.putObject(`db://definitions/${projectId}/information/permissions/everyone`, {
                        uid: 'everyone',
                        userName: 'Everyone',
                        write: false,
                    } )
                    return true;
                }
                return false;
            },
            async isExistPermission(projectId, uid){
                if(projectId){
                    let information = await this.list(`db://definitions/${projectId}/information`)
                    if(information){
                        if(uid){
                            if(uid == information.author){
                                return { uid: information.author, userName: information.email, write: true, isAuthor: true }
                            } else if(information.permissions) {
                                return information.permissions[uid]
                            }
                        } else {
                           return information.permissions;
                        }
                    }
                }
                return null;
            },
            async isExistServerModel(projectId){
                if(projectId){
                    let information = await this.list(`db://definitions/${projectId}/information`)
                    if(information) {
                        return true;
                    }
                }
                return false;
            },
            invitePublic(show) {
                var me = this
                if (!me.invitationLists) me.invitationLists = {}

                if (show) {
                    me.invitationLists['everyone'] = {
                        uid: 'everyone',
                        userName: 'Everyone',
                        write: false,
                    }
                    me.showPublicModel = true
                } else {
                    me.invitationLists['everyone'] = null
                    me.showPublicModel = false
                }

            },
            getPodStatus(userName, userGroup, projectName) {
                var me = this
                return new Promise(function (resolve, reject) {
                    var hashName;
                    if (me.$route.params.labId) {
                        if (me.$parent.labInfo.independent) {
                            var hashPath = me.getClassPath('labs/' + me.$route.params.labId + '/' + me.$route.params.userId);
                        } else {
                            var hashPath = me.getClassPath(me.$route.params.userId);
                        }
                        hashName = "labs-" + me.hashCode(hashPath);
                    } else {
                        hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`
                    }
                    me.$http.get(`api/v1/namespaces/default/pods/${hashName}`).then(function (result) {
                        if (result.data.status.phase == "Running") {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            checkIdeOperator(hashName) {
                var me = this
                if (me.$parent.classInfo) {
                    var serverToken = me.$parent.classInfo.token;
                    var serverUrl = me.$parent.classInfo.serverUrl;
                }

                if (!serverUrl || !serverToken) {
                    return new Promise(function (resolve) {
                        me.$http.get(`apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status`).then(function (result) {
                            console.log(result.data.status.conditions)
                            result.data.status.conditions.forEach(function (item) {
                                if (item.reason == "InstallSuccessful" && item.type == "Deployed") {
                                    resolve(true)
                                }
                            })
                        }).catch(function (e) {
                            resolve(false)
                        })
                    })
                } else {
                    return new Promise(function (resolve) {
                        me.$http.get(`http://apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                            console.log(result.data.status.conditions)
                            result.data.status.conditions.forEach(function (item) {
                                if (item.reason == "InstallSuccessful" && item.type == "Deployed") {
                                    resolve(true)
                                }
                            })
                        }).catch(function (e) {
                            resolve(false)
                        })
                    })
                }
            },
            deleteConfig(hashName, obj) {
                var me = this
                return new Promise(async function (resolve, reject) {
                    var tenant;
                    if(me.$parent.classInfo) {
                        tenant = me.$parent.classInfo.ideUrl;
                    } else {
                        tenant = me.getTenantId();
                    }
                    me.$http.delete(`file.${tenant}/api/deleteConfig`, {
                        data: {
                            "tenant": "eventstorming",
                            "course": obj.course,
                            "clazz": "users",
                            "userId": obj.userId,
                            "status": "running",
                            "hashName": hashName
                        }
                    }, {
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        }
                    }).then(() => {
                        resolve()
                    }).catch(error => alert(error))
                });
            },
            makeDir(path) {
                var me = this;
                return new Promise(function (resolve,reject) {
                    var tenant;
                    if(me.$parent.classInfo) {
                        tenant = me.$parent.classInfo.ideUrl;
                    } else {
                        tenant = me.getTenantId();
                    }
                    me.$http.post(`file.${tenant}/api/makeDir`, {
                            "path": path
                        }).then(function () {
                            return resolve();
                    }).catch(function(e) {
                            alert(e);
                        reject();
                    });
                });
            },
            makeConfig(hashName, obj) {
                var me = this
                return new Promise(async function (resolve, reject) {
                    var serverUrl, serverToken, ideUrl;
                    if (me.$parent.classInfo) {
                        serverUrl = me.$parent.classInfo.serverUrl;
                        serverToken = me.$parent.classInfo.token;
                    } else {
                        serverUrl = window.CLUSTER_ADDRESS;
                    }

                    var serviceAccount = await me.existServiceAccountCheck(hashName);

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms))
                    }

                    while (!serviceAccount) {
                        serviceAccount = await me.existServiceAccountCheck(hashName);
                        await sleep(3000)
                    }

                    var secretName = serviceAccount.data.secrets[0].name
                    var secret = await me.getSecret(hashName, secretName);

                    while (!secret) {
                        secret = await me.getSecret(hashName, secretName)
                        await sleep(3000)
                    }

                    var decodedToken = atob(secret);

                    // 6. upload Config
                    // 클러스터명, 서버ip 바꿔줄 것!

                    var configJson = {
                        "apiVersion": "v1",
                        "clusters": [
                            {
                                "cluster": {
                                    "insecure-skip-tls-verify": true,
                                    "server": serverUrl
                                },
                                "name": "kcb-test2.k8s.local"
                            }
                        ],
                        "contexts": [
                            {
                                "context": {
                                    "cluster": "kcb-test2.k8s.local",
                                    "namespace": hashName,
                                    "user": hashName
                                },
                                "name": "kcb-test2.k8s.local"
                            }
                        ],
                        "current-context": "kcb-test2.k8s.local",
                        "kind": "Config",
                        "preferences": {},
                        "users": [
                            {
                                "name": hashName,
                                "user": {
                                    "token": decodedToken
                                }
                            }
                        ]
                    };
                    var tenant;
                    if(me.$parent.classInfo) {
                        tenant = me.$parent.classInfo.ideUrl;
                    } else {
                        tenant = me.getTenantId();
                    }
                    me.$http.post(`file.${tenant}/api/uploadConfig`, {
                        "config": JSON.stringify(configJson),
                        "tenant": me.$route.params.labId ? me.getTenantId() : "eventstorming",
                        "course": obj.course,
                        "clazz": me.$route.params.labId ? obj.clazz : `users`,
                        "userId": obj.userId,
                        "status": "running",
                        "hashName": hashName
                    }, {
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        }
                    }).then(function () {
                        me.$EventBus.$emit("nextStep");
                        resolve();
                    }).catch(error => alert(error))
                })
            },
            async addInviteUser(user, myself) {
                var me = this
                var write = false
                var success = false
                if (user.email) {
                    return new Promise(async function (resolve, reject) {
                        if (user.permission == 'Write') {
                            write = true
                        }

                        var options = {
                            sort: "desc",
                            orderBy: 'email',
                            size: null,
                            startAt: `${user.email}`,
                            endAt: `${user.email}`,
                        }

                        var snapshots = await me.list('db://users',options)
                        if(snapshots){
                            if (!me.invitationLists) me.invitationLists = {}
                            snapshots.forEach(function (snapshot) {
                                var uid = snapshot.key
                                if( (myself && me.userInfo.uid == uid) || (!myself && me.userInfo.uid != uid) ){
                                    var item = snapshot
                                    me.invitationLists[uid] =
                                        {
                                            uid: uid,
                                            userName: item.userName ? item.userName : ( item.username ? item.username : 'anyone'),
                                            userPic: item.profile_picture ? item.profile_picture : '',
                                            email: item.email ? item.email : user.email,
                                            write: write,
                                            request: user.request ? user.request : null
                                        }
                                }
                            })
                            me.invitationLists.__ob__.dep.notify()
                            if(!me.invitationLists){
                                var obj = {
                                    msg: "공유실패: Can't find user. check email."
                                }
                                me.$EventBus.$emit('inviteCallBack', obj)
                                // me.snackbar.show = true
                                // me.snackbar.text = "공유실패: Can't find user. check email."
                                // me.snackbar.color = '#E57373'
                                resolve(false)
                            }
                            resolve(true)
                        }else{
                            var obj = {
                                msg: "공유실패: 초대하려는 유저가 구글 로그인을 안했을 가능성이 높습니다."
                            }
                            me.$EventBus.$emit('inviteCallBack', obj)
                            // me.snackbar.show = true
                            // me.snackbar.text = '공유실패: 초대하려는 유저가 구글 로그인을 안했을 가능성이 높습니다.'
                            // me.snackbar.color = '#E57373'
                            resolve(false)
                        }
                    })
                } else {
                    var obj = {
                        msg: "공유실패: 이메일형식에 맞춰서 넣어주세요."
                    }
                    me.$EventBus.$emit('inviteCallBack', obj)
                    // me.snackbar.show = true
                    // me.snackbar.text = '공유실패: 이메일형식에 맞춰서 넣어주세요.'
                    // me.snackbar.color = '#E57373'
                    resolve(false)
                }
            },
            removeInviteUser(user) {
                var me = this
                me.invitationLists[user.uid] = null
                if (user.uid == 'everyone') {
                    me.showPublicModel = false
                }
                me.invitationLists.__ob__.dep.notify();
            },
            async applyInviteUsers(inputUser, request) {
                var me = this
                var result = true
                if (inputUser) {
                    result = await me.addInviteUser(inputUser, true)
                }
                console.log(me.invitationLists)

                if (me.invitationLists) {
                    if (!request) {
                        Object.keys(me.invitationLists).forEach(function (invitation) {
                            if (me.invitationLists[invitation] && me.invitationLists[invitation].request) {
                                me.invitationLists[invitation].request = false
                            }
                        })
                    }

                    me.putObject(`db://definitions/${me.projectId}/information/permissions`, me.invitationLists)
                    me.information.permissions = me.invitationLists
                    me.modelChanged = true
                    if (request) {
                        me.joinRequested = true
                    }
                }

                if (result) {
                    var obj = {
                        msg: null
                    }
                    me.$EventBus.$emit('inviteCallBack', obj)
                    me.inviteDialog = false
                }

            }, 
            closeInviteUsers(beforeInvitationLists) {
                var me = this
                console.log(beforeInvitationLists)
                if (beforeInvitationLists) {
                    Object.keys(beforeInvitationLists).forEach(function (invitation) {
                        if (beforeInvitationLists[invitation] && beforeInvitationLists[invitation].request) {
                            beforeInvitationLists[invitation].request = false
                        }
                    })
                    me.putObject(`db://definitions/${me.projectId}/information/permissions`, beforeInvitationLists)
                    me.information.permissions = beforeInvitationLists
                    me.modelChanged = false
                }
                me.inviteDialog = false
            },
            getLastQueue() {
                var me = this
                return new Promise(async function (resolve, reject) {
                    var option = {
                        sort: 'desc',
                        orderBy: null,
                        size: 2,
                        startAt: null,
                        endAt: null,
                    }

                    var result = await me.list(`db://definitions/${me.projectId}/queue`, option)
                    resolve(result)
                })
            },
            getUndoRedoQueue(endAt) {
                var me = this
                return new Promise(async function (resolve) {
                    var option = {
                        sort: 'desc',
                        orderBy: null,
                        size: 2,
                        startAt: null,
                        endAt: endAt,
                    }
                    var keyValue = await me.list(`db://definitions/${me.projectId}/queue`, option)

                    if (keyValue) {
                        var prevVal = keyValue[0]
                        var prevKey = prevVal.key
                        var nextVal = keyValue[1]
                        var nextKey = nextVal ? nextVal.key : null

                        if (prevKey && prevVal.action.includes('user')) {
                            resolve(me.getUndoRedoQueue(nextKey))
                        } else {
                            resolve(keyValue)
                        }
                    } else {
                        resolve(null)
                    }
                })
            },
            sort(lastChild, lastChildIndex) {
                var me = this
                var currentChild = null

                if (me.sortScheduleId) return;
                try {

                    if (lastChild == null) {
                        lastChildIndex = queueFifo.elements.length - 1;
                        lastChild = queueFifo.elements[lastChildIndex];
                    }
                    var timePassed = Date.now() - lastChild.childValue.receivedTime;
                    if (timePassed < 200 || me.changedByMe) {

                        if (!me.sortScheduleId) {
                            me.sortScheduleId = setTimeout(function () {
                                        me.sortScheduleId = null
                                        me.sort(lastChild, lastChildIndex);
                                }, 300);
                        }
                    } else {
                        /* receivedQueue Start */
                        me.$EventBus.$emit('progressValue', true)

                        var countOrdered = lastChildIndex + 1;

                        queueFifo.elements.sort(function (a, b) { // 오름순
                            return a.childKey < b.childKey ? -1 : a.childKey > b.childKey ? 1 : 0;
                        });

                        for (var i = 0; i < countOrdered; i++) {
                            currentChild = queueFifo.elements[i]
                            me.receivedQueueItemCountAfterLastSnapshot = me.receivedQueueItemCountAfterLastSnapshot + 1
                            me.receivedQueueDrawElement(queueFifo.elements[i])

                        }
                        for (var i = 0; i < countOrdered; i++) {
                            var firstQueue = queueFifo.dequeue()
                            currentChild = null

                            if (firstQueue &&
                                firstQueue.childValue.editUid == me.userInfo.uid &&
                                me.receivedQueueItemCountAfterLastSnapshot >= me.snapshotFrequency &&
                                me.receivedQueueItemCountAfterLastSnapshot % me.snapshotFrequency == 0) {
                                me.checkLeaderExist(firstQueue)
                            }

                        }

                        if (queueFifo.isEmpty()) {
                            /* receivedQeue End */
                            clearTimeout(me.queueScheduleId);

                            me.queueScheduleId = setTimeout(function () {
                                console.log('#---------  End received Queue ----------------#')
                                me.$EventBus.$emit('progressValue', false)
                                me.overlayText = null
                                me.initLoad = true
                                if(me.isAutoForkModel) me.autoForkModel()
                            }, 500)

                        }

                        lastChildIndex = queueFifo.elements.length - 1;
                        lastChild = queueFifo.elements[lastChildIndex];
                        if (lastChildIndex > -1) {
                            me.sortScheduleId =
                                setTimeout(function () {
                                        me.sortScheduleId = null
                                        me.sort(lastChild, lastChildIndex);
                                    },
                                    300
                                );
                        }
                    }
                } catch (e) {
                    console.log('sortError: ', e, 'lastChild:', lastChild, 'key:', lastChild.childKey, 'action:', lastChild.childValue.action , currentChild)

                    me.watch_off(`db://definitions/${me.projectId}/queue`)
                    if( currentChild && currentChild.childKey ){
                        me.delete(`db://definitions/${me.projectId}/queue/${currentChild.childKey}`)
                    }
                    var queueIds = queueFifo.findIndexByChildKey(currentChild.childKey)
                    if(queueIds != -1){
                        queueFifo.removeByIndex(queueIds)
                    }
                    me.$emit('forceUpdateKey')
                }


            },
            async checkLeaderExist(child) {
                var me = this
                var lastKey

                var option = {
                    sort: 'desc',
                    orderBy: null,
                    size: 1,
                    startAt: null,
                    endAt: null,
                }

                var snapshot = await me.list(`db://definitions/${me.projectId}/snapshotLists`, option)

                if (snapshot) {
                    var snapshotObj = snapshot[0]
                    lastKey = snapshotObj.lastSnapshotKey ? snapshotObj.lastSnapshotKey : ''
                }

                if (!snapshot || lastKey < child.childKey) {
                    me.$refs['modeler-image-generator'].save(me.id, me.canvas).then(function (resolve) {

                        var obj = {
                            snapshot: JSON.stringify(me.value),
                            timeStamp: Date.now(),
                            snapshotImg: resolve,
                            lastSnapshotKey: child.childKey,
                        }
                        me.pushObject(`db://definitions/${me.projectId}/snapshotLists`, obj)
                    })
                }

                me.receivedQueueItemCountAfterLastSnapshot = 0

            },
            undoRedoDraw(child, state) {
                var me = this

                var action = child.childValue.action ? child.childValue.action : child.childValue.state

                if (state == 'undo') {
                    if (action == 'redo') {
                        child = JSON.parse(child.childValue.item)
                        action = child.childValue.action
                    }

                    if (action.includes('Move')) {
                        var orgin = JSON.parse(JSON.stringify(child.childValue.after))
                        child.childValue.after = child.childValue.before
                        child.childValue.before = orgin
                    } else if (action.includes('Modify')) {
                        child.childValue.item = JSON.stringify(jsondiffpatch.reverse(JSON.parse(child.childValue.item)))
                    } else if (action.includes('Push')) {
                        child.childValue.action = child.childValue.action.replace('Push', 'Delete')
                    } else if (action.includes('Delete')) {
                        child.childValue.action = child.childValue.action.replace('Delete', 'Push')
                    }

                } else if (state == 'redo') {
                    child = JSON.parse(child.childValue.item)

                    if (action == 'undo') {
                        action = child.childValue.action
                        if (action.includes('Move')) {
                            var orgin = JSON.parse(JSON.stringify(child.childValue.after))
                            child.childValue.after = child.childValue.before
                            child.childValue.before = orgin
                        } else if (action.includes('Modify')) {
                            child.childValue.item = JSON.stringify(jsondiffpatch.reverse(JSON.parse(child.childValue.item)))
                        } else if (action.includes('Push')) {
                            child.childValue.action = child.childValue.action.replace('Push', 'Delete')
                        } else if (action.includes('Delete')) {
                            child.childValue.action = child.childValue.action.replace('Delete', 'Push')
                        }
                    }

                }

                var obj = {
                    action: state,
                    editUid: me.userInfo.uid,
                    timeStamp: Date.now(),
                    item: JSON.stringify(child)
                }
                me.pushObject(`db://definitions/${me.projectId}/queue`, obj)

            },
            receivedQueueDrawElement(child, ignore) {
                var me = this
                ignore = ignore ? ignore : false

                if (child != undefined) {
                    var item = null
                    var afterMove = null
                    var action = child.childValue.action ? child.childValue.action : child.childValue.state

                    if (action == 'undo' || action == 'redo') {
                        // changedByMe
                        ignore = true
                        var undoRedoKey = child.childKey;
                        child = JSON.parse(child.childValue.item);
                        child.undoRedoKey = undoRedoKey;
                        action = child.childValue.action
                    }

                    if (action.includes('Move')) {
                        afterMove = child.childValue.after
                    } else {
                        item = child.childValue.item ? JSON.parse(child.childValue.item) : null
                    }

                    let associatedProjectId = child.isMirrorQueue ? me.information.associatedProject : me.projectId

                    //origin
                    if (action == 'elementPush') {

                        if (!ignore && child.childKey < me.prevKey) {
                            console.log(`ERR] Element MOVE: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`);
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }

                        // Excute Element Push
                        if (ignore || child.childKey != me.prevKey) {
                            if(!child.isMirrorQueue) me.prevKey = child.childKey
                            item.author = child.childValue.editUid

                            //Setting added Entity ( By Queue migrate)
                            item = me.migrateQueue(action, item);

                            //add Element
                            me.addElements(item, child);
                            // me.$set(me.value.elements, item.elementView.id, item)

                            if (me.initLoad) me.changedTemplateCode = true
                        } else {
                            console.log('reduplication Element Push')
                        }

                    } else if (action == 'elementDelete') {
                        try {

                            me.deleteElements(item, child);
                            // me.value.elements[item.elementView.id] = null;

                            if (me.initLoad) me.changedTemplateCode = true

                        } catch (e) {
                            console.log(`ERR] Element DELETE: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`);
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }

                    } else if (action == 'elementMove') {

                        try {
                            var elementId = child.childValue.elementId

                            var obj = {
                                action: 'elementMove',
                                element: afterMove,
                            }

                            me.onMoveElementById(elementId, afterMove, child)

                            // Changed Status
                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${elementId}`, {action: action})
                            })


                        } catch (e) {
                            console.log(`ERR] Element MOVE: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`);
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }


                    } else if (action == 'valueModify') {
                        try {
                            //changedByMe
                            if (!ignore && me.changedByMeKeys.includes(child.childKey)) {
                                me.changedByMeKeys.splice(me.changedByMeKeys.indexOf(child.childKey), 1)
                                if (me.initLoad) me.changedTemplateCode = true


                            } else {
                                me.changeValue(item, child);
                                if (me.initLoad) me.changedTemplateCode = true

                            }

                        } catch (e) {
                            console.log(`ERR] Value Patch: ${e}/ ID: ${associatedProjectId}/ key:${child.childKey}/ value:${JSON.parse(JSON.stringify(me.value))}/ diff:${JSON.parse(child.childValue.item)}`)
                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`)
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`)
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }

                    } else if (action == 'relationPush') {

                        if (!ignore && child.childKey < me.prevKey) {
                            console.log(`ERR] Relation PUSH: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`)
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }

                        if (ignore || child.childKey != me.prevKey) {
                            if(!child.isMirrorQueue) me.prevKey = child.childKey

                            if (me.validateRelation(item.from, item.to)) {

                                if (!item._type.endsWith('Relation')) {
                                    item.author = child.childValue.editUid
                                }

                                me.addRelations(item, child);
                                // me.$set(me.value.relations, item.relationView.id, item)

                                if (me.initLoad) me.changedTemplateCode = true
                            }
                        } else {
                            console.log('reduplication Relation Push')
                        }


                    } else if (action == 'relationDelete') {

                        try {

                            me.deleteRelations(item, child);
                            // me.value.relations[item.relationView.id] = null;
                            if (me.initLoad)me.changedTemplateCode = true

                        } catch (e) {
                            console.log(`ERR] Relation DELETE: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`)
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }


                    } else if (action == 'relationMove') {

                        try {
                            var relatinId = child.childValue.relationId

                            var obj = {
                                action: 'relationMove',
                                element: afterMove
                            }

                            me.onMoveRelationById(relatinId, afterMove, child)

                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${relatinId}`, obj)
                            })

                        } catch (e) {
                            console.log(`ERR] Relation MOVE: ID: ${associatedProjectId}/ now:${child.childKey}/ prev:${me.prevKey}/ child:${child}`)

                            me.watch_off(`db://definitions/${associatedProjectId}/queue`)
                            if( child && child.childKey ){
                                me.delete(`db://definitions/${associatedProjectId}/queue/${child.childKey}`);
                                if(child.undoRedoKey){
                                    me.delete(`db://definitions/${associatedProjectId}/queue/${child.undoRedoKey}`)
                                }
                            }
                            var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            if(queueIds != -1){
                                queueFifo.removeByIndex(queueIds)
                            }
                            me.$emit('forceUpdateKey')
                        }
                    }
                }
            },
            addElements(element, child){
                var me = this
                me.$set(me.value.elements, element.elementView.id, element);

                me.$nextTick(function () {
                    me.$EventBus.$emit(`${element.elementView.id}`, {
                        action: 'elementPush',
                        STATUS_COMPLETE: true
                    })
                });
            },
            deleteElements(element, child){
                var me = this
                me.value.elements[element.elementView.id] = null;
                // delete me.value.elements[element.elementView.id];

                me.$nextTick(function () {
                    me.$EventBus.$emit(`${element.elementView.id}`, {
                        action: 'elementDelete',
                        STATUS_COMPLETE: true
                    })
                });
            },
            addRelations(relation, child){
                var me = this
                me.$set(me.value.relations, relation.relationView.id, relation);

                me.$nextTick(function () {
                    me.$EventBus.$emit(`${relation.relationView.id}`, {
                        action: 'relationPush',
                        STATUS_COMPLETE: true
                    })
                });
            },
            deleteRelations(relation, child){
                var me = this
                me.value.relations[relation.relationView.id] = null;

                me.$nextTick(function () {
                    me.$EventBus.$emit(`${relation.relationView.id}`, {
                        action: 'relationDelete',
                        STATUS_COMPLETE: true
                    })
                });
            },
            changeValue(diff, child){
                var me = this
                jsondiffpatch.patch(me.value, diff);
            },
            async receiveValueSpecOne() {
                var me = this
                await me.watch(`db://definitions/${me.projectId}/versionLists/${me.information.lastVersionName}/versionValue`, function (callback) {
                    // me.changedByMe = false
                    me.value = JSON.parse(callback.value)
                })
            },
            releaseQueue(projectId){
                var me = this

                if(projectId){
                    return;
                }

                me.watch_off(`db://definitions/${projectId}/queue`)
            },
            watchProjectInformation(associatedProjectId){
                var me = this
                if(!associatedProjectId) return

                me.watch(`db://definitions/${associatedProjectId}/information`, function (information) {
                    let old = JSON.parse(JSON.stringify(me.projectInformation));
                    me.projectInformation = information ? information : null
                    me.detectDeletedModel(old);
                })
            },
            detectDeletedModel(info){
                // reload condition.
            },
            async receiveAssociatedProject(associatedProjectId){
                var me = this
                let startKey = '';

                me.isLoadedInitMirror = false;
                me.projectInformation = await me.list(`db://definitions/${associatedProjectId}/information`);

                if(!me.projectInformation) return; // local

                // server
                // TODO: Snapshot Logic.
                let snapshots = await me.list(`db://definitions/${associatedProjectId}/snapshotLists`, {
                    sort: "desc",
                    orderBy: null,
                    size: 1,
                    startAt: null,
                    endAt: null,

                })

                if (snapshots) {
                    startKey = snapshots[0].lastSnapshotKey ? snapshots[0].lastSnapshotKey : ''
                    me.mirrorValue = JSON.parse(snapshots[0].snapshot);
                } else {
                    startKey = ''
                    me.mirrorValue =
                    {
                        'elements': {},
                        'relations': {},
                        'basePlatform': null,
                        'basePlatformConf': {},
                        'toppingPlatforms': null,
                        'toppingPlatformsConf': {},
                        'scm': {}
                    }
                }


                let isWaitingQueue = null
                let waitingTime = startKey ? 10000 : 3000
                isWaitingQueue = setTimeout(function () {
                    /* receivedSnapshot End */
                    me.isLoadedInitMirror = true;
                    me.watchProjectInformation(associatedProjectId)
                }, waitingTime)


                // TODO: Qeuue Logic.
                me.watch_added(`db://definitions/${associatedProjectId}/queue`, {
                    sort: null,
                    orderBy: null,
                    size: null,
                    startAt: startKey,
                    endAt: null,
                }, async function (queue) {

                    if( queue.action.includes('user') ){
                        return;
                    }
                    me.isLoadedMirrorQueue = true
                    clearTimeout(isWaitingQueue);

                    var obj = {
                        _ordered: false,
                        childKey: queue.key,
                        childValue: queue,
                        isMirrorQueue: true,
                    }
                    obj.childValue.key = queue.key;
                    obj.childValue.receivedTime = Date.now();

                    me.receivedQueueDrawElement(obj, true);
                    me.mirrorQueueCount++;

                    me.saveAssociatedModelSnapshot(associatedProjectId, queue)

                    isWaitingQueue = setTimeout(function () {
                        /* receivedSnapshot End */
                        if(!me.isLoadedInitMirror){
                            me.isLoadedInitMirror = true;
                            me.watchProjectInformation(associatedProjectId)
                        }
                        me.isLoadedMirrorQueue = false;
                    }, 1000)
                });
            },
            getProjectDefinitionLists(){
                return []
            },
            syncMirrorElements() {
                var me = this;
                let modelLists = me.getProjectDefinitionLists()
                let disconnectDiff = {'elements': {}}
                Object.values(me.value.elements)
                    .filter((ele) => ele && ele.mirrorElement)
                    .forEach(function (mirror) {
                        let origin = me.mirrorValue.elements[mirror.mirrorElement]

                        if(origin /*&& modelLists.includes(origin.definitionId)*/ ) {
                            // connection -> Sync
                            if(mirror.elementView)
                                me.value.elements[mirror.elementView.id] = me.overrideMirrorValue(mirror, origin);
                            else if(mirror.id)
                                me.value.elements[mirror.id] = me.overrideMirrorValue(mirror, origin);
                            else
                                console.log("mirror element is corrupt: doesn't have elementView")
                                
                        } else if(origin && !modelLists.includes(origin.definitionId)){
                            // disconnect -> origin definition remove.
                            me.$set(disconnectDiff.elements, origin.id, [origin,null])
                        } else if(!origin && mirror.definitionId && modelLists.includes(mirror.definitionId)){
                            // connection -> user remove.
                            me.$refs[`${mirror.id}`]? me.$refs[`${mirror.id}`][0].onRemoveShape() : null;
                            // delete me.value.elements[mirror.id];
                            me.value.elements[mirror.id] = null;
                        } else if(!origin && mirror.mirrorElement){
                            // reConnection -> relink
                            let reOrigin = Object.values(me.mirrorValue.elements)
                                .find(ele =>
                                    me.validateElementFormat(ele)
                                    && ele._type == mirror._type  // equals type.
                                    && ele.name
                                    && ele.name.toLowerCase() == mirror.name.toLowerCase() // equals name
                                    && ele.elementView.id != mirror.id // myself x
                                    && !ele.mirrorElement // connected element x
                                )
                            if(reOrigin) {
                                mirror.mirrorElement = reOrigin.elementView.id
                                me.changedByMe = true;
                            }
                        }
                    });

                if( Object.keys(disconnectDiff.elements).length > 0){
                    // disconnect -> definition remove.
                    me.pushObject(`db://definitions/${me.information.associatedProject}/queue`, {
                        action: 'valueModify',
                        editUid: me.userInfo.uid,
                        timeStamp: Date.now(),
                        item: JSON.stringify(disconnectDiff)
                    });
                }
            },
            overrideMirrorValue(mirror, origin) {
                if (!origin) return mirror;

                let result = Object.assign({}, origin);
                Object.keys(mirror).forEach(function (itemKey) {
                    if(itemKey == "elementView" || itemKey == "relationView" || itemKey == "id" || itemKey == "mirrorElement" ) {
                        // 원본 값에 mirror Element 정보 override.
                        result[itemKey] = mirror[itemKey];
                    }
                });
                //
                // // Don't override.
                // delete result['definitionId']

                return result;
            },
            async saveAssociatedModelSnapshot(id, queue){
                var me = this

                if(!me.isLogin) return;
                if(me.disableModel) return;
                if(me.isReadOnlyModeling) return;

                if( me.mirrorQueueCount >= me.snapshotFrequency ) {
                    if( me.mirrorQueueCount % me.snapshotFrequency == 0 && queue.editUid == me.userInfo.uid) {
                        await me.pushObject(`db://definitions/${id}/snapshotLists`, {
                            snapshot: JSON.stringify(me.mirrorValue),
                            timeStamp: Date.now(),
                            snapshotImg: null,
                            lastSnapshotKey: queue.key,
                        })
                    }
                    // other user and set Snap user.
                    me.mirrorQueueCount = 0;
                }
            },
            receiveQueue() {
                var me = this
                var isWaitingQueue = null
                let waitingTime = me.lastSnapQueueKey ? 10000 : 3000
                isWaitingQueue = setTimeout(function () {
                    /* receivedQeue End */
                    me.initLoad = true
                    me.$EventBus.$emit('progressValue', false)
                    if(me.isAutoForkModel){
                        me.autoForkModel()
                    }
                },waitingTime)


                var options = {
                    sort: null,
                    orderBy: null,
                    size: null,
                    startAt: me.lastSnapQueueKey,
                    endAt: null,
                }

                me.watch_added(`db://definitions/${me.projectId}/queue`, options, async function (queue) {
                    // console.log('watch_added:: ', queue)
                    // console.log('receiveQueue: ', queue.key, me.lastSanpQueueKey, queue.key > me.lastSnapQueueKey)

                    if (queue) {
                        me.latestQueueKey = queue.key
                    }
                    if (  queue && (me.lastSnapQueueKey ? queue.key > me.lastSnapQueueKey : true) ) {
                    // if (me.specVersion != '1.0' && queue && (me.lastSnapQueueKey ? queue.key > me.lastSnapQueueKey : true)) {
                        if (queue.action == 'userEntrance') {

                            var obj = {
                                uid: queue.editUid,
                                email: queue.email,
                                userName: queue.userName,
                                picture: queue.picture
                            }
                            if (me.participantLists.findIndex(user => user.uid == obj.uid) == -1) {
                                me.participantLists.push(obj)
                            }

                        } else if (queue.action == 'userExit') {
                            var obj = {
                                uid: queue.editUid,
                                email: queue.email,
                                userName: queue.userName,
                            }
                            var findIndex = me.participantLists.findIndex(user => user.uid == obj.uid)
                            if (findIndex != -1) {
                                me.participantLists.splice(findIndex, 1)
                            }

                        } else if (queue.action == 'userPanelOpen' ||
                            queue.action == 'userPanelClose' ||
                            queue.action == 'userSelectedOn' ||
                            queue.action == 'userSelectedOff' ||
                            queue.action == 'userMovedOn' ||
                            queue.action == 'userMovedOff') {

                            var obj = {
                                action: queue.action,
                                uid: queue.editUid,
                                picture: queue.picture,
                                name: queue.name
                            }

                            me.$EventBus.$emit(`${queue.editElement}`, obj)

                        } else {
                            clearTimeout(isWaitingQueue)

                            if (!me.receivedQueueExistValue) {
                                me.receivedQueueExistValue = true
                            }

                            var obj = {
                                _ordered: false,
                                childKey: queue.key,
                                childValue: queue
                            }
                            obj.childValue.key = queue.key;
                            obj.childValue.receivedTime = Date.now();

                            queueFifo.enqueue(obj)
                            me.sort();
                        }
                    }


                })
            },
            removeMoveDiff(diff){
                if(diff.elements){
                    Object.keys(diff.elements).forEach(function(id){
                        delete diff.elements[id]['elementView'];

                        if(JSON.stringify(diff.elements[id]) == '{}') {
                            delete diff.elements[id]
                        }
                    });

                    if(JSON.stringify(diff.elements) == '{}') {
                        delete diff.elements
                    }
                }

                if(diff.relations){
                    Object.keys(diff.relations).forEach(function(id){
                        delete diff.relations[id]['relationView'];
                        if(JSON.stringify(diff.relations[id]) == '{}') {
                            delete diff.relations[id]
                        }
                    });
                    if(JSON.stringify(diff.relations) == '{}') {
                        delete diff.relations
                    }
                }

                if(JSON.stringify(diff) == '{}') {
                    return null;
                }

                return diff
            },
            async modifiedElement(diff, options) {
                var me = this
                if(!options) options = {}
                let forcePush = options.forcePush
                // console.log("수정");
                // if (me.storageExist) {

                if (me.isServerModeling) {
                    // server
                    if ((me.changedByMe || forcePush) && me.isQueueModeling) {
                        // 서버o, 랩 x, 큐 o
                        // me.changedByMe = false;

                        if(!forcePush){
                            diff = me.removeMoveDiff(diff);
                        }
                        if ( !me.isReadOnlyModeling && diff) {
                            var postObj = {
                                action: 'valueModify',
                                editUid: me.userInfo.uid,
                                timeStamp: Date.now(),
                                item: JSON.stringify(diff)
                            }
                            var key = await me.pushObject(`db://definitions/${me.projectId}/queue`, postObj)
                            me.changedByMeKeys.push(key)

                            // COMMON QUEUE
                            if( me.projectSendable && !me.value.mirrorElement) {
                                me.pushObject(`db://definitions/${me.information.associatedProject}/queue`, postObj)
                            }
                        }
                        me.changedByMe = false
                        me.modelChanged = true
                        console.log('=== Push ModifiedElement ===')
                    } else if ( !me.isQueueModeling && !me.isReadOnlyModeling ) {
                        // 서버o, 랩 x, 큐 x
                        // var putValue = {
                        //     value: JSON.stringify(me.value)
                        // }
                        // me.putObject(`db://definitions/${me.projectId}/versionLists/${versionName}/versionValue`, putValue)
                        var versionName = me.information.lastVersionName
                        await me.putString(`storage://definitions/${me.projectId}/versionLists/${versionName}/versionValue`, JSON.stringify(me.value));
                        me.localUndoRedoStorage(diff)
                    } else if (me.$isElectron) {
                        // var putValue = {
                        //     value: JSON.stringify(me.value)
                        // }
                        // me.putObject(`db://definitions/${me.projectId}/versionLists/${versionName}/versionValue`, putValue)
                        var versionName = me.information.lastVersionName
                        await me.putString(`storage://definitions/${me.projectId}/versionLists/${versionName}/versionValue`, JSON.stringify(me.value));
                        me.localUndoRedoStorage(diff)
                    }

                } else {
                    // 서버x, 랩x, 큐x
                    var proId = me.projectId
                    var lists = await me.getObject(`localstorage://localLists`)
                    if (lists) {
                        var index = lists.findIndex(list => list.projectId == me.projectId)

                        if (index != -1) {
                            lists[index].lastModifiedTimeStamp = Date.now()
                            if (me.initLoad) me.changedTemplateCode = true
                        }
                    }
                    me.putObject(`localstorage://localLists`, lists)
                    // local 저장 
                    me.putObject(`localstorage://${proId}`, me.value)
                    me.localUndoRedoStorage(diff)
                }

            },
            bindEvents(opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
                this.canvas = opengraph.canvas;

                opengraph.$el.addEventListener('mousemove',(e)=>{
                    me.mouseEventCnt ++;
                    // Event 발생 30회 마다 1회 push.
                    if( me.mouseEventCnt % 30 == 1){
                        me.mouseEventCnt = 1;
                        let scale = opengraph.canvas._CONFIG.SLIDER[0].innerText / 100
                        let offsetX = (e.clientX - canvasEl.offset().left + canvasEl[0].scrollLeft)/scale;
                        let offsetY = (e.clientY- canvasEl.offset().top + canvasEl[0].scrollTop)/scale;
                        me.sendMoveEvents(offsetX, offsetY);
                    }
                });

                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start() {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height'),
                            'description': $(this).attr('_description'),
                            'label': $(this).attr('_label')
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });

                canvasEl.droppable({
                    drop(event, ui) {
                        var componentInfo = canvasEl.data('DRAG_SHAPE'),
                            shape, element;
                        if (componentInfo) {
                            var dropX = event.pageX - canvasEl.offset().left + canvasEl[0].scrollLeft;
                            var dropY = event.pageY - canvasEl.offset().top + canvasEl[0].scrollTop;
                            var scale = opengraph.canvas._CONFIG.SLIDER[0].innerText / 100

                            dropX = dropX / scale;
                            dropY = dropY / scale;

                            componentInfo = {
                                component: componentInfo.component,
                                x: dropX,
                                y: dropY,
                                width: parseInt(componentInfo.width, 10),
                                height: parseInt(componentInfo.height, 10),
                                label: componentInfo.label ? componentInfo.label : '',
                                description: componentInfo.description ? componentInfo.description : ''
                            }


                            me.addElement(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },
            toggleGrip() {
                this.dragPageMovable = !this.dragPageMovable;

                if (this.dragPageMovable) {
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else {
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            automaticGuidanceChange() {
                this.automaticGuidance = !this.automaticGuidance;
            },
            undo() {
                var me = this;
                var undoElement;
                if (me.undoRedoArray.length > 0) {
                    me.undoRedoIndex = me.undoRedoIndex - 1;
                    undoElement = me.undoRedoArray[me.undoRedoIndex] ?
                            JSON.parse(me.undoRedoArray[me.undoRedoIndex]) : null;

                    if (!undoElement) {
                        me.undoRedoIndex = 0
                        return
                    }

                    var type = Object.keys(undoElement)[0];
                    var diff = undoElement[type];
                    var id = Object.keys(undoElement[type])[0];
                    var value = Object.values(diff);
                    me.changedByUndoRedo = true;

                    if (Array.isArray(value[0])) {
                        if (value[0].length == 1) {
                            me.value[type][id] = null;
                        } else if (value[0].length == 2) {
                            me.$set(me.value[type], id, value[0][0]);
                        }
                    } else if (typeof value == 'object') {
                        jsondiffpatch.patch(me.value[type], jsondiffpatch.reverse(diff));
                    }
                }
            },
            redo() {
                var me = this;
                var redoElement;
                if (me.undoRedoArray.length > 0) {
                    me.undoRedoIndex = me.undoRedoIndex + 1;
                    redoElement = me.undoRedoArray[me.undoRedoIndex] ? 
                            JSON.parse(me.undoRedoArray[me.undoRedoIndex]) : null;

                    if (!redoElement) {
                        me.undoRedoIndex = me.undoRedoArray.length;
                        return;
                    }

                    var type = Object.keys(redoElement)[0];
                    var diff = redoElement[type];
                    var id = Object.keys(redoElement[type])[0];
                    var value = Object.values(diff);
                    me.changedByUndoRedo = true;

                    if (Array.isArray(value[0])) {
                        if (value[0].length == 1) {
                            me.$set(me.value[type], id, value[0][0]);
                        } else if (value[0].length == 2) {
                            me.value[type][id] = null;
                        }
                    } else if (typeof value == 'object') {
                        jsondiffpatch.patch(me.value[type], diff);
                    }
                }
            },
            localUndoRedoStorage(diff) {
                var me = this
                if (me.changedByUndoRedo) {
                    me.changedByUndoRedo = false
                } else {

                    var lastIndex = me.undoRedoArray.length
                    if (lastIndex != me.undoRedoIndex) {
                        me.undoRedoArray.splice(me.undoRedoIndex, lastIndex - me.undoRedoIndex)
                    }
                    me.undoRedoArray.push(JSON.stringify(diff))
                    me.undoRedoIndex = me.undoRedoIndex + 1

                }
            },
            getUndoTarget(currentKey) {
                var me = this

                return new Promise(async function (resolve, reject) {
                    var backCount = 0;
                    var nextKey = null
                    var nextValue = null
                    var drawQueue = null

                    while (currentKey) {
                        var keyValue = await me.getUndoRedoQueue(currentKey)
                        // 0 - 다음
                        // 1 - 현재
                        nextValue = keyValue[0]
                        nextKey = nextValue.key
                        currentKey = keyValue[1] ? keyValue[1].key : null
                        if (!nextValue) break; // last

                        if (nextValue.editUid != me.userInfo.uid) continue; //다른사람 큐 는 건너 뛰기

                        if (nextValue.action == 'undo') backCount = backCount + 1;
                        else if (nextValue.action == 'redo') backCount = backCount - 1;
                        else backCount = backCount - 1;

                        if (backCount == -1) break;   //undo시 사용
                    }
                    // 마지막 큐
                    if(keyValue.length == 1){
                        me.undoDisable = true
                    }else{
                        me.undoDisable = false
                        if(me.redoDisable) me.redoDisable = false //redo 활성화
                    }

                    if (nextKey && backCount == -1) {
                        drawQueue = {
                            childKey: nextKey,
                            childValue: nextValue
                        }
                    }
                    resolve(drawQueue)
                })

            },
            async getRedoTarget(nextKey) {
                var me = this
                return new Promise(async function (resolve, reject) {
                    var backCount = 0;
                    var currentKey = null
                    var currentValue = null
                    var drawQueue = null

                    while (nextKey) {
                        var keyValue = await me.getUndoRedoQueue(nextKey)
                        // 0 - 현재
                        // 1 - 다음
                        currentValue = keyValue[0]
                        currentKey = currentValue.key
                        nextKey = keyValue[1] ? keyValue[1].key : null
                        if (!currentValue) break; // last

                        if (currentValue.editUid != me.userInfo.uid) continue; //다른사람 큐 는 건너 뛰기

                        if (currentValue.action == 'undo') backCount = backCount - 1;
                        else if (currentValue.action == 'redo') backCount = backCount + 1;
                        else backCount = backCount - 1;

                        if (backCount == -1) break;   //undo시 사용
                    }

                    if (currentKey && currentValue.action == 'undo') {
                        me.redoDisable = false
                        if(me.undoDisable) me.undoDisable = false //undo 활성화
                        drawQueue = {
                            childKey: currentKey,
                            childValue: currentValue
                        }
                    }else{
                        me.redoDisable = true
                    }
                    resolve(drawQueue)

                })
            },
            copy() {
            },
            paste() {
            },
            unselectedAll(newVal) {
                var me = this
                Object.values(me.value.elements).forEach(function (definition) {
                    if (definition != null) {
                        definition.selected = false
                    }
                })
                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation != null) {
                        relation.selected = false
                    }
                })
            },
            validateRelation(fromId, toId) {
                var me = this
                try {
                    var relations = me.value.relations
                    if (relations) {
                        var index = Object.values(relations).findIndex(relation => relation && relation.from == fromId && relation.to == toId)
                        if (index == -1) {
                            return true
                        }
                    }
                    return false
                } catch (e) {
                    return true
                }
            },
            onConnectShape(edge, from, to) {

                var me = this;
                //존재하는 릴레이션인 경우 (뷰 ��포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
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
                        isRelation: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }

                    from.$parent.value.elementView.id = from.id;
                    to.$parent.value.elementView.id = to.id;

                    me.canvas.removeShape(edgeElement, true);

                    if (me.validateRelation(from.id, to.id)) {
                        me.addElement(componentInfo);
                    }

                }
            },
            addElement(componentInfo, bounded) {
                this.enableHistoryAdd = true;
                var me = this;
                var additionalData = {};
                var vueComponent = me.getComponentByName(componentInfo.component);
                var element;

                if (componentInfo.isRelation && componentInfo.component.includes('relation')) {
                    /* make Relation */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.sourceElement.value,
                        componentInfo.targetElement.value,
                        componentInfo.vertices,
                    );

                } else {
                    /* make Element */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height,
                        componentInfo.description,
                        componentInfo.label
                    );
                }

                me.addElementPush(me.value, element)
            },
            // addRelationPush(values, relation){
            //     var me = this
            //     var value = values ? values : me.value
            //
            //     if ( me.isServerModeling && me.isQueueModeling ) {
            //         //server
            //         me.modelChanged = true
            //         if (!Object.keys(value.relations).includes(relation.relationView.id)) {
            //             me.$set(value.relations, relation.relationView.id, relation)
            //             me.$nextTick(function () {
            //                 me.$EventBus.$emit(`${relation.relationView.id}`, {action: 'relationPush', STATUS_COMPLETE: false})
            //             })
            //             var postObj = {
            //                 action: 'relationPush',
            //                 editUid: me.userInfo.uid,
            //                 timeStamp: Date.now(),
            //                 item: JSON.stringify(relation)
            //             }
            //             me.pushObject(`db://definitions/${me.projectId}/queue`, postObj)
            //             console.log('added:server')
            //         }
            //
            //     } else {
            //         if (!Object.keys( value.relations).includes(relation.relationView.id)) {
            //             me.$set(value.relations, relation.relationView.id, relation)
            //
            //             if (me.initLoad) {
            //                 me.changedTemplateCode = true
            //             }
            //             console.log('added:localstorage,kubernetes')
            //         }
            //     }
            // },
            addElementPush(values, element) {
                var me = this
                var value = values ? values : me.value
                var location = element.elementView ? value.elements : value.relations
                var eleId = element.elementView ? element.elementView.id : element.relationView.id

                // if (me.storageExist) {
                if (me.isServerModeling && me.isQueueModeling ) {
                    //server
                    me.modelChanged = true
                    var action = element.relationView ? 'relationPush' : 'elementPush'
                    if (!Object.keys(location).includes(eleId)) {

                        //STATUS_COMPLETE
                        me.$set(location, eleId, element)
                        //STATUS_COMPLETE_addElementPush
                        me.$nextTick(function () {
                            me.$EventBus.$emit(`${eleId}`, {action: action, STATUS_COMPLETE: false})
                        })
                        var postObj = {
                            action: action,
                            editUid: me.userInfo.uid,
                            timeStamp: Date.now(),
                            item: JSON.stringify(element)
                        }
                        me.pushObject(`db://definitions/${me.projectId}/queue`, postObj)
                        console.log('added:server')
                    }

                } else {
                    if (!Object.keys(location).includes(eleId)) {
                        me.$set(location, eleId, element)
                        if (me.initLoad) me.changedTemplateCode = true

                        console.log('added:localstorage,kubernetes')
                    }
                }

            },
            uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            dbuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
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
            getComponentByName(name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
            validateRelationFormat(relation){
                if(!relation) return false
                if(Array.isArray(relation)) return false
                if(!relation.relationView) return false
                if(!relation._type) return false
                if(Object.keys(relation).indexOf('name') == -1) return false;

                return true;
            },
            validateElementFormat(element){
                if(!element) return false
                if(Array.isArray(element)) return false;
                if(element == {}) return false;
                if(!element.elementView) return false
                if(!element._type) return false
                if(Object.keys(element).indexOf('name') == -1) return false;

                return true;
            },
            getNowDate(){
                var currentDate = new Date();

                function addLeadingZeros(number, length) {
                    var numberString = String(number);
                    while (numberString.length < length) {
                        numberString = "0" + numberString;
                    }
                    return numberString;
                }

                var year = currentDate.getYear(); // Get the current year (e.g., 2023)
                var month = currentDate.getMonth() + 1; // Get the current month (0-11, add 1 to get 1-12)
                var day = currentDate.getDate(); // Get the current day of the month (1-31)
                var hours = currentDate.getHours(); // Get the current day of the month (1-31)
                var min = currentDate.getMinutes(); // Get the current day of the month (1-31)
                var sec = currentDate.getSeconds(); // Get the current day of the month (1-31)
                var ms = currentDate.getMilliseconds(); // Get the current day of the month (1-31)

                year = String(year).slice(-2);
                month = addLeadingZeros(month, 2);
                day = addLeadingZeros(day, 2);
                hours = addLeadingZeros(hours, 2);
                min = addLeadingZeros(min, 2);
                sec = addLeadingZeros(sec, 2);

                var currentDateNumber = year + month + day + hours + min + sec + ms;
                console.log("Current date number: " + currentDateNumber, ms);

                return currentDateNumber;
            },

            // PowerPoint Generator
            generatePowerPoint() {
                var me = this;
                // Create new ppt with model canvas value
                const modelData = [
                    {
                        canvasType: me.canvasType,
                        value: {
                            elements: JSON.parse(JSON.stringify(me.value.elements)),
                            relations: JSON.parse(JSON.stringify(me.value.relations))
                        }
                    }
                ]
                const generator = new PowerPointGenerator(me.projectName);
                generator.createPowerPoint(modelData);
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
        left: 10;
        right: 0;
        /*position: relative;*/
        position: absolute;
        overflow: hidden;
        width: 100%;
        height: 100%;

        .fullcanvas {
            position: relative;
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

        .toolsSide {
            position: absolute;
            width: 100px;
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
                color: #1a76d2;
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

    .rtc {
        .button {
            color: red;
        }

        .buttonHover {
            background-Color: white;
        }

        .content {
            background-Color: white;
        }

        .titlebar {
            background-color: white;
        }
    }


</style>