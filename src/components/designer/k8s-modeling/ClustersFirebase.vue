<template>
</template>

<script>
    import ClustersBase from './ClustersBase'
    import firebase from 'firebase'

    export default {
        name: 'clusters-firebase',
        mixins: [ClustersBase],
        // mounted() {
        // },
        methods: {
            getData() {
                var me = this
                var list = []
                var userId = localStorage.getItem('email').replace(/\./gi, '_')
                // var convertEmail = me.userInfo.email
                firebase.database().ref('enrolledUsers/' + userId + '/clusters/')
                    .once('value', function (snapshot) {
                        if (snapshot.exists()) {
                            var clusterIds = Object.keys(snapshot.val())
                            clusterIds.forEach(function (clusterId, index) {
                                var cluster = snapshot.val()[clusterId]
                                cluster.clusterId = clusterId
                                list.push(cluster)
                            })
                        }
                    })
                me.clustersList = list
            },
            async save() {
                var me = this
                var userId = ''
                var newClusterKey = ''
                var cluster = {
                    "name": me.clusterName,
                    "clusterAddress": me.clusterAddress,
                    "apiServer":me.apiServer,
                    "token": me.kuberToken,
                    "connection": false,
                }

                userId = localStorage.getItem('email').replace(/\./gi, '_')
                newClusterKey = firebase.database().ref('enrolledUsers/').child(userId + '/clusters/').push().key
                firebase.database().ref('enrolledUsers/').child(userId + '/clusters/' + newClusterKey).update(cluster)

                await me.getData()
                me.closeToken()
            },
            deleteCluster(val) {
                if (!confirm('해당 클러스터를 삭제하시겠습니까?')) {
                    return
                }

                var me = this
                var userId = localStorage.getItem('email').replace(/\./gi, '_')
                var clusterId = val.clusterId

                if (localStorage.getItem('clusterName') == val.name) {
                    localStorage.removeItem('clusterName')
                    localStorage.removeItem('clusterAddress')
                    localStorage.removeItem('apiServer')
                    localStorage.removeItem('kuberToken')
                }

                firebase.database().ref('enrolledUsers/').child(userId + '/clusters/' + clusterId).update({
                    "name": null,
                    "apiServer": null,
                    "clusterAddress": null,
                    "token": null
                })
                me.getData()
            }
        },
    }
</script>

<style>

</style>