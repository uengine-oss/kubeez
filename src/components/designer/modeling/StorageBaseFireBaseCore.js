// import firebase from 'firebase'
const firebase = require('firebase')
require('firebase/auth')


class StorageBaseFireBaseCore {

    list(path, metadata) {
        var me = this
        return new Promise(function (resolve, reject) {
            try {
                let reference = firebase.database().ref(path);

                if( metadata ){
                    // SORT
                    if (metadata.orderBy) {
                        reference = reference.orderByChild(metadata.orderBy)
                    } else {
                        reference = reference.orderByKey()
                    }

                    // RANGE
                    if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                        reference = reference.equalTo(metadata.startAt)
                    } else if( metadata.startAt && !metadata.endAt ){
                        // Start ~
                        reference = reference.startAt(metadata.startAt)
                    } else if( !metadata.startAt && metadata.endAt ){
                        // ~ END
                        reference = reference.endAt(metadata.endAt)
                    } else if( metadata.startAt && metadata.endAt ){
                        // Start ~ END
                        reference = reference.startAt(metadata.startAt)
                        reference = reference.endAt(metadata.endAt)
                    }

                    // SIZE && DIRECTION
                    if (metadata.size) {
                        if (metadata.sort && metadata.sort.includes('desc')) {
                            reference = reference.limitToLast(metadata.size)
                        } else {
                            reference = reference.limitToFirst(metadata.size)
                        }
                    }
                }

                reference.once('value', function (snapshot) {
                    if (snapshot.exists()) {
                        if( snapshot && metadata ){
                            if( metadata.sort && metadata.sort.includes('desc') ){
                                resolve(me.reversedChildren(snapshot));
                            }else{
                                resolve(me.forwardChildren(snapshot));
                            }
                        }else{
                            resolve (snapshot ? snapshot.val() : null )
                        }
                    } else {
                        resolve(null)
                    }
                },function (err) {
                    resolve({Error: err.code})
                });

            } catch (e) {
                console.log('Error] Firebase _list: ', e)
                resolve(undefined)
            }
        });
    }

    delete(path) {
        let storageRef = firebase.storage().ref(path);
        return storageRef.remove();
    }

    get(path) {
        return new Promise(function (resolve, reject) {
            try {

                firebase.database().ref(path).once('value', function (snapshots) {
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
    }

    put(path, value) {
        return new Promise(function (resolve, reject) {
            try {
                firebase.database().ref(path).update(value, (error) => {
                    if (error) {
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                },function (err) {
                    resolve({Error: err.code})
                });
            } catch (e) {
                console.log('Error] Firebase _put: ', e)
                resolve(false)
            }
        })
    }

    set(path, value) {
        return new Promise(function (resolve, reject) {
            try {
                firebase.database().ref(path).set(value, (error) => {
                    if (error) {
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                },function (err) {
                    callback({Error: err.code})
                });
            } catch (e) {
                console.log('Error] Firebase _set: ', e)
                resolve(false)
            }
        })
    }

    push(path, value) {
        return new Promise(function (resolve, reject) {
            try {
                var snapshots = firebase.database().ref(path).push(value)

                resolve(snapshots ? snapshots.key : null)
            } catch (e) {
                console.log('Error] Firebase _push: ', e)
                resolve(undefined)
            }
        })
    }

    watch_off(path){
        return firebase.database().ref(path).off();
    }

    watch(path, callback) {
        try {
            firebase.database().ref(path).on('value', function (snapshot) {
                if (snapshot && snapshot.exists()) {
                    callback(snapshot.val())
                }else{
                    callback(null)
                }
            },function (err) {
                callback({Error: err.code})
            });
        } catch (e) {
            console.log('Error] Firebase _watch: ', e)
            callback(undefined)
        }

    }

    watch_added(path, metadata, callback ) {
        try {

            var me = this
            var reference = firebase.database().ref(path);

            if( metadata ){
                // SORT
                if (metadata.orderBy && metadata.orderBy.toLowerCase() != 'key') {
                    reference = reference.orderByChild(metadata.orderBy)
                } else {
                    reference = reference.orderByKey()
                }

                // RANGE
                if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                    reference = reference.equalTo(metadata.startAt)
                } else if( metadata.startAt && !metadata.endAt ){
                    // Start ~
                    reference = reference.startAt(metadata.startAt)
                } else if( !metadata.startAt && metadata.endAt ){
                    // ~ END
                    reference = reference.endAt(metadata.endAt)
                } else if( metadata.startAt && metadata.endAt ){
                    // Start ~ END
                    reference = reference.startAt(metadata.startAt)
                    reference = reference.endAt(metadata.endAt)
                }
            }


            reference.on('child_added', function (snapshot) {
                if (snapshot && snapshot.exists()) {
                    var queue = snapshot.val()
                    if (typeof queue == 'boolean') {
                        var obj = {
                            key: queue.key,
                            value: queue
                        }
                        callback(obj)
                    } else if(typeof queue == 'string'){
                        var obj = {
                            key: snapshot.key,
                            value: queue
                        }
                        callback(obj)
                    } else {
                        queue.key = snapshot.key
                        callback(queue)
                    }
                } else {
                    callback(null)
                }
            },function (err) {
                callback({Error: err.code})
            });
        } catch (e) {
            console.log('Error] Firebase _watch_added: ', e)
            callback(undefined)
        }
    }

    watch_changed(path, callback) {
        firebase.database().ref(path).on('child_changed', (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val(), snapshot.key)
            }
        },function (err) {
            callback({Error: err.code})
        });
    }

    forwardChildren(snapshot) {
        var children = [];
        snapshot.forEach(function (child) {
            if(child.key != "count"){
                var val = child.val()
                val.key = child.key
                children.push(val);
            }
        });
        return children;
    }

    reversedChildren(snapshot) {
        var children = [];
        snapshot.forEach(function (child) {
            if(child.key != "count"){
                var val = child.val()
                val.key = child.key
                children.unshift(val);
            }
        });
        return children;
    }

    isEqualTo(a, b){
        try{
            if(a && b){
                return String(a).toLowerCase() == String(b).toLowerCase()
            }
            return false
        }catch (e) {
            return false
        }
    }
}

module.exports = StorageBaseFireBaseCore;