<template></template>

<script>
    import StorageBaseLocalStorage_ from "./StorageBaseLocalStorage_";

    export default {
        name: "storage-base-localstorage",
        mixins: [StorageBaseLocalStorage_],
        methods:{
            get(path, tenant){
                return this._get(path)
            },
            put(path, string, isString){
                return this._put(path,string)
            },
            delete(path){
                return this._delete(path)
            },
            list(path, metadata, tenant){
                return this._get(path)
            },
            set(path, string, isString){
                return this._put(path)
            }
        }
    };
</script>