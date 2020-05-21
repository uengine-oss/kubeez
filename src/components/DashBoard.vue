<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div>
        <v-layout >
            <v-btn-toggle
                    v-model="toggle_exclusive">
                <v-btn fab text color="primary" @click="types='pod'" style="width: 150px;">
                    pods
                </v-btn>
                <v-btn fab text color="primary" @click="types='deployment'" style="width: 150px;">
                    deployment
                </v-btn>
                <v-btn fab text color="primary" @click="types='service'" style="width: 150px;">
                    service
                </v-btn>
                <v-btn fab text color="primary" @click="types='service'" style="width: 150px;">
                    <v-icon>add</v-icon>
                </v-btn>
            </v-btn-toggle>

            <v-flex grow pa-1 style="margin-left: 8px;">
                <v-text-field v-model="search" append-icon="search" label="Search" single-line
                              hide-details></v-text-field>
            </v-flex>
            <v-flex shrink pa-1>
                <v-btn color="info" @click="codeModalShow(); status = 'add'">ADD</v-btn>

            </v-flex>
        </v-layout>
        <!-- Title -->
        <v-data-table
                :headers="headers"
                :items="list"
                class="elevation-1"
                :loading="tableLoad"
                :search="search"
                :expand="expand"
        >
            <template slot="items" slot-scope="props">
                <tr v-bind:class="{ deletedItem: props.item.apiVersion == 'DELETED' }">
                    <td style="width: 20px">
                        <v-progress-circular
                                indeterminate
                                :size="20"
                                color="primary"
                                v-if="props.item.running == true"
                        ></v-progress-circular>
                    </td>
                    <td>{{ props.item.name }}
                    </td>
                    <td>{{ props.item.namespace }}</td>
                    <!-- pod Column -->
                    <td class="text-xs-left" v-if="types == 'pod'">{{ props.item.status }}</td>
                    <td class="text-xs-center" v-if="types == 'pod'">
                        {{ props.item.createTimeStamp }}
                    </td>
                    <!-- Deployment Column -->
                    <td class="text-xs-center" v-if="types == 'deployment'">
                        {{ props.item.statusReadyReplicas }}
                    </td>
                    <td class="text-xs-center" v-if="types == 'deployment'">
                        {{ props.item.statusReplicas }}
                    </td>
                    <td class="text-xs-center" v-if="types == 'deployment'">
                        {{ props.item.statusUpdateReplicas }}
                    </td>
                    <td class="text-xs-center" v-if="types == 'deployment'">
                        {{ props.item.statusAvailableReplicas }}
                    </td>
                    <td class="text-xs-center" v-if="types == 'deployment'">
                        {{ props.item.createTimeStamp }}
                    </td>
                    <!-- Service Column -->
                    <td class="text-xs-left" v-if="types == 'service'">
                        {{ props.item.specType }}
                    </td>
                    <td class="text-xs-left" v-if="types == 'service'">
                        {{ props.item.specClusterIp }}
                    </td>
                    <td class="text-xs-left"
                        v-if="types == 'service' && props.item.ingressIp != null && props.item.hostname == null"
                    >
                        {{ props.item.ingressIp }}
                    </td>
                    <td class="text-xs-left"
                        v-if="types == 'service' && props.item.hostname != null && props.item.ingressIp == null"
                    >
                        {{ props.item.hostname }}
                    </td>
                    <td class="text-xs-left"
                        v-if="types == 'service' && props.item.ingressIp == null && props.item.hostname == null"
                    >

                    </td>
                    <td class="text-xs-left" v-if="types == 'service' && props.item.specPorts != null">
                        <a class="caption" style="color: #000000; margin-right: 4px;"

                           v-for="portData in JSON.parse(props.item.specPorts)"
                        >
                            {{ portData.port }}:{{ portData.nodePort }}/{{ portData.protocol }}
                        </a>
                    </td>
                    <td class="text-xs-left" v-if="types == 'service' && props.item.specPorts == null">
                        <a class="caption" style="color: #000000; margin-right: 4px;">

                        </a>
                    </td>
                    <td class="text-xs-center" v-if="types == 'service'">
                        {{ props.item.createTimeStamp }}
                    </td>
                    <td class="justify-center layout px-0" v-if="props.item.apiVersion != 'DELETED'">
                        <v-icon small class="mr-2" @click="log_dialogShow(props)" v-if="types != 'service'">
                            show_chart
                        </v-icon>
                        <v-icon
                                small
                                class="mr-2"
                                @click="handleEdit(props.item); status = 'edit'"
                        >
                            edit
                        </v-icon>
                        <v-icon
                                small
                                @click="deleteModalShow(props.item)"
                        >
                            delete
                        </v-icon>
                    </td>
                    <td v-else></td>
                </tr>
            </template>
            <template slot="no-data">
            </template>
        </v-data-table>

        <template>
            <v-layout row justify-center>
                <v-dialog v-if="this.types=='pod'" v-model="log_dialog" fullscreen hide-overlay
                          transition="dialog-bottom-transition">
                    <v-card>
                        <v-toolbar dark color="primary">
                            <v-btn icon dark @click="log_dialog = false">
                                <v-icon>close</v-icon>
                            </v-btn>

                            <v-toolbar-title v-if="selectedRow.item != null">{{ selectedRow.item.name }} LOG
                            </v-toolbar-title>
                        </v-toolbar>

                        <v-list>
                            <!--<v-subheader>{{ temp_log_name }}</v-subheader>-->
                            <!-- <v-subheader> SHOW </v-subheader> -->

                            <v-layout justify-space-between style="margin: 10px; left: 10px">
                                <v-data-table :rows-per-page-items="logPageItems" :items="tmpLog" class="elevation-1"
                                              hide-headers style="word-break:break-all;">
                                    <!--<temnplate v-slot:items="items" v-if="logLoad == false">-->
                                    <!--<v-progress-circular-->
                                    <!--indeterminate-->
                                    <!--color="primary"-->
                                    <!--&gt;</v-progress-circular>-->
                                    <!--</temnplate>-->
                                    <template v-slot:items="items">
                                        <tr v-if="items.item.status == 'WARN'"
                                            style=" background-color: #FFC107; color: #000000; display: block;">
                                            <td class="text-xs-left" style="min-width: 124px;">{{ items.item.dateTime
                                                }}
                                            </td>
                                            <td class="text-xs-left" style="min-width: 100px;">{{ items.item.status }}
                                            </td>
                                            <td>{{ items.item.message }}</td>
                                        </tr>
                                        <tr v-else-if="items.item.status == 'ERROR'"
                                            style="background-color: #b71c1c; color: #ffffff; display: block;">
                                            <td class="text-xs-left" style="min-width: 124px;">{{ items.item.dateTime
                                                }}
                                            </td>
                                            <td class="text-xs-left" style="min-width: 100px;">{{ items.item.status }}
                                            </td>
                                            <td>{{ items.item.message }}</td>
                                        </tr>
                                        <tr v-else style="display: block;">
                                            <td class="text-xs-left" style="min-width: 124px;">{{ items.item.dateTime
                                                }}
                                            </td>
                                            <td class="text-xs-left" style="min-width: 100px;">{{ items.item.status }}
                                            </td>
                                            <td>{{ items.item.message }}</td>
                                        </tr>
                                    </template>
                                    <template v-slot:no-data>
                                        <v-alert :value="true" color="error" icon="warning">
                                            Sorry, nothing to display here :(
                                        </v-alert>
                                    </template>
                                </v-data-table>
                            </v-layout>
                        </v-list>
                    </v-card>
                </v-dialog>

                <v-dialog v-if="this.types=='deployment'" v-model="log_dialog" fullscreen hide-overlay
                          transition="dialog-bottom-transition">
                    <v-card>
                        <v-toolbar dark color="primary">
                            <v-btn icon dark @click="log_dialog = false">
                                <v-icon>close</v-icon>
                            </v-btn>

                            <v-toolbar-title v-if="selectedRow.item != null">{{ selectedRow.item.name }} Log
                            </v-toolbar-title>
                        </v-toolbar>


                        <v-layout justify-space-between style="margin: 10px; left: 10px">
                            <v-tabs v-model="deployTab" show-arrows style="max-width: 100%">
                                <v-tab v-for="keyitem in Object.keys(tmpLog)">
                                    {{ keyitem }}
                                </v-tab>

                                <v-tabs-items v-model="deployTab">
                                    <v-tab-item v-for="keyitem in Object.keys(tmpLog)">
                                        <v-data-table class="elevation-1" hide-headers :items="tmpLog[keyitem]"
                                                      style="word-break:break-all;">
                                            <!--<temnplate v-if="logLoad == false" v-slot:items="items">-->
                                            <!--<v-progress-circular-->
                                            <!--indeterminate-->
                                            <!--color="primary"-->
                                            <!--&gt;</v-progress-circular>-->
                                            <!--</temnplate>-->
                                            <template v-slot:items="items" style="display: block;">
                                                <tr v-if="items.item.status == 'WARN'"
                                                    style=" background-color: #FFC107; color: #000000; display: block;">
                                                    <td class="text-xs-left" style="min-width: 124px;">{{
                                                        items.item.dateTime }}
                                                    </td>
                                                    <td class="text-xs-left" style="min-width: 100px;">{{
                                                        items.item.status }}
                                                    </td>
                                                    <td>{{ items.item.message }}</td>
                                                </tr>
                                                <tr v-else-if="items.item.status == 'ERROR'"
                                                    style="background-color: #b71c1c; color: #ffffff; display: block;">
                                                    <td class="text-xs-left" style="min-width: 124px;">{{
                                                        items.item.dateTime }}
                                                    </td>
                                                    <td class="text-xs-left" style="min-width: 100px;">{{
                                                        items.item.status }}
                                                    </td>
                                                    <td>{{ items.item.message }}</td>
                                                </tr>
                                                <tr v-else style="display: block;">
                                                    <td class="text-xs-left" style="min-width: 124px;">{{
                                                        items.item.dateTime }}
                                                    </td>
                                                    <td class="text-xs-left" style="min-width: 100px;">{{
                                                        items.item.status }}
                                                    </td>
                                                    <td>{{ items.item.message }}</td>
                                                </tr>
                                            </template>
                                            <template v-slot:no-data>
                                                <v-alert :value="true" color="error" icon="warning">
                                                    Sorry, nothing to display here :(
                                                </v-alert>
                                            </template>
                                        </v-data-table>
                                    </v-tab-item>
                                </v-tabs-items>

                            </v-tabs>
                        </v-layout>
                    </v-card>
                </v-dialog>
            </v-layout>
        </template>
        <!-- Edit & Add Modal -->
        <modal ref="modal" name="codeModal" :height='"60%"' :width="'80%'">
            <v-layout justify-space-between>
                <v-flex>
                    <v-card-title class="headline">
                        {{types.toUpperCase()}} Editor
                    </v-card-title>
                </v-flex>
                <v-flex style="text-align: right">
                    <v-btn fab flat @click="codeModalhide">
                        <v-icon>
                            clear
                        </v-icon>
                    </v-btn>
                </v-flex>
            </v-layout>
            <EditYaml :status="status" :plainText.sync="plainText" :types="types" :namespace="namespace"></EditYaml>
        </modal>

        <!-- Delete Modal -->
        <modal scrollable ref="modal" name="deleteModal" :height='"auto"' :width='500'>
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <div class="headline">삭제 안내</div>
                        <span class="text-capitalize"> {{ deleteName }}를 삭제하시겠습니까?</span>
                    </div>
                </v-card-title>

                <v-card-actions>
                    <v-btn color="primary" @click="deleteModalhide">Close</v-btn>
                    <v-btn color="primary" @click="handleDelete(selectedRow)">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </modal>

        <v-snackbar
                v-model="snackbar.status"
                :bottom="snackbar.y === 'bottom'"
                :top="snackbar.y === 'top'"
                :left="snackbar.x === 'left'"
                :right="snackbar.x === 'right'"
                :timeout="snackbar.timeout"
                :color="snackbar.color"
        >
            {{ snackbar.text }}
            <v-btn
                    dark
                    flat
                    @click="snackbar.status = false"
            >
                Close
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    // import EditYaml from "@/components/edityamlpage.vue";
    import yaml from 'js-yaml'
    import json2yaml from 'json2yaml'
    import {codemirror} from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/darcula.css'
    import 'codemirror/mode/yaml/yaml.js'


    export default {

        name: 'DashBoard',
        props: {
            namespace: String,
        },
        components: {
            yaml,
            json2yaml,
            codemirror
        },
        created() {

        },
        data() {
            return {
                pagination: {},
                pageItems: [10, 25, {"text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1}],
                logPageItems: [100, 200, {"text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1}],
                evtSource: null,
                cmOption: {
                    tabSize: 4,
                    mode: 'yaml',
                    theme: 'darcula',
                    lineNumbers: true,
                    lineWrapping: true,
                    viewportMargin: 20

                },
                toggle_exclusive: 0,
                log_dialog: false,
                deployTab: 'tab-1',
                temp_log_name: "",
                expand: false,
                modalStatus: false,
                tableLoad: false,
                list: [],
                search: '',
                visible: false,
                plainText: "",
                selectedRow: {},
                loading: false,
                yamlText: "",
                status: '',
                snackbar: {
                    status: false,
                    y: 'top',
                    x: null,
                    mode: '',
                    timeout: 6000,
                    text: ''
                },
                tmpLog: [],
                types: 'pod',
                logLoad: false
            }
        },
        beforeDestroy: function () {
            var me = this
            // console.log("closing evtSource beforeDestroy");
            this.evtSource.close();
            me.$EventBus.$off('deployStart')

        },
        computed: {
            codemirror: function () {
                return this.$refs.myCm.codemirror;
            },
            kubeHost: function () {
                return this.$store.state.kubeHost
            },
            getAuth() {
                return this.$store.state.storeAuthorized
            },
            deleteName() {
                return this.selectedRow.name
            },
            deleteNamespace() {
                return this.selectedRow.namespace
            },
            headers() {
                if (this.types == 'pod') {
                    var result = [
                        {text: '', value: 'running', align: 'left', sortable: false},
                        {
                            text: 'Name',
                            align: 'left',
                            sortable: false,
                            value: 'name'
                        },
                        {text: 'Namespace', value: 'namespace', align: 'left', sortable: false},
                        {text: 'Status', value: 'status', sortable: false},
                        {text: 'Create Time', value: 'createTimeStamp', align: 'center', sortable: false},
                        {text: 'Action', value: 'name', sortable: false, align: 'center'},
                    ]
                    return result
                } else if (this.types == 'deployment') {
                    var result = [
                        {text: '', value: 'running', align: 'left', sortable: false},

                        {
                            text: 'Name',
                            align: 'left',
                            sortable: false,
                            value: 'name'
                        },
                        {text: 'Namespace', value: 'namespace', align: 'left', sortable: false},
                        {text: 'Desire', value: 'statusReadyReplicas', align: 'center', sortable: false},
                        {text: 'Current', value: 'Current', align: 'center', sortable: false},
                        {text: 'Up-To-Date', value: 'Up-to-Date', align: 'center', sortable: false},
                        {text: 'Available', value: 'Available', align: 'center', sortable: false},
                        {text: 'Create Time', value: 'createTimeStamp', align: 'center', sortable: false},
                        {text: 'Action', value: 'name', sortable: false, align: 'center'},
                    ]
                    return result

                } else if (this.types == 'service') {
                    var result = [
                        {text: '', value: 'running', align: 'left', sortable: false},

                        {
                            text: 'Name',
                            align: 'left',
                            sortable: false,
                            value: 'name'
                        },
                        {text: 'Namespace', value: 'namespace', align: 'left', sortable: false},
                        {text: 'Type', value: 'type', align: 'left', sortable: false},
                        {text: 'Cluster IP', value: 'cluster-ip', align: 'center', sortable: false},
                        {text: 'External IP', value: 'external-ip', align: 'center', sortable: false},
                        {text: 'PORT(S)', value: 'ports', align: 'center', sortable: false},
                        {text: 'Create Time', value: 'createTimeStamp', align: 'center', sortable: false},
                        {text: 'Action', value: 'name', sortable: false, align: 'center'},
                    ]
                    return result
                }
            }
        },
        mounted() {
            var me = this
            me.$EventBus.$on('deployStart', function () {
                me.postYAML()
            });

            this.$nextTick(function () {
                if (this.getAuth == true) {
                    this.getList()
                }
            })
        },
        watch: {
            types: function () {
                var me = this

                this.evtSource.close();
                me.$EventBus.$off('deployStart')

                this.$nextTick(function () {
                    if (this.getAuth == true) {
                        this.getList()
                    }
                })

                me.$EventBus.$on('deployStart', function () {
                    me.postYAML()
                });
            },
            namespace: function () {
                this.getList()
                this.pagination.page = 1;
            },
            plainText: function (newVal) {
            },
            getAuth: function (newVal) {
                this.getList()
            },
            kubeHost: function (newVal) {
                this.getList()
            },
            tmpLog: function (newVal, oldVal) {
                var me = this
                if(me.logLoad == true) {
                    clearTimeout(function () {
                        me.getLog(me.selectedRow)
                    })
                    // clearInterval(me.getLog(me.selectedRow))
                    // setInterval(me.getLog(me.selectedRow), 10000)
                    setTimeout(function () {
                        me.getLog(me.selectedRow)
                    }, 5000)
                }
            }
        },

        methods: {
            log_dialogShow(props) {
                var me = this
                me.log_dialog = true;
                this.getLog(props);
            },
            getLog(props) {
                var me = this
                me.selectedRow = props;
                // me.temp_log_name = listTmp.name;
                clearTimeout()

                me.logLoad = false;

                let types = me.types
                if (types == 'pod') {
                    types = 'pods'
                }

                let type = me.types
                if (type == 'deployment') {
                    type = 'deploy'
                }
                me.temp_log_name = props.item.name;

                this.$http.get(`${API_HOST}/kube/v1/${types}/namespaces/${props.item.namespace}/${types}/${props.item.name}/log?username=${this.$store.state.username}`)
                    .then(function (result) {
                        me.logLoad = false;
                        me.tmpLog = [];
                        if (result.data.length != undefined) {
                            me.tmpLog = [];
                            me.tmpLog = result.data.reverse();

                        }
                        // deployment
                        else {
                            me.tmpLog = {};
                            me.tmpLog["All"] = {};
                            let tmpLog = [];
                            let tmpKeys = []
                            Object.keys(result.data).forEach(function (keys) {
                                tmpKeys.push(keys)
                            })

                            Object.values(result.data).forEach(function (resultLog) {
                                resultLog.forEach(function (logItem) {
                                    tmpLog.push(logItem)
                                })
                            })

                            me.tmpLog["All"] = _.sortBy(tmpLog, 'dateTime').reverse();

                            tmpKeys.forEach(function (tmpKey) {
                                me.tmpLog[tmpKey] = _.sortBy(result.data[tmpKey], 'dateTime').reverse();
                            })
                        }
                        // // console.log(props)
                        //
                        // if(props.expanded == false || props.expanded == undefined) {
                        //     props.expanded = true
                        // }
                    })
            },
            codeModalShow() {
                this.plainText = '';
                this.$modal.show('codeModal');
            },
            codeModalhide() {
                this.$modal.hide('codeModal');
            },
            deleteModalShow(item) {
                this.selectedRow = item
                this.$modal.show('deleteModal');
            },
            deleteModalhide() {
                this.$modal.hide('deleteModal');
            },
            startSSE: function () {
                var me = this;
// var tmp = [];
                if (me.evtSource != null) {
                    me.evtSource.close()
                }

                if (me.namespace == 'All') {
                    me.evtSource = new EventSource(`${API_HOST}/kubesse/?host=${this.$store.state.kubeHost}&username=${this.$store.state.username}&instanceType=` + me.types)
                } else if (me.namespace != null) {
                    me.evtSource = new EventSource(`${API_HOST}/kubesse/?host=${this.$store.state.kubeHost}&username=${this.$store.state.username}&instanceType=` + me.types + '&namespace=' + me.namespace)
                }

                /*
                TODO : 이벤트 수정
                */
                me.evtSource.onmessage = function (e) {

                    var parseMessage = JSON.parse(e.data);

                    var tmpData = JSON.parse(parseMessage.message)
                    // console.log(tmpData)
                    var listIdTmp = [];
                    me.list.forEach(function (listData) {
                        listIdTmp.push(listData.id)
                    });

                    if (parseMessage.instanceType == 'status') {
                        if (parseMessage.host == 'Cluster') {
                            me.snackbar.text = `${tmpData.msg}`
                            me.snackbar.y = 'bottom'
                            me.snackbar.timeout = 6000
                            me.snackbar.status = true
                            me.snackbar.color = 'error'
                        }
                    } else {
                        me.list.some(function (listTmp, index) {
                            if (listIdTmp.includes(tmpData.id)) {
                                if (listTmp.name == tmpData.name && listTmp.namespace == tmpData.namespace) {
                                    if (listTmp.kind == 'Pod') {
                                        if (tmpData.apiVersion == 'DELETED') {
                                            tmpData["running"] = false;
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        } else {
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        }
                                    } else if (listTmp.kind == 'Deployment') {
                                        if (tmpData.apiVersion == 'DELETED') {
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        } else {
                                            if (tmpData.statusAvailableReplicas == tmpData.statusReadyReplicas && tmpData.statusReplicas == tmpData.statusUpdateReplicas && tmpData.statusReplicas == tmpData.statusReadyReplicas) {
                                                tmpData["running"] = false;
                                                me.list = [
                                                    ...me.list.slice(0, index),
                                                    tmpData,
                                                    ...me.list.slice(index + 1)
                                                ]
                                            } else {
                                                tmpData["running"] = true
                                                me.list = [
                                                    ...me.list.slice(0, index),
                                                    tmpData,
                                                    ...me.list.slice(index + 1)
                                                ]
                                            }
                                        }
                                    } else if (listTmp.kind == 'Service') {
                                        if (tmpData.apiVersion == 'DELETED') {
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        } else {
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        }
                                    }
                                }
                            } else if (!listIdTmp.includes(tmpData.id)) {
                                if (tmpData.apiVersion == 'DELETED') {
                                    me.list.some(function (listTmp, index) {
                                        if (listTmp.name == tmpData.name && listTmp.namespace == tmpData.namespace) {
                                            me.list = [
                                                ...me.list.slice(0, index),
                                                tmpData,
                                                ...me.list.slice(index + 1)
                                            ]
                                        }
                                    })
                                } else {
                                    tmpData["running"] = true;
                                    me.list.push(tmpData)
                                    listIdTmp.push(tmpData.id)
                                    return;
                                }
                            }
                        })
                    }
                }

                //     if (tmpData.instanceType == 'status') {
                //         me.list.some(function (listTmp, index) {
                //             if (listTmp.name == tmpData.name && listTmp.namespace == tmpData.namespace) {
                //                 me.list = [
                //                     ...me.list.slice(0, index),
                //                     tmpData,
                //                     ...me.list.slice(index + 1)
                //                 ]
                //                 me.tableLoad = false;
                //                 return;
                //             }
                //         })
                //     } else {

                // }
                // }

                me.evtSource.onerror = function (e) {
                    me.evtSource.close();

                    setTimeout(function () {
                        me.startSSE()
                    }, 2000)
                }
            },
            getList() {
                var me = this
                var getURLType
                this.list = [];
                if (me.types == 'pod') {
                    getURLType = me.types + 's'
                } else {
                    getURLType = me.types
                }

                if (me.namespace == 'All') {
                    me.$http.get(`${API_HOST}/kube/v1/` + getURLType)
                        .then((result) => {
                            var tmpData = result.data
                            var resultMap = []
                            var usedId = []
                            return new Promise((resolve, reject) => {
                                tmpData.forEach(function (sortingData) {
                                    if (!(usedId.includes(sortingData.id))) {
                                        resultMap.push(sortingData)
                                        usedId.push(sortingData.id)
                                    } else {
                                        resultMap.forEach(function (resultMapTmp, index) {
                                            if (resultMapTmp.id == sortingData.id) {
                                                if (resultMapTmp.apiVersion == 'DELETED') {
                                                    resultMap = [
                                                        ...resultMap.slice(0, index),
                                                        resultMapTmp,
                                                        ...resultMap.slice(index + 1)
                                                    ]
                                                } else if (sortingData.apiVersion == 'DELETED') {
                                                    resultMap = [
                                                        ...resultMap.slice(0, index),
                                                        sortingData,
                                                        ...resultMap.slice(index + 1)
                                                    ]
                                                } else {
                                                    if (Date.parse(resultMapTmp.createTime) < Date.parse(sortingData.createTime)) {
                                                        resultMap = [
                                                            ...resultMap.slice(0, index),
                                                            sortingData,
                                                            ...resultMap.slice(index + 1)
                                                        ]
                                                    }
                                                }
                                            }
                                        })
                                    }
                                })
                                resolve(resultMap)
                            }).then(function (resolveData) {
                                var deleteItemList = []
                                // // console.log(resolveData)
                                resolveData.forEach(function (deleteTmp, index) {
                                    if (deleteTmp.apiVersion == 'DELETED') {
                                        deleteItemList.push(deleteTmp)
                                    }
                                })
                                // me.evtSource.close()
                                me.startSSE()
                                me.list = _.difference(resolveData, deleteItemList)


                            })
                        })
                } else if (me.namespace != 'All') {
                    me.$http.get(`${API_HOST}/kube/v1/` + getURLType + '/namespaces/' + me.namespace)
                        .then((result) => {
                            var tmpData = result.data
                            var resultMap = []
                            var usedId = []
                            return new Promise((resolve, reject) => {
                                tmpData.forEach(function (sortingData) {
                                    if (!(usedId.includes(sortingData.id))) {
                                        resultMap.push(sortingData)
                                        usedId.push(sortingData.id)
                                    } else {
                                        resultMap.forEach(function (resultMapTmp, index) {
                                            if (resultMapTmp.id == sortingData.id) {
                                                if (resultMapTmp.apiVersion == 'DELETED') {
                                                    resultMap = [
                                                        ...resultMap.slice(0, index),
                                                        resultMapTmp,
                                                        ...resultMap.slice(index + 1)
                                                    ]
                                                } else if (sortingData.apiVersion == 'DELETED') {
                                                    resultMap = [
                                                        ...resultMap.slice(0, index),
                                                        sortingData,
                                                        ...resultMap.slice(index + 1)
                                                    ]
                                                } else {
                                                    if (Date.parse(resultMapTmp.createTime) < Date.parse(sortingData.createTime)) {
                                                        resultMap = [
                                                            ...resultMap.slice(0, index),
                                                            sortingData,
                                                            ...resultMap.slice(index + 1)
                                                        ]
                                                    }
                                                }
                                            }
                                        })
                                    }
                                })
                                resolve(resultMap)
                            }).then(function (resolveData) {
                                var deleteItemList = []
                                // // console.log(resolveData)
                                resolveData.forEach(function (deleteTmp, index) {
                                    if (deleteTmp.apiVersion == 'DELETED') {
                                        deleteItemList.push(deleteTmp)
                                    }
                                })

                                me.startSSE()
                                // let tmpList = _.difference(resolveData, deleteItemList)
                                // tmpList.forEach(function (item) {
                                //     item['running'] = false;
                                // })
                                me.list = _.difference(resolveData, deleteItemList)
                                // me.searched = me.list
                            })
                        })
                }
            },
            handleDelete(item) {
                var me = this
                var getURLType

                me.list.some(function (items, index) {
                    if (me.selectedRow.name == items.name && me.selectedRow.namespace == items.namespace) {
                        me.list[index]['running'] = true;
                    }
                })

                if (me.types == 'pod') {
                    getURLType = me.types + 's'
                } else {
                    getURLType = me.types
                }
                me.$http.delete(`${API_HOST}/kube/v1/` + getURLType + '/namespaces/' + item.namespace + '/' + item.name, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                ).then(function () {
                    me.snackbar.text = me.types.toUpperCase() + '삭제 진행중입니다.'
                    me.snackbar.x = 'right'
                    me.snackbar.y = 'top'
                    me.snackbar.timeout = 6000
                    me.snackbar.status = true
                    me.snackbar.color = 'cyan darken-2'

                    me.status = ''
                    me.deleteModalhide()
                })
            },
            handleEdit(item) {
                var me = this
                // me.visible = true
                me.codeModalShow()

                var yamlData = item.sourceData
                me.selectedRow = item
                me.plainText = json2yaml.stringify(JSON.parse(yamlData))
                    .replace(/- \n[ ]+/g, '- ')
                    .replace(/\\"/g, '\'')
            },
            postYAML() {
                var me = this
                me.$EventBus.$emit('postYAML')
                var nameSpace = me.namespace;
                if (nameSpace == 'All') {
                    nameSpace = 'default'
                }

                if (me.status == 'edit') {
                    me.snackbar.text = me.types.toUpperCase() + '수정 진행중입니다.'
                    me.snackbar.x = 'right'
                    me.snackbar.y = 'top'
                    me.snackbar.timeout = 6000
                    me.snackbar.color = 'info'
                    me.snackbar.status = true
                } else if (me.status == 'add') {
                    me.snackbar.text = me.types.toUpperCase() + '추가 진행중입니다.'
                    me.snackbar.x = 'right'
                    me.snackbar.y = 'top'
                    me.snackbar.timeout = 6000
                    me.snackbar.color = 'info'
                    me.snackbar.status = true
                }

                var me = this;
                var postText

                if (me.plainText.includes('}n')) {
                    postText = me.plainText.replace('}n', '}')
                } else {
                    postText = me.plainText
                }

                var jsonYaml = yaml.load(postText)

                me.codeModalhide()

                var getURLType;
                if (me.types == 'pod') {
                    getURLType = me.types + 's'
                } else {
                    getURLType = me.types
                }

                if (me.status == 'add') {
                    me.$http.post(`${API_HOST}/kube/v1/` + getURLType + '/namespaces/' + nameSpace, jsonYaml, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    ).then(function () {
                        me.snackbar.text = me.types.toUpperCase() + ' 추가중입니다..'
                        me.snackbar.x = 'right'
                        me.snackbar.y = 'top'
                        me.snackbar.timeout = 6000
                        me.snackbar.status = true
                        me.snackbar.color = 'success'
                        me.status = ''
                    })
                } else if (me.status == 'edit') {
                    me.$http.put(`${API_HOST}/kube/v1/` + getURLType + '/namespaces/' + nameSpace + '/' + me.selectedRow.name, jsonYaml, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    ).then(function () {
                        me.snackbar.text = me.types.toUpperCase() + '수정중입니다..'
                        me.snackbar.x = 'right'
                        me.snackbar.y = 'top'
                        me.snackbar.timeout = 6000
                        me.snackbar.status = true
                        me.snackbar.color = 'success'
                        me.status = ''

                        me.list.some(function (item, index) {
                            if (me.selectedRow.name == item.name && me.selectedRow.namespace == item.namespace) {
                                me.list[index]['running'] = true;
                            }
                        })
                    })
                }
            }
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="css">
    .CodeMirror {
        height: 500px !important;
    }

    .v-card__text {
        padding: 0px !important;
    }

    .v-card__actions {
        text-align: right !important;
    }

    .deletedItem {
        text-decoration: line-through;
    }
    #box
    {
        position: absolute;
        width: 500px;
        height: 500px;
        left: 50%;
        top: 100%;
        margin-left: -250px;
        margin-top: -250px;
    }
</style>
