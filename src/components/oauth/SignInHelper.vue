<template>
    <v-card class="elevation-12"
            v-if="standard"
            style="background: #FFFFFF;
                    min-width:300px;
                    max-width:300px;
                    position:absolute;
                    display:block;
                    left:50%;
                    margin-left:-150px;
                    top:50%;
                    margin-top:-250px;
                    height: 350px;"
    >
        <v-card flat>
            <v-col align="center">
                <v-col justify="center" align="center" style="margin-top: 30px;">
                    <div style=" font-weight:700;font-size:20px;color:#424242;">LOGIN</div>
                    <div class="pa-2"></div>
                    <v-btn
                            block
                            color="#ffffff"
                            style="width: 80%; font-size: 13px; color: #175FC7; justify-content: center; "
                            @click="snsLogin('google')"
                    >
                        <img width="20px"
                             style="margin-bottom:3px; margin-right:15px ;"
                             alt="Google sign-in"
                             src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"/>
                        Login in with Google
                    </v-btn>
                    <div class="pa-2 clearfix or-box">

                        <hr class="or-line" style="width:45%; margin-right:1px;">
                        <div id="or-text">or</div>
                        <hr class="or-line" style="width:45%; margin-left:1px;">
                    </div>
                    <v-btn
                            block
                            color="#000000"
                            style="width: 250px;font-size: 13px; color:black; background-color:white;justify-content: center; "
                            @click="snsLogin('github')">

                        <img
                                id="git-hover"
                                width="30px"
                                style="margin-bottom:-1px; margin-right:5px;"
                                alt="Github sign-in"
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
                        Login in with Github
                    </v-btn>

                    <div style="font-size: small; color:#BDBDBD; margin-top: 15px;">
                        {{$t('loginList.cookieCheck1')}}<br> {{$t('loginList.cookieCheck2')}}
                    </div>
                </v-col>
            </v-col>
        </v-card>
    </v-card>
    <v-card v-else-if="guest"
            class="elevation-12"
            style="width:700px;
                    position:absoluite;
                    margin-top:50px;
                    margin:0 auto;">
        <v-card>
            <v-card-title>
                <span class="headline">게스트 로그인 정보</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-row>
                        <v-text-field
                                v-if="inputConnectionkey"
                                v-model="connectionKey"
                                label="접속 키"
                                required
                        ></v-text-field>
                    </v-row>
                    <v-row>
                        <v-text-field label="이름" v-model="userInfo.name" required></v-text-field>
                    </v-row>
                    <v-row>
                        <v-text-field label="이메일" v-model="userInfo.email" required :rules="emailRules"></v-text-field>
                    </v-row>
                    아바타
                    <v-row>
                        <v-col v-for="i in 22">
                            <v-badge
                                    v-if="userImage == i"
                                    avatar
                                    bordered
                                    overlap
                                    color="success"
                            >
                                <template v-slot:badge style="top: 1px; right: -2px;">
                                    <v-icon style="color: #ffffff">
                                        mdi-check-bold
                                    </v-icon>
                                </template>

                                <v-avatar
                                        class="profile"
                                        color="grey"
                                        size="50"
                                        style="margin-top: 5px; margin-right: 7px"
                                        @click="userImage = null"
                                >
                                    <v-img :src="userIcon(i)"></v-img>
                                </v-avatar>
                            </v-badge>
                            <v-avatar
                                    v-else
                                    class="profile"
                                    color="grey"
                                    size="50"
                                    style="margin-top: 5px; margin-right: 7px"
                                    @click="userImage = i"
                            >
                                <v-img :src="userIcon(i)"></v-img>
                            </v-avatar>
                        </v-col>
                    </v-row>

                    <div class="caption">아이콘 제작자 <a href="https://www.flaticon.com/kr/authors/freepik"
                                                    title="Freepik">Freepik</a> from <a
                            href="https://www.flaticon.com/kr/" title="Flaticon"> www.flaticon.com</a>
                    </div>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeLogin()">Close</v-btn>
                <v-btn color="blue darken-1" text @click="joinClassByKey()" :disabled="!valid">입장</v-btn>
            </v-card-actions>
        </v-card>
    </v-card>

    <v-card style="background: #FFFFFF; min-width:400px; position:absolute; top:150px; left:50%; margin-left:-200px;"
            v-else-if="onlyConnectionKey">
        <v-card>
            <v-card-title>
                <span class="headline">접속키 입력</span>
            </v-card-title>
            <v-card-text>
                <v-text-field
                        v-if="inputConnectionkey"
                        v-model="connectionKey"
                        label="접속 키"
                        required
                        @keydown.enter="inputConnectionKey()"
                ></v-text-field>
            </v-card-text>
            <v-card-actions style="margin-left:250px;">
                <v-btn color="blue darken-1" text @click="closeLogin()">Close</v-btn>
                <v-btn color="blue darken-1" text @click="inputConnectionKey()">입력</v-btn>
            </v-card-actions>
        </v-card>
    </v-card>
