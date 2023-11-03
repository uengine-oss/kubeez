<template></template>

<script>
    import firebase from 'firebase'
    import StorageBaseFireBase_ from "./StorageBaseFireBase_";

    export default {
        name: "storage-base-firebase",
        mixins: [StorageBaseFireBase_],
        methods:{
            async put(path, string, isString){
                var me = this
                try {
                    //putObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }

                    var reference = firebase.database().ref(path)
                    var snapshots = await me._put(reference,parseString)

                    return snapshots ? snapshots : false
                } catch (e) {
                    //putString
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._put(reference,string)

                    return snapshots ? snapshots : false
                }

            },
            async set(path,string,isString){

                var me = this
                try {
                    //setObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }

                    var reference = firebase.database().ref(path)
                    var snapshots = await me._set(reference,parseString)

                    return snapshots ? snapshots : false

                } catch (e) {
                    //SetString
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._set(reference,string)

                    return snapshots ? snapshots : false
                }

            },
            async push(path, string, isString){
                try {
                    var me = this
                    //pushObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._push(reference,parseString)

                    return snapshots ? snapshots.key : null
                } catch (e) {
                    //pushString
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._push(reference,string)
                    return snapshots ? snapshots.key : null
                }
            },
            async get(path){
                var me = this
                var reference = firebase.database().ref(path);
                var snapshots = await me._get(reference)

                if(snapshots && snapshots.Error){
                    return snapshots;
                }

                return snapshots ? snapshots.val() : null
            },
            async list(path, metadata){
                var me = this
                var reference = firebase.database().ref(path)

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

                var snapshots = await me._list(reference)

                // if(snapshots && snapshots.ErrorCode){
                //     return snapshots;
                // }

                if( snapshots && metadata ){
                    if( metadata.sort && metadata.sort.includes('desc') ){
                        return me.reversedChildren(snapshots)
                    }else{
                        return me.forwardChildren(snapshots)
                    }
                }else{
                    return snapshots ? snapshots.val() : null
                }
            },
            watch(path, callback){
                var me = this
                var reference = firebase.database().ref(path);
                me._watch(reference,function (snapshot){
                    if (snapshot && snapshot.exists()) {
                        callback(snapshot.val())
                    }else{
                        callback(null)
                    }
                })
            },
            watch_added(path, metadata, callback){
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


                 me._watch_added( reference ,function (snapshot) {
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
                 })
            },
            isValidatePath(path){
                var me = this
                try{
                    var reference = firebase.database().ref(path);
                    return {status : true, msg: null}
                }catch(e){
                    return {status : false, msg: e.message }
                }
                // ".", "#", "$", "[", or "]"
            },
            watch_off(path){
                var me = this
                var reference = firebase.database().ref(path);
                me._watch_off(reference)
            },
            delete(path) {
                var me = this
                var reference = firebase.database().ref(path)
                return me._delete(reference)
            },
            isConnection(path, callback){
                var reference = firebase.database().ref(".info/connected");

                this._isConnection(reference, function (snapshot) {
                        callback(snapshot)
                })
            },
            /////////// Function ///////////
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
            },
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
            },
            isEqualTo(a, b){
                try{
                    if(a && b){
                        return String(a).toLowerCase() == String(b).toLowerCase()
                    }
                    return false
                }catch (e) {
                    return false
                }
            },
        }
    };
</script>
