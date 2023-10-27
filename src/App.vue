<template>
    <v-app id="inspire"
           @keydown.esc="overlay = false"
           style="overflow: hidden"
    >
        <v-app-bar
                :clipped-left="$vuetify.breakpoint.lgAndUp"
                elevation="0"
                app
                fixed
                style="left:0px; background-color:transparent; z-index:1;"
                hide-on-scroll
        >

            <v-toolbar-title style="width: 360px;" class="ml-0 pl-3">
                <v-layout>
                    <v-btn @click.native="$router.push('/')"
                            style="width: 150px; height: 50px;"
                            text
                    >
                        <v-img contain
                                max-height=45
                                max-width=140 
                                src="../public/static/image/kuberez_logo.png"
                        ></v-img>
                    </v-btn>
                </v-layout>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-text-field
                    v-if="labInfo && labInfo.tool == 'url' && inSideElectron"
                    style="margin-top: 25px; width: 400px;"
                    filled
                    rounded
                    dense
                    v-model="urlText"
                    @keydown.enter="sendUrl(urlText)"
            >
            </v-text-field>
            <div v-if="labInfo && labInfo.tool == 'url' && inSideElectron">
                <v-icon style="margin-left: 5px;" @click="screenPlus()">mdi-plus</v-icon>
                <v-icon style="margin-left: 5px;" @click="screenMinus()">mdi-minus</v-icon>
            </div>
            
            <!--             particiate Lists-->
            <div style="width: 15%;">
                <participant-icons
                    v-if="showParticipantIcons"
                    :lists="participantLists"
                    @openParticipantPanel="openParticipantPanel"
                    class="clear-icon"
                >
                </participant-icons>
            </div>

            <v-btn v-if="showNewButton"
                    class="app-new-btn"
                    text
                    @click="moveToModel()"
            >
                    <v-icon>mdi-file-plus</v-icon>
                    <div class="app-new-text" style=" font-weight:700;">NEW</div>
                </v-btn>

            <v-btn class="app-docs-btn"
                    @click="wikiOpen()"
                    text
                    style="margin-right:10px; font-weight:700;"
            >
                <v-icon>mdi-book</v-icon>
                <div class="app-docs-text">Wiki</div>
            </v-btn>
            
            <v-btn v-if="!(isLogin || isGuestLogin)"
                    @click="loginPage()"
                    fab icon>
                <v-avatar size="40">
                    <v-icon x-large>mdi-account-circle</v-icon>
                </v-avatar>
            </v-btn>

            <v-menu v-if="(isLogin || isGuestLogin)"
                    v-model="openMenu"
                    open-on-hover
                    offset-y
            >
                <template v-slot:activator="{ on }">
                    <v-hover v-model="LoginHover">
                        <v-avatar size="40" v-on="on">
                            <div v-if="userInfo && userInfo.profile && userInfo.profile !== 'undefined'">
                                <img :src=userInfo.profile style="width:100%;">
                            </div>
                            <div v-else>
                                <v-icon x-large>mdi-account-circle</v-icon>
                            </div>
                        </v-avatar>
                    </v-hover>
                </template>

                <v-list style="width:310px;">
                    <v-list-item-group>
                        <div style="font-size: small; cursor:default; display: table-cell; padding-left:16px;">
                            <div v-if="isLogin">{{userInfo.email}}</div>
                            <div v-else-if="isGuestLogin">(GUEST) {{userInfo.email}}</div>
                        </div>
                        <v-divider style="margin-top: 5px;"></v-divider>
                        <v-list-item
                                v-for="(item, index) in paymentLists"
                                :key="index"
                                @click="onClickLoginMenu(item.key)"
                                class="text-reader"
                        >
                            <v-list-item-title>{{ $t(item.display) }}</v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
        </v-app-bar>

        <div v-if= "showMemo" 
                ref="draggable" 
                @mousedown="dragStart" 
                mousemove="dragging" 
                @mouseup="dragStop" 
                style="position: absolute; top: 0; left: -400px; width: 500px;"
        >      
            <v-card style="margin: 55px 100px 0 1000px; 
                        width: 500px; 
                        position: absolute; 
                        top: 220px; 
                        left: 380px; 
                        z-index: 9;"
            >
                <ckeditor v-model="editorData" :config="editorConfig"></ckeditor>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn fill="none" 
                            style="margin-left:5px; position: absolute; top: 0px; left: 450px; clo" 
                            v-bind="attrs" v-on="on"
                            color="gray" icon large
                            @click="showMemo = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </template>
                    <span>닫기</span>
                </v-tooltip>
            </v-card>
        </div>
        <course-navigator v-if="courseNavi && $route.path.includes('eventstorming')"
                          :value.sync="naviObject"></course-navigator>
        <v-content :style="headerFloating == true ? 'margin-top:-64px;':'margin-top:0px;'">
            <v-progress-linear v-if="progressValue" fixed indeterminate color="orange" height="10"></v-progress-linear>
            <v-container :style="labTool == 'quiz' ? 'background-color: #E3F2FD':''" fluid fill-height>
                <v-layout row wrap>
                    <v-flex xs12>
                        <router-view></router-view>

                        <!--new Terminal -->
                        <!--                        <terminal-page-->
                        <!--                                :terminal="terminal"-->
                        <!--                                :userInfo="userInfo"-->
                        <!--                                @terminalOff="terminalOff"-->
                        <!--                                @terminalOn="terminalOn"-->
                        <!--                                @snackbar="sendSnackbar"-->
                        <!--                        ></terminal-page>-->

                        <!--old Terminal -->
                        <div v-if="terminal">
                            <v-btn color="error" @click="terminalOff"
                                   style="position: fixed; height: 5%; top: 65%; right: 5px;">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>

                            <iframe
                                    v-if="terminalUrl"
                                    id="eventTerminal"
                                    :src="terminalUrl"
                                    @load="onLoad"
                                    :style="{width: terminalWidth + 'px'}"
                                    style="height:30%; right: 0; bottom: 0; display: block; position: fixed;"
                            ></iframe>

                            <div v-else>
                                <v-skeleton-loader
                                        v-bind="attrs"
                                        type="card-avatar"
                                ></v-skeleton-loader>
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>

        <!--  설명 Dialog -->
        <v-dialog
                v-model="infoDialog"
                style="width: 700px; height: 700px;"
        >
            <v-card>
                <v-card-title class="headline">How to use EventStorming-tool?</v-card-title>

                <v-carousel
                        v-model="infoNum"
                        show-arrows="true"
                >
                    <v-carousel-item
                            v-for="(slider, i) in infoSlider"
                            :key="slider"
                            :src="slider"
                    >
                    </v-carousel-item>
                </v-carousel>

            </v-card>
        </v-dialog>


        <!--  subscriptionDialog  -->
        <v-dialog
                v-model="subscriptionDialog"
                max-width="400"
                @click:outside="closeSubscriptionDialog"
        >
            <v-card style="width:100%; height: 100%;">
                <v-row style="justify-content: space-between; margin-left: 0px; margin-right: 0px;">
                    <div class="main-title" style="margin-left: 5%; padding-top: 20px;"> 구독 구매</div>
                </v-row>
                <v-row style="margin-left: 3%; margin-right: 3%; margin-top: 3%;">
                    <SubscriptionItemTemplate @close="closeSubscriptionDialog"></SubscriptionItemTemplate>
                </v-row>
            </v-card>
        </v-dialog>

        <!--login-->
        <v-dialog
                v-model="loginDialog"
                width="300"
                @click:outside="closeLoginDialog()"
        >
            <Login :loginMsg="loginText" @close="closeLoginDialog()" @login="login"></Login>
        </v-dialog>

        <!-- Setting Dialog -->
        <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog = false; kubeToken=''; kubeHost='';">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text @click="saveSetting()">Save</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-list three-line subheader>
                    <v-subheader>Connection Setting</v-subheader>
                    <v-list-tile avatar>
                        <v-list-tile-content>
                            <v-list-tile-sub-title>
                                <v-text-field
                                        label="Kube Host"
                                        v-model="kubeHost"
                                        hint="Ex) https://api.k8s.bzdvops.com"
                                        outline
                                ></v-text-field>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile avatar>
                        <v-list-tile-content>
                            <v-list-tile-sub-title>
                                <v-text-field
                                        label="Kube Token"
                                        v-model="kubeToken"
                                        outline
                                ></v-text-field>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-dialog>

        <!-- Snackbar insert info -->
        <v-snackbar
                v-model="snackbar"
                color="error"
                :timeout=10000
        >
            Click Setting & Insert Infomation
            <v-btn
                    dark
                    text
                    @click="snackbar = false"
            >
                Close
            </v-btn>
        </v-snackbar>

        <v-dialog v-model="podStatusDialog" hide-overlay>
            <v-card width="100%">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{hashName}} Events</v-toolbar-title>
                    <!--                    <v-divider></v-divider>-->
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click="podStatusDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text style="max-height: 500px; width: 100%;">
                    <pod-events :hash-name="hashName" v-if="podStatusDialog"></pod-events>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-alert type="info" outlined border="top" dismissible v-if="progressing"
                 style="position: fixed; bottom: 0; margin-bottom: 0px; z-index:999; width: 100%; background-color: #ffffff !important">
            <h3>{{$t('word.progressState')}}</h3>
            <v-stepper
                    style="box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 0%), 0px 0px 0px 0px rgb(0 0 0 / 0%), 0px 0px 0px 0px rgb(0 0 0 / 0%)"
                    v-model="step">
                <v-stepper-header flat>
                    <template v-for="(n,index) in steps">
                        <v-stepper-step
                                v-if="n.text == 'IDE Creating...'"
                                :key="`${n.text}`"
                                :complete="step > index +1"
                                :step="index + 1"
                                :rules="[() => !n.error]"
                                non-linear
                                @click="podStatusDialog = true"
                                color="success"
                        >{{ n.text }}
                        </v-stepper-step>
                        <v-stepper-step
                                v-else
                                :key="`${n.text}`"
                                :complete="step > index +1"
                                :step="index + 1"
                                :rules="[() => !n.error]"
                                non-linear
                                color="success"
                        >{{ n.text }}
                        </v-stepper-step>
                        <v-divider
                                v-if="index != steps.length -1 && index !== steps"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-stepper-header>
            </v-stepper>
        </v-alert>

        <v-footer v-if="showReplayBar" padless>
            <v-col cols="12">
                <v-subheader class="pl-0">Show thumb when using slider</v-subheader>
                <v-slider
                        v-model="slider"
                        thumb-label
                ></v-slider>
            </v-col>
        </v-footer>


        <v-footer
                padless
                style="border-top: solid; border-block-width: 0.5px; border-color: darkgray; background: white;"
        >
            <div style="margin-left: 7%; margin-right: 7%;">
            </div>
        </v-footer>
    </v-app>
