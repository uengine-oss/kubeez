<template>
    <v-container>
        <v-row>
            <v-col
                    v-for="(item, index) in clustersList"
                    :key="index"
                    cols="6" md="4">
                <v-card
                        outlined
                        class="mx-auto"
                        max-width="400"
                        max-height="400"
                        @dblclick="selectCluster(item)">
                    <v-card-title>
                        {{ item.name }}
                        <v-spacer></v-spacer>
                        <v-icon @click="deleteCluster(item)">delete</v-icon>
                    </v-card-title>
                    <v-card-text>
                        API Server : {{ item.apiServer }}
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        
        <v-btn fab dark left bottom color="primary" class="my-10" @click="tokenDialog = true">
            <v-icon dark>mdi-plus</v-icon>
        </v-btn>

        <v-dialog v-model="tokenDialog" max-width="350">
            <v-card>
                <v-card-title class="headline">Cluster</v-card-title>
                <v-card-text>
                    <v-text-field
                            v-model="clusterName"
                            label="Name"
                            required
                    ></v-text-field>
                    <v-text-field
                            v-model="clusterAddress"
                            label="API Server"
                            required
                            hint="Ex) https://api.k8s.bzdvops.com"
                    ></v-text-field>
                    <v-text-field
                            label="TOKEN"
                            v-model="kuberToken"
                            required
                            outline
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="saveClusterData()">Save</v-btn>
                    <v-btn color="red darken-1" text @click="close()">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import firebase from 'firebase'
    
    export default {
        name: 'ViewManageClustersPage',
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
            me.getClusterData()
        },
        watch: {
        },
        methods: {
            getClusterData() {
                var me = this
                var list = []
                var userId = localStorage.getItem('uid')
                
                firebase.database().ref('userLists/' + userId + '/clusters/')
                    .once('value', function(snapshot) {
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
            async saveClusterData() {
                var me = this
                var userId = ''
                var newClusterKey = ''
                
                var cluster = {
                    "name" : me.clusterName,
                    "apiServer" : me.clusterAddress,
                    "token": me.kuberToken
                }

                userId = localStorage.getItem('uid')
                newClusterKey = firebase.database().ref('userLists/').child(userId + '/clusters/').push().key

                firebase.database().ref('userLists/').child(userId + '/clusters/' + newClusterKey).update(cluster)

                localStorage.setItem('clusterName', me.clusterName);
                localStorage.setItem('clusterAddress', me.clusterAddress);
                localStorage.setItem('kuberToken', me.kuberToken);

                await me.getClusterData()
                
                me.close()
            },
            deleteCluster(val) {
                if(!confirm('해당 클러스터를 삭제하시겠습니까?')) {
                    return
                }
                
                var me = this
                var userId = localStorage.getItem('uid')
                var clusterId = val.clusterId

                if(localStorage.getItem('clusterName') == val.name) {
                    localStorage.removeItem('clusterName')
                    localStorage.removeItem('clusterAddress')
                    localStorage.removeItem('kuberToken')
                }

                firebase.database().ref('userLists/').child(userId + '/clusters/' + clusterId).update({
                    "name": null,
                    "apiServer": null,
                    "token": null
                })
                me.getClusterData()
            },
            selectCluster(val) {
                var me = this

                localStorage.setItem('clusterName', val.name);
                localStorage.setItem('clusterAddress', val.apiServer);
                localStorage.setItem('kuberToken', val.token);
                
                me.$emit('input', localStorage.getItem('clusterName'))
                me.$EventBus.$emit('terminalOff')
                me.$emit('close')
            },
            close() {
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