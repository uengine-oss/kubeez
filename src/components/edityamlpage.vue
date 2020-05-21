<template>
    <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
            <v-flex grow style="max-width: 65%">
                <v-card flat>
                    <v-card-text>
                        <codemirror
                                ref="myCm"
                                :options="{
                                    theme: 'darcula',
                                    lineNumbers: true,
                                    lineWrapping: true,
                                    }"
                                :value="yaml_text"
                                v-model="yaml_text"
                                @focus="onYamlFocus()"
                        >
                        </codemirror>
                        <v-layout row wrap>
                            <v-flex xs4>
                                <v-btn v-if="importFile == false" color="success" block @click="importFile = true">
                                    LocalFile
                                </v-btn>
                                <text-reader
                                        v-if="importFile == true"
                                        :fileName.sync="fileName"
                                        :plainText.sync="yaml_text"
                                        :importType="'yaml'"
                                        @load="yaml_text = $event">
                                </text-reader>
                            </v-flex>
                            <v-flex xs4>
                                <v-btn color="success" block @click="download">Download</v-btn>
                            </v-flex>
                            <v-flex xs4>
                                <v-btn color="info" block @click="$EventBus.$emit('deployStart')">Deploy
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex shrink style="width: 35%;">
                <v-card flat>
                    <v-card-text>
                        <template v-for="item in ui_list">
                            <v-text-field
                                    v-if="item.ui_type=='string' && status =='add' && item.ui_name.includes('name')"
                                    :label="item.ui_name"
                                    v-model="item.val"
                                    @focus="onUiFocus()"
                            ></v-text-field>
                            <v-autocomplete v-if="item.ui_type == 'list'&& status =='add'" :items="depList"
                                            :label="item.ui_name" v-model="item.val"
                                            @focus="onUiFocus()"></v-autocomplete>
                            <v-text-field
                                    v-if="item.ui_type=='string' && status =='edit' && item.ui_name.includes('name')"
                                    :label="item.ui_name"
                                    v-model="item.val"
                                    @focus="onUiFocus()"
                                    readonly
                            ></v-text-field>
                            <v-text-field
                                    v-if="item.ui_type=='string' && status !='edit' && !item.ui_name.includes('name')"
                                    :label="item.ui_name"
                                    v-model="item.val"
                                    @focus="onUiFocus()"
                            ></v-text-field>
                            <v-text-field v-else-if="item.ui_type=='number'"
                                          v-model="item.val" @focus="onUiFocus()"
                                          type="number"
                                          :label='item.ui_name'
                            ></v-text-field>
                            <v-select
                                    v-if="item.ui_type=='select' && status !='edit' && !item.ui_name.includes('name')"
                                    :items="items"
                                    :label="item.ui_name"
                                    v-model="item.val"
                                    @focus="onUiFocus()"
                                    label="Service Type"
                            ></v-select>
                        </template>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<style>
    .CodeMirror-scroll {
        text-align: left;
    }
</style>

