<template>
    <div>
        <v-dialog
            v-model="attrDialog"
            width="500">
            
            <template v-slot:activator="{ on, attrs }">
                <v-btn 
                        dark 
                        rounded 
                        color="primary"
                        v-on="on" 
                        v-bind="attrs"
                        @click="attrDialog = true">
                    ADD ATTRIBUTE
                </v-btn>
            </template>
            
            <v-card>
                <v-card-title class="headline">ADD ATTRIBUTE</v-card-title>
                <v-card-text>
                    <v-autocomplete
                            filled
                            label="Select Attribute"
                            :items="attrList"
                            v-model="searchKey"
                    ></v-autocomplete>

                    <yaml-editor
                            v-if="attrVal"
                            v-model="attrVal">
                    </yaml-editor>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="attrDialog = false">Cancel</v-btn>
                    <v-btn color="green darken-1" text @click="addAttribute">ADD</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import YamlEditor from "./KubeYamlEditor";

    export default {
        name: 'attr-field',
        props: {
            value: Object,
        },
        components: {
            "yaml-editor": YamlEditor,
        },
        data() {
            return {
                attrDialog: false,
                attrList: [],
                attrKey: "",
                attrVal: null
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
            }
        },
        mounted() {
            var me = this;
            me.getAttrList();
        },
        methods: {
            getAttrList(keyArr, obj) {
                var me = this;
                var keyArr = keyArr || Object.keys(me.value.advancedAttributePaths);
                var obj = obj || me.value.advancedAttributePaths;

                for (var key in obj) {
                    var keyPath = me.getPath(key, "", me.value.advancedAttributePaths);
                    keyArr = keyArr.concat(keyPath);
                    if(typeof obj[key] == "object") {
                        return me.getAttrList(keyArr, obj[key]);
                    }
                }
                me.attrList = keyArr;
            },
            getPath(searchKey, parentKey, obj) {
                var me = this;
                var res = "";
                var parentKey = parentKey || "";

                for (var key in obj) {
                    if(key == searchKey) {
                        res = parentKey + key;
                    } else {
                        if(typeof obj[key] == "object") {
                            parentKey += key + '.';
                            return me.getPath(searchKey, parentKey, obj[key]);
                        }
                    }
                }
                return res;
            },
            setAttribute(val) {
                var me = this;
                var attrList = Object.entries(me.value.advancedAttributePaths);
                attrList.forEach(([key, value]) => {
                    if(key == val || val.includes(key)) {
                        me.attrKey = key;
                        me.attrVal = value;
                    }
                });
            },
            addAttribute() {
                var me = this;
                me.value.object.metadata.name = me.value.object.metadata.name + ","
                me.$nextTick(function () {
                    _.set(me.value.object, me.attrKey, me.attrVal);
                    me.value.object.metadata.name = (me.value.object.metadata.name).replace(',', '')
                });
                me.attrDialog = false;
            }
        }
    }
</script>

<style>

</style>