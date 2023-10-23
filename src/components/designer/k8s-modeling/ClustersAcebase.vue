<template>
</template>

<script>
    import ClustersBase from './ClustersBase'

    export default {
        name: 'clusters-acebase',
        mixins: [ClustersBase],
        methods: {
            getData() {
                var me = this;
                // if (localStorage.getItem('clustersList')) {
                //     me.clustersList = JSON.parse(localStorage.getItem('clustersList'))
                // }
            },
            save() {
                var me = this;
                var cluster = {
                    "name": me.clusterName,
                    "apiServer": me.clusterAddress,
                    "token": me.kuberToken,
                    "connection": false,
                };
                me.clustersList.push(cluster);
                // localStorage['clustersList'] = JSON.stringify(me.clustersList)
                // me.closeToken()
            },
            deleteCluster(val) {
                var me = this;
                if (!confirm('해당 클러스터를 삭제하시겠습니까?')) {
                    return
                };
                // me.clustersList.splice(me.clustersList.indexOf(val), 1)
                // localStorage.removeItem('clustersList')
                // localStorage['clustersList'] = JSON.stringify(me.clustersList)

                // if (localStorage.getItem('clusterName') == val.name) {
                //     localStorage.removeItem('clusterName')
                //     localStorage.removeItem('clusterAddress')
                //     localStorage.removeItem('kuberToken')
                //     me.$emit('input', '')
                // }
                me.getData();
            },
        },
    }
</script>

<style>
</style>