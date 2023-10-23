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
            <v-toolbar-title style="width: 360px" class="ml-0 pl-3">
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
            
            <v-btn @click="wikiOpen"
                    class="mr-2"
                    color="primary"
                    icon
            >
                <v-icon>info</v-icon>
            </v-btn>
        </v-app-bar>

        <v-content :style="headerFloating == true ? 'margin-top:-64px;':'margin-top:0px;'">
            <v-progress-linear v-if="progressValue"
                    fixed 
                    indeterminate
                    color="orange"
                    height="10"
            ></v-progress-linear>
            <v-container fluid fill-height>
                <v-layout row wrap>
                    <v-flex xs12>
                        <router-view/>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>

        <v-snackbar v-model="snackbar" :color="snackbarColor">
            {{ snackbarText }}
            <v-btn dark @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>

        <div v-if="terminal">
            <v-btn color="error"
                    @click="terminalOff" 
                    style="position: fixed; height: 5%; top: 60%; right: 1%;"
            >
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <iframe
                    id="eventTerminal"
                    :src="terminalUrl"
                    @load="onLoad"
                    style="width: 100%; left: 0; bottom: 0; display: block; position: fixed"
            ></iframe>
        </div>
        
        <v-overlay :value="overlay">
            <v-btn icon @click="overlay = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-layout style="height: 90%; width: 90%;">
                <youtube-media
                        :video-id="'P237N2azQNM'"
                        :player-width="this.$innerWidth*0.7"
                        :player-height="this.$innerHeight*0.7"
                ></youtube-media>
            </v-layout>
        </v-overlay>        
    </v-app>
</template>

<script>
    export default {
        name: 'App',
        props: {},
        data: () => ({
            headerFloating: false,

            // terminal
            terminalUrl: '',
            terminal: false,
            iframeLoading: true,
                        
            overlay: false,
            progressValue: false,
            // snackbar
            snackbar: false,
            snackbarColor: 'error',
            snackbarText: '',
        }),
        computed: {
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid;
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
        },
        async created() {
            var me = this;

            // me.getRef('auth').getRedirectResult().then((result) => {
            //     if (result.credential) {
            //         /** 
            //          * @type {firebase.auth.OAuthCredential}
            //          *  */
            //         me.onSignInWithRedirectResult(result);
            //     }
            // }).catch((error) => {
            //     // Handle Errors here.
            //     var errorCode = error.code;
            //     var errorMessage = error.message;
            // });

            try {
                // setting locale
                await me.setLocale();

                //set userInfo
                // await me.loginUser();

            } catch (e) {
                console.log(e);
                console.log('[Error] APP.vue Created');
            }
        },
        watch: {},
        beforeDestroy() {
            window.localStorage.removeItem("accessToken");
        },
        mounted() {
            var me = this

            if (localStorage.getItem('projectName')) {
                me.overlay = false
            }

            me.$EventBus.$on('isMounted-ModelCanvas', function (data) {
                if(data == 'true') {
                    me.headerFloating = true
                } else {
                    me.headerFloating = false
                }
            });

            me.$EventBus.$on('mobileMode', function (data) {
                me.isMobile = data;
            });

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

            me.$EventBus.$on('sendCode', function (val) {
                if (me.terminal) {
                    $('iframe').get(0).contentWindow.wt.term.term.send(val);
                } else {
                    me.snackbar = true;
                    me.snackbarText = "Open the terminal before clicking on the command.";
                }
            });

            me.$EventBus.$on('progressValue', function (newVal) {
                me.progressValue = newVal;
            });
            
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
            onSignInWithRedirectResult(result) {
                var me = this;

                try {
                    var token = result.credential.accessToken;
                    var uid = result.user.uid;
                    var provider = result.credential.providerId.split('.')[0];
                    var userEmail = result.user.providerData[0].email;
                    var userProfile = result.user.providerData[0].photoURL;
                    var state = result.operationType;
                    var userName = provider.includes('github') ? result.additionalUserInfo.username : result.additionalUserInfo.profile.name;

                    window.localStorage.setItem("author", userEmail);
                    window.localStorage.setItem("userName", userName);
                    window.localStorage.setItem("email", userEmail);
                    window.localStorage.setItem("picture", userProfile);
                    window.localStorage.setItem("accessToken", token);
                    window.localStorage.setItem("uid", uid);
                    window.localStorage.setItem("loginType", provider);

                    if (userEmail && userEmail.includes('@uengine.org')) {
                        window.localStorage.setItem("authorized", 'admin');
                    } else {
                        window.localStorage.setItem("authorized", 'student');
                    }

                    me.$EventBus.$emit('login', token);
                    me.$emit('login');

                    if(provider.includes('github')){
                        window.localStorage.setItem("gitAccessToken", token);
                        window.localStorage.setItem("gitToken", token);
                        window.localStorage.setItem("gitUserName", userName);
                        window.localStorage.setItem("gitOrgName", userName);
                        me.$emit('isGitLogin');
                    }

                    me.$gtag.event('login', {method: provider});
                } catch (e) {
                    console.log(`Error] signInWithRedirectResult: ${e}`);
                }
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
            onLoad() {
                console.log('iframe loaded');
                this.iframeLoading = false;
            },
            wikiOpen() {
                window.open('https://github.com/uengine-oss/kuber-ez/wiki')
            },
            getTerminalToken() {
                var me = this
                var item = {
                    "type": "Token",
                    "name" : localStorage.getItem('clusterName'),
                    "apiServer" : localStorage.getItem('clusterAddress'),
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
            terminalOff() {
                var me = this;
                me.$EventBus.$emit('terminalOff');
            },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            }
        }
    }
</script>
<style>
    .iframe-wrapper {
       border: 1px solid gray;
       height: 600px;
    }

    /* .vue-friendly-iframe {
       height: 35%;
       width: 100%;
    }

    iframe {
       height: 100%;
       width: 100%;
    } */

    iframe {
        height: 35%;
        width: 100%;
        border: 0;
    }

</style>
