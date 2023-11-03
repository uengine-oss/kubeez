<template>
    <v-container>
        <v-row>
            <v-col cols="6" md="4">
                <v-card
                        class="mx-auto" max-width="400" max-height="400" outlined
                        :class="value.name == 'default' ? 'selected' : ''"
                        @click='selectCluster({ "name": "default",
                        "cluserAddress": "",
                    "apiServer": "",
                    "token": "",
                    "connection": true})'>
                    <v-card-title>
                        default
                    </v-card-title>
                    <v-card-text>
                        API Server : default
                    </v-card-text>
                    <v-row>
                        <v-chip
                                small
                                color="green"
                                text-color="white"
                                style="position:relative; margin-bottom:10px; margin-left:25px;"
                        >
                            connected
                        </v-chip>

                        <v-icon v-if="value.name == 'default'" large color="green"
                                style="position:absolute; right:5px; bottom:5px;">check
                        </v-icon>
                    </v-row>
                </v-card>
            </v-col>
            <v-col v-for="(item, index) in clustersLists" :key="index" cols="6" md="4">
                <v-card
                        class="mx-auto" max-width="400" max-height="400" outlined
                        :class="item.name == value.name ? 'selected' : ''"
                        @click="selectCluster(item)">
                    <v-card-title>
                        {{ item.name }}
                        <v-spacer></v-spacer>
                        <v-btn text icon>
                            <v-icon @click.stop="deleteCluster(item)">delete</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        API Server : {{ item.apiServer }}
                    </v-card-text>
                    <v-row>
                        <v-chip
                                v-if="item.connection"
                                small
                                color="green"
                                text-color="white"
                                style="position:relative; margin-bottom:10px; margin-left:25px;"
                        >
                            connected
                        </v-chip>
                        <v-chip
                                v-else
                                small
                                color="red"
                                text-color="white"
                                style="position:relative; margin-bottom:10px; margin-left:25px;"
                        >
                            disconnected
                        </v-chip>
                        <v-icon v-if="item.name == value.name" large color="green"
                                style="position:absolute; right:5px; bottom:5px;">check
                        </v-icon>
                    </v-row>

                </v-card>
            </v-col>
            <v-col cols="6" md="4">
                <v-card v-if="!tokenDialog" @click="tokenDialog = true, connectable = false"
                        class="mx-auto"
                        style="height:300px; height:108px;
                        text-align:center; line-height:108px;
                        font-size:50px; font-weight:100;"
                        outlined
                >+
                </v-card>
                <div>
                    <v-card v-if="tokenDialog" max-width="350" outlined>
                        <v-card-title class="headline">Cluster</v-card-title>
                        <v-card-text>
                            <v-text-field
                                    v-model="clusterName"
                                    label="Name"
                                    required
                            ></v-text-field>
                            <v-text-field
                                    v-model="clusterAddress"
                                    label="Cluster Address"
                                    required
                                    hint="kubectl clsuter-info >> Kubernetes control plane url"
                            ></v-text-field>
                            <v-text-field
                                    v-model="apiServer"
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
                            <v-text-field
                                    label="Namespace"
                                    v-model="namespace"
                                    required
                                    outline
                            ></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                            <v-progress-circular
                                    v-if="waitConnetionTest"
                                    indeterminate
                                    color="primary"
                            ></v-progress-circular>
                            <v-chip
                                    v-else
                                    class="ma-2"
                                    text-color="black"
                                    color="white"
                                    @click="dialogConnectionTest()"
                            >
                                <v-avatar left>
                                    <v-icon :color="dialogBtnColor">mdi-checkbox-marked-circle</v-icon>
                                </v-avatar>
                                validation
                            </v-chip>

                            <v-spacer></v-spacer>
                            <v-btn text @click="closeToken()">Cancel</v-btn>
                            <v-btn color="primary" text @click="save()">Save</v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import Clusters from './ClustersFirebase'

    export default {
        name: 'clusters',
        mixins: [Clusters],
        checkbox: true,
        computed: {
            dialogBtnColor() {
                if (this.connectable) {
                    return 'green'
                } else {
                    return 'red'
                }
            },
            clustersLists() {
                var me = this
                var filterClusterLists = []
                filterClusterLists = me.clustersList
                filterClusterLists.forEach(async function (cluster) {
                    cluster.connection = await me.connectionTest(cluster.apiServer, cluster.token)
                })

                return filterClusterLists
            }
        },
        methods: {
            connectionTest(apiServer, token) {
                var me = this

                return new Promise((resolve, reject) => {
                    if (apiServer && token) {
                        me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/apis/apps/v1?serverUrl=${apiServer}&token=${token}`)
                            .then(function (result) {
                                // item.connection = true
                                me.waitConnetionTest = false
                                resolve(true)
                            }).catch(function (e) {
                                // item.connection = false
                                // return false
                                me.waitConnetionTest = false
                                resolve(false)
                            }
                        )
                    } else {
                        me.waitConnetionTest = false
                        alert('apiServer 와 token 값을 확인해주세요.')
                        resolve(false)
                    }
                })
            },
            async dialogConnectionTest() {
                var me = this
                me.waitConnetionTest = true
                me.connectable = await me.connectionTest(me.clusterAddress, me.kuberToken)
            },
        }
    }
</script>


<style scoped>
    .selected {
        background-color: #E0F7FA;
    }
</style>