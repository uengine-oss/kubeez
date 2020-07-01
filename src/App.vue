<template>
    <v-app id="inspire"
           @keydown.esc="overlay = false"
           style="overflow: hidden"
    >

        <v-app-bar
                :clipped-left="$vuetify.breakpoint.lgAndUp"
                color="blue darken-1"
                dark
                app
                fixed
        >
            <v-toolbar-title style="width: 700px" class="ml-0 pl-3">
                <v-layout>
                    <!--                    <v-app-bar-nav-icon style="margin-right: 20px;" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>-->

                    <v-btn text style="width: 150px; height: 50px;"  @click.native="$router.push('/')">
                        <v-img contain  max-height=45 max-width=140 src="../public/static/image/logochange2.png"></v-img>
                    </v-btn>
                    <!--<div class="font-weight-bold" style="font-size: 16px; margin-top: 24px"> by uEngine</div>-->
                </v-layout>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu
                    v-if="($route.params.author && $route.params.projectName && $route.params.author != 'Local')"
                    v-model="chatWindow"
                    :close-on-content-click="false"
                    :nudge-width="200"
                    offset-x
            >
                <template v-slot:activator="{ on }">
                    <v-btn text
                           dark
                           v-on="on"
                    >
                        <v-icon dark>chat</v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-list>
                        <v-list-item>
                            <v-list-item-avatar>
                                <img v-if="loginUser.picture"
                                     :src=loginUser.picture
                                >
                            </v-list-item-avatar>

                            <v-list-item-content>
                                <v-list-item-title>
                                    {{$route.params.projectName}}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{$route.params.author}}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <div v-for="item in messageLists"
                    >
                        <span v-if="item.model">
                            {{item.userName}}님이 수정하였습니다.
                        </span>
                        <v-col v-else>
                            <v-row v-if="item.uid == uid"
                                   justify="end"
                            >
                                <v-col>
                                    <v-row
                                            justify="end"
                                    >
                                         <span class="caption"
                                               style="margin-bottom: 0px; display: block;">{{item.userName}}</span>
                                    </v-row>

                                </v-col>
                                <v-chip
                                        color="green"
                                        text-color="white"
                                        style="display: block;"
                                >{{item.message}}
                                </v-chip>
                            </v-row>
                            <v-row v-else>
                                <v-chip
                                        style="display: block;"
                                >{{item.message}}
                                </v-chip>
                                <span class="caption"
                                      style="margin-bottom: 0px; display: block;">{{item.userName}}</span>
                            </v-row>
                        </v-col>
                    </div>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-text-field
                                v-model="message"
                                outlined
                                append-icon="mdi-send"
                                @click:append="sendMessage"
                                v-on:keyup.enter="sendMessage"
                        ></v-text-field>
                    </v-card-actions>
                </v-card>
            </v-menu>

            <v-toolbar-title class="mr-5">
                {{ clusterInfo }}
            </v-toolbar-title>

            <v-btn
                    v-if="!successLogin"
                    @click="loginPage"
                    fab icon>
                <v-avatar>
                    <v-icon x-large>mdi-account-circle</v-icon>
                </v-avatar>
            </v-btn>

            <v-btn
                    v-if="successLogin"
                    @click="logout()"
                    fab icon>
                <v-avatar
                        size="40"
                >
                    <img
                            v-if="loginUser.picture"
                            :src=loginUser.picture
                    >
                </v-avatar>
            </v-btn>

            <v-btn 
                    v-if="successLogin"
                    @click="clusterOpen"
                    icon>
                <v-icon>settings</v-icon>
            </v-btn>

            <v-btn icon color="white" @click="wikiOpen">
                <v-icon medium>info</v-icon>
            </v-btn>
        </v-app-bar>

        <v-content>
            <v-progress-linear v-if="progressValue" fixed indeterminate color="orange" height="10" ></v-progress-linear>
            <v-container fluid fill-height>
                <v-layout row wrap>
                    <v-flex xs12>
                        <router-view/>
                    </v-flex>


                </v-layout>
            </v-container>
        </v-content>

        <vue-friendly-iframe
               v-if="terminal"
               className="eventTerminal"
               style="width: 100%; left: 0; bottom: 0; display: block; position: fixed"
               :src="terminalUrl" @load="onLoad"
               frameborder="0"
        ></vue-friendly-iframe>
        
        <v-overlay
                :value="overlay"
                align="end"
        >
            <v-btn
                    icon
                    @click="overlay = false"
            >
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-layout
                    style="height: 90%; width: 90%;"
            >
                <youtube-media
                        :video-id="'P237N2azQNM'"
                        :player-width="this.$innerWidth*0.7"
                        :player-height="this.$innerHeight*0.7"
                ></youtube-media>
            </v-layout>
        </v-overlay>


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

                        <!--                        <v-sheet-->
                        <!--                                height="100%"-->
                        <!--                                tile-->
                        <!--                        >-->
                        <!--                            <v-row-->
                        <!--                                    class="fill-height"-->
                        <!--                                    align="center"-->
                        <!--                                    justify="center"-->
                        <!--                            >-->
                        <!--                                <div class="display-3">Slide {{ i + 1 }}</div>-->
                        <!--                            </v-row>-->
                        <!--                        </v-sheet>-->
                    </v-carousel-item>
                </v-carousel>

            </v-card>
        </v-dialog>

        <!--login-->
        <v-dialog
                v-model="loginDialog"
                width="300"
        >
            <Login></Login>
        </v-dialog>

        <!-- Setting Dialog -->
        <v-dialog v-model="clusterDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Manage Clusters</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click="clusterClose()">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-list three-line subheader>
                    <v-list-item>
                        <v-list-item-content>
                            <ViewManageClustersPage 
                                    @close="clusterClose"
                                    v-model="clusterInfo" />
                        </v-list-item-content>
                    </v-list-item>
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
                    flat
                    @click="snackbar = false"
            >
                Close
            </v-btn>
        </v-snackbar>

    </v-app>
