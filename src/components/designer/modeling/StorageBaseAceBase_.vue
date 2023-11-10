<template></template>

<script>

    // db.auth.signIn('admin', '75sdDSFg37w5');
    // const { AceBaseClient } = require('acebase-client');
    export default {
        name: "storage-base-acebase_",
        data() {
            return {
                db: null
            }
        },
        created(){
            var me = this
            // const db = new AceBaseClient({ host: 'localhost', port: 5757, dbname: 'mydb', https: false });
            // db.ready(() => {
            //     console.log('Connected successfully');
            //     me.db = db
            //     // conso
            // });
        },
        methods: {
            _signIn(userInfo) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    userInfo.displayName = userInfo.username;
                    window.$acebase.auth.signInWithEmail(userInfo.email, userInfo.password).then(result => {
                        resolve(result)
                    }).catch(e => {
                        reject(e)
                    })
                })
            },
            _signUp(userInfo) {
                var me = this
                // acebase.auth.signIn('admin', '75sdDSFg37w5');
                return new Promise(function (resolve, reject) {
                    userInfo.displayName = userInfo.username;
                    window.$acebase.auth.signUp(userInfo).then(result => {
                        resolve(result)
                    }).catch(e => {
                        reject(e)
                    })
                })
            },
            _getRef(auth) {
                var me = this
                if (auth && auth == 'auth') {
                    return window.$acebase.auth
                } else if (auth && auth == 'db') {
                    // 수정필요
                    var reference = window.$acebase.ref()
                    return reference.query(reference.db)
                }
            },
            _getUserInfo() {
                var me = this
                return new Promise(async function (resolve, reject) {
                    if (window.localStorage.getItem("accessToken")){
                        try{
                            // var obj = {
                            //             name: "user",
                            //             email: "email@email.com",
                            //             uid: "xxxx-xxxx-xxxx-xxxx-xxxx",
                            //             // profile: result.user.picture,
                            //             // authorized: null,
                            //             accessToken: "electron-token",
                            //         }
                            //         resolve(obj)
                            window.$acebase.auth.signInWithToken(window.localStorage.getItem("accessToken"))
                                .then(result => {
                                    var obj = {
                                        name: result.user.username,
                                        email: result.user.email,
                                        uid: result.user.uid,
                                        profile: result.user.picture,
                                        authorized: null,
                                        accessToken: result.accessToken,
                                    }
                                    resolve(obj)
                                })
                        }catch (e) {
                            console.log('Error] AceBase _getUserInfo: ',e)
                            resolve(null)
                        }
                    } else {
                        resolve(null)
                    }
                })
            },
            _list(reference) {
                return new Promise(function (resolve, reject) {
                    try{
                        reference.get(snapshot => {
                            if (snapshot) {
                                resolve(snapshot)
                            } else {
                                resolve(null)
                            }
                        });
                    }catch (e) {
                        console.log('Error] AceBase _list: ',e)
                        resolve(null)
                    }
                })
            },
            _push(reference, value) {
                return new Promise(function (resolve, reject) {
                    var snapshots = null
                    try {
                        if(value){
                            reference
                            .push(value)
                            .then(userRef => {
                                resolve(userRef)
                            });
                        }else{
                            snapshots = reference.push()
                            resolve(snapshots)
                        }
                    } catch (e) {
                        console.log('Error] AceBase _push')
                        resolve(null)
                    }
                })
            },
            _delete(reference) {
                try{
                    reference.remove()
                        // .then(() => { /* removed successfully */ )};
                    return true
                }catch (e) {
                    console.log('Error] AceBase _delete: ', e)
                    return false
                }
            },
            _get(reference) {
                return new Promise(function (resolve, reject) {
                    try{
                        reference.get(snapshot => {
                            if (snapshot) {
                                resolve(snapshot)
                            } else {
                                resolve(null)
                            }
                        });
                    } catch (e) {
                        console.log('Error] AceBase _get: ', e)
                        resolve(null)
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
                        console.log('Error] AceBase _put: ', e)
                        resolve(false)
                    }
                })
            },
            _set(reference, value) {

                return new Promise(async function (resolve, reject) {
                    try {
                        reference.set(value, (error) => {
                            if (error) {
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                    } catch (e) {
                        console.log('Error] AceBase _set: ', e)
                        resolve(false)
                    }
                })
            },
            _watch(reference, callback) {
                try{
                    reference.on('value',snapshot => {
                            if (snapshot) {
                                callback(snapshot)
                            } else {
                                callback(null)
                            }
                        })
                        // .on('value')
                        // .subscribe(snapshot => {
                        //     if (snapshot) {
                        //         callback(snapshot)
                        //     } else {
                        //         callback(null)
                        //     }
                        //     // .subscribe only fires for new children from now on
                        // })
                }catch (e) {
                    console.log('Error] AceBase _watch: ', e)
                    callback(undefined)
                }
            },
            _watch_added(reference, callback) {
                try{
                    reference
                        .on('child_added', (snapshot) =>{
                            if (snapshot) {
                                callback(snapshot)
                            } else {
                                callback(null)
                            }
                        })

                    // .on('child_added')
                    // .subscribe(snapshot => {
                    //     if (snapshot) {
                    //         callback(snapshot)
                    //     } else {
                    //         callback(null)
                    //     }
                    // });
                }catch (e) {
                    console.log('Error] AceBase _watch_added: ', e)
                    callback(undefined)
                }
            },
            _watch_off(reference) {
                reference.off('child_added')
                reference.off('value')
                reference.off('child_changed')
            },
            _isConnection(reference, callback){
                try{
                    reference.on("value", (snap) => {
                        if (snap.val() === false && navigator.onLine == false) {
                            callback(false)
                        }
                        callback(true)
                    });
                }catch (e) {
                    callback(undefined)
                    console.log('Error] AceBase _isConnection: ', e)
                }

            },
        }
    };
</script>
