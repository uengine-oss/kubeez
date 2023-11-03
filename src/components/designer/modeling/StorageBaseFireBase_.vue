<template></template>

<script>
    import firebase from 'firebase'
    require('firebase/auth')

    // 3
    export default {
        name: "storage-base-firebase_",
        methods: {
            _getRef(auth) {
                if (auth && auth == 'auth') {
                    return firebase.auth()
                } else if (auth && auth == 'db') {
                    return firebase.database()
                } else if (auth && auth == 'google') {
                    return new firebase.auth.GoogleAuthProvider();
                } else if (auth && auth == 'github') {
                    return new firebase.auth.GithubAuthProvider()
                } else if (auth && auth == "keycloak-oidc") {
                    // TODO: 변수 처리로 oidc name 받을 수 있도록 처리
                    return new firebase.auth.OAuthProvider("oidc.aifrica");
                }

            },
            _refreshFirebaseIdToken() {
                return new Promise(function (resolve, reject) {
                    try{
                        firebase.auth().currentUser.getIdToken(true)
                        .then(function(idToken) {
                            resolve(idToken)
                        }).catch(function(error) {
                            resolve(null)
                        });
                    }catch (e) {
                        resolve(undefined)
                    }
                })
            },
            _getUserInfo() {
                return new Promise(function (resolve, reject) {
                    try{
                        firebase.auth().onAuthStateChanged(function (user) {
                            if (user) {
                                var email = user.email ? user.email : user.providerData[0].email
                                var name = user.displayName ? user.displayName : user.providerData[0].displayName
                                var profile = user.photoURL ? user.photoURL : user.providerData[0].photoURL

                                if (user.providerData[0].providerId == "github.com") {
                                    email = user.providerData[0].email
                                    name = email
                                }

                                var obj = {
                                    name: name,
                                    email: email,
                                    uid: user.uid,
                                    profile: profile,
                                    authorized: null,
                                    accessToken: user.ya,
                                }
                                resolve(obj);
                            } else {
                                // No user is signed in.
                                resolve(null)
                            }
                        });
                    }catch (e) {
                        resolve(undefined)
                    }
                })
            },
            _list(reference) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.once('value', function (snapshots) {
                            if (snapshots.exists()) {
                                resolve(snapshots)
                            } else {
                                resolve(null)
                            }
                        },function(err){
                            resolve({ErrorCode: err.code})
                        })
                    } catch (e) {
                        console.log('Error] Firebase _list: ', e)
                        resolve(undefined)
                    }
                })
            },
            _delete(reference) {
                return reference.remove()
            },
            _get(reference) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.once('value', function (snapshots) {
                            if (snapshots.exists()) {
                                resolve(snapshots)
                            } else {
                                resolve(null)
                            }
                        },function (err) {
                            resolve({Error: err.code})
                        });
                    } catch (e) {
                        console.log('Error] Firebase _get: ', e)
                        resolve(undefined)
                    }
                })
            },
            _put(reference, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.update(value, (error) => {
                            if (error) {
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                    } catch (e) {
                        console.log('Error] Firebase _put: ', e)
                        resolve(false)
                    }
                })
            },
            _set(reference, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.set(value, (error) => {
                            if (error) {
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                    } catch (e) {
                        console.log('Error] Firebase _set: ', e)
                        resolve(false)
                    }
                })
            },
            _push(reference, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        var snapshots = reference.push(value)
                        resolve(snapshots)
                    } catch (e) {
                        console.log('Error] Firebase _push: ', e)
                        resolve(undefined)
                    }
                })
            },
            _watch_off(reference){
                reference.off();
            },
            _watch(reference, callback) {
                try {
                    reference.on('value', function (snapshot) {
                        if (snapshot.exists()) {
                            callback(snapshot)
                        } else {
                            callback(null)
                        }
                    });
                } catch (e) {
                    console.log('Error] Firebase _watch: ', e)
                    callback(undefined)
                }

            },
            _watch_added(reference, callback) {
                try {
                    reference.on('child_added', function (snapshot) {
                        if (snapshot.exists()) {
                            callback(snapshot)
                        } else {
                            callback(null)
                        }
                    });
                } catch (e) {
                    console.log('Error] Firebase _watch_added: ', e)
                    callback(undefined)
                }
            },
            watch_changed(path, callback) {
                var starCountRef = firebase.database().ref(path);
                starCountRef.on('child_changed', (snapshot) => {
                    if (snapshot.exists()) {
                        callback(snapshot.val(), snapshot.key)
                    }
                });
            },
            _isConnection(reference, callback){

                reference.on("value", (snap) => {
                    if (snap.val() === false && navigator.onLine == false) {
                        callback(false)
                    }
                    callback(true)
                });
            }
        }
    };
</script>
