<template>
    <v-app id="inspire"
           @keydown.esc="overlay = false"
           style="overflow: hidden">
        <v-app-bar
                :clipped-left="$vuetify.breakpoint.lgAndUp"
                color="blue darken-1"
                dark app fixed>
            <v-toolbar-title style="width: 700px" class="ml-0 pl-3">
                <v-layout>
                    <v-btn text style="width: 150px; height: 50px;"  @click.native="$router.push('/')">
                        <v-img contain  max-height=45 max-width=140 src="../public/static/image/kuberez_logo.png"></v-img>
                    </v-btn>
                </v-layout>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            
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

        <v-snackbar v-model="snackbar" :color="snackbarColor">
            {{ snackbarText }}
            <v-btn dark @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>

        <div v-if="terminal">
            <v-btn color="error" @click="terminalOff" style="position: fixed; height: 5%; top: 60%; right: 1%;">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <iframe
                    id="eventTerminal"
                    :src="terminalUrl"
                    @load="onLoad"
                    style="width: 100%; left: 0; bottom: 0; display: block; position: fixed"
            ></iframe>
        </div>
        
        <v-overlay
                :value="overlay"
                align="end">
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
        },
        created() {
            var me = this
        },
        watch: {},
        beforeDestroy(){
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

            if (localStorage.getItem('projectName')) {
                me.overlay = false
            }

            me.$EventBus.$on('terminalOn', function () {
                me.getTerminalToken();
            })
            me.$EventBus.$on('terminalOff', function () {
                me.terminalUrl = '';
                me.terminal = false;
            })
            me.$EventBus.$on('sendCode', function (val) {
                if(me.terminal) {
                    $('iframe').get(0).contentWindow.wt.term.term.send(val)
                } else {
                    me.snackbar = true;
                    me.snackbarText = "Open the terminal before clicking on the command.";
                }
            })

            me.$EventBus.$on('progressValue',function (newVal) {
                me.progressValue = newVal
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
            onLoad() {
                console.log('iframe loaded');
                this.iframeLoading = false;
            },
            wikiOpen() {
                window.open('https://github.com/uengine-oss/kuber-ez')
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
            terminalOff() {
                var me = this;
                me.$EventBus.$emit('terminalOff');
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
