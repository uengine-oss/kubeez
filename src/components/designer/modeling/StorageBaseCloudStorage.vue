<template></template>

<script>
    import firebase from 'firebase'
    import StorageBaseCloudStorage_ from "./StorageBaseCloudStorage_";

    export default {
        name: "storage-base-cloud-storage",
        mixins: [StorageBaseCloudStorage_],
        methods: {
            async delete(path) {
                var me = this
                try {
                    let storageRef = firebase.storage().ref(path);
                    let result = await me._delete(storageRef)

                    return result;
                } catch (e) {
                    return {Error: e};
                }
            },
            list_watch(path, metadata, callback) {
                return this._list_watch(path, metadata, callback)
            },
            async getURL() {
                return await this._getURL(path)
            },
            async getImageURL(path) {
                return await this._getImageURL(path)
            },
            async get(path) {
                var me = this
                try {
                    if (path.startsWith('https://') || path.startsWith('gs://')) {
                        return await me._fetch(path);
                    }

                    let storageRef = firebase.storage().ref(path);
                    let result = await me._get(storageRef);

                    if (!result || result.Error) {
                        return result;
                    }
                    result = await me._fetch(result);

                    return result;
                } catch (e) {
                    return {Error: e};
                }
            },
            async put(path, value) {
                var me = this;
                try {
                    let storageRef = firebase.storage().ref(path);

                    let options = {
                        format: 'raw', // raw, base64, base64url, data_url
                        metadata: {contentType: 'text/plain'} //   { contentType: 'text/plain', 'application/json, 'image/png' }
                    }

                    if (typeof value == 'string' && value.startsWith('data:image')) {
                        // data:image/png;base64,<ddd>

                        let header = value.split(',')[0]
                        let format = header.split(';')[1];
                        let contentType = header.split(';')[0].split(':')[1]
                        value = value.split(',')[1]
                        options.format = format ? format : 'raw'
                        options.metadata.contentType = contentType ? contentType : 'text/plain'
                    }

                    let result = await me._put(storageRef, value, options);

                    return result.ref.getDownloadURL();
                } catch (e) {
                    return {Error: e};
                }
            },
            async list(path, metadata) {
                var me = this;

                return new Promise(async function (resolve, reject) {
                    try {
                        let storageRef = firebase.storage().ref(path);
                        let result = null;
                        let obj = {};
                        if (metadata) {
                            // { maxResults: 100}
                            result = await me._list(storageRef, metadata);
                        } else {
                            result = await me._listAll(storageRef);
                        }

                        if (!result || result.Error) {
                            resolve(result)
                        }

                        result.prefixes.forEach((ref) => {
                            obj[ref.name] = ref;
                        });
                        result.items.forEach((ref) => {
                            // All the items under listRef.
                            obj[ref.name] = ref.fullPath
                        });

                        resolve(result);
                    } catch (e) {
                        reject({Error: e});
                    }
                })

            },
            async getMetadata(path) {
                let me = this;
                let storageRef = firebase.storage().ref(path);
                const result = await me._getMetadata(storageRef);
                return result
            },
            async isValidatePath(path) {
                var me = this
                try {
                    let storageRef = firebase.storage().ref(path);
                    let result = await me._get(storageRef);
                    // if(result.Error){
                    //     return { status : false, msg: result.Error.message_ }
                    // }
                    return {status: true, msg: null}
                } catch (e) {
                    // ".", "#", "$", "[", or "]"
                    return {status: false, msg: e.message}
                }

            },
        }
    };
</script>
