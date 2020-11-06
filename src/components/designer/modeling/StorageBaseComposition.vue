<template></template>

<script>
    import StorageBaseAbstract from "./StorageBaseAbstract";
    import StorageBaseLocalStorage from "./StorageBaseLocalStorage";

    export default {
        name: "storage-base-composition",
        mixins: [StorageBaseAbstract],
        data() {
            return {
                standalone: null,
            }
        },
        created() {

            var me = this

            var StorageBaseLocalClass = Vue.extend(StorageBaseLocalStorage)
            me.standalone = new StorageBaseLocalClass()

        },
        methods: {
            watch(path, callback) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.watch(path, callback);
            },
            async _list(path, metadata) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return await server._list(path, metadata);
            },
            async _get(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path)
                    return await server._get(path);
                else
                    return null
            },
            _put(path, string) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path && string) {
                    return server._put(path, string);
                } else {
                    return null
                }
            },
            async _push(path, string) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path) {
                    return await server._push(path, string);
                } else {
                    return null
                }
            },
            _delete(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                if (path) {
                    return server._delete(path);
                } else {
                    return null
                }

            },
            _getURL(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server._getURL(path);
            },
            getImageURL(path) {
                var server = this.getServer(path);
                path = path.includes('://') ? path.split('://')[1] : path
                return server.getImageURL(path);

            },
            getServer(path) {
                var me = this
                //default
                return me.standalone
            }


        }
    };
</script>
