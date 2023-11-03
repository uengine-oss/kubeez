<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="canvas-panel">
        <!-- Code Modal -->
        <v-layout right>
            <opengraph ref="opengraph" focus-canvas-on-select wheelScalable :labelEditable="false"
                       :dragPageMovable="dragPageMovable" :enableContextmenu="false" :enableRootContextmenu="false"
                       :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                       :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" :enableHotkeyCtrlD="false"
                       :enableHotkeyCtrlG="false" :slider="true" :movable="false" :resizable="true" :selectable="false"
                       :deleteable="false"
                       :connectable="false" v-if="value" v-on:canvasReady="bindEvents" :autoSliderUpdate="true"
                       :imageBase="imageBase">
                <!--엘리먼트-->
                <div
                        v-for="elementId in Object.keys(value.elements)">
                    <component
                            v-if="elementId && value.elements[elementId]"
                            :is="getComponentByClassName(value.elements[elementId]._type)"
                            :value.sync="value.elements[elementId]"
                    ></component>
                </div>

                <div
                        v-for="relationId in Object.keys(value.relations)">
                    <component
                            v-if="relationId && value.relations[relationId]"
                            :is="getComponentByClassName(value.relations[relationId]._type)"
                            :value.sync="value.relations[relationId]"
                    ></component>
                </div>


            </opengraph>

            <v-layout right>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>

                <v-flex style="justify:end; align:start;">
                    <v-row justify="end" align="start" style="margin-right: 10px;">

                        <v-col align="start" justify="end" cols="12" sm="6">
                            <v-text-field
                                    v-model="projectName"
                                    disabled
                                    :width="300"
                                    label="Project Name"
                            >
                            </v-text-field>
                        </v-col>

                        <v-menu
                                class="pa-2"
                                style="margin-right: 3px"
                                offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                        style="margin-right: 5px;margin-top: 15px;"
                                        color="orange"
                                        dark
                                        @click="goToModeling()"
                                >
                                    <v-icon> mdi-server</v-icon>
                                    Modeling
                                </v-btn>
                            </template>
                        </v-menu>

                    </v-row>
                </v-flex>
            </v-layout>


            <v-card class="tools" style="top:100px; text-align: center;">
                <span class="bpmn-icon-hand-tool" v-bind:class="{ icons : !dragPageMovable, hands : dragPageMovable }"
                      _width="30"
                      _height="30" v-on:click="toggleGrip">
                     <v-tooltip md-direction="right">Hands</v-tooltip>
                </span>
            </v-card>

        </v-layout>

        <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>

    </div>
</template>

