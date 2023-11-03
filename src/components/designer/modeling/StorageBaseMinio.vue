<template></template>

<script>
    import StorageBaseMinio_ from "./StorageBaseMinio_";

    export default {
        name: "storage-base-minio",
        mixins: [StorageBaseMinio_],
        methods:{
            watch(path, callback) {
                return this._watch(path, callback)
            },
            list_watch(path, metadata, callback) {
                return this._list_watch(path, metadata, callback)
            },
            async list(path, metadata, tenant) {
               return await this._list(path, metadata, tenant)
            },
            async get(path, tenant) {
                return await this._get(path, tenant)
            },
            async put(path, string, isString) {
                return await this._put(path, string)
            },
            async set(path, string, isString) {
                return await this._put(path, string)
            },
            async push(path, string, isString) {
                return await this._put(path, string)
            },
            async delete(path) {
                return await this._delete(path)
            },
            //minio Only
            async getURL(path, tenant) {
                return await this._getURL(path, tenant)
            },
            //minio Only
            async getImageURL(path) {
                return await this._getImageURL(path)
            },
            isValidatePath(path){
                 return {status : true, msg: null}
            },
        }
    };
</script>