</template>

<script>
    import StorageBase from "./components/CommonStorageBase";
    
    export default {
        name: 'App',
        props: {},
        mixins: [StorageBase],
        data: () => ({
            //search
            search: '',
            searchMode: 'all',
            headerFloating: false,
            openReloadMenu: false,
            openMenu: false,
            labInfo: null,
            urlText: null,
            // tenantLogo: null,
            terminalUrl: '',
            terminal: false,
            openGuide: false,
            // forceUpdate: true,
            iframeLoading: true,

            infoSlider: [
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/event.png',
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/policy.png',
            ],
            attrs: {
                class: 'mb-6',
                boilerplate: true,
                elevation: 2,
            },
            messageLists: [],
            infoNum: 0,
            chatWindow: false,
            dialog: false,
            drawer: false,
            infoDialog: false,
            kubeHost: '',
            kubeToken: '',
            loginDialog: false,
            openPaymentTime: false,
            refundDialog: false,
            refundInfo: null,
            subscriptionDialog: false,

            showGetCoin: false,
            loadingMigrateHistory: false,
            ideLoading: false,
            items: [
                // {icon: 'fa-book', text: 'Introduce', route: '/'},
                // {icon: 'fa-sticky-note', text: 'EventStormingListPage', route: '/' },
                {icon: 'fa-sticky-note', text: 'EventStorming', route: '/'},
            ],
            api: [],
            snackbar: false,
            fab: false,
            courseNavi: false,
            overlay: true,
            message: '',
            // uid: '',
            // userName: '',
            messageRef: {},
            progressValue: false,
            naviObject: {
                drawer: false,
                instruction: [],
                checkPoints: [],
                hints: [],
                logs: ''
            },
            progressing: false,
            podStatusDialog: false,
            steps: [{text: "Code Generate", error: false},
                {text: "Code To Zip", error: false},
                {text: "Upload Zip", error: false},
                {text: "IDE Exist Check", error: false},
                {text: "IDE Creating...", error: false},
                {text: "Setting Config", error: false},
                {text: "IDE Start!", error: false}],
            step: 1,
            hashName: "",
            terminalWidth: "100%",
            interval: '',
            podStatusInterval: '',
            showReplayBar: false,
            slider: 45,
            participantLists: [],
            customizationHome: 'https://intro.msaez.io',
            paymentLists: [
                {key: 'showMemo', display: `메모장 사용하기`},
                {key: 'logout', display: `로그아웃`}
            ],
            loginText: 'Login',
            LoginHover: false,
            
            showNewButton: false,
            isMobile: false,
            stepSetTimeOut: null,
            labTool: null,
            inSideRounge: false,
            inSideLab: false,
            editor: '',
            content: '',
            editorData: '',
            editorConfig: {
                toolbar: [
                    ['Bold', '-', 'NumberedList', 'BulletedList', 'Image' ],
                    ['Link', 'Unlink', ],
                    ],
                
            },
            showMemo: false,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,

        }),
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },

            // showAppBar(){
            //     if(window.location.href.includes('/start-Electron')){
            //         return false
            //     } else {
            //         return true
            //     }
            // },
            inSideElectron() {
                return window.ipcRenderer
            },
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            showParticipantIcons() {
                return this.participantLists.length > 0 ? true : false
            },
            activeFab() {
                switch (this.tabs) {
                    case 'one':
                        return {class: 'purple', icon: 'account_circle'}
                    case 'two':
                        return {class: 'red', icon: 'edit'}
                    case 'three':
                        return {class: 'green', icon: 'keyboard_arrow_up'}
                    default:
                        return {}
                }
            },
        },
        created: async function () {
            var me = this;

            try {
                // setting locale
                await me.setLocale();

                //set userInfo
                await me.loginUser();

            } catch (e) {
                console.log(e)
                console.log('[Error] APP.vue Created')
            }

        },
        watch: {
            'search': function (newVal) {
                this.$EventBus.$emit('searchItem', newVal, null, false);
            },
            'searchMode': function () {
                this.$EventBus.$emit('searchItem', this.search, null, true)
            },
            "openReloadMenu": function () {
                if (window.ipcRenderer) {
                    if (this.openReloadMenu) {
                        window.ipcRenderer.send("hideView");
                    } else {
                        var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("resizeView", {
                            x: $(".v-navigation-drawer").width(),
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
                } else {
                    console.log('k8sez')
                }
            },
            "openMenu": function () {
                if (window.ipcRenderer) {
                    if (this.openMenu) {
                        window.ipcRenderer.send("hideView");
                    } else {
                        var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("resizeView", {
                            x: $(".v-navigation-drawer").width(),
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
                } else {
                    console.log('msaez')
                }
            },
            "iFrame": function (newVal) {
                console.log('iFrame', newVal)
            },
            "editorData":
                _.debounce(function(newValue, oldValue){
                    this.saveMemo()
                }, 1000),
        },
        beforeDestroy() {
            var me = this;
            if (me.isLogin) {
                var convertEmail = me.userInfo.email.replace(/\./gi, '_');
                me.watch_off(`db://enrolledUsers/${convertEmail}/purchaseHistory`);
            }
            window.localStorage.removeItem("accessToken");
        },
        async mounted() {
            var me = this;

            me.$EventBus.$on('isMounted-ModelCanvas', function (data) {
                if(data == 'true') {
                    me.headerFloating = true
                } else {
                    me.headerFloating = false
                }
                
            })
            me.$EventBus.$on('setLabTool', function (data) {
                me.labTool = data
            })

            if (localStorage.getItem('projectName')) {
                me.overlay = false
            }
            me.$EventBus.$on('inSideCourse', function (data) {
                me.inCourse = data
            })
            me.$EventBus.$on('mobileMode', function (data) {
                me.isMobile = data
            })
            me.$EventBus.$on('setLabInfo', function (data) {
                me.urlText = ''
                if (data) {
                    me.labInfo = data
                    if(me.labInfo.URL){
                        me.urlText = me.labInfo.URL
                    }
                    // console.log(me.urlText)
                } else {
                    me.labInfo = null
                }
            })
            me.$EventBus.$on("inSideLab", function (data) {
                me.inSideLab = data
            })
            me.$EventBus.$on("inSideRounge", function (data) {
                me.inSideRounge = data
            })
            //<<<<< old terminal
            me.$EventBus.$on('terminalOn', function (data) {
                // me.getTerminalToken();
                try {
                    me.$EventBus.$emit('loadTerminal');
                    me.terminalWidth = $('.canvas-panel').width()
                    me.getTerminalConfig(data);
                } catch (e) {

                }
            })
            me.$EventBus.$on('terminalOff', function () {
                try {
                    me.terminalUrl = '';
                    me.terminal = false;
                } catch (e) {
                }
            })
            me.$EventBus.$on('terminalFrameOn', function () {
                me.terminalWidth = $('.canvas-panel').width()
            })
            //  old terminal >>>>>

            me.$EventBus.$on('progressing', function (data) {
                me.progressing = data.progressing
                switch (data.type) {
                    case "ES":
                        me.steps = [
                            {text: "Code Generate", error: false},
                            {text: "Code To Zip", error: false},
                            {text: "Upload Zip", error: false},
                            {text: "IDE Exist Check", error: false},
                            {text: "IDE Creating...", error: false},
                            {text: "Setting Config", error: false},
                            {text: "IDE Start!", error: false}
                        ]
                        break;
                    case "Lab":
                        me.steps = [
                            {text: "Check Template File", error: false},
                            {text: "IDE Exist Check", error: false},
                            {text: "IDE Creating...", error: false},
                            {text: "Setting Config", error: false},
                            {text: "IDE Start!", error: false}
                        ]
                        break;
                }

                /** Step 단계 정리 ( 1. EventStorming IDE )
                 * 1. Code Generate
                 * 2. Code To Zip
                 * 3. Upload Zip
                 * 4. IDE Exist Check
                 * 5. Setting Config
                 * 6. IDE Creating...
                 *  -> Pod 상태를 받아 와야 할듯..
                 *  고민 - Click시에 IDE 생성 진행 상태 관련 정보 받아오는 UI 만들기?
                 * 7. IDE Starting...
                 */

                /** Step 단계 정리 ( 2. LabTool IDE )
                 * 1. Check Template File
                 * 2. IDE Exist Check...
                 * 3. Setting Config...
                 * 4. IDE Creating...
                 *  -> Pod 상태를 받아 와야 할듯..
                 *  고민 - Click시에 IDE 생성 진행 상태 관련 정보 받아오는 UI 만들기?
                 * 5. IDE Starting
                 */

            })

            me.$EventBus.$on('nextStep', function (data) {
                me.step = me.step + 1
                // !!!
            })
            me.$EventBus.$on('hashName', function (data) {
                me.hashName = data.hashName
            })
            me.$EventBus.$on('hideProgressing', function (data) {
                me.progressing = false
            })
            me.$EventBus.$on('openProgressing', function (data) {
                me.progressing = true
            })
            me.$EventBus.$on('endProgressing', function (data) {
                // 초기값으로 변경.
                me.progressing = false
                me.step = 1;
                me.steps = [];
                me.hashName = "";
            })

            me.$EventBus.$on('progressingError', function () {
                me.steps[me.step - 1].error = true
            })

            me.$EventBus.$on('sendCode', function (val) {
                if (me.terminal) {
                    $('iframe').get(0).contentWindow.wt.term.term.send(val)
                } else {
                    me.snackbar = true;
                    me.snackbarText = "Open the terminal before clicking on the command.";
                }
            })

            me.$EventBus.$on('progressValue', function (newVal) {
                me.progressValue = newVal
            })

            me.$EventBus.$on('showReplayBar', function (newVal) {
                console.log(newVal)
                me.showReplayBar = newVal
            })

            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal
            })

            me.$EventBus.$on('subscriptionDialog', function (newVal) {
                if (newVal) {
                    me.openSubscriptionDialog()
                } else {
                    me.closeSubscriptionDialog()
                }
            })


            me.$EventBus.$on('openGetCoin', function (newVal) {
                me.showGetCoin = newVal;
            });

            me.$EventBus.$on('showLoginDialog', function () {
                me.openLoginDialog();
            })
            me.$EventBus.$on('closeChat', function (val) {
                me.messageLists = [];
                me.messageRef.off();
            })

            me.$EventBus.$on('participant', function (val) {
                me.participantLists = val
            })

            me.$EventBus.$on('storming-start', function (data) {
                console.log(data)
                me.courseNavi = true;
                me.naviObject.labsName = data.labName
                me.naviObject.drawer = true;
                me.naviObject.checkPoints = data.checkPoints;
                me.naviObject.hints = data.hints;
                me.naviObject.lab = data.lab;
                me.naviObject.instruction = data.instruction;
                me.naviObject.email = data.email

            })
            this.$EventBus.$on('guideClose', function () {
                me.openGuide = true
            })
            me.$EventBus.$on("urlUpdate", function (data) {
                me.urlText = data
            })

            me.$EventBus.$on('lab_VideoSize', function () {
                setTimeout(function () {
                    me.terminalWidth = $('.canvas-panel').width();
                }, 200)

            })

            $(document).keydown((evt) => {
                if (evt.keyCode == 27) {
                    this.overlay = false
                }
            });

            if (me.$route.query.access_token) {
                localStorage.setItem("accessToken", me.$route.query.access_token)
                var tmpURL = window.location.protocol + "//" + window.location.host + "/";
                window.location.href = tmpURL;
            }
        },
        methods: {
            login() {
                this.$EventBus.$emit('jumpToLab');
            },
            onSignInWithRedirectResult(result){
                var me = this
                try{
                    var token = result.credential.accessToken;
                    var uid = result.user.uid;
                    var provider = result.credential.providerId.split('.')[0];
                    var userEmail = result.user.providerData[0].email;
                    var userProfile = result.user.providerData[0].photoURL;
                    var state = result.operationType;
                    var userName = provider.includes('github') ? result.additionalUserInfo.username : result.additionalUserInfo.profile.name;

                    window.localStorage.setItem("author", userEmail)
                    window.localStorage.setItem("userName", userName)
                    window.localStorage.setItem("email", userEmail)
                    window.localStorage.setItem("picture", userProfile)
                    window.localStorage.setItem("accessToken", token)
                    window.localStorage.setItem("uid", uid)
                    window.localStorage.setItem("loginType", provider)

                    if (userEmail && userEmail.includes('@uengine.org')) {
                        window.localStorage.setItem("authorized", 'admin');
                    } else {
                        window.localStorage.setItem("authorized", 'student');
                    }

                    me.$EventBus.$emit('login', token)
                    me.$emit('login')

                    if(provider.includes('github')){
                        window.localStorage.setItem("gitAccessToken", token)
                        window.localStorage.setItem("gitToken", token)
                        window.localStorage.setItem("gitUserName", userName)
                        window.localStorage.setItem("gitOrgName", userName)
                        me.$emit('isGitLogin')
                    }

                    //firebase DB input
                    me.writeUserData(uid, userName, userEmail, userProfile, provider)

                    me.$gtag.event('login', {method: provider})
                } catch (e) {
                    console.log(`Error] signInWithRedirectResult: ${e}`)

                }
            },
            writeUserData(userId, name, email, imageUrl, provider) {
                // With onSignInWithRedirectResult
                var authorized = 'admin';
                if (email.includes('@uengine.org')) {
                    authorized = 'admin'
                } else {
                    authorized = 'student'
                }

                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                    authorized: authorized,
                    loginDate: Date.now()
                }
                var eObj = {
                    uid: userId,
                    userName: name,
                    profile_picture: imageUrl,
                    email: email,
                }

                this.putObject(`db://users/${userId}`, obj)
                //새로운 로그인 유저
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    this.putObject(`db://enrolledUsers/${convertEmail}`, eObj)
                }

            },
            naviControll() {
                this.$EventBus.$emit('naviControll')
            },
            moveToCourses(){
                this.$router.push('/courses')
            },
            sendSnackbar(on, text) {
                var me = this
                me.snackbar = on;
                me.snackbarText = text
            },
            setLocale() {
                try {
                    var me = this
                    $.getJSON("https://ipinfo.io", function (data) {
                        var country = data.country // 접속자 국가
                        if (country == "KR") {
                            me.$i18n.locale = 'ko'
                        } else {
                            me.$i18n.locale = 'en'
                        }
                    });
                } catch (e) {
                    me.$i18n.locale = 'ko'
                }
            },
            addNewClass() {
                this.$EventBus.$emit("addNewClass", true)
            },
            contextOpen(event) {
                this.$refs.menu.open(event);
            },
            onOpen() {
                console.log('The context menu was opened');
                this.openReloadMenu = true
            },
            onClose() {
                console.log('The context menu was closed');
                this.openReloadMenu = false
            },
            onClick(text) {
                if (text == "강력 새로고침") {
                    if (window.ipcRenderer) {
                        window.ipcRenderer.send("reloadIgnoringCache");
                    }
                }
            },
            sendUrl(text) {
                var me = this
                try {
                    var setUrl = null
                    if (text.includes('https://') || text.includes('http://')) {
                        setUrl = text
                    } else {
                        setUrl = 'https://' + text
                    }
                    var setClassId = me.classId.replace('running@', '')
                    var userId = localStorage.getItem('email').replace('.', '_')
                    me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/' + userId + '/myURL', setUrl)
                    if (me.isAdmin) {
                        var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
                        copyLabInfo.URL = setUrl
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
                        me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/URL', setUrl);
                    } else {
                        console.log('student')
                        this.$EventBus.$emit("urlUpdateForStudent", setUrl)
                    }
                    me.urltextfield = false
                } catch (e) {
                    console.log(e.message)
                }

            },
            goBack() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("goBack");
                }
            },
            goForward() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("goForward");
                }
            },
            reLoadPage() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("reload");
                }
            },
            screenMinus() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("screenMinus");
                }
            },
            screenPlus() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("screenPlus");
                }
            },
            moveToModel() {
                var me = this;
                try {
                    me.$router.push({path: `kubernetes/${me.dbuid()}`});
                } catch (e) {
                    alert('Error-NewProject', e)
                }

            },
            loadTextFromFile(test) {
                var me = this
                try {
                    const fileInfo = test.target.files[0];
                    const reader = new FileReader();

                    reader.readAsText(fileInfo);

                    reader.onload = function (info) {
                        var loadedProject = JSON.parse(info.target.result)
                        me.saveLocalToMine(loadedProject)
                    }
                } catch (e) {
                    alert('Error-Download:', e)
                }
            },

            async saveLocalToMine(loadedFile) {
                var me = this
                if (me.isLogin) {
                    var author = me.userInfo.uid ? me.userInfo.uid : localStorage.getItem('uid')
                    var authorName = me.userInfo.name ? me.userInfo.name : localStorage.getItem('userName')
                    var authorEmail = me.userInfo.email ? me.userInfo.email : localStorage.getItem('email')
                    var authorProfile = me.userInfo.profile ? me.userInfo.profile : localStorage.getItem('picture')
                    var date = loadedFile.date ? loadedFile.date : Date.now()
                    var img = loadedFile.img ? loadedFile.img : 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'
                    var type = loadedFile.type ? loadedFile.type : 'es'
                    var projectName = loadedFile.projectName ? loadedFile.projectName : 'untitled'
                    var comment = ''
                    var lastModifiedDate = date
                    var lastModifiedEmail = authorEmail
                    var lastModifiedUser = author
                    var getElements = loadedFile.elements ? loadedFile.elements : {}
                    var getRelations = loadedFile.relations ? loadedFile.relations : {}
                    var getValue = {'elements': getElements, 'relations': getRelations}

                    var newProjectId = me.dbuid()
                    var newVersionKey = await me.pushString(`db://definitions/${newProjectId}/versionLists`)


                    var information = {
                        author: author,
                        authorEmail: authorEmail,
                        comment: comment,
                        img: img,
                        lastModifiedEmail: lastModifiedEmail,
                        lastModifiedUser: lastModifiedUser,
                        lastVersionName: newVersionKey,
                        projectName: projectName,
                        type: type,
                        lastModifiedTimeStamp: lastModifiedDate,
                        createdTimeStamp:date,
                    }
                    var lastVersionValue = {
                        value: JSON.stringify(getValue),
                    }

                    var putUser = {
                        uid: author,
                        name: authorName,
                        picture: authorProfile
                    }

                    // var putMine = {
                    //     author: author,
                    //     authorEmail: authorEmail,
                    //     authorProfile: authorProfile,
                    //     comment: comment,
                    //     date: date,
                    //     img: img,
                    //     projectId: newProjectId,
                    //     lastModifiedDate: lastModifiedDate,
                    //     projectName: projectName,
                    //     type: type
                    // }

                    me.putObject(`db://definitions/${newProjectId}/information`, information);

                    me.putObject(`storage://definitions/${newProjectId}/versionLists/${newVersionKey}/versionValue`, JSON.stringify(getValue))
                    // me.putObject(`db://definitions/${newProjectId}/versionLists/${newVersionKey}/versionValue`, lastVersionValue)

                    me.putObject(`db://userLists/${author}`, putUser)
                    // me.putObject(`db://userLists/${author}/mine/${newProjectId}`, putMine)

                    setTimeout(function () {
                        var pathName = type == 'es' ? 'storming' : (type == 'k8s' ? 'kubernetes' : 'business-model-canvas')
                        me.$router.push({path: `${pathName}/${newProjectId}`});
                    }, 500)
                } else {
                    var newProjectId = me.dbuid()
                    var author = localStorage.getItem('uid') ? localStorage.getItem('uid') : 'anyone'
                    var date = loadedFile.date ? loadedFile.date : Date.now()
                    var img = loadedFile.img ? loadedFile.img : 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'
                    var type = loadedFile.type ? loadedFile.type : 'es'
                    var projectName = loadedFile.projectName ? loadedFile.projectName : 'untitled'
                    var getElements = loadedFile.elements ? loadedFile.elements : {}
                    var getRelations = loadedFile.relations ? loadedFile.relations : {}
                    var getValue = {'elements': getElements, 'relations': getRelations}

                    var lists = await me.getObject(`localstorage://localLists`)
                    var newInfo = {
                        img: img,
                        projectName: projectName,
                        projectId: newProjectId,
                        type: type,
                        lastModifiedTimeStamp: lastModifiedDate,
                        createdTimeStamp:date,
                    }
                    lists.push(newInfo)
                    me.putObject(`localstorage://localLists`, lists)
                    me.putObject(`localstorage://${newProjectId}`, JSON.stringify(getValue))

                    var pathName = type == 'es' ? 'storming' : (type == 'k8s' ? 'kubernetes' : 'business-model-canvas')
                    me.$router.push({path: `${pathName}/${newProjectId}`});
                }

            },
            openLoginDialog() {
                this.loginDialog = true
            },
            closeLoginDialog() {
                this.loginDialog = false
            },
            openToolTime() {
                this.openPaymentTime = true
            },
            closeToolTime() {
                this.openPaymentTime = false
            },
            openRefundDialog() {
                this.refundDialog = true
            },
            closeRefundDialog() {
                this.refundInfo = null
                this.refundDialog = false
            },
            openSubscriptionDialog() {
                this.subscriptionDialog = true
            },
            closeSubscriptionDialog() {
                this.subscriptionDialog = false
            },
            openGetCoin() {
                this.showGetCoin = true
            },
            closeGetCoin() {
                this.showGetCoin = false
            },
            provision() {
                this.$router.push({path: '/provision'});
            },
            onClickLoginMenu(key) {
                var me = this
                try {
                    if (key == 'logout') {
                        me.logout();
                        if (window.ipcRenderer) {
                            window.ipcRenderer.send("closeView");
                        }
                    } else if(key == 'showMemo'){
                        me.openMemo()
                    } else {
                        if (!me.isLogin) {
                            me.openLoginDialog()
                        }
                    }
                } catch (e) {
                    console.log(e);
                    alert('error-loginMenu', e)
                }

            },
            openParticipantPanel(boolean) {
                var me = this
                me.$EventBus.$emit('participantPanel', boolean)
            },
            goMessage() {
                var me = this
                me.$router.push('/MessageTest')
            },
            openPanelParticiateLists() {
                this.$EventBus.$emit('participantsListsPanel', true)
            },
            onLoad() {
                console.log('iframe loaded');
                this.iframeLoading = false;
            },
            getTerminalToken() {
                var me = this
                var item = {
                    "type": "Token",
                    "name": localStorage.getItem('clusterName'),
                    "apiServer": localStorage.getItem('clusterAddress'),
                    "token": localStorage.getItem('kuberToken'),
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post("api/kube-token", item).then(function (response) {
                    me.terminalUrl = "terminal/?token=" + response.data.token;
                    me.terminal = true;
                }).catch(function (err) {
                    me.snackbar = true;
                    me.snackbarText = "To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.";
                })
            },
            getTerminalConfig(data) {
                var me = this
                var item = {
                    "type": "Token",
                    "name": data.name,
                    // "apiServer": localStorage.getItem('clusterAddress'),
                    "kubeConfig": data.config
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post("api/kube-config", item).then(function (response) {
                    me.terminalUrl = "terminal/?token=" + response.data.token;
                    me.terminal = true;
                }).catch(function (err) {
                    me.snackbar = true;
                    me.snackbarText = "To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.";
                })
            },
            // new terminal
            // terminalOn() {
            //     try {
            //         this.terminal = true;
            //     } catch (e) {
            //         console.log(e)
            //     }
            // },
            terminalOff() {
                var me = this;
                // new terminal
                // try {
                //     me.terminal = false;
                // } catch (e) {
                //     console.log(e)
                // }

                // old terminal
                me.$EventBus.$emit('terminalOff');
            },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
            logout() {
                var me = this;

                if (me.isLogin) {
                    var obj = {
                        state: 'signOut',
                        logoutDate: Date.now()
                    }
                    me.putObject(`db://users/${me.userInfo.uid}`, obj)
                }
                
                localStorage.clear();
                me.$EventBus.$emit('login', null);
                me.$gtag.event('logout', {method: 'google'});
                var newURL = window.location.protocol + "//" + window.location.host + "/";
                window.location.href = newURL;
            },
            saveSetting() {
                var me = this;
                me.dialog = false;
                this.$http.put(`${API_HOST}/kube/user/saveUserDetail`, {
                    username: me.userInfo.user_name,
                    host: me.kubeHost,
                    token: me.kubeToken
                }).then((result) => {
                    let tmp = {kubeHost: me.kubeHost, kubeToken: me.kubeHost, userName: me.userInfo.user_name}
                    me.$store.dispatch('LOGIN', tmp)
                })
            },
            loginPage() {
                var me = this
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("loginPage", me.getTenantId());
                    window.ipcRenderer.on("loginData", function (event, arg) {
                        var tmp = JSON.parse(arg)
                        console.log(tmp)
                        window.localStorage.setItem("author", tmp.author)
                        window.localStorage.setItem("userName", tmp.userName)
                        window.localStorage.setItem("email", tmp.email)
                        window.localStorage.setItem("picture", tmp.picture)
                        window.localStorage.setItem("accessToken", tmp.accessToken)
                        window.localStorage.setItem("uid", tmp.uid)
                        window.localStorage.setItem("authorized", tmp.authorized);
                        if (tmp.type == "github") {
                            window.localStorage.setItem("gitAccessToken", tmp.gitAccessToken)
                        }
                        location.reload()
                    })
                } else {
                    me.openLoginDialog();
                }
            },
            wikiOpen() {
                window.open("hhttps://github.com/uengine-oss/kubeez/wiki", "_blank")
            },
            async openMemo() {
                var me = this;
                var convertEmail = localStorage.getItem("email").replace(/\./gi, '_')
                me.editorData = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/memo/' + convertEmail , me.editorData);
                me.showMemo = !me.showMemo
            },
            async saveMemo(){
                var me = this; 
                var convertEmail = localStorage.getItem("email").replace(/\./gi, '_')
                await me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/memo/' + convertEmail , me.editorData);
                if(!me.editorData){
                    await me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/memo/' + convertEmail , me.editorData + '메모할 내용을 입력해주세요.');
                }
            },
            dragStart(event) {
                var me = this;
                me.isDragging = true;
                me.startX = event.clientX;
                me.startY = event.clientY;
                me.currentX = me.$refs.draggable.offsetLeft;
                me.currentY = me.$refs.draggable.offsetTop;
                me.offsetX = me.startX - me.currentX;
                me.offsetY = me.startY - me.currentY;
            },
            dragging(event) {
                var me = this;
                if (me.isDragging) {
                    me.currentX = event.clientX - me.offsetX;
                    me.currentY = event.clientY - me.offsetY;
                    me.$refs.draggable.style.left = `${me.currentX}px`;
                    me.$refs.draggable.style.top = `${me.currentY}px`;
                }
            },
            dragStop() {
                var me = this;
                me.isDragging = false;
            }
        }
    }

