<template>
    <div>
        <v-dialog
                v-model="attrDialog"
                width="500">

            <template v-slot:activator="{ on, attrs }">
                <div>
                    <div v-for="(item, idx) in userDefinedAttributes" :key="idx">
                        <v-text-field
                                v-if="item.type == 'String'"
                                :label="item.label"
                                v-model="userDefinedAttrVal[item.key]"
                                :disabled="readOnly"
                                @keyup="updateValue(item.key, userDefinedAttrVal[item.key], item.type)">
                            <template v-slot:append-outer>
                                <v-icon small @click="deleteAttr(item)">mdi-delete-forever</v-icon>
                            </template>
                        </v-text-field>
                        
                        <v-text-field
                                v-if="item.type == 'Number'"
                                :label="item.label"
                                type="number"
                                :disabled="readOnly"
                                v-model="userDefinedAttrVal[item.key]"
                                @keyup="updateValue(item.key, userDefinedAttrVal[item.key], item.type)"
                                @click="updateValue(item.key, userDefinedAttrVal[item.key], item.type)">
                            <template v-slot:append-outer>
                                <v-icon small @click="deleteAttr(item)">mdi-delete-forever</v-icon>
                            </template>
                        </v-text-field>
                        
                        <v-checkbox
                                v-if="item.type == 'Boolean'"
                                :label="item.label"
                                :disabled="readOnly"
                                v-model="userDefinedAttrVal[item.key]"
                                @change="updateValue(item.key, userDefinedAttrVal[item.key], item.type)">
                            <template v-slot:append-outer>
                                <v-icon small @click="deleteAttr(item)">mdi-delete-forever</v-icon>
                            </template>
                        </v-checkbox>

                        <div v-if="item.type == 'Key & Value'">
                            <span>{{item.label}}</span>
                            <v-text-field
                                    label="Key"
                                    v-model="definedKey"
                                    :disabled="readOnly">
                                <template v-slot:append-outer>
                                    <v-icon small @click="deleteAttr(item)">mdi-delete-forever</v-icon>
                                </template>
                            </v-text-field>
                            <v-text-field
                                    dense
                                    label="Value"
                                    v-model="definedValue"
                                    :disabled="readOnly"
                                    @keydown.enter="updateValue(definedKey, definedValue, item.type, item); definedKey = ''; definedValue = '';"
                            ></v-text-field>
                        </div>
                    </div>
                </div>

                <v-btn
                        text
                        dark
                        color="primary"
                        :disabled="readOnly"
                        v-on="on"
                        v-bind="attrs"
                        @click="attrDialog = true">
                    ADD ATTRIBUTE
                </v-btn>
            </template>

            <v-card>
                <v-card-title class="headline">
                    <v-tabs>
                        <v-tab @click="isAddAttr=true;">ADD ATTRIBUTE</v-tab>
                        <v-tab @click="isAddAttr=false; attrKey=''; attrVal='';">USER DEFINED</v-tab>
                    </v-tabs>
                </v-card-title>
                
                <v-card-text v-if="isAddAttr">
                    <v-autocomplete
                            filled
                            label="Select Attribute"
                            :disabled="readOnly"
                            :items="attrList"
                            v-model="searchKey"
                    ></v-autocomplete>

                    <MonacoEditor 
                            v-if="attrVal"
                            v-model="attrVal"
                            theme="vs-dark"
                            class="editor"
                            language="yaml"
                    ></MonacoEditor>
                </v-card-text>

                <v-card-text v-else>
                    <v-text-field
                            filled
                            label="Label (e.g. Template Labels)"
                            v-model="attrLabel"
                    ></v-text-field>
                    <v-text-field
                            filled
                            label="Attribute Key (e.g. spec.template.metadata.labels)"
                            v-model="attrKey"
                    ></v-text-field>
                    <v-select
                            filled
                            label="Attribute Value Type"
                            v-model="attrValType"
                            :items="typeList"
                    ></v-select>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text :disabled="readOnly" @click="attrDialog = false">Cancel</v-btn>
                    <v-btn color="green darken-1" text  :disabled="readOnly" @click="addAttribute">ADD</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import MonacoEditor from 'vue-monaco';
    import json2yaml from 'json2yaml'
    import yaml from "js-yaml";

    export default {
        name: 'kube-attr-field',
        props: {
            value: Object,
            readOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
        },
        components: {
            MonacoEditor,
        },
        data() {
            return {
                attrDialog: false,
                isAddAttr: true,
                attrList: [],
                attrKey: "",
                attrVal: null,
                typeList: [ "String", "Number", "Boolean", "Key & Value" ],
                attrLabel: "",
                attrValType: "",
                userDefinedAttributes: [],
                userDefinedAttrVal: {},
                definedKey: "",
                definedValue: "",
            }
        },
        computed: {
            searchKey: {
                get() {
                    return null
                },
                set(val) {
                    var me = this;
                    me.setAttribute(val);
                }
            },
        },
        mounted() {
            var me = this;
            me.getAttrList();
            
            var definedAttrList = localStorage.getItem('userDefinedAttributes_' + me.value._type);
            if(definedAttrList != null) {
                me.userDefinedAttributes = JSON.parse(definedAttrList);
            }
        },
        methods: {
            getAttrList(keyArr, valArr) {
                var me = this;
                if(!keyArr && !valArr && !me.value.advancedAttributePaths) {
                    return
                }
                var keyArr = keyArr || Object.keys(me.value.advancedAttributePaths);
                var valArr = valArr || Object.values(me.value.advancedAttributePaths);

                valArr.forEach((val) => {
                    if (val) {
                        if (typeof val == "object") {
                            var arr = Object.keys(val);
                            arr.forEach((item) => {
                                keyArr = keyArr.concat(me.getPath(item, "", me.value.advancedAttributePaths));
                            });
                            return me.getAttrList(keyArr, Object.values(val));
                        } else {
                            me.attrList = keyArr;
                        }
                    }
                });
            },
            getPath(searchKey, parentKey, obj) {
                var me = this;
                var res = "";
                var parentKey = parentKey || "";

                for (const [key, value] of Object.entries(obj)) {
                    if (key == searchKey) {
                        res = parentKey + key;
                    } else {
                        if (typeof value == "object") {
                            if(value.hasOwnProperty(searchKey)) {
                                parentKey = key + '.';
                                return me.getPath(searchKey, parentKey, value);
                            }
                        }
                    }
                }
                return res;
            },
            setAttribute(val) {
                var me = this;
                var attrList = Object.entries(me.value.advancedAttributePaths);
                attrList.forEach(([key, value]) => {
                    if (key == val || val.includes(key)) {
                        me.attrKey = key;
                        me.attrVal = json2yaml.stringify(value);
                    }
                });
            },
            addAttribute() {
                var me = this;
                if(!me.isAddAttr) {
                    me.addUserDefinedAttr(me.attrKey, me.attrValType, me.attrLabel);
                    return;
                }
                me.value.object.metadata.name = me.value.object.metadata.name + ",";
                me.$nextTick(function () {
                    _.set(me.value.object, me.attrKey, yaml.load(me.attrVal));
                    me.value.object.metadata.name = (me.value.object.metadata.name).replace(',', '');
                    me.attrList = [];
                    me.attrKey = "";
                    me.attrVal = "";
                    me.getAttrList();
                });
                me.attrDialog = false;
            },
            addUserDefinedAttr(key, type, label) {
                var me = this;
                me.userDefinedAttributes.push({
                    "key": key,
                    "type": type,
                    "label": label,
                });
                localStorage['userDefinedAttributes_' + me.value._type] = JSON.stringify(me.userDefinedAttributes);
                me.attrKey = "";
                me.attrLabel = "";
                me.attrValType = "";
                me.attrDialog = false;
            },
            updateValue(key, value, type, item) {
                var me = this;
                if(type == "Number") {
                    value = Number(value);
                } else if(type == "Boolean") {
                    value = value == 1 ? true : false;
                }
                if(type == "Key & Value") {
                    key = item.key + "." + key
                }
                _.set(me.value.object, key, value);
                
                me.value.object.metadata.name = me.value.object.metadata.name + ",";
                me.$nextTick(function () {
                    me.value.object.metadata.name = (me.value.object.metadata.name).replace(',', '');
                });
            },
            deleteAttr(val) {
                var me = this;
                var attrType = 'userDefinedAttributes_' + me.value._type;
                me.userDefinedAttributes.splice(me.userDefinedAttributes.indexOf(val), 1);
                localStorage.removeItem(attrType);
                localStorage[attrType] = JSON.stringify(me.userDefinedAttributes);
            }
        },
        watch: {
            'value.advancedAttributePaths': {
                deep: true,
                handler() {
                    var me = this;
                    me.getAttrList();
                }
            }
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
    .editor {
        width: 435px;
        height: 250px;
    }
</style>