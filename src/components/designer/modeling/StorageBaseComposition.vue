<template></template>

<script>
    import StorageBaseAbstract from "./StorageBaseAbstract";
    import StorageBaseAceBase from "./StorageBaseAceBase";
    import StorageBaseLocalStorage from "./StorageBaseLocalStorage";

    export default {
        name: "storage-base-composition",
        mixins: [StorageBaseAbstract],
        data() {
            return {
                localstorage: null,
                db: null,
                standalone: null,
                storage: null
            }
        },
        created() {
            var me = this;

            var StorageBaseLocalClass = Vue.extend(StorageBaseLocalStorage);
            var StorageBaseCloudStorageClazz = Vue.extend(StorageBaseAceBase);
            var StorageBaseDBClass = Vue.extend(StorageBaseAceBase);

            me.localstorage = new StorageBaseLocalClass();
            me.storage = new StorageBaseCloudStorageClazz();
            me.db = new StorageBaseDBClass();

        },
        computed: {
            now() {
                return Date.now();
            },
        },
        methods: {
            _getMetadata(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path;
                 return server.getMetadata(path);
            },
             _watch(path, callback) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path;
                 return server.watch(path, callback);
            },
            //firebase only
            watch_added(path, metadata, callback) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.watch_added(path, metadata, callback);
            },
            //firebase only
            watch_changed(path, callback) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.watch_changed(path, callback);
            },
            //firebase only
            watch_off(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.watch_off(path);
            },
            async _list_watch(path, metadata, callback) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return await server._list_watch(path, metadata, callback);
            },
            async _list(path, metadata, tenant) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return await server.list(path, metadata, tenant);
            },
            async _get(path, tenant) {
                var server = this.getServer(path);
                // path = path.includes('://') ? path.split('://')[1] : path
                path = this.getPath(path);
                if (path){
                    return await server.get(path, tenant);
                } else{
                    return null
                }
            },
            async _signUp(path, userInfo) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path)
                    return await server._signUp(userInfo);
                else
                    return null
            },
            async _signIn(path, userInfo) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path)
                    return await server._signIn(userInfo);
                else
                    return null
            },
            _put(path, string, isString) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path && string) {
                    return server.put(path, string, isString);
                } else {
                    return null
                }
            },
            _set(path, string, isString) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path && string) {
                    return server.set(path, string, isString);
                } else {
                    return null
                }
            },
            async _push(path, string, isString) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path) {
                    return await server.push(path, string, isString);
                } else {
                    return null
                }
            },
            _delete(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path) {
                    return  server.delete(path);
                } else {
                    return null
                }
            },
            _refreshFirebaseIdToken(){
                return this.db._refreshFirebaseIdToken()
            },
            _getUserInfo(){
                return this.db._getUserInfo()
            },
            _getRef(auth){
                return this.db._getRef(auth)
            },
            //minio Only
            _getURL(path, tenant) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server._getURL(path, tenant);
            },
            _isConnection(path,callback){
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path

                if(server)
                    return server.isConnection(path, callback);
            },
            //minio Only
            getImageURL(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.getImageURL(path);

            },
            getPath(path){
                if (path.includes('://')) {
                    var serverName = path.split('://')[0]
                    return path.replace(`${serverName}://`, '');
                }
                return path;
            },
            getServer(path) {
                var me = this
                if (path.includes('://')) {
                    var distributedPath = path.split('://')[0]
                    if (distributedPath) {
                        if (distributedPath.toLowerCase().includes('localstorage')) {
                            return me.localstorage
                        } else if (distributedPath.toLowerCase().includes('db')) {
                            return me.db
                        } else if (distributedPath.toLowerCase().includes('minio')) {
                            return me.minio
                        } else if (distributedPath.toLowerCase().includes('labstorage')) {
                            return me.minio
                        } else if (distributedPath.toLowerCase().includes('standalone')) {
                            return me.standalone
                        } else if (distributedPath.toLowerCase().includes('cluster')) {
                            return me.minio
                        } else if (distributedPath.toLowerCase().includes('storage')) {
                            return me.storage
                        }
                    } else {
                        return me.localstorage
                    }
                } else {
                    if (path.includes('Untitled1.ipynb') || path.includes('config')) {
                        return me.standalone;
                    }
                    return me.standalone
                    // return me.localstorage
                }
            },
            _isValidatePath(path){
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path) {
                    return  server.isValidatePath(path);
                } else {
                    return true;
                }
            },
            convertUTCToTimeStamp(utcDate) {
                try {
                    var timeStamp = Date.parse(utcDate)
                    if (timeStamp) {
                        if (typeof timeStamp == 'string')
                            timeStamp = Number(timeStamp)
                        var date = new Date(timeStamp);
                        var year = date.getFullYear().toString()
                        var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
                        var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)

                        return `${year}${month}${day}`
                    }
                    return null
                } catch (e) {
                    console.log(e)
                }
            },
            convertTimeStampToDate(getTimeStamp) {
                var timeStamp = null
                if (getTimeStamp) {
                    timeStamp = getTimeStamp
                } else {
                    timeStamp = Date.now()
                }

                if (timeStamp) {
                    if (typeof timeStamp == 'string')
                        timeStamp = Number(timeStamp)
                    var date = new Date(timeStamp);
                    var year = date.getFullYear().toString().slice(-2)
                    var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
                    var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
                    var hour = ("0" + date.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
                    var minute = ("0" + date.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
                    var second = ("0" + date.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)

                    return year + "." + month + "." + day + ' ' + hour + ":" + minute + ':' + second
                }

            },
        }
    };
</script>
