<template>
</template>

<script>
    import ClustersBase from './ClustersBase'

    export default {
        name: 'clusters-localStorage',
        mixins: [ClustersBase],
        methods: {
            getData() {
                var me = this
                if (localStorage.getItem('clustersList')) {
                    me.clustersList = JSON.parse(localStorage.getItem('clustersList'))
                }
            },
            save() {
                var me = this
                var cluster = {
                    "name": me.clusterName,
                    "clusterAddress": me.clusterAddress,
                    "apiServer":me.apiServer,
                    "token": me.kuberToken,
                    "connection": false,
                }
                me.clustersList.push(cluster)
                localStorage['clustersList'] = JSON.stringify(me.clustersList)
                me.closeToken()
            },
            deleteCluster(val) {
                if (!confirm('해당 클러스터를 삭제하시겠습니까?')) {
                    return
                }
                var me = this
                me.clustersList.splice(me.clustersList.indexOf(val), 1)
                localStorage.removeItem('clustersList')
                localStorage['clustersList'] = JSON.stringify(me.clustersList)

                if (localStorage.getItem('clusterName') == val.name) {
                    localStorage.removeItem('clusterName')
                    localStorage.removeItem('clusterAddress')
                    localStorage.removeItem('apiServer')
                    localStorage.removeItem('kuberToken')
                    me.$emit('input', '')
                }
                this.getData()
            },
        },
    }
</script>

<style>

</style>