</script>
<style>

    .upload {
        height: 48px;
        cursor: pointer;
        line-height: 48px;
        padding-left: 16px;
        color: rgba(0, 0, 0, 0.87);
    }

    .upload:hover {
        background-color: #f9f9f9;
    }

    /*.iframe-wrapper {*/
    /*    border: 1px solid gray;*/
    /*    height: 600px;*/
    /*}*/

    /*.vue-friendly-iframe {*/

    /*    height: 35%;*/
    /*    width: 100%;*/
    /*}*/

    /*iframe {*/
    /*    height: 100%;*/
    /*    width: 100%;*/
    /*}*/
    /*iframe {*/
    /*    height: 100%;*/
    /*    width: 100%;*/
    /*}*/
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

    .learn-main-search {
        width: 60px !important;
        margin-left: 10px !important;
        margin-right: 10px !important;
    }

    .learn-main-search .v-input__slot {
        min-height: 36px !important;
        width: 100% !important;
        margin-top: 10px;
    }

    .learn-main-search .v-label {
        top: 8px !important;
    }

    .list-type-btn:hover {
        border: 0.1px solid rgba(255, 255, 255) !important;
    }
    
    /* 추가 */

    @media only screen and (max-width: 1110px) {
        .app-docs-text, .app-new-text {
            display: none;
        }

        .app-docs-btn, .app-new-btn {
            min-width:32px !important;
            max-width:32px !important;
        }
    }

    @media only screen and (max-width: 781px) {
        #textsize {
            font-size: 11px;
        }
    }

    @media only screen and (max-width: 475px) {
        .app-docs-btn, .app-new-btn {
            display:none;
        }
    }

</style>