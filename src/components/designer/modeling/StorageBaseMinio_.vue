<template></template>

<script>
    var Minio = require('minio');
    import TenantAware from "../../labs/TenantAware";


    export default {
        name: "storage-base-minio_",
        mixins: [TenantAware],
        data() {
            return {
                minioClient: null,
                pollingJob: null,
            }
        },
        methods: {
            _watch(path, callback) {
                var me = this
                me.pollingJob = setInterval(async function () {
                    callback(await me._get(path))
                }, 5000)
            },
            _list(path, recursive, tenant) {
                var me = this;
                recursive = recursive ? recursive : false
                return new Promise((resolve, reject) => {
                    var listObj = null;
                    var stream = me.minioClient.listObjects(`labs-${tenant ? tenant : me.getTenantId()}`, path, recursive)
                    //true 내부 , false 해당 path의 노출.
                    stream.on('data', function (obj) {
                        if (!listObj) listObj = []
                        listObj.push(obj)
                    })
                    stream.on('error', function (err) {
                        reject(err);
                    })
                    stream.on('end', function () {
                        resolve(listObj)
                    })
                });
            },
            _list_watch(path, recursive, callback) {
                var me = this;
                recursive = recursive ? recursive : false
                var stream = me.minioClient.listObjects(`labs-${me.getTenantId()}`, path, recursive)
                stream.on('data', function (obj) {
                    callback(obj);
                })
                stream.on('end', function (obj) {
                    // callback(obj);
                })
                stream.on('error', function (err) {
                    console.log(err);
                })
            },
            _put(path, string) {
                var me = this;
                return new Promise((resolve, reject) => {
                    me.minioClient.putObject(`labs-${me.getTenantId()}`, path, string, function (err, etag) {
                        if (err == null && etag) {
                            resolve(etag);
                        } else
                            reject(err);

                    });
                });
            },
            _delete(path) {
                var me = this
                return new Promise((resolve, reject) => {
                    me.minioClient.removeObject(`labs-${me.getTenantId()}`, path, function (err) {
                        if (err) {
                            reject(err)
                        }
                        resolve()
                    })
                })
            },
            async _get(path, tenant) {
                var me = this
                
                var exist = await me._list(path, null, tenant);
                if (!exist || exist.length == 0) return null;
                return new Promise((resolve, reject) => {
                    var result = null
                    me.minioClient.getObject(`labs-${tenant ? tenant : me.getTenantId()}`, path, function (err, labDataStream) {
                        if (err) {
                            resolve(null)
                            return;
                        }
                        if (!labDataStream) {
                            resolve(null)
                            return;
                        }
                        labDataStream.on('data', function (labChunk) {
                            if (result) {
                                result = [...result, ...labChunk];
                            } else {
                                result = [...labChunk];
                            }
                        })

                        labDataStream.on('end', function () {
                            var returnResult = null
                            if (path.includes('png') || path.includes('jpg')) {
                                returnResult = result
                            } else {
                                if (result) {
                                    result = new Uint8Array(result).buffer;
                                    returnResult = new TextDecoder("utf-8").decode(result)
                                }
                            }
                            resolve(returnResult);
                        })

                        labDataStream.on('error', function (err) {
                            resolve(null)
                            //reject(err);

                        })
                    })
                });
            },
            async _getURL(path, tenant) {
                var me = this
                return new Promise((resolve, reject) => {
                    me.minioClient.presignedUrl('GET', `labs-${tenant ? tenant : me.getTenantId()}`, path, 60, function (err, presignedUrl) {
                        if (err) return reject(err);
                        resolve(presignedUrl)
                    })
                });
            },

            async __get(path) {
                var source = await this._get(path);

                if (!source) return null;

                var string = new TextDecoder("utf-8").decode(source)
                return (string);

            },

            async _getImageURL(path) {
                var me = this;

                var imgChunk = await me._get(path);
                if (!imgChunk) return null;

                if (path.includes('png')) {
                    var base64Data = btoa(String.fromCharCode.apply(null, imgChunk))
                    return ('data:image/png;base64,' + base64Data)
                } else if (path.includes('jpg')) {
                    var base64Data = btoa(String.fromCharCode.apply(null, imgChunk))
                    return ('data:image/jpg;base64,' + base64Data)
                } else if (path.includes('svg')) {

                    // var base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(imgChunk)))
                    return null
                }
            },
        },
        beforeDestroy() {
            clearInterval(this.pollingJob)
        }
    };
</script>
