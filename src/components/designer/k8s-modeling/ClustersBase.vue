<template>

</template>

<script>
    
    export default {
        name: 'clusters-base',
        props: {
            value: String,
        },
        data() {
            return {
                clustersList: [],
                tokenDialog: false,
                clusterName: '',
                clusterAddress: '',
                kuberToken: '',
            }
        },
        mounted: function () {
            var me = this
            me.getData()
        },
        watch: {
        },
        methods: {
            getData() {
                var me = this
            },
            save() {
                var me = this
            },
            deleteCluster(val) {
                var me = this
            },
            selectCluster(val) {
                var me = this
                localStorage.setItem('clusterName', val.name)
                localStorage.setItem('clusterAddress', val.apiServer)
                localStorage.setItem('kuberToken', val.token)
                me.$emit('input', val.name)
                me.$emit('close')
            },
            closeToken() {
                var me = this
                me.clusterName = ''
                me.clusterAddress = ''
                me.kuberToken = ''
                me.tokenDialog = false
            },
        },
    }
</script>

<style>

</style>