<script>
    var FileSaver = require('file-saver');

    // @ is an alias to /src
    import TextReader from "@/components/yaml.vue";
    import yaml from 'js-yaml'
    import json2yaml from 'json2yaml'
    import 'vue-codemirror'
    import 'codemirror/mode/yaml/yaml.js'
    import 'codemirror/theme/darcula.css'
    import {codemirror} from 'vue-codemirror'
    import {saveAs} from 'file-saver';

    export default {
        name: 'EditYaml',
        props:
            ['plainText', 'types', 'status','namespace'],
        data() {
            return {
                fab: false,
                temp_text: "",
                ui_list: [],
                yaml_text: "",
                json_data: "",
                cursor_pos: "",
                channel: "yaml",
                auto_edit: true,
                importFile: false,
                items: ['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName'],
                depList: []
            }
        },
        created: function () {
            var me = this
            me.$EventBus.$on('postYAML', function () {
                me.$emit('update:plainText', me.yaml_text)
            });
            if (me.status == 'add') {
                if (me.types == 'pod') {
                    me.createPod()
                } else if (me.types == 'service') {
                    me.createService()
                    var namespace = me.namespace
                    if (namespace == 'All') {
                        namespace = 'default'
                    }
                    me.$http.get(`${API_HOST}/kube/v1/` + me.types + '/namespaces/' + namespace)
                        .then((result) => {
                            result.data.forEach(function (dep) {
                                me.depList.push(dep.name)
                            })
                        })
                } else if (me.types == 'deployment') {
                    me.createDeployment()
                }
            }
        },
        beforeDestroy: function () {
            var me = this
            // console.log("destory")
            this.$EventBus.$off('postYAML')
            // this.$EventBus.$off('deployStart')
        },
        computed: {
            codemirror: function () {
                return this.$refs.myCm.codemirror;
            },
            activeFab() {
                switch (this.tabs) {
                    case 'one':
                        return {'class': 'purple', icon: 'account_circle'}
                    case 'two':
                        return {'class': 'red', icon: 'edit'}
                    case 'three':
                        return {'class': 'green', icon: 'keyboard_arrow_up'}
                    default:
                        return {}
                }
            },
            fileName: {
                get: function () {
                    var me = this
                    var result;

                    me.ui_list.some(function (listTmp) {
                        if (listTmp.ui_name.includes('name')) {
                            return result = listTmp.val;
                        }
                    })

                    return result;
                },
                set: function (newVal) {
                    var me = this
                    me.ui_list.some(function (listTmp) {
                        if (listTmp.ui_name.includes('name')) {
                            listTmp.val = newVal;
                            return me.uiToJson()
                        }
                    })
                }
            }
        },
        components: {
            TextReader,
            yaml,
            json2yaml,
            codemirror,
            saveAs
        },
        methods: {
            createPod() {
                let me = this
                me.ui_list = [
                    {
                        key_lists: [
                            "metadata,name",
                            "metadata,labels,name",
                            "spec,containers,0,name"
                        ],
                        ui_name: "pod name",
                        ui_type: "string",
                        val: "name",
                    },
                    {
                        key_lists: [
                            "spec,containers,0,ports,0,containerPort"
                        ],
                        ui_name: "pod port",
                        ui_type: "number",
                        val: "0",
                    },
                    {
                        key_lists: [
                            "spec,containers,0,image"
                        ],
                        ui_name: "pod image",
                        ui_type: "string",
                        val: "image",
                    },
                ]

                me.yaml_text =
                    "apiVersion: v1\n" +
                    "kind: Pod\n" +
                    "metadata:\n" +
                    "  name: \n" +
                    "  labels:\n" +
                    "    name: \n" +
                    "spec:\n" +
                    "  containers:\n" +
                    "  - name: \n" +
                    "    image: \n" +
                    "    ports:\n" +
                    "    - containerPort: 80"

            },
            download() {
                var me = this;

                var text = me.yaml_text;

                var filename = me.fileName + '.yaml';


                var file = new File([text], filename, {type: "text/yaml;charset=utf-8"});
                FileSaver.saveAs(file);
            },
            onYamlFocus() {
                let me = this
                me.channel = 'yaml'
            },
            onUiFocus() {
                let me = this;
                me.channel = 'ui'
            },
            modifyJson(json_data, key_list, modify_data) {
                let me = this
                if (key_list.length <= 0) {
                    json_data = modify_data
                } else {
                    let find = key_list.splice(0, 1)
                    if (json_data[find] == null)
                        json_data[find] = {}
                    json_data[find] = me.modifyJson(json_data[find], key_list, modify_data)
                }
                return json_data
            },
            findJson(json_data, key_list) {
                let me = this
                let find = key_list.splice(0, 1)
                if (key_list.length <= 0) {
                    return json_data[find]
                } else {
                    if (json_data[find] == null)
                        json_data[find] = {}
                    return me.findJson(json_data[find], key_list)
                }
            },
            uiToJson() {
                let me = this
                let json = JSON.parse(JSON.stringify(me.json_data))
                let ui_list = me.ui_list
                for (let idx in ui_list) {
                    let item = ui_list[idx]
                    let val = item.val
                    let key_lists = item.key_lists
                    for (let i in key_lists) {
                        let key_list = key_lists[i].split(',')
                        json = me.modifyJson(json, key_list, val)
                    }
                }
                me.json_data = json
            },
            getArrVal(arr, val) {
                for (let i in arr) {
                    if (arr[i] != val) {
                        return arr[i]
                    }
                }
                return val
            },
            compareArrVals(arr) {
                let start = arr.splice(0, 1)
                for (let i in arr) {
                    if (arr[i] != start) {
                        return false
                    }
                }
                return true
            },
            jsonToUi() {
                let me = this
                let json = JSON.parse(JSON.stringify(me.json_data))
                let ui_list = me.ui_list
                for (let idx in ui_list) {
                    let item = ui_list[idx]
                    let val = item.val
                    let key_lists = item.key_lists
                    let val_list = []
                    for (let i in key_lists) {
                        let key_list = key_lists[i].split(',')
                        val_list.push(me.findJson(json, key_list))
                    }
                    let newVal = me.getArrVal(val_list, val)
                    me.ui_list[idx].val = newVal
                    if (!me.compareArrVals(val_list)) {
                        for (let i in key_lists) {
                            let key_list = key_lists[i].split(',')
                            json = me.modifyJson(json, key_list, newVal)
                        }
                        me.json_data = json
                    }
                }
            },
            yamlFilter(yaml_text) {
                // if(yaml_text.match('---')) {
                // yaml_text = yaml_text.replace(/"/g, '')
                // yaml_text = yaml_text.replace(/- \n[ ]+/g, '- ')
                let lines = yaml_text.split('\n')
                lines.splice(0, 1)
                for (let i in lines) {
                    lines[i] = lines[i].substring(2, lines[i].length)
                }
                yaml_text = lines.join('\n')
                yaml_text = yaml_text.replace(/ null/g, ' ')
                return yaml_text
                // }
            },
            createDeployment() {
                let me = this
                me.ui_list = [
                    {
                        key_lists: [,
                            'metadata,name',
                            "metadata,labels,app",
                            "spec,selector,matchLabels,app",
                            "spec,template,metadata,labels,app",
                            "spec,template,spec,containers,0,name"
                        ],
                        ui_name: "deployment name",
                        ui_type: "string",
                        val: "name",
                    },
                    {
                        key_lists: [
                            "spec,template,spec,containers,0,image"
                        ],
                        ui_name: "image",
                        ui_type: "string",
                        val: "image_name",
                    },
                    {
                        key_lists: [
                            "spec,replicas"
                        ],
                        ui_name: "replicas",
                        ui_type: "number",
                        val: "1",
                    },
                    {
                        key_lists: [
                            "spec,template,spec,containers,0,ports,0,containerPort"
                        ],
                        ui_name: "port",
                        ui_type: "number",
                        val: "80",
                    }
                ];
                me.yaml_text =
                    "apiVersion: apps/v1\n" +
                    "kind: Deployment\n" +
                    "metadata:\n" +
                    "  name: \n" +
                    "  labels:\n" +
                    "    app: \n" +
                    "spec:\n" +
                    "  selector:\n" +
                    "    matchLabels:\n" +
                    "      app:  \n" +
                    "  replicas: 1\n" +
                    "  template:\n" +
                    "    metadata:\n" +
                    "      labels: \n" +
                    "          app: \n" +
                    "    spec:\n" +
                    "      containers:\n" +
                    "        - name: \n" +
                    "          image: \n" +
                    "          ports: \n" +
                    "            - containerPort: 80"
                ;
            },
            createService() {
                let me = this
                me.ui_list = [
                    {
                        key_lists: [
                            "metadata,name",
                            "metadata,labels,app"
                        ],
                        ui_name: "service name",
                        ui_type: "string",
                        val: "name",
                    },
                    {
                        key_lists: [
                            "spec,type"
                        ],
                        ui_name: "service type",
                        ui_type: "select",
                        val: "",
                    },
                    {
                        key_lists: [
                            "spec,selector,app"
                        ],
                        ui_name: "deployment name",
                        ui_type: "list",
                        val: "dep",
                    },
                    {
                        key_lists: [
                            "spec,ports,0,port"
                        ],
                        ui_name: "port",
                        ui_type: "number",
                        val: "80",
                    },
                    {
                        key_lists: [
                            "spec,ports,0,targetPort"
                        ],
                        ui_name: "target port",
                        ui_type: "number",
                        val: "80",
                    },
                ];
                me.yaml_text =
                    "apiVersion: v1\n" +
                    "kind: Service\n" +
                    "metadata:\n" +
                    "  name: \n" +
                    "  labels:\n" +
                    "    app: \n" +
                    "spec:\n" +
                    "  type:\n" +
                    "  ports:\n" +
                    "    - port: 80\n" +
                    "      targetPort: 80\n" +
                    "  selector:\n" +
                    "    app: "
            },
            newLoad(data) {
                let me = this
                let json
                if (data == 'object') {
                    json = data
                } else {
                    try {
                        json = yaml.load(data)
                    } catch (e) {
                        return
                    }
                }

                let type = json["kind"]
                let ui = [
                    {
                        key_lists: [
                            "metadata,name",
                        ],
                        ui_name: type + " main name",
                        ui_type: "string",
                        val: me.findJson(json, "metadata,name".split(','))
                    }
                ];

                if (type.toLowerCase() == 'service') {
                    ui.push({
                        key_lists: [
                            "spec,selector,app"
                        ],
                        ui_name: "deployment name",
                        ui_type: "string",
                        val: me.findJson(json, "spec,selector,app".split(','))
                    })
                    ui.push(
                        {
                            key_lists: [
                                "spec,ports,0,port"
                            ],
                            ui_name: "port",
                            ui_type: "number",
                            val: me.findJson(json, "spec,ports,0,port".split(',')),
                        })
                    ui.push(
                        {
                            key_lists: [
                                "spec,ports,0,targetPort"
                            ],
                            ui_name: "target port",
                            ui_type: "string",
                            val: me.findJson(json, "spec,ports,0,targetPort".split(',')),
                        })
                    ui.push(
                        {
                            key_lists: [
                                "spec,type"
                            ],
                            ui_name: "type",
                            ui_type: "string",
                            val: me.findJson(json, "spec,type".split(',')),
                        })
                } else if (type.toLowerCase() == 'deployment') {
                    ui.push({
                        key_lists: [
                            "spec,template,spec,containers,0,image"
                        ],
                        ui_name: "image",
                        ui_type: "string",
                        val: me.findJson(json, "spec,template,spec,containers,0,image".split(','))
                    })
                    ui.push({
                        key_lists: [
                            "spec,replicas"
                        ],
                        ui_name: "replicas",
                        ui_type: "number",
                        val: me.findJson(json, "spec,replicas".split(','))
                    })
                    // ui.push({
                    //     key_lists: [
                    //         "spec,template,spec,containers,0,ports,0,containerPort"
                    //     ],
                    //     ui_name: "port",
                    //     ui_type: "number",
                    //     val: me.findJson(json, "spec,template,spec,containers,0,ports,0,containerPort".split(','))
                    // })
                } else if (type.toLowerCase() == 'pod') {
                    ui.push(
                        {
                            key_lists: [
                                "spec,containers,0,ports,0,containerPort"
                            ],
                            ui_name: "pod port",
                            ui_type: "number",
                            val: me.findJson(json, "spec,containers,0,ports,0,containerPort".split(',')),
                        })
                    ui.push({
                        key_lists: [
                            "spec,containers,0,image"
                        ],
                        ui_name: "pod image",
                        ui_type: "string",
                        val: me.findJson(json, "spec,containers,0,image".split(',')),
                    })
                }
                me.ui_list = ui;
            },
            templateLoad() {
                var me = this;
                if (me.types == 'pod') {
                    me.createPod()
                } else if (me.types == 'deployment') {
                    me.createDeployment()
                } else if (me.types == 'service') {
                    me.createService()
                }
            }
        },
        watch: {
            plainText: {
                immediate: true,
                handler(newVal, oldVal) {
                    var me = this
                    if (newVal != '') {
                        me.newLoad(newVal)
                        if (oldVal == undefined) {
                            me.yaml_text = me.yamlFilter(newVal)
                        }
                        // else {
                        //     me.yaml_text = newVal
                        // }
                        me.json_data = yaml.load(newVal)
                    }
                }
            },
            yaml_text: {
                // immediate: true,
                handler(newVal) {
                    if (newVal != '') {
                        var me = this
                        // // console.log(newVal)
                        if (me.auto_edit) {
                            try {
                                if (!(me.yaml_text == me.temp_text)) {
                                    me.temp_text = me.yaml_text
                                    me.cursor_pos = me.codemirror.getCursor("start")
                                    me.json_data = yaml.load(me.yaml_text)
                                }
                                me.jsonToUi()
                                this.$nextTick(function () {
                                    me.codemirror.setCursor(me.cursor_pos)
                                    me.codemirror.refresh()

                                });
                            } catch (e) {
                            }
                        }
                    }
                }
            },
            ui_list: {
                handler: function () {
                    let me = this
                    if (me.channel == 'ui') {
                        me.uiToJson()
                    }
                    for (let idx in me.ui_list) {
                        let znum = (me.ui_list[idx].val)//.toString().match(/0[0-9]+/)
                        if (typeof  znum == 'string') {
                            let check_str = znum.match(/^0[0-9]+/)
                            if (check_str)
                                me.ui_list[idx].val = parseInt(check_str)
                        }
                    }
                    let yaml_text = json2yaml.stringify(JSON.parse(JSON.stringify(me.json_data)))
                    me.yaml_text = me.yamlFilter(yaml_text)
                    // // console.log(me.yaml_text)
                    // me.$nextTick(function () {
                    //     // console.log(me.yaml_text)
                    // })
                },
                deep: true
            },
        }
    }


</script>
