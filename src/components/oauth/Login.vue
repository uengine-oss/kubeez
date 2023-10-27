<template>
    <div v-if="isGitMenu">
        <v-btn
            @click="snsLogin('github')"
            style="background-color:white;"
        >
            <img id="git-hover"
                width="30px"
                alt="Github sign-in"
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
            <div>sign in with github</div>
        </v-btn>
    </div>
    <div v-else>
        <v-card v-if="standard"
                class="elevation-12"
                style="background: #FFFFFF;
                        min-width:500px;
                        max-width:500px;
                        position:absolute;
                        display:block;
                        left:50%;
                        top:50%;
                        margin:-250px 0 0 -250px;"
        >
            <v-card flat>
                <div>
                    <div style="margin:20px; text-align: center;">
                        <div style="font-size:24px; font-weight:700;">{{ LoginInformation1 }}</div>
                        {{ LoginInformation2 }}
                        <div>{{$t('loginList.LoginInformation1')}}</div>
                        <div>{{$t('loginList.LoginInformation2')}}</div>
                    </div>
                    <v-btn @click="snsLogin('github')"
                        style="background-color:white; width:400px; margin-left:50px; height:50px; margin-bottom:10px;"
                    >
                        <img id="git-hover"
                                width="50px"
                                alt="Github sign-in"
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                style="background-color:transparent;"/>
                        <div>Github</div>
                    </v-btn>
                    <v-btn v-if="!onlyGitLogin" @click="snsLogin('google')"
                        style="background-color:white; width:400px; margin-left:50px; height:50px; margin-bottom:10px;"
                    >
                        <img width="40px"
                                alt="Google sign-in"
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"/>
                        <div>Google</div>
                    </v-btn>
                    <v-btn @click="snsLogin('keycloak-oidc')"
                        style="background-color:white; width:400px; margin-left:50px; height:50px; "
                    >
                        <img id="git-hover"
                                width="50px"
                                alt="Github sign-in"
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
                        <div>aifrica</div>
                    </v-btn>
                </div>

                <div style="width:500px; margin-left:5px; margin-bottom:20px; text-align:center; font-size: small; color:#BDBDBD; margin-top: 30px;">
                    {{$t('loginList.cookieCheck1')}}<br> {{$t('loginList.cookieCheck2')}}
                </div>
            </v-card>
        </v-card>
    
        <v-card v-else-if="guest"
                class="elevation-12"
                style="background: #FFFFFF;
                        min-width:500px;
                        max-width:500px;
                        position:absolute;
                        display:block;
                        left:50%;
                        top:50%;
                        margin:-200px 0 0 -250px;"
        >
            <v-card flat>
                <div>
                    <div style="margin:20px; text-align: center;">
                        <div>{{$t('loginList.LoginInformation1')}}</div>
                        <div>{{$t('loginList.LoginInformation2')}}</div>
                    </div>
                    <v-btn @click="snsLogin('github')"
                        style="background-color:white; width:400px; margin-left:50px; height:50px; margin-bottom:10px;"
                    >
                        <img id="git-hover"
                                width="50px"
                                alt="Github sign-in"
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
                        <div>Github</div>
                    </v-btn>
                    <v-btn v-if="!onlyGitLogin" @click="snsLogin('google')"
                        style="background-color:white; width:400px; margin-left:50px; height:50px;"
                    >
                        <img width="40px"
                                alt="Google sign-in"
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"/>
                        <div>Google</div>
                    </v-btn>
                </div>

                <div style="width:500px; margin-left:5px; margin-bottom:20px; text-align:center; font-size: small; color:#BDBDBD; margin-top: 30px;">
                    {{$t('loginList.cookieCheck1')}}<br> {{$t('loginList.cookieCheck2')}}
                </div>
            </v-card>
            <!-- <v-tabs> // 게스트 로그인 + 소셜
                <v-tab style="width:50%;">Social Login</v-tab>
    
                <v-tab style="width:50%">GUEST Login</v-tab>
    
                <v-tab-item>
                    <v-card flat>
                        <div style="height:150px; margin-top:50px;">
                            <v-btn @click="snsLogin('google')"
                                   class="login-row"
                                   style="width:250px; height:150px; margin-left:75px; background-color:white;"
                            >
                                <img width="40px"
                                     style="margin-top:-50px;"
                                     alt="Google sign-in"
                                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"/>
                                <div style="width:100px; height:20px; position:absolute; top:10px;">Google</div>
                            </v-btn>
                            <div class="login-row" style="width:50px; text-align:center; line-height:150px;">or</div>
                            <v-btn @click="snsLogin('github')"
                                   class="login-row"
                                   style="width:250px; height:150px; background-color:white;"
                            >
                                <img id="git-hover"
                                     width="50px"
                                     style="margin-top:-50px;"
                                     alt="Github sign-in"
                                     src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
                                <div style="width:100px; height:20px; position:absolute; top:10px;">Github</div>
                            </v-btn>
                        </div>
    
                        <div style="width:700px; margin-left:5px; margin-bottom:20px; text-align:center; font-size: small; color:#BDBDBD; margin-top: 30px;">
                        Please ensure 3rd party cookies are enabled if<br> login fails.
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card-text>
                        <v-form v-model="valid" style="width:550px; margin-left:60px;">
                            <v-row>
                                <v-text-field
                                        v-if="isConnectionkey"
                                        v-model="connectionKey"
                                        label="접속 키"
                                        required
                                ></v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field label="이름" v-model="guestUserInfo.name" required></v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field label="이메일" v-model="guestUserInfo.email" required
                                              :rules="emailRules"></v-text-field>
                            </v-row>
                            <div style="margin-left:-12px;">아바타</div>
                            <v-row style="width:620px; margin-left:-30px;">
                                <v-col v-for="i in 21">
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
    
                            <div style="margin-left:-20px;" class="caption">아이콘 제작자 <a
                                    href="https://www.flaticon.com/kr/authors/freepik"
                                    title="Freepik">Freepik</a> from <a
                                    href="https://www.flaticon.com/kr/" title="Flaticon"> www.flaticon.com</a>
                            </div>
                        </v-form>
                    </v-card-text>
                    <v-card-actions style="margin-top:-11px;">
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="closeLogin()">Close</v-btn>
                        <v-btn color="blue darken-1" text @click="joinClassByKey()" :disabled="!valid">입장</v-btn>
                    </v-card-actions>
                </v-tab-item>
            </v-tabs> -->
        </v-card>
    
        <v-card style="background: #FFFFFF; min-width:400px; position:absolute; top:150px; left:50%; margin-left:-200px;"
                v-else-if="onlyConnectionKey">
            <v-card>
                <v-card-title>
                    <span class="headline">접속키 입력</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                            v-if="isConnectionkey"
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
    </div>