<script>
    import CodeViewer from "../CodeViewer";
    import firebase from 'firebase'
    import {
        saveAs
    } from 'file-saver';
    // import firebase from 'firebase'
    import {
        mdiAbTesting
    } from '@mdi/js';

    var _ = require('lodash')

    var pluralize = require('pluralize');
    var path = require('path')


    export default {
        name: 'view-modeling-designer',
        components: {
            saveAs,
            CodeViewer,
            mdiAbTesting,
        },
        props: {
            versionValue: Object,
        },
        data() {
            return {
                value: null,
                canvas: null,
                dragPageMovable: false,
                projectName: null,
                orginIsRead: false,

                parmVersion: null,
                parmType: null,
                parmProjectId: null,
                parmUid: null,
                parmSnapshotIndex: null,
                parmQueueIndex: null,

                participantLists: null,
                database: null,

                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
            }
        },
        beforeDestroy: function () {
            var me = this
            var app = me.getComponent('App')

            // this.$EventBus.$emit('viewModelingDesigner', false)
            app.showParticiateLists = false

        },
        computed: {},
        created: function () {
            var me = this
            var app = me.getComponent('App')

            if (!me.value) me.value = {'elements': [], 'relations': []}
            me.database = firebase.database()
            me.parmUid = this.$route.params.userUid;
            me.parmProjectId = this.$route.params.projectId;
            me.parmVersion = localStorage.getItem('parmVersion')


            if (this.$route.params.snapshotIndex && this.$route.params.queueIndex) {
                me.parmSnapshotIndex = this.$route.params.snapshotIndex
                me.parmQueueIndex = this.$route.params.queueIndex
                if (!me.participantLists) me.participantLists = []
                app.showParticiateLists = true
                console.log('replay')
                // this.$EventBus.$emit('viewModelingDesigner', true)

                me.startSnapshotSetting()


            } else {
                console.log('version')
                // this.$EventBus.$emit('viewModelingDesigner', true)
                me.projectName = me.versionValue.versionName
                me.value = JSON.parse(me.versionValue.versionValue)

            }


        },
        mounted() {
            // this.$EventBus.$emit('viewModelingDesigner',true)


        },
        watch: {
            participantLists: function (newVal) {
                var me = this
                var filter
                filter = newVal.filter(user => user.uid != localStorage.getItem('uid'))
                me.$EventBus.$emit('particiateLists', filter)
            },
        },
        methods: {
            startSnapshotSetting() {
                var me = this

                me.database
                    .ref('definitions/' + me.parmProjectId + '/snapshotLists')
                    .orderByKey()
                    .equalTo(me.parmSnapshotIndex)
                    .once('value', function (value) {
                        if (value.exists()) {

                            me.value = JSON.parse(value.val()[Object.keys(value.val())[0]].snapshot)
                        }
                    }).then(function (lastSnapshot) {

                    var snapshotLastKey = null
                    if (lastSnapshot.exists()) {
                        snapshotLastKey = lastSnapshot.val()[Object.keys(lastSnapshot.val())[0]].lastSnapshotKey
                    } else {
                        snapshotLastKey = ''
                    }

                    me.database
                        .ref('definitions/' + me.parmProjectId + '/queue')
                        .orderByKey()
                        .startAt(snapshotLastKey)
                        .once('value', function (snapshot) {
                            if (snapshot.exists()) {
                                var lists = Object.keys(snapshot.val())
                                lists.forEach(function (child) {
                                    me.receivedQueueDrawElement(snapshot.val()[child])
                                })
                            }
                        })
                })
            },
            receivedQueueDrawElement(child) {
                var me = this

                //origin

                if (child.state == 'userEntrance') {

                    var obj = {
                        uid: child.editUid,
                        email: child.email,
                        userName: child.userName,
                        picture: child.picture
                    }
                    if (me.participantLists.findIndex(user => user.uid == obj.uid) == -1) {
                        me.participantLists.push(obj)
                    }


                } else if (child.state == 'userExit') {
                    var obj = {
                        uid: child.editUid,
                        email: child.email,
                        userName: child.userName,
                    }
                    if (me.participantLists.findIndex(user => user.uid == obj.uid) != -1) {
                        me.participantLists.splice(me.participantLists.findIndex(user => user.uid == obj.uid), 1)
                    }

                } else if (child.state == 'userPanelOpen' ||
                    child.state == 'userPanelClose' ||
                    child.state == 'userSelectedOn' ||
                    child.state == 'userSelectedOff' ||
                    child.state == 'userMovedOn' ||
                    child.state == 'userMovedOff' ) {

                    var obj = {
                        action: child.state,
                        uid: child.uid,
                        picture: child.picture,
                    }

                    me.$EventBus.$emit(`${child.editElement}`, obj)


                } else if (child.state == 'elementPush') {

                    var element = JSON.parse(child.item)
                    me.value.definition.push(element)

                } else if (child.state == 'elementDelete') {

                    try {
                        var item = JSON.parse(child.item)

                        var obj = {
                            action: 'delete',
                            element: child.item
                        }
                        // me.$EventBus.$emit(`${item.elementView.id}`, obj)
                        me.$nextTick(function () {
                            me.$EventBus.$emit(`${item.elementView.id}`, obj)
                        })
                    } catch (e) {
                        console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                        alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                        window.location.reload(true)
                    }

                } else if (child.action == 'elementMove') {

                    try {

                        var afterMove = child.after
                        var obj = {
                            action: 'elementMove',
                            element: afterMove,
                        }
                        // me.$EventBus.$emit(`${child.elementId}`, obj)

                        me.$nextTick(function () {
                            // me.isReceiveQueue = true
                            me.$EventBus.$emit(`${child.elementId}`, obj)
                        })

                    } catch (e) {
                        console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                        alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                        window.location.reload(true)
                    }


                } else if (child.state == 'valueModify') {

                    try {
                        //changedByMe
                        jsondiffpatch.patch(me.value, JSON.parse(child.item))

                    } catch (e) {
                        console.log('patchError:', e, JSON.parse(JSON.stringify(me.value)), JSON.parse(child.item))
                        alert('Concurrent editing is unsynchronized. Page will be reloaded(patchError)')
                        window.location.reload(true)

                    }

                } else if (child.state == 'relationPush') {

                    var relation = JSON.parse(child.item)
                    me.value.relation.push(relation);


                } else if (child.state == 'relationDelete') {

                    try {
                        var item = JSON.parse(child.item)

                        var obj = {
                            action: 'delete',
                            element: child.item
                        }
                        me.$nextTick(function () {
                            me.$EventBus.$emit(`${item.relationView.id}`, obj)
                        })
                    } catch (e) {
                        console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                        alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                        window.location.reload(true)
                    }


                } else if (child.state == 'relationMove') {
                    try {
                        var afterMove = child.after

                        var obj = {
                            action: 'relationMove',
                            element: afterMove
                        }

                        me.$nextTick(function () {
                            me.$EventBus.$emit(`${child.relationId}`, obj)
                        })

                    } catch (e) {
                        console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                        alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                        window.location.reload(true)
                    }

                }

                console.log('draw:', child.childKey, child.childValue)
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            goToModeling() {
                var me = this
                console.log('goTO model')
                me.$router.push({path: '/storming/' + me.parmUid + '/' + me.parmType + '/' + me.parmProjectId + '/' + me.parmVersion});

            },
            toggleGrip: function () {

                if (this.dragPageMovable) {
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else {
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            bindEvents: function (opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
                this.canvas = opengraph.canvas;
                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start: function () {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height')
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });

                canvasEl.droppable({
                    drop: function (event, ui) {
                        var componentInfo = canvasEl.data('DRAG_SHAPE'),
                            shape, element;
                        if (componentInfo) {
                            var dropX = event.pageX - canvasEl.offset().left + canvasEl[0].scrollLeft;
                            var dropY = event.pageY - canvasEl.offset().top + canvasEl[0].scrollTop;

                            dropX = dropX / opengraph.scale;
                            dropY = dropY / opengraph.scale;

                            componentInfo = {
                                component: componentInfo.component,
                                x: dropX,
                                y: dropY,
                                width: parseInt(componentInfo.width, 10),
                                height: parseInt(componentInfo.height, 10),
                                label: ''
                            }
                            me.addElement(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },

            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                $.each(window.Vue.classModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .input-name {
        background-color: #ffffff;
        full-width: 10px;
    }

    .canvas-panel {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: absolute;
        overflow: hidden;

        .fullcanvas {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
        }

        .fullcanvashands {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
            cursor: url('../../../../public/static/image/symbol/hands.png'), auto;
        }

        .tools {
            position: absolute;
            width: 48px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow: hidden;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .zoom {
            position: absolute;
            width: 42px;
            right: 20px;
            bottom: 120px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .icons {
            cursor: pointer;
            font-size: 30px;

            &:hover {
                color: #ffc124;
            }
        }

        .hands {
            cursor: pointer;
            font-size: 30px;
            color: #ffc124;
        }

        .export,
        .history,
        .import,
        .save {
            position: absolute;
            padding: 8px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
            }
        }

        .import {
            left: 80px;
            bottom: 20px;
        }

        .export {
            left: 180px;
            bottom: 20px;
        }

        .history {
            left: 280px;
            bottom: 20px;
        }
    }

    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    /* The whole thing */
    .custom-menu {
        display: none;
        z-index: 1000;
        position: absolute;
        overflow: hidden;
        border: 1px solid #CCC;
        white-space: nowrap;
        font-family: sans-serif;
        background: #FFF;
        color: #333;
        border-radius: 5px;
        padding: 0;
    }

    /* Each of the items in the list */
    .custom-menu li {
        padding: 8px 12px;
        cursor: pointer;
        list-style-type: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #DEF;
    }
</style>