</template>
<script>
    import firebase from 'firebase'
    import LabBase from "../labs/LabBase";
    import TenantAware from '../labs/TenantAware';

    require('firebase/auth')

    export default {
        name: "SignInHelper",
        components: {},
        props: {
            loginMsg: {
                type: String,
                default: function () {
                    return null
                }
            }
        },
        mixins: [LabBase, TenantAware],
        data: () => ({
            tenantLogo: null,
            drawer: null,
            guest: false,
            standard: false,
            onlyConnectionKey: false,
            userInfo: {
                name: '',
                email: ''
            },
            connectionKey: '',
            userImage: null,
            inputConnectionkey: false,
            authorized: null,
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
            ],
            valid: true
        }),
        watch: {
            "userImage": {
                handler(newVal) {
                    console.log(newVal)
                    var me = this
                    localStorage.setItem("picture", me.userIcon(newVal))
                }
            }
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        },
        async created() {
            var me = this

            me.userInfo.email = localStorage.getItem('email')
            me.userInfo.name = localStorage.getItem('userName')

            if (window.location.href.includes("login-page")) {

                var clazz = await this.getClassInfo();

                if (clazz.connectionKey) {
                    me.inputConnectionkey = true
                }

                if (localStorage.getItem('authorized') == null) {
                    if (clazz.connectionKey) {
                        me.guest = true
                        me.$emit('type', 'guest')
                    } else {
                        me.standard = true
                        me.$emit('type', 'standard')
                    }
                } else {
                    if (clazz.connectionKey) {
                        me.onlyConnectionKey = true
                        me.$emit('type', 'connectionKey')
                    }
                }
            } else {
                me.standard = true
                me.$emit('type', 'standard')
            }

            if (localStorage.getItem('authorized')) {
                me.authorized = true
            } else {
                me.authorized = false
            }

            me.tenantLogo = await me.getImageURL("/logo.png");

        },
        methods: {
            userIcon(number) {
                if (number < 10) {
                    return `static/usericon/00${number}.svg`
                } else {
                    return `static/usericon/0${number}.svg`
                }
            },
            writeUserData(userId, name, email, imageUrl, provider) {
                var database = firebase.database();
                var authorized = 'admin';
                if (email.includes('@uengine.org')) {
                    authorized = 'admin'
                } else {
                    authorized = 'student'
                }

                //추후 삭제
                database.ref('users/' + userId).update({
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                    authorized: authorized
                });

                //새로운 로그인 유저
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    database.ref('enrolledUsers/' + convertEmail).update({
                        uid: userId,
                        userName: name,
                        profile_picture: imageUrl,
                        email: email,
                    });
                }
            },
            snsLogin(who) {
                var me = this
                var app = this.getComponent('App')
                var event = this.getComponent('EventStormingListPage')
                if (me.inputConnectionkey)
                    localStorage.setItem('connectionKey', me.connectionKey)

                if (who == 'google') {
                    var provider = new firebase.auth.GoogleAuthProvider();
                    provider.addScope('profile');
                    provider.addScope('email')

                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var user = result.additionalUserInfo.profile;
                        var state = result.operationType;

                        var msgObj = {
                            "type": "google",
                            "author": user.email,
                            "userName": user.name,
                            "email": user.email,
                            "picture": user.picture,
                            "accessToken": token,
                            "uid": uid
                        }
                        if (user.email && user.email.includes('@uengine.org')) {
                            msgObj.authorized = 'admin'
                        } else {
                            msgObj.authorized = 'student'
                        }

                       me.TransferTokensToElectronApp(msgObj)
                        //firebase DB input
                        me.writeUserData(uid, user.name, user.email, user.picture, 'google')
                    }).catch(function (error) {
                        window.ipcRenderer.send("loginFailed")
                        setTimeout(function () {
                            window.close()
                        }, 2000)
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        alert("[" + errorCode + "] " + errorMessage)
                    });


                } else if (who == 'github') {
                    var provider = new firebase.auth.GithubAuthProvider();
                    provider.addScope('repo');
                    provider.addScope('user');
                    provider.addScope('admin:org');

                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        console.log(result)
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var userName = result.additionalUserInfo.username
                        var userEmail = result.user.providerData[0].email
                        var userProfile = result.additionalUserInfo.profile.avatar_url;
                        var state = result.operationType;

                        var msgObj = {
                            "type": "github",
                            "author": userEmail,
                            "userName": userName,
                            "email": userEmail,
                            "picture": userProfile,
                            "gitAccessToken": token,
                            "accessToken": token,
                            "uid": uid
                        }
                        if (userEmail && userEmail.includes('@uengine.org')) {
                            msgObj.authorized = 'admin'
                        } else {
                            msgObj.authorized = 'student'
                        }

                        me.TransferTokensToElectronApp(msgObj)

                        // setTimeout(function () {
                        //     window.close()
                        // }, 2000)
                        me.writeUserData(uid, userName, userEmail, userProfile, 'github')


                    }).catch(function (error) {
                        window.ipcRenderer.send("loginFailed")
                        setTimeout(function () {
                            window.close()
                        }, 2000)
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        alert("[" + errorCode + "] " + errorMessage)
                    });
                }
            },
            getHashCode(email) {
                var me = this
                var lab = me.labId;
                if (!email) {
                    email = me.selectedUser.email;
                }
                // lab 별로
                // var hashPath = me.getClassPath('labs/' + lab + '/' + email);
                // return me.hashCode(hashPath)

                var hashPath = me.getClassPath(email);
                return me.hashCode(hashPath);
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
            async classLogin() {
                var me = this

                if (this.classInfo) {
                    var clazz = this.classInfo;
                } else {
                    var clazz = await this.getClassInfo();
                }
                var userId = localStorage.getItem('email')
                var userName = localStorage.getItem('userName');
                var join = async function () {
                    var uploadObject = {
                        userName: userName,
                        photoURL: localStorage.getItem('picture'),
                        email: userId
                    }
                    if (me.classId) {
                        var classId = me.classId
                    } else {
                        var classId = me.$route.query.classId
                    }

                    if (me.courseId) {
                        var courseId = me.courseId
                    } else {
                        var courseId = me.$route.query.courseId
                    }

                    me.putObject('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/${me.hashCode(userId)}`), uploadObject)

                    try {
                        var userInfo = await me.getObject(`enrolledUsers/${userId.replace(/\./gi, '_')}`)
                    } catch (e) {

                    }
                    if (!userInfo) {
                        me.putObject(`enrolledUsers/${userId.replace(/\./gi, '_')}`, uploadObject)
                    }

                    var enrolledClassInfo = courseId + "@" + classId

                    me.putObject(`enrolledUsers/${userId.replace(/\./gi, '_')}/enrolledClass/${enrolledClassInfo}`, true)

                    if (!localStorage.getItem('authorized'))
                        localStorage.setItem('authorized', "student")

                    localStorage.setItem("connectionKey", me.connectionKey)

                    me.$EventBus.$emit('login', "class")
                    // me.$emit('login')
                    // location.reload(true);
                };


                if (localStorage.getItem('authorized') == null) {


                    if (clazz.connectionKey) {
                        if (me.connectionKey == null) {
                            var connectionKey = alert("접속키를 입력하여주세요.");
                            return;
                        } else {
                            var connectionKey = me.connectionKey
                            localStorage.setItem("connectionKey", me.connectionKey)
                        }
                        if (clazz.connectionKey != me.connectionKey) {
                            alert("접속 키가 다릅니다.")
                        } else if (userId != null) {
                            join();
                            // me.connectionKey = null
                            me.userInfo = {
                                name: '',
                                email: '',
                            }
                        } else {
                            me.connectionKey = connectionKey;
                            me.selectedClazz = clazz;

                        }
                    } else if (!userId && !userName) {
                        // me.dialog = true;
                    } else {
                        join();
                    }
                } else {
                    // me.$emit('login')
                    join()
                }

            },
            TransferTokensToElectronApp(obj) {
                const script = document.createElement("script");
                script.src = `http://localhost:5174/receive-tokens/?obj=${JSON.stringify(obj)}`;
                document.head.appendChild(script);

                // after 1s, remove the script element, and close the page
                setTimeout(() => {
                    script.remove();
                    window.close();
                }, 1000);
            },
            joinClassByKey() {
                var me = this;
                if (!me.authorized) {
                    localStorage.setItem('email', me.userInfo.email)
                    localStorage.setItem('userName', me.userInfo.name);
                }

                // console.log(me.$route.params.courseId)
                me.classLogin();
            },
            closeLogin() {
                var me = this
                if (this.loginDialog) {
                    me.loginDialog = false
                }
                var tmpURL = window.location.protocol + "//" + window.location.host + "/#/courses";
                window.location.href = tmpURL;
            },
            closeConnectionKey() {
                if (this.onlyConnectionKey) {
                    this.onlyConnectionKey = false
                }
            },
            inputConnectionKey() {
                if (this.inputConnectionkey)
                    localStorage.setItem('connectionKey', this.connectionKey)
                this.joinClassByKey()
            },
        },

    }
</script>

<style>
    .loginDialog {
        position: relative;
        bottom: 5px;
        height: 30px;
        line-height: 30px;
        font-weight: 700;
        font-size: 20px;
        margin-top: -15px;
        margin-left: -200px;
        color: #424242;
    }

    .or-line, #or-text {
        float: left;
    }

    .or-line {
        margin-top: 12px;
    }

    .or-box {
        margin-top: -8px;
        margin-bottom: -10px;
    }

    .clearfix::after {
        content: "";
        display: block;
        clear: both;
    }
</style>