</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";

    export default {
        components: {},
        props: {
            onlyGitLogin: Boolean,
            loginMsg: {
                type: String,
                default: function () {
                    return null
                }
            },
            isGitMenu: Boolean,
            LoginInformation1: String,
            LoginInformation2: String
        },
        mixins: [CommonStorageBase],
        data: () => ({
            tenantLogo: null,
            drawer: null,
            guest: false,
            standard: false,
            onlyConnectionKey: false,
            guestUserInfo: {
                name: '',
                email: ''
            },
            // userInfo: {
            //     name: '',
            //     email: ''
            // },
            connectionKey: '',
            userImage: null,
            isConnectionkey: false,
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

            // me.userInfo.email = localStorage.getItem('email')
            // me.userInfo.name = localStorage.getItem('userName')

            if (window.location.href.includes("login-page")) {

                var clazz = await this.getClassInfo();

                if (clazz.connectionKey) {
                    me.isConnectionkey = true
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

            me.tenantLogo = await me.getImageURL("storage://labs-msaez.io/logo.png");

        },
        methods: {
            track(event, category) {
                gtag('event', event, {
                    'event_category': category,
                    'event_label': 'TEST LABEL'
                });
            },
            userIcon(number) {
                if (number < 10) {
                    return `static/usericon/00${number}.svg`
                } else {
                    return `static/usericon/0${number}.svg`
                }
            },
            writeUserData(userId, name, email, imageUrl, provider) {
                // var database = firebase.database();
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
            snsLogin(who) {
                var me = this
                var app = this.getComponent('App')

                me.setConnectionKey()

                if (who == 'google') {

                    var provider = me.getRef('google')
                    provider.addScope('profile');
                    provider.addScope('email')

                    me.getRef('auth').signInWithPopup(provider).then(function (result) {
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var user = result.additionalUserInfo.profile;
                        var state = result.operationType;

                        window.localStorage.setItem("author", user.email)
                        window.localStorage.setItem("userName", user.name)
                        window.localStorage.setItem("email", user.email)
                        window.localStorage.setItem("picture", user.picture)
                        window.localStorage.setItem("accessToken", token)
                        window.localStorage.setItem("uid", uid)
                        window.localStorage.setItem("loginType", "google")
                        if (user.email && user.email.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }
                        app.loginDialog = false
                        me.$EventBus.$emit('login', token)
                        me.$emit('login')
                        //firebase DB input
                        me.writeUserData(uid, user.name, user.email, user.picture, 'google')
                        me.track('login', 'auth')
                        // window.location.reload();
                    }).catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        alert("[" + errorCode + "] " + errorMessage)
                    });

                    // firebase.auth().signInWithPopup(provider).then(function (result) {
                    //     var token = result.credential.accessToken;
                    //     var uid = result.user.uid;
                    //     var user = result.additionalUserInfo.profile;
                    //     var state = result.operationType;
                    //
                    //     window.localStorage.setItem("author", user.email)
                    //     window.localStorage.setItem("userName", user.name)
                    //     window.localStorage.setItem("email", user.email)
                    //     window.localStorage.setItem("picture", user.picture)
                    //     window.localStorage.setItem("accessToken", token)
                    //     window.localStorage.setItem("uid", uid)
                    //     if (user.email && user.email.includes('@uengine.org')) {
                    //         window.localStorage.setItem("authorized", 'admin');
                    //     } else {
                    //         window.localStorage.setItem("authorized", 'student');
                    //     }
                    //     app.loginDialog = false
                    //     me.$EventBus.$emit('login', token)
                    //     // me.$emit('login')
                    //     //firebase DB input
                    //     me.writeUserData(uid, user.name, user.email, user.picture, 'google')
                    // }).catch(function (error) {
                    //     var errorCode = error.code;
                    //     var errorMessage = error.message;
                    //     alert("[" + errorCode + "] " + errorMessage)
                    // });
                } else if (who == "keycloak-oidc") {
                    /** TODO: 변수 처리로 oidc name 받을 수 있도록 처리 - oidc id 입력 할 수 있는 창 필요.
                     */
                    var provider = me.getRef("keycloak-oidc")
                    provider.addScope('profile');
                    provider.addScope('email');
                    provider.addScope('openid');
                    me.getRef('auth').signInWithPopup(provider).then(function(result) {
                        console.log(result)
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var user = result.additionalUserInfo.profile;
                        // var state = result.operationType;
                        window.localStorage.setItem("author", user.email)
                        window.localStorage.setItem("userName", user.name)
                        window.localStorage.setItem("email", user.email)
                        window.localStorage.setItem("picture", user.picture)
                        window.localStorage.setItem("accessToken", token)
                        window.localStorage.setItem("uid", uid)
                        window.localStorage.setItem("loginType", "google")
                        if (user.email && user.email.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }
                        app.loginDialog = false
                        me.$EventBus.$emit('login', token)
                        me.$emit('login')
                        //firebase DB input
                        me.writeUserData(uid, user.name, user.email, user.picture, 'oidc')
                        me.track('login', 'auth')
                    })
                } else if (who == 'github') {
                    var provider = me.getRef('github')
                    provider.addScope('repo');
                    provider.addScope('user');
                    provider.addScope('admin:org');

                    me.getRef('auth').signInWithPopup(provider).then(function (result) {
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var userName = result.additionalUserInfo.username
                        var userEmail = result.user.providerData[0].email
                        var userProfile = result.additionalUserInfo.profile.avatar_url;
                        var state = result.operationType;

                        window.localStorage.setItem("author", userEmail)
                        window.localStorage.setItem("userName", userName)
                        window.localStorage.setItem("email", userEmail)
                        window.localStorage.setItem("picture", userProfile)
                        window.localStorage.setItem("accessToken", token)
                        window.localStorage.setItem("gitAccessToken", token)
                        window.localStorage.setItem("gitToken", token)
                        window.localStorage.setItem("uid", uid)
                        window.localStorage.setItem("loginType", "github")
                        window.localStorage.setItem("gitUserName", userName)
                        window.localStorage.setItem("gitOrgName", userName)
                        if (userEmail && userEmail.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }

                        app.loginDialog = false
                        me.$EventBus.$emit('login', token)
                        me.$emit('login')
                        me.$emit('isGitLogin')
                        //firebase DB input
                        me.writeUserData(uid, userName, userEmail, userProfile, 'github')

                        me.$gtag.event('login', {method: 'github'})
                        // window.location.reload();
                    }).catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        alert("[" + errorCode + "] " + errorMessage)
                    });
                } else if (who == 'googletest') {
                    var provider = me.getRef('google')
                    provider.addScope('profile');
                    provider.addScope('email');

                    me.getRef('auth').signInWithRedirect(provider).then(function (result) {
                        var token = result.credential.accessToken;
                        var uid = result.user.uid;
                        var user = result.additionalUserInfo.profile;
                        var state = result.operationType;

                        window.localStorage.setItem("author", user.email)
                        window.localStorage.setItem("userName", user.name)
                        window.localStorage.setItem("email", user.email)
                        window.localStorage.setItem("picture", user.picture)
                        window.localStorage.setItem("accessToken", token)
                        window.localStorage.setItem("uid", uid)
                        if (user.email && user.email.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }
                        app.loginDialog = false
                        me.$EventBus.$emit('login', token)
                        me.$emit('login')
                        //firebase DB input
                        me.writeUserData(uid, user.name, user.email, user.picture, 'google')
                        me.track('login', 'auth')
                    }).catch(function (error) {
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
                var userId = me.userInfo.email
                var userName = me.userInfo.name

                var join = async function () {
                    var uploadObject = {
                        userName: userName,
                        photoURL: me.userInfo.profile,
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

                    me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/${me.hashCode(userId)}`), uploadObject)

                    try {
                        var userInfo = await me.getObject(`db://enrolledUsers/${userId.replace(/\./gi, '_')}`)
                    } catch (e) {

                    }
                    if (!userInfo) {
                        me.putObject(`db://enrolledUsers/${userId.replace(/\./gi, '_')}`, uploadObject)
                    }

                    var enrolledClassInfo = courseId + "@" + classId

                    me.setObject(`db://enrolledUsers/${userId.replace(/\./gi, '_')}/enrolledClass/${enrolledClassInfo}`, true)

                    if (!localStorage.getItem('authorized'))
                        localStorage.setItem('authorized', "student")

                    localStorage.setItem(classId, me.connectionKey)

                    me.$emit('login')
                };


                if (localStorage.getItem('authorized') == null) {


                    if (clazz.connectionKey) {
                        if (me.connectionKey == null) {
                            var connectionKey = alert("접속키를 입력하여주세요.");
                            return;
                        } else {
                            var connectionKey = me.connectionKey
                            localStorage.setItem(`${clazz.status}@${clazz.classId}`, me.connectionKey)
                        }
                        if (clazz.connectionKey != me.connectionKey) {
                            alert("접속 키가 다릅니다.")
                        } else if (userId != null) {
                            join();
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
                    join()
                }

            },
            joinClassByKey() {
                var me = this;
                if (!me.authorized) {
                    localStorage.setItem('email', me.guestUserInfo.email)
                    localStorage.setItem('userName', me.guestUserInfo.name);
                    localStorage.setItem('author', me.guestUserInfo.email)
                }
                me.$EventBus.$emit('login', true)
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
            setConnectionKey() {
                if (this.isConnectionkey) {
                    var classId = this.$route.query.classId ? this.$route.query.classId : this.$route.params.classId
                    localStorage.setItem(classId, this.connectionKey)
                }
            },
            inputConnectionKey() {
                this.setConnectionKey()
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

    .login-row {
        float: left;
    }

    .clearfix::after {
        content: "";
        display: block;
        clear: both;
    }
</style>



