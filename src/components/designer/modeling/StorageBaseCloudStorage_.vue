<template></template>

<script>
    import firebase from 'firebase'
    import {uploadString, uploadBytes } from 'firebase/storage';

    export default {
        name: "storage-base-cloud-storage_",
        methods: {
            async _list_watch(path, recursive, callback) {
                var me = this;
                let obj = await this._list(path);
                obj.prefix = JSON.parse(JSON.stringify(obj.prefixes));
                delete obj.prefixes;
                callback(obj)
            },
            _listAll(reference) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.listAll()
                            .then((res) => {
                                resolve(res);
                            }).catch((error) => {
                                // Uh-oh, an error occurred!
                                resolve( {Error: error} );
                            });
                    } catch (error) {
                        console.log('Error] Cloud Storage _list: ', e);
                        resolve( {Error: error} );
                    }
                })
            },
            _list(reference, options){
                return new Promise(function (resolve, reject) {
                    try {
                        reference.list(options)
                            .then((res)=>{
                                resolve(res);
                            }).catch((error)=>{
                                // Uh-oh, an error occurred!
                                resolve( {Error: error} );
                            });
                    } catch (error) {
                        console.log('Error] Cloud Storage _list: ', e)
                        resolve( {Error: error} );
                    }
                });
            },
            _getURL(path) {
                return new Promise (function (resolve, reject) {
                    let storageRef = firebase.storage().ref();
                    var ref = storageRef.child(path);
                    ref.getDownloadURL()
                    .then((url) => {
                        resolve(url)
                    // Insert url into an <img> tag to "download"
                    })
                    .catch(e => reject(e))
                })
            },
            _getImageURL(path) {
                return new Promise (function (resolve, reject) {
                    let storageRef = firebase.storage().ref();
                    var imageRef = storageRef.child(path);
                    imageRef.getMetadata()
                      .then((metadata) => {
                          console.log(metadata)
                        // Metadata now contains the metadata for 'images/forest.jpg'
                      })
                      .catch((error) => {
                        // Uh-oh, an error occurred!
                      });

                })
            },
            _delete(reference) {
                return new Promise(async function (resolve, reject) {
                    try {
                        // return reference.remove()
                        reference.delete().then((snapshot) => {
                            // File deleted successfully
                            resolve(snapshot);
                        }).catch((error) => {
                            // Uh-oh, an error occurred!
                            resolve( {Error: error} );
                        });
                    }catch (error){
                        resolve( {Error: error} );
                    }
                });
            },
            _fetch(url){
                return new Promise(async function (resolve, reject) {
                    fetch(url)
                        .then(async function(response) {
                            // 일단 Text로 Return해서 사용해도 괜찮지 않을까?
                            // 
                            var contentType = response.headers.get('Content-Type');
                            // Handle the response headers
                            if (contentType.includes('application/json')) {
                                // Handle JSON response
                                resolve(response.json());
                            } else if (contentType.includes('text/plain')) {
                                // Handle plain text response
                                resolve(response.text());
                            } else if(contentType.includes('image/')) {
                                resolve(url);
                            } else if (contentType.includes('text/html') || contentType.includes('text/markdown') ) {
                                resolve(response.text());
                            } else {
                                // Handle other content types or throw an error
                                resolve({Error: `Unsupported content type: ${contentType}`} );
                            }
                        }).catch(function(error) {
                            // Handle any errors
                            resolve({Error: `Fetch Handle any errors: ${error}`} );
                        });
                })
            },
            _get(reference) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.getDownloadURL().then(function(url) {
                            // Use the download URL to access the file
                            resolve(url);
                        }).catch(function(error) {
                            // Handle any errors
                            resolve( {Error: error} );
                        });
                    } catch (error) {
                        resolve( {Error: error} );
                    }
                })
            },
            _getMetadata(reference){
                return new Promise(function (resolve, reject) {
                    try {
                        reference.getMetadata().then(function(metadata) {
                            // Use the download URL to access the file
                            resolve(metadata);
                        }).catch(function(error) {
                            // Handle any errors
                            resolve( {Error: error} );
                        });
                    } catch (error) {
                        console.log('Error] Cloud Storage _get: ', error)
                        resolve( {Error: error} );
                    }
                })

            },
            _put(reference, value, options) {
                return new Promise(function (resolve, reject) {
                    try {
                        let format = options.format;
                        let metadata = options.metadata;

                        reference.putString(value, format, metadata).then((snapshot) => {
                            resolve(snapshot);
                        }).catch((error)=>{
                            resolve( {Error: error} );
                        })
                    } catch (error) {
                        console.log('Error] Cloud Storage _put: ', error)
                        resolve({ Error: error});
                    }
                })
            },
            _watch_off(reference){
                reference.off();
            },
            _watch(reference, callback) {
                try {

                } catch (e) {
                    console.log('Error] Firebase _watch: ', e)
                    callback(undefined)
                }

            },
        }
    };
</script>