</template>

<script>
    import axios from 'axios'
    import https from 'https'
    import firebase from 'firebase'

    export default {
        name: 'App',
        props: {},
        data: () => ({
            terminalUrl: '',
            terminal: false,
            iframeLoading: true,
            infoSlider: [
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/event.png',
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/policy.png',
            ],
            messageLists: [],
            infoNum: 0,
            chatWindow: false,
            clusterDialog: false,
            clusterInfo: '',
            drawer: false,
            infoDialog: false,
            kubeHost: '',
            kubeToken: '',
            loginDialog: false,
            items: [
                // {icon: 'fa-book', text: 'Introduce', route: '/'},
                // {icon: 'fa-sticky-note', text: 'EventStormingListPage', route: '/' },
                {icon: 'fa-sticky-note', text: 'EventStorming', route: '/'},
            ],
            api: [],
            snackbar: false,
            fab: false,
            overlay: false,
            // loginUser: {},
            successLogin: false,
            message: '',
            uid: '',
            userName: '',
            messageRef: {},
            progressValue: false
        }),
        components: {
            axios,
            https,
        },
        beforeDestroy() {
            var me = this
            window.localStorage.removeItem("accessToken");
            // me.messageRef = firebase.database().ref(`/${me.chatUid}/${me.$route.params.projectName}`);

            // window.localStorage.removeItem("projectName");
            // window.localStorage.removeItem("picture");
            // window.localStorage.removeItem("loadData");
        },
        // beforeMount(){
        // },
        computed: {
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
            loginUser() {
                var us = {
                    'author': window.localStorage.getItem("author"),
                    'userName': window.localStorage.getItem("userName"),
                    'picture': window.localStorage.getItem("picture"),
                    'email': window.localStorage.getItem("email")
                }
                return us
            },
            authorized() {
                var me = this
                if (window.localStorage.getItem("accessToken") == null) {
                    window.authorized = false;
                    return false
                } else if (window.localStorage.getItem("accessToken")) {
                    // this.$http.defaults.headers.common['Authorization'] = `Bearer ${localStorage.accessToken}`;
                    // var us={
                    //     'author': window.localStorage.getItem("author"),
                    //     'userName':window.localStorage.getItem("userName"),
                    //     'picture': window.localStorage.getItem("picture"),
                    //     'email': window.localStorage.getItem("email")
                    // }
                    me.loginUser

                    window.authorized = true;
                    me.loginDialog = false;
                    return true
                }
            },
            // userInfo() {
            //     if (this.authorized == true) {
            //         // console.log(this.$jwt.decode())
            //         return this.$jwt.decode()
            //     } else {
            //         return null
            //     }
            // }
        },
        created: function () {
            var me = this
            //로그인 초기 세탕
            if (me.authorized) {
                me.successLogin = true
                me.overlay = false
            } else {
                me.successLogin = false
            }
        },
        watch: {},
        beforeDestroy(){
            // console.log("APP> beforeDestory")
            // window.localStorage.removeItem("accessToken");
            // window.localStorage.removeItem("author");
            // window.localStorage.removeItem("userName");
            // window.localStorage.removeItem("email");
            // window.localStorage.removeItem("projectName");
            // window.localStorage.removeItem("picture");
            // window.localStorage.removeItem("loadData");
            // window.localStorage.removeItem("uid");
        },
        mounted() {
            var me = this

            if (localStorage.getItem('clusterName')) {
                me.clusterInfo = localStorage.getItem('clusterName')
            }

            if (localStorage.getItem('projectName')) {
                me.overlay = false
            }

            //로그인 토큰값으로 파악
            me.$EventBus.$on('login', function (val) {
                if (val) {
                    me.successLogin = true
                } else {
                    me.successLogin = false
                }
                me.loginDialog = false
                me.authorized
                // me.vm.$forceUpdate();
                me.$forceUpdate();
            })

            // // console.log()

            me.$EventBus.$on('loginRecommand', function () {
                me.loginDialog = true
                // me.messageLists.push({'이동되었습니다.'})
            })
            me.$EventBus.$on('closeChat', function (val) {
                // console.log("chat close", me.messageRef)
                me.messageLists = [];
                me.messageRef.off();
            })

            me.$EventBus.$on('terminalOn', function (val) {
                var token = val;
                // console.log(location.pathname)
                // me.terminalUrl = location.pathname + "terminal/?token=" + token;
                me.terminalUrl = "http://192.168.99.125:30807/" + "terminal/?token=" + token
                me.terminal = true;
            })
            me.$EventBus.$on('terminalOff', function (val) {
                me.terminalUrl = ''
                me.terminal = false
            })
            me.$EventBus.$on('progressValue',function (newVal) {
                me.progressValue = newVal
            })
            // me.$EventBus.$on('chatKey', function (val) {
            //     me.chatUid = val
            //     // me.$route.params.projectName
            //     me.messageRef = firebase.database().ref(`/${val}/${me.$route.params.projectName}`);
            //     // console.log("chat start", me.messageRef)
            //
            //     me.messageRef.on('child_added', function (value) {
            //         if (value.val().message) {
            //             if (value.val().message.length > 0) {
            //                 me.messageLists.push(value.val())
            //             }
            //         }
            //     })
            // })


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
            // Multi(){
            //   this.$EventBus.$emit('webrtcDialog')
            // },
            onLoad() {
                console.log('iframe loaded');
                this.iframeLoading = false;
            },
            // onIframeLoad() {
            //     console.log('iframe loaded');
            // },
            async sendMessage() {

                var me = this
                if (me.message.length > 0) {
                    // var users = me.getUid();
                    if (me.userName.length < 1 && me.uid.length < 1) {

                        users.then(function (user) {
                            me.userName = user.displayName;
                            me.uid = user.uid

                            me.messageRef = firebase.database().ref(`/${me.chatUid}/${me.$route.params.projectName}`);
                            me.messageRef.push({message: me.message, userName: me.userName, uid: me.uid});
                            me.message = '';
                        })
                    } else {
                        me.messageRef = firebase.database().ref(`/${me.chatUid}/${me.$route.params.projectName}`);
                        me.messageRef.push({message: me.message, userName: me.userName, uid: me.uid});
                        me.message = '';
                    }
                }
            },
            // logoutUpdate(userId) {
            //     var me = this
            //
            //     //사용자 조회
            //
            //     firebase.database().ref('/users/' + userId)
            //         .once('value')
            //         .then(function (snapshot) {
            //             var email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
            //             var picture = (snapshot.val() && snapshot.val().profile_picture) || 'Anonymous';
            //             var state = "signOut";
            //             var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            //
            //             //업데이트
            //             me.$nextTick(function () {
            //                 firebase.database().ref('users/' + userId)
            //                     .set({
            //                         username: username,
            //                         email: email,
            //                         profile_picture: picture,
            //                         state: state
            //                     });
            //                 // console.log("comlepete")
            //             })
            //         });
            // },
            // getUid() {
            //     return new Promise(function (resolve) {
            //         firebase.auth().onAuthStateChanged(function (user) {
            //             if (user) {
            //                 resolve(user);
            //             } else {
            //                 // No user is signed in.
            //                 resolve("everyone")
            //             }
            //         });
            //     })
            // },
            logout() {
                var me = this
                var userId = localStorage.getItem('uid')

                firebase.database().ref('users/' + userId).update({
                    state: 'signOut'
                });

                firebase.auth().signOut().then(function (result) {
                    // Sign-out successful.
                    console.log('logout')
                    window.localStorage.removeItem("accessToken");
                    window.localStorage.removeItem("author");
                    window.localStorage.removeItem("userName");
                    window.localStorage.removeItem("email");
                    window.localStorage.removeItem("projectName");
                    window.localStorage.removeItem("picture");
                    window.localStorage.removeItem("loadData");
                    window.localStorage.removeItem("uid");
                    window.localStorage.removeItem("clusterName");
                    window.localStorage.removeItem("clusterAddress");
                    window.localStorage.removeItem("kuberToken");

                    me.$EventBus.$emit('login', localStorage.getItem("accessToken"))

                    var newURL = window.location.protocol + "//" + window.location.host + "/";
                    window.location.href = newURL;
                }).catch(function (error) {
                    // An error happened.
                });

                // this.$store.commit('LOGOUT')
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
                me.loginDialog = true;
            },
            wikiOpen() {
                window.open('http://uengine.org/eventstorming/#/')
            },
            clusterOpen() {
                var me = this
                me.clusterDialog = true
            },
            clusterClose() {
                var me = this
                me.clusterDialog = false
            }
        }
    }
</script>
<style>
    .iframe-wrapper {
       border: 1px solid gray;
       height: 600px;
    }

    .vue-friendly-iframe {
       height: 35%;
       width: 100%;
    }

    iframe {
       height: 100%;
       width: 100%;
    }

</style>
