<template>
</template>

<script>
    export default {
        name: 'storage-base-localstorage',
        data() {
            return {}
        },
        methods: {
            _list(path, metadata) {
                return localStorage.getItem(path)
            },
            _get(path) {
                return localStorage.getItem(path)
            },
            _put(path, string) {
                localStorage.setItem(path, string)
            },
            _push(path,string){
                console.log('No methods : localStorage push')
            },
            _delete(path) {
                localStorage.removeItem(path)
                return null
            },
            watch(path, callback) {
                console.log('No methods : LocalStorage Watch')
            },


        }

    }
</script>