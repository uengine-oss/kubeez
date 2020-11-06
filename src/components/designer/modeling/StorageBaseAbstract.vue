<template>

</template>

<script>

    export default {
        name: "storage-base-abstract",
        methods: {
            //options - sort. query, size, page, key, startAt, endAt
            //options - sort. query, size, page, key, startAt, endAt

            /// underbar methods are ABSTRACT METHODS that must be implemented by derived classes
            _list(path, metadata) {
                throw new Error("must be implemented")
            },
            async _get(path) {
                throw new Error("must be implemented")
            },
            _put(path, string) {
                throw new Error("must be implemented")
            },
            _push(path, string) {
                throw new Error("must be implemented")
            },
            _delete(path) {
                throw new Error("must be implemented")
            },
            _getURL(path) {
                throw new Error("must be implemented")
            },
            async list(path, options) {
                var list = await this._list(path,options);
                return list;
            },
            async getURL(path) {
                return await this._getURL(path);
            },
            async listMetadata(path) {
                return await this._list(path, true);
            },
            async getString(path) {
                return await this._get(path);
            },
            async delete(path) {
                return await this._delete(path)
            },
            async getObject(path) {
                var string = await this._get(path);
                if (typeof string == 'string')
                    var data = JSON.parse(string);
                else
                    var data = string

                return data;
            },

            async putString(path, string) {
                return await this._put(path, string);
            },
            async putObject(path, obj) {
                var string = JSON.stringify(obj);
                return await this._put(path, string);
            },

            async pushString(path, string){
                return await this._push(path, string);
            },
            async pushObject(path, obj){
                var string = JSON.stringify(obj);
                return await this._push(path, string);
            },


        }

    };
</script>
