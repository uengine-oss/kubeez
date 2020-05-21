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
                                <template v-for="item in properties">
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
                if (me.value._type == 'org.uengine.modeling.model.Event') {
                    return '도메인 전문가가 정의함. 이벤트 퍼블리싱'
                } else if (me.value._type == 'org.uengine.modeling.model.Aggregate') {
                    return '비즈니스 로직 처리의 도메인 객체 덩어리 (서로 연결된 하나 이상의 엔터티 및 value objects의 집합체)'
                } else if (me.value._type == 'org.uengine.modeling.model.Command') {
                    return '행동, 결정 등의 값들에 대한 정의 (UI 혹은 API)'
                } else if (me.value._type == 'org.uengine.modeling.model.External') {
                    return '외부 시스템'
                } else if (me.value._type == 'org.uengine.modeling.model.Policy') {
                    return '업무정책 이벤트에 대한 반응 (subscribe)'
                } else if (me.value._type == 'org.uengine.modeling.model.View') {
                    return '행위와 결정을 하기 위하여 유저가 참고하는 데이터 (데이터 프로젝션이 필요 :  CQRS 등으로 수집)'
                } else if (me.value._type == 'org.uengine.modeling.model.BoundedContext') {
                    return '이벤트의 내용을 정의하고 시스템의 경계를 구분.'
                } else if(me.value._type == 'org.uengine.modeling.model.Actor'){
                    return ''
                }

                return ''
            },

            dragOptions() {
                return {
                    animation: 200,
                    group: "description",
                    disabled: false,
                    ghostClass: "ghost"
                };
            },
            fieldDescriptors: function () {
                var me = this
                return me.value.fieldDescriptors
            },
            widthScale: function () {
                var me = this;
                if (me.value._type == 'org.uengine.modeling.model.View') {
                    return 500
                } else {
                    return 800
                }
            },
            eventList: function () {
                var designer = this.$parent.getComponent('modeling-designer')

                var tmp = []

                designer.value.definition.forEach(function (tmpData) {
                    if (tmpData != null) {
                        if (tmpData._type == 'org.uengine.modeling.model.Event') {
                            tmp.push(tmpData)
                        }
                    }
                })

                tmp = tmp.filter(n => n)
                return tmp
            },
            aggregateList: function () {
                var designer = this.$parent.getComponent('modeling-designer')

                var tmp = []

                designer.value.definition.forEach(function (tmpData) {
                    if (tmpData != null) {
                        if (tmpData._type == 'org.uengine.modeling.model.Aggregate') {
                            var ob = {
                                'id': tmpData.elementView.id,
                                'name': tmpData.name,
                                'namePlural': tmpData.namePlural,
                                'namePascalCase': tmpData.namePascalCase,
                                'nameCamelCase': tmpData.nameCamelCase,
                                'boundedContext': tmpData.boundedContext,
                                'fieldDescriptors': tmpData.aggregateRoot['fieldDescriptors']
                            }
                        }
                        tmp.push(ob)
                    }
                })

                tmp = tmp.filter(n => n)
                return tmp
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
                angle: null,
                connectedList: [],
                connectedListName: {},
                viewList: null,
                // viewRowAddDialog: false,
                restfulList: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
                entityTypeList: ['Integer', 'String', 'Float', 'Double', 'Long', 'Date'],
                entityKey: false,
                entityType: '',
                entityName: '',
                drag: false,
                headers: [
                    {
                        text: 'key',
                        value: 'isKey',
                        align: 'center'
                    },
                    {
                        text: 'type',
                        value: 'className',
                        align: 'center'
                    },
                    {
                        text: 'name',
                        value: 'name',
                        align: 'center'
                    },
                    {
                        text: 'Actions',
                        value: 'action',
                        sortable: false,
                        align: 'center'
                    },],
                translateText: '',
                usedTranslate: false,
                UMLInput: '',
                // editedIndex: '',
                setIsKeyList: [],
                attributeEdit: false,
                attributeEditIndex: 0,
                isRead: false,
                //new
                namePanel: '',

                copyElement: {},
                parmUid: '',
                parmType: '',

                yaml_text: '',
                ui_list: [],
                cursor_pos: "",
                channel: "",
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

            if (me.value._type == 'org.uengine.modeling.model.Aggregate') {

                me.value.aggregateRoot.fieldDescriptors = me.copyElement.aggregateRoot.fieldDescriptors

            } else if (me.value._type == 'org.uengine.modeling.model.Command') {

                me.value.aggregate = me.copyElement.aggregate
                me.value.isRestRepository = me.copyElement.isRestRepository
                me.value.controllerInfo = me.copyElement.controllerInfo
                me.value.restRepositoryInfo = me.copyElement.restRepositoryInfo


            } else if (me.value._type == 'org.uengine.modeling.model.Event') {

                me.value.trigger = me.copyElement.trigger
                me.value.fieldDescriptors = me.copyElement.fieldDescriptors
                me.value.aggregate = me.copyElement.aggregate

            } else if (me.value._type == 'org.uengine.modeling.model.View') {

                me.value.fieldDescriptors = me.copyElement.fieldDescriptors
                me.value.dataProjection = me.copyElement.dataProjection
                me.value.createRules = me.copyElement.createRules
                me.value.updateRules = me.copyElement.updateRules
                me.value.deleteRules = me.copyElement.deleteRules

            } else if (me.value._type == 'org.uengine.modeling.model.Policy') {
            } else if (me.value._type == 'org.uengine.modeling.model.BoundedContext') {

                me.value.preferredPlatform = me.copyElement.preferredPlatform
            } else {
                

            }

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
            
            if (me.copyElement.properties != null) {
                me.ui_list = me.copyElement.properties
            }

            if (me.copyElement.yaml_text != null) {
                me.yaml_text = me.copyElement.yaml_text
            } else {
                me.createYaml()
            }

            me.$nextTick(function () {
                me.isRead = designer.isRead
            })


        },
        mounted: function () {
            this.fieldDescriptors;
            var me = this
            var designer = this.$parent.getComponent('modeling-designer')

            me.$nextTick(function () {
                me.isRead = designer.isRead
            })

            // if (me.parmUid != localStorage.getItem('uid')) {
            //     me.isRead = false
            // }else{
            //     me.isRead = false
            // }
            // me.$EventBus.$on('isClose',function (newVal) {
            //     me.isClose = newVal
            //     console.log(me.isClose)
            //     if(me.isClose){
            //         me.value =  JSON.parse(JSON.stringify(me.copyElement))
            //     }
            // })
            //
            // var designer = this.$parent.getComponent('modeling-designer')
            // // console.log(designer.$refs[`${me.value.elementView.id}`][0].openPanel)
            // me.isClose = designer.$refs[`${me.value.elementView.id}`][0].openPanel

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
            yaml_text: {
                handler(newVal) {
                    if (newVal != '') {
                        var me = this
                        //console.log(newVal)
                        if (me.auto_edit) {
                            try {
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
                    if (me.value._type == 'org.uengine.modeling.model.View' || me.value._type == 'org.uengine.modeling.model.Event' || me.value._type == 'org.uengine.modeling.model.Command' || me.value._type == 'org.uengine.modeling.model.Policy' || me.value._type == 'org.uengine.modeling.model.Aggregate') {
                        me.value.name = newVal
                        me.value.namePascalCase = changeCase.pascalCase(newVal)
                        me.value.nameCamelCase = changeCase.camelCase(newVal)
                        me.value.namePlural = changeCase.camelCase(pluralize(newVal));
                    } else {
                        me.value.name = newVal
                        me.value.namePascalCase = changeCase.pascalCase(newVal)
                    }
                },
            selectKey(item) {
                var me = this

                if (me.value._type == 'org.uengine.modeling.model.Aggregate') {
                    me.copyElement.aggregateRoot.fieldDescriptors.forEach(function (ele, idx) {
                        ele.isKey = false
                        if (idx == me.copyElement.aggregateRoot.fieldDescriptors.indexOf(item)) {
                            ele.isKey = true
                        }
                    })

                } else {
                    me.copyElement.fieldDescriptors.forEach(function (ele, idx) {
                        ele.isKey = false
                        // console.log(idx, me.value.fieldDescriptors.indexOf(item))
                        if (idx == me.copyElement.fieldDescriptors.indexOf(item)) {
                            ele.isKey = true
                        }
                    })

                }

            },
            // arrayDiff(a1, a2) {
            //
            //     var a = [], diff = [];
            //
            //     for (var i = 0; i < a1.length; i++) {
            //         a[a1[i]] = true;
            //     }
            //
            //     for (var i = 0; i < a2.length; i++) {
            //         if (a[a2[i]]) {
            //             delete a[a2[i]];
            //         } else {
            //             a[a2[i]] = true;
            //         }
            //     }
            //
            //     for (var k in a) {
            //         diff.push(k);
            //     }
            //
            //     return diff;
            // },
            syncFromAggregate() {
                var me = this


                if (me.copyElement.aggregate.id != null) {
                    var arr2 = me.value.aggregate.fieldDescriptors
                    var arr1 = JSON.parse(JSON.stringify(me.copyElement.fieldDescriptors))

                    console.log('>>>>>>>>>>>>>>>>>', arr2, me.value.aggregate.fieldDescriptors, me.copyElement.aggregate.fieldDescriptors)


                    arr2.forEach(function (agg) {
                        var check = false
                        arr1.forEach(function (ev) {
                            if (JSON.stringify(Object.entries(agg).sort()) === JSON.stringify(Object.entries(ev).sort())) {
                                check = true
                            } else if (agg.name == ev.name && agg.className == ev.className) {
                                check = true
                            }
                        })

                        if (!check) {
                            agg.isKey = false
                            me.copyElement.fieldDescriptors.push(agg)
                        }
                    })
                } else {
                    alert("select 'Associated aggreate'")
                }


            },
            viewMainRowAdd(type) {
                var me = this

                if (me.copyElement.dataProjection == 'cqrs') {


                    if (type == 'create') {

                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'CREATE',
                            when: '',
                            fieldMapping: [{"viewField": {}, "eventField": {}}],
                            where: [{"viewField": {}, "eventField": {}}],
                        }

                        me.copyElement.createRules.push(obj)
                    } else if (type == 'update') {
                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'UPDATE',
                            when: '',
                            fieldMapping: [{"viewField": {}, "eventField": {}}],
                            where: [{"viewField": {}, "eventField": {}}],
                        }
                        // var obj = {
                        //     sourceEvent: {},
                        //     fieldMapping: [{"viewField": {}, "eventField": {}}],
                        //     condition: [{"conditionViewField": {}, "conditionEventField": {}}]
                        // }
                        // me.value.viewFieldDescriptors.updateFieldDescriptors.push(obj);
                        // me.value.viewStoreRule.push(obj)
                        me.copyElement.updateRules.push(obj)
                    } else if (type == 'delete') {
                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'DELETE',
                            when: '',
                            fieldMapping: [{"viewField": {}, "eventField": {}}],
                            where: [{"viewField": {}, "eventField": {}}],
                        }
                        // var obj = {
                        //     sourceEvent: {},
                        //     condition: [{"conditionViewField": {}, "conditionEventField": {}}]
                        // }
                        // me.value.viewFieldDescriptors.deleteFieldDescriptors.push(obj);
                        // me.value.viewStoreRule.push(obj)
                        me.copyElement.deleteRules.push(obj)
                    }

                } else if (me.copyElement.dataProjection == 'uimashup') {
                    // var ob = {
                    //     isKey: false,
                    //     name: '',
                    //     className: '',
                    //     sourceRepository: '',
                    //     repositoryDirectValue: '',
                    //     hateoas: '',
                    //     link: ''
                    // }
                    // me.value.viewFieldDescriptors.push(ob);
                }
            },
            // save() {
            //     var me = this
            //
            //     if (this.editedIndex > -1) {
            //         Object.assign(me.value.fieldDescriptors[this.editedIndex], this.editedItem)
            //     } else {
            //         me.value.fieldDescriptors.push(this.editedItem)
            //     }
            //     me.value.editingView = false
            // },
            // editItem(item) {
            //     var me = this
            //     me.editedIndex = me.value.fieldDescriptors.indexOf(item)
            //
            //     this.editedItem = Object.assign({}, item)
            //     // me.value.editingView  = true
            // },
            //
            // : _.debounce(
            //     function (newVal) {
            //         var me = this
            //         if (me.value._type == 'org.uengine.modeling.model.View' || me.value._type == 'org.uengine.modeling.model.Event' || me.value._type == 'org.uengine.modeling.model.Command' || me.value._type == 'org.uengine.modeling.model.Policy' || me.value._type == 'org.uengine.modeling.model.Aggregate') {
            //             me.value.namePascalCase = changeCase.pascalCase(newVal)
            //             me.value.nameCamelCase = changeCase.camelCase(newVal)
            //             me.value.namePlural = changeCase.camelCase(pluralize(newVal));
            //         }
            //     }, 200
            // ),
            initNameCase:
                function (newVal) {
                    var me = this

                    if (me.value._type == 'org.uengine.modeling.model.View' || me.value._type == 'org.uengine.modeling.model.Event' || me.value._type == 'org.uengine.modeling.model.Command' || me.value._type == 'org.uengine.modeling.model.Policy' || me.value._type == 'org.uengine.modeling.model.Aggregate') {
                        me.copyElement.namePascalCase = changeCase.pascalCase(newVal)
                        me.copyElement.nameCamelCase = changeCase.camelCase(newVal)
                        me.copyElement.namePlural = changeCase.camelCase(pluralize(newVal));
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
            umlDiagramOpen() {
                var me = this
                // console.log("umlDiagram-Open")
                me.$ModelingBus.$emit('umlDiagram');
            },
            modifyAttributeItem(item) {
                var me = this
                var tmpObject = {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "name": item.name,
                    "namePascalCase": changeCase.pascalCase(item.name),
                    "nameCamelCase": changeCase.camelCase(item.name),
                    "className": item.className,
                    "isKey": item.isKey
                }

                if (me.copyElement._type == 'org.uengine.modeling.model.Aggregate') {

                    me.copyElement.aggregateRoot.fieldDescriptors[me.attributeEditIndex] = tmpObject
                } else {
                    me.copyElement.fieldDescriptors[me.attributeEditIndex] = tmpObject
                }

                me.attributeEdit = false
            },
            editAttributeItem(item) {
                var me = this

                if (me.copyElement._type == 'org.uengine.modeling.model.Aggregate') {
                    me.attributeEditIndex = me.copyElement.aggregateRoot.fieldDescriptors.indexOf(item)
                } else {
                    me.attributeEditIndex = me.copyElement.fieldDescriptors.indexOf(item)
                }


                me.attributeEdit = true
            },
            deleteAttribute(val) {
                var me = this

                if (val.isKey) {
                    alert("Is Primary Key")
                } else {
                    if (me.copyElement._type == 'org.uengine.modeling.model.Aggregate') {
                        me.copyElement.aggregateRoot.fieldDescriptors.forEach(function (element, idx) {
                            if (!element.isKey && element.name == val.name && element.className == val.className) {

                                if (idx > -1)
                                    me.copyElement.aggregateRoot.fieldDescriptors.splice(idx, 1)

                                // me.$emit('update:aggregateRoot.fieldDescriptors', me.aggregateRoot.fieldDescriptors);
                            }
                        })
                    } else {

                        me.copyElement.fieldDescriptors.forEach(function (element, idx) {

                            if (element.name == val.name && element.className == val.className) {
                                if (idx > -1)
                                    me.copyElement.fieldDescriptors.splice(idx, 1)

                                // me.$emit('update:fieldDescriptors', me.fieldDescriptors);
                            }
                        })

                    }
                }

            },
            changeTranslate() {
                this.namePanel = this.translateText
                this.usedTranslate = false
            },
            addAttribute: function (type, name) {
                var me = this
                if (type.length < 1) {
                    type = 'String'
                }
                if (type.length != 0 && name.length != 0) {
                    let tmpObject = null

                    tmpObject = {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "name": name,
                        "namePascalCase": changeCase.pascalCase(name),
                        "nameCamelCase": changeCase.camelCase(name),
                        "className": type,
                        "isKey": false
                    }

                    // if (name == 'id' && type == 'Long') {
                    //     tmpObject = {
                    //         "_type": "org.uengine.model.FieldDescriptor",
                    //         "name": name,
                    //         "namePascalCase": changeCase.pascalCase(name),
                    //         "nameCamelCase": changeCase.camelCase(name),
                    //         "className": type,
                    //         "isKey": true
                    //     }
                    // }

                    if (me.copyElement._type == "org.uengine.modeling.model.Aggregate") {
                        // me.value.aggregateRoot.fieldDescriptors.push(tmpObject);

                        var check = false

                        if (((tmpObject.name).toLowerCase() == 'id' && (tmpObject.className).toLowerCase() == 'long')) {
                            check = true
                        } else {
                            me.copyElement.aggregateRoot.fieldDescriptors.forEach(function (agg) {
                                if ((JSON.stringify(Object.entries(agg).sort())).toLowerCase() === (JSON.stringify(Object.entries(tmpObject).sort())).toLowerCase()) {
                                    check = true
                                }
                            })
                            if (!check) {
                                me.copyElement.aggregateRoot.fieldDescriptors.push(tmpObject)
                            }
                        }

                    } else {
                        // me.value.fieldDescriptors.push(tmpObject);

                        var check = false


                        me.copyElement.fieldDescriptors.forEach(function (agg) {
                            if (JSON.stringify(Object.entries(agg).sort()).toLowerCase() === JSON.stringify(Object.entries(tmpObject).sort()).toLowerCase()) {
                                check = true
                            }
                        })

                        if (!check) {
                            me.copyElement.fieldDescriptors.push(tmpObject)
                        }


                    }

                    this.entityType = ""
                    this.entityName = ""

                } else {
                    var designer = this.$parent.getComponent('modeling-designer')
                    designer.text = "TYPE & NAME INPUT REQUEST"
                    designer.snackbar = true
                }
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
                console.log(json)
                // let ui_list = me.ui_list
                // for (let idx in ui_list) {
                //     let item = ui_list[idx]
                //     let val = item.val
                //     let key_lists = item.key_lists
                //     for (let i in key_lists) {
                //         let key_list = key_lists[i].split(',')
                //         json = me.modifyJson(json, key_list, val)
                //     }
                // }
                me.value.template = json
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
            createYaml() {
                let me = this
                let yamlText = json2yaml.stringify(me.value.template)
                me.copyElement.yaml_text = me.yamlFilter(yamlText)
                //console.log(me.yaml_text)
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
