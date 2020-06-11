<template>
    <v-card class="elevation-12">
        <v-card flat>
            <v-col justify="center" align="center">
                <v-btn 
                        block
                        color="white"
                        class="btn-google"
                        @click="snsLogin('google')">
                    <img
                            class="google-logo"
                            alt="Google sign-in"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"/>
                    Login in with Google
                </v-btn>
                <!-- <div class="pa-2"></div>
                <v-btn 
                        block
                        color="black"
                        class="btn-github">
                    <img
                            class="github-logo"
                            alt="Github sign-in"
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
                    Login in with Github
                </v-btn> -->
            </v-col>
        </v-card>
    </v-card>
</template>

<script>
    import firebase from 'firebase'
    require('firebase/auth')

    export default {
        name: 'Login',
        data() {
            return {
            }
        },
        methods: {
            updateUserData(userId, name, email, imageUrl, provider) {
                var database = firebase.database()

                database.ref('users/' + userId).update({
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                })
            },
            snsLogin(who) {
                var me = this
                
                if(who == 'google') {
                    var provider = new firebase.auth.GoogleAuthProvider()
                    provider.addScope('profile')
                    provider.addScope('email')

                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        
                        var token = result.credential.accessToken
                        var uid = result.user.uid
                        var user = result.additionalUserInfo.profile
                        var state = result.operationType

                        window.localStorage.setItem("author", user.email)
                        window.localStorage.setItem("userName", user.name)
                        window.localStorage.setItem("email", user.email)
                        window.localStorage.setItem("picture", user.picture)
                        window.localStorage.setItem("accessToken", token)
                        window.localStorage.setItem("uid", uid)

                        me.$EventBus.$emit('login', token)

                        me.updateUserData(uid, user.name, user.email, user.picture, who)
                    }).catch(function (error) {
                        var errorCode = error.code
                        var errorMessage = error.message
                        alert("[" + errorCode + "] " + errorMessage)
                    })
                }
            }

        }
    }
</script>

<style scoped>
    .v-card {
        background-color: white;
    }
    .btn-google {
        font-size: 13px;
        color: #175FC7;
        justify-content: center;
    }
    .btn-github {
        font-size: 13px;
        color: white;
        justify-content: center;
    }
    .google-logo {
        width: 20px;
        margin-bottom: 3px;
        margin-right: 15px;
    }
    .github-logo {
        width: 30px;
        margin-bottom: 3px;
        margin-left: -8px;
        margin-right: 10px;
        background-color: white;
        -webkit-filter: invert(100%);
        filter: invert(100%);
    }
</style>