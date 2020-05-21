<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right v-bind:style="{width: widthScale}">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-title class="headline">{{ titleName }}
                    </v-list-item-title>
                    <v-tooltip v-model="show" top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon @click.native="closePanel()">
                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                            </v-btn>
                            <v-btn icon v-on="on">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ getDescriptionText }}</span>
                    </v-tooltip>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap>
                    <v-flex grow style="width: 500px;">
                        <v-card flat>
                            <v-card-text>
                                <codemirror
                                        ref="myCm"
                                        :options="{
                                            theme: 'darcula',
                                            lineNumbers: true,
                                            lineWrapping: true,
                                        }"
                                        :value="copyElement.yaml_text"
                                        v-model="copyElement.yaml_text"
                                        @focus="onYamlFocus()"
                                >
                                </codemirror>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex shrink style="width: 300px;">
                        <v-card flat>
                            <v-card-text>
                                <template v-for="item in copyElement.properties">
                                    <v-text-field
                                        v-if="item.type =='string' && value.status =='add'"
                                        :label="item.name"
                                        v-model="item.val"
                                        @focus="onUiFocus()"
                                    ></v-text-field>
                                    <v-text-field
                                        v-if="item.type =='string' && value.status =='edit'"
                                        :label="item.name"
                                        v-model="item.val"
                                        @focus="onUiFocus()"
                                        readonly
                                    ></v-text-field>
                                    <v-text-field
                                        v-if="item.type =='number'"
                                        :label="item.name"
                                        v-model="item.val"
                                        type="number"
                                        @focus="onUiFocus()"
                                    ></v-text-field>
                                </template>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import yaml from "js-yaml";

    var _ = require('lodash')
    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');
    var pluralize = require('pluralize');
    //https://www.npmjs.com/package/change-case
    import draggable from 'vuedraggable'
    import firebase from 'firebase'
    import json2yaml from "json2yaml";
    import {codemirror} from "vue-codemirror";


    export default {
        name: 'modeling-property-panel',
        props: {
            value: Object,
            titleName: String,
            img: String,
        },
        components: {
            draggable,
            yaml,
            json2yaml,
            codemirror
        },
        computed: {
            getDescriptionText() {
                var me = this
                if (me.value._type == 'Service') {
                    return 'Service'
                } else if (me.value._type == 'Deployment') {
                    return 'Deployment'
                }
                
                return ''
            },

            widthScale: function () {
                var me = this;
                if (me.value._type == 'org.uengine.modeling.model.View') {
                    return 500
                } else {
                    return 800
                }
            },

            codemirror: function () {
                return this.$refs.myCm.codemirror;
            },
        },
        data: function () {
            return {
                show: false,
                navigationDrawer: false,
                _item: this.value,
                preventWatch: false,
                x: null,
                y: null,
                width: null,
                height: null,
                style: [],
                drag: false,
                translateText: '',
                usedTranslate: false,
                isRead: false,
                //new
                namePanel: '',

                copyElement: {},
                parmUid: '',
                parmType: '',

                temp_text: '',
                cursor_pos: '',
                channel: '',
                auto_edit: true,
            }
        },
        beforeDestroy() {
            var me = this
            var projectId = this.$route.params.projectId
            var projectVer = this.$route.params.projectVersion
            // var designer = this.$parent.getComponent('modeling-designer')

            // me.checkValue =true
            me.setNameCase(me.namePanel)

            this.$emit('changed', me.copyElement);


            // firebase.database()
            //     .ref("/saver/multi/" + projectId + "/" + projectVer + '/participants/')
            //     .child(localStorage.getItem('uid'))
            //     .update({
            //         'nowLocation': '',
            //     })

        },
        created: function () {
            var me = this
            var designer = this.$parent.getComponent('modeling-designer')
            var projectId = this.$route.params.projectId
            var projectVer = this.$route.params.projectVersion

            me.parmUid = this.$route.params.userUid;
            me.parmType = this.$route.params.type
            // console.log(me.value)
            me.copyElement = JSON.parse(JSON.stringify(me.value))

            // console.log(me.copyElement)
            if (me.copyElement.name != null) {
                me.namePanel = me.copyElement.name
            }

            if (me.copyElement.yaml_text != null) {
            } else {
                me.createYaml()
            }

            me.$nextTick(function () {
                me.isRead = designer.isRead
            })


        },
        mounted: function () {
            var me = this
            var designer = this.$parent.getComponent('modeling-designer')

            me.$nextTick(function () {
                me.isRead = designer.isRead
            })

        },
        watch: {
            "namePanel": function (newVal) {
                var me = this
                var designer = this.$parent.getComponent('modeling-designer')
                me.copyElement.name = newVal.replace(/\n/g, "").replace(/ /gi, "")
                me.getTranslate(me.copyElement.name)
                // me.translateText = '';
                designer.$refs[`${me.value.elementView.id}`][0].namePanel = me.copyElement.name
            },
            // "value.name": function (newVal, oldVal) {
            //     var me = this
            //     if (oldVal == 'tmp') {
            //         me.getTranslate(newVal)
            //         me.initNameCase(newVal)
            //         me.translateText = '';
            //     } else {
            //         me.getTranslate(newVal)
            //         me.setNameCase(newVal)
            //         me.translateText = '';
            //     }
            // },

            // "value.drawer": function (val) {
            //     this.navigationDrawer = val;
            // },
            //프로퍼티 창이 오픈되었을 때 모델값을 새로 반영한다.
            navigationDrawer: {
                handler: function (val, oldval) {
                    var opengraph = this.$parent.getComponent('opengraph')
                    if (this.titleName == 'Aggregate') {
                        // this.getRelation()
                    }
                    if (val == true) {
                        this._item = this.value;

                        if (this.value.elementView) {
                            this.x = this.value.elementView.x;
                            this.y = this.value.elementView.y;
                            this.width = this.value.elementView.width;
                            this.height = this.value.elementView.height;
                        }

                        this.$emit('update:drawer', val);
                        this.$emit('changed', val);

                    } else {
                        //공백 제거
                        this.copyElement.name = this.copyElement.name.replace(/\n/g, "").replace(/ /gi, "")

                        //프로퍼티 에디팅 해제.
                        this.$emit('update:drawer', false);
                        this.$emit('changed', null);
                    }
                }
            },
            "copyElement.yaml_text": {
                handler(newVal) {
                    if (newVal != '') {
                        var me = this
                        //console.log(newVal)
                        if (me.auto_edit) {
                            try {
                                if (!(me.copyElement.yaml_text == me.temp_text)) {
                                    me.temp_text = me.copyElement.yaml_text
                                    me.cursor_pos = me.codemirror.getCursor("start")
                                    me.copyElement.template = yaml.load(me.copyElement.yaml_text)
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
            "copyElement.properties": {
                handler: function (newVal) {
                    let me = this
                    if (me.channel == 'ui') {
                        me.uiToJson()
                    }
                    for (let idx in me.copyElement.properties) {
                        let znum = (me.copyElement.properties[idx].val)
                        if (typeof znum == 'string') {
                            let check_str = znum.match(/^0[0-9]+/)
                            if (check_str) {
                                me.copyElement.properties[idx].val = parseInt(check_str)
                            }
                        }
                    }
                    let yaml_text = json2yaml.stringify(JSON.parse(JSON.stringify(me.copyElement.template)))
                    me.copyElement.yaml_text = me.yamlFilter(yaml_text)
                },
                deep: true
            },

        },
        methods: {
            closePanel() {
                var me = this
                var designer = me.$parent.getComponent('modeling-designer')
                designer.$refs[`${me.value.elementView.id}`][0].openPanel = false
                console.log('closePanel', designer.$refs[`${me.value.elementView.id}`][0].openPanel)
            },
            setNameCase:
                function (newVal) {
                    var me = this
                    if (me.value._type == 'org.uengine.modeling.model.View' || me.value._type == 'org.uengine.modeling.model.Event' || me.value._type == 'org.uengine.modeling.model.Command' || me.value._type == 'orguengine.modeling.model.Policy' || me.value._type == 'org.uengine.modeling.model.Aggregate') {
                        me.value.name = newVal
                        me.value.namePascalCase = changeCase.pascalCase(newVal)
                        me.value.nameCamelCase = changeCase.camelCase(newVal)
                        me.value.namePlural = changeCase.camelCase(pluralize(newVal));
                    } else {
                        me.value.name = newVal
                        me.value.namePascalCase = changeCase.pascalCase(newVal)
                    }
                },
            
            getTranslate:
                _.debounce(
                    function (newVal) {
                        var me = this
                        if (me.copyElement._type == 'org.uengine.modeling.model.Event') {
                            try {
                                googleTranslate.detectLanguage(newVal, function (err, detection) {
                                    if (detection.language != 'en') {
                                        googleTranslate.translate(newVal, 'en', function (err, translation) {
                                            me.usedTranslate = true
                                            me.translateText = changeCase.pascalCase(translation.translatedText);
                                        });
                                    }
                                });
                            } catch (e) {
                                // console.log('[Event ERROR]' + e)
                            }

                        } else if (me.copyElement._type == 'org.uengine.modeling.model.Policy') {

                            try {
                                googleTranslate.detectLanguage(newVal, function (err, detection) {
                                    if (detection.language != 'en') {
                                        googleTranslate.translate(newVal, 'en', function (err, translation) {
                                            me.usedTranslate = false
                                            me.translateText = changeCase.pascalCase(translation.translatedText);
                                        });
                                    } else if (detection.language == 'en') {
                                        me.usedTranslate = false
                                        me.translateText = changeCase.pascalCase(newVal)
                                    }
                                });
                            } catch (e) {
                                // console.log('[Policy ERROR]' + e)
                            }

                        } else if (me.copyElement._type == 'org.uengine.modeling.model.Aggregate') {

                            try {
                                googleTranslate.detectLanguage(newVal, function (err, detection) {
                                    if (detection.language != 'en') {
                                        googleTranslate.translate(newVal, 'en', function (err, translation) {
                                            me.usedTranslate = true
                                            me.translateText = changeCase.pascalCase(translation.translatedText);
                                        });
                                    } else if (detection.language == 'en') {
                                        me.usedTranslate = true
                                        me.translateText = changeCase.pascalCase(newVal)
                                    }
                                });
                            } catch (e) {
                                // console.log('[Aggregate ERROR]' + e)
                            }

                        } else {
                            try {
                                googleTranslate.detectLanguage(newVal, function (err, detection) {
                                    if (detection.language != 'en') {
                                        googleTranslate.translate(newVal, 'en', function (err, translation) {
                                            me.usedTranslate = true
                                            me.translateText = translation.translatedText;
                                        });
                                    } else if (detection.language == 'en') {
                                        me.usedTranslate = true
                                        // me.translateText.replace(' ','')
                                    }
                                });
                            } catch (e) {
                                // console.log(e)
                            }

                        }
                    }, 500
                ),
            changeTranslate() {
                this.namePanel = this.translateText
                this.usedTranslate = false
            },

            // 
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
                let json = JSON.parse(JSON.stringify(me.value.template))
                let property_list = me.copyElement.properties
                for (let idx in property_list) {
                    let item = property_list[idx]
                    let val = item.val
                    let key_lists = item.key_lists
                    for (let i in key_lists) {
                        let key_list = key_lists[i].split(',')
                        json = me.modifyJson(json, key_list, val)
                    }
                }
                me.copyElement.template = json
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
                let json = JSON.parse(JSON.stringify(me.copyElement.template))
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
                        me.copyElement.template = json
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
            createYaml() {
                let me = this
                let yamlText = json2yaml.stringify(me.value.template)
                me.copyElement.yaml_text = me.yamlFilter(yamlText)
            },

        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
