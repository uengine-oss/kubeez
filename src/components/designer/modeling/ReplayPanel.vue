<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width:17%">

            <v-list class="pa-1">
                <v-card
                        class="mx-auto"
                        tile
                        dense
                >
                    <v-list flat style="margin-bottom: 80px;">

                        <v-overlay :value="loading">
                            <v-col align="center">
                                <div> Loading...</div>
                                <v-progress-circular indeterminate size="64"></v-progress-circular>
                            </v-col>
                        </v-overlay>

                        <v-list-item-group
                                v-if="!loading &&  queueLists && queueLists.length > 0"
                                v-model="currentQueue"
                                :mandatory="true"
                                color="indigo"
                                active-class="border"
                        >
                            <v-list-item
                                    v-for="(queue,index) in queueLists"
                                    :key="index"
                            >

                                <v-list-item-content v-if="queue.key.includes('init')">
                                    <v-btn text color="black" block> Init</v-btn>
                                </v-list-item-content>


                                <v-list-item-avatar v-if="!queue.key.includes('init')" style="margin-right: 1px">
                                    <v-img :src="queue.picture"></v-img>
                                </v-list-item-avatar>

                                <v-list-item-content v-if="!queue.key.includes('init')">
                                    <v-row v-for="chip in queue.chips" dense
                                           style="max-width: fit-content; margin-left: 5px;">
                                        <v-chip small :color="chip.color">{{chip.state}}</v-chip>
                                    </v-row>
                                    {{queue.action}}
                                </v-list-item-content>

                            </v-list-item>
                        </v-list-item-group>

                        <div v-if="!loading && queueLists && queueLists.length == 0">
                            No Data
                        </div>
                    </v-list>

                </v-card>

            </v-list>
        </v-navigation-drawer>
    </v-layout>
</template>

<script>
    // import StorageBase from "./StorageBase";
    import StorageBase from "./ModelStorageBase";
    import TimeAgo from 'javascript-time-ago'
    import ko from 'javascript-time-ago/locale/ko'

    TimeAgo.addLocale(ko)
    const timeAgo = new TimeAgo('ko-KO')

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });
    export default {
        name: 'replay-panel',
        mixins: [StorageBase],
        props: {
            value: Number,
            sliderLists: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            projectId: String

        },
        data() {
            return {
                loading: false,
                queueLists: [],
                currentQueue: null,
            }
        },
        created() {
        },
        computed: {

        },
        watch: {
            // "value":_.debounce(function (newTime, oldTime) {
            //     if(newTime){
            //         this.onLoadQueueLists();
            //     }
            //
            // }, 1000),
        },
        methods: {
            async onLoadQueueLists(){
                var me = this;
                me.loading = true
                var currentSliderTimeStamp = me.value
                /*
                    현재 슬라이더 위치 시간 이후
                    다음 스냅샷 이전 까지의 큐 정보 노출.
                        없을시 모든 큐 정보 노출.
                 */
                var nextSnapshot = me.sliderLists.filter( x => currentSliderTimeStamp < x.timeStamp)[0];
                var nextTimeStamp = null;
                if(nextSnapshot){
                    nextTimeStamp = nextSnapshot.timeStamp
                }

                var options = {
                    sort: 'asc',
                    orderBy: 'timeStamp',
                    size: null,
                    startAt: currentSliderTimeStamp,
                    endAt: nextTimeStamp
                }
                me.queueLists = await me.list(`db://definitions/${me.projectId}/queue`, options)
                me.loading = false
            },
            changeUrl(state, title, url) {
                if (typeof (history.pushState) != "undefined") { //브라우저가 지원하는 경우
                    history.pushState(state, title, url);
                } else {
                    location.href = url; //브라우저가 지원하지 않는 경우 페이지 이동처리
                }
            },
            async moveQueue(prevKey, NextKey) {
                var me = this

                if (prevKey && NextKey) {
                    // o------o
                    var option = {
                        sort: null,
                        orderBy: null,
                        size: null,
                        startAt: prevKey,
                        endAt: NextKey,
                    }
                } else if (prevKey && !NextKey) {
                    // o------>
                    var option = {
                        sort: null,
                        orderBy: null,
                        size: null,
                        startAt: prevKey,
                        endAt: null,
                    }
                } else if (!prevKey && NextKey) {
                    // >------o
                    var option = {
                        sort: null,
                        orderBy: null,
                        size: null,
                        startAt: null,
                        endAt: NextKey,
                    }
                } else {
                    // <------>
                    var option = {
                        sort: null,
                        orderBy: null,
                        size: null,
                        startAt: null,
                        endAt: null,
                    }
                }


                var getSnapshot = await me.list(`db://definitions/${me.getProjectId}/queue`, option)
                if (getSnapshot) {
                    getSnapshot.forEach((item) => {
                        var queueValue = item
                        var queuekey = queueValue.key
                        if (!queueValue.action.includes('user')) {
                            var queue = {
                                childKey: queuekey,
                                childValue: queueValue
                            }
                            me.receivedQueueDrawElement(queue, true)
                        }
                    })
                }


            },
            async editUserImg(queue) {
                var me = this

                var img = await me.getString(`db://users/${queue.value.editUid}/profile_picture`)
                if (img) {
                    return img
                }
                return 'https://cdn.vuetifyjs.com/images/john.jpg'
            },
            getDiffValues(diffJson) {
                var me = this
                var label = {index: null, type: null, changed: {}}

                function getDiffValue(diffJson) {
                    Object.keys(diffJson).forEach(function (type, index) {
                        var val = diffJson[type]
                        var index = Object.keys(val)[0]


                        if (type == 'elements') {
                            label.index = index
                            label.type = type
                        } else {
                            if (type != '0' && type != '1' && index != '_type' && type != 'elements') {
                                label.changed[type] = val
                            }

                        }


                        if (type != '_t' && val[index] && typeof val[index] == 'object') {
                            getDiffValue(val[index])
                        }
                    })
                }


                getDiffValue(diffJson)
                return label

            },
            elementComment(queue) {
                var me = this
                var comment = {
                    display: '',
                    detail: ''
                }

                var valueIndex = null

                var action = queue.value.action
                var item = queue.value.item ? JSON.parse(queue.value.item) : queue.value

                if (action.includes('undo') || action.includes('redo')) {
                    var undoDiff = JSON.parse(queue.value.item)
                    item = undoDiff.childValue.item ? JSON.parse(undoDiff.childValue.item) : undoDiff.childValue
                    action = JSON.parse(queue.value.item).childValue.action
                }

                if (action.includes('relation')) {

                    if (action.includes('Push')) {

                        var source = item.sourceElement
                        var target = item.targetElement

                        comment.display = '[선] \"' + source.name + ' \" [ ' + source._type.split('.')[4] + ' ] -> \"' + target.name + ' \" [ ' + target._type.split('.')[4] + ' ]' + '를 연결합니다.'
                        comment.detail = ''

                    } else if (action.includes('Delete')) {

                        var source = item.sourceElement
                        var target = item.targetElement


                        comment.display = '[선] \"' + source.name + ' \" [ ' + source._type.split('.')[4] + ' ] ->\"' + target.name + ' \" [ ' + target._type.split('.')[4] + ' ]' + '를 삭제 합니다.'
                        comment.detail = ''

                    } else if (action.includes('Move')) {

                        var relation = me.value.relations[item.relationId]
                        if (relation) {
                            var source = relation.sourceElement
                            var target = relation.targetElement
                            comment.display = '[선] \" ' + source.name + '\" [' + source._type.split('.')[4] + '] ->  \" ' + source.name + '\" [' + source._type.split('.')[4] + '] 이동 합니다.'
                            comment.detail = ''
                        } else {
                            comment.display = '[선] 이동합니다.'
                            comment.detail = ''
                        }

                        // comment.display = '\" ' + item.elementName + '\"인 [ ' + item.elementType + ' ]가 이동 합니다.'
                        // comment.detail = '[ X: ' + JSON.parse(item.before).x + '/ Y: ' + JSON.parse(item.before).y + '] \n'
                        //     + ' => [ X: ' + JSON.parse(item.after).x + '/ Y: ' + JSON.parse(item.after).y + '] \n'

                    } else if (action.includes('Modify')) {
                        comment.display = '준비중 입니다.'
                        comment.detail = ''
                    }

                } else {
                    if (action.includes('Push')) {

                        comment.display = '\"' + item.name + ' \" 인[ ' + item._type.split('.')[4] + ' ]를 추가 합니다.'
                        comment.detail = 'X좌표: ' + item.elementView.x + '/ Y좌표: ' + item.elementView.y

                    } else if (action.includes('Delete')) {

                        comment.display = '\"' + item.name + ' \" 인[ ' + item._type.split('.')[4] + ' ]를 삭제 합니다.'
                        comment.detail = 'X좌표: ' + item.elementView.x + '/ Y좌표: ' + item.elementView.y

                    } else if (action.includes('Move')) {

                        comment.display = '\" ' + item.elementName + '\"인 [ ' + item.elementType + ' ]가 이동 합니다.'
                        comment.detail = '[ X: ' + JSON.parse(item.before).x + '/ Y: ' + JSON.parse(item.before).y + '] \n'
                            + ' => [ X: ' + JSON.parse(item.after).x + '/ Y: ' + JSON.parse(item.after).y + '] \n'

                    } else if (action.includes('Modify')) {
                        var diff = item
                        var id = Object.keys(diff.elements)[0]
                        // var copyValue = JSON.parse(JSON.stringify(me.value))
                        var copyValue = me.value
                        var elementName = copyValue.elements[id] ? copyValue.elements[id].name : ''
                        var elementType = copyValue.elements[id] ? copyValue.elements[id]._type.split('.')[4] : ''

                        var diffParse = me.getDiffValues(diff)

                        comment.display = '\"' + elementName + ' \"인 [ ' + elementType + ' ]를 수정 합니다. '

                        Object.entries(diffParse.changed).forEach(function (key) {
                            if (typeof key[1] == 'object' && !Array.isArray(key[1])) {
                                comment.detail = comment.detail + key[0] + ', '
                            } else if (Array.isArray(key[1])) {
                                comment.detail = comment.detail + '[' + key[0] + ': ' + key[1][0] + ' -> ' + key[1][1] + '], '
                            } else {
                                comment.detail = comment.detail + ''
                            }
                        })
                        // Object.keys(diffParse.changed).forEach(function (key) {
                        //     console.log('keys: ',key,diffParse.changed[key])
                        //     // comment.detail = comment.detail ? comment.detail + ', ' + key : key
                        // })
                        comment.detail = comment.detail + ' 변경되었습니다.'

                    }
                }


                return comment
            },

            receivedQueueDrawElement(child, ignore) {
                var me = this
                ignore = ignore ? ignore : false

                if (child != undefined) {
                    var item = null
                    var afterMove = null
                    var action = child.childValue.action ? child.childValue.action : child.childValue.state

                    if (action == 'undo' || action == 'redo') {
                        // changedByMe
                        ignore = true
                        child = JSON.parse(child.childValue.item)
                        action = child.childValue.action
                    }

                    if (action.includes('Move')) {
                        afterMove = child.childValue.after
                    } else {
                        item = child.childValue.item ? JSON.parse(child.childValue.item) : null
                    }


                    //origin
                    if (action == 'elementPush') {

                        // if (me.specVersion == '2.0') {
                        //
                        //     me.value.definition.push(item)
                        //
                        // } else {
                            if (!ignore && child.childKey < me.prevKey) {
                                console.log('Wrong Order: elementPush ', child.childKey, 'prevKey:', me.prevKey, child)
                                alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                                window.location.reload(true)
                            }

                            if (ignore || child.childKey != me.prevKey) {
                                me.prevKey = child.childKey
                                me.$set(me.value.elements, item.elementView.id, item)
                                // console.log('received Queue : push Element')
                            } else {
                                console.log('reduplication Element Push')
                            }

                        // }

                    } else if (action == 'elementDelete') {


                        try {

                            // if (me.specVersion == '2.0') {
                            //     var obj = {
                            //         action: 'delete',
                            //         element: JSON.stringify(item)
                            //     }
                            //     me.$nextTick(function () {
                            //         me.$EventBus.$emit(`${item.elementView.id}`, obj)
                            //     })
                            //
                            // } else {
                                me.value.elements[item.elementView.id] = null;
                            // }

                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                            alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                            window.location.reload(true)
                        }

                    } else if (action == 'elementMove') {

                        try {
                            var elementId = child.childValue.elementId

                            var obj = {
                                action: 'elementMove',
                                element: afterMove,
                            }

                            me.onMoveElementById(elementId, afterMove)
                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${elementId}`, obj)
                            })


                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                            alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                            window.location.reload(true)
                        }


                    } else if (action == 'valueModify') {

                        try {
                            //changedByMe
                            if (!ignore && me.changedByMeKeys.includes(child.childKey)) {
                                me.changedByMeKeys.splice(me.changedByMeKeys.indexOf(child.childKey), 1)
                            } else {
                                jsondiffpatch.patch(me.value, item)
                            }

                        } catch (e) {
                            console.log('patchError:', e, JSON.parse(JSON.stringify(me.value)), JSON.parse(child.childValue.item))
                            alert('Concurrent editing is unsynchronized. Page will be reloaded(patchError)')
                            window.location.reload(true)
                        }

                    } else if (action == 'relationPush') {

                        // var item = JSON.parse(child.childValue.item)
                        // if (me.specVersion == '2.0') {
                        //     me.value.relation.push(item);
                        // } else {
                            if (!ignore && child.childKey < me.prevKey) {
                                console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                                alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                                window.location.reload(true)
                            }

                            if (ignore || child.childKey != me.prevKey) {
                                me.prevKey = child.childKey

                                me.$set(me.value.relations, item.relationView.id, item)

                            } else {
                                console.log('reduplication Relation Push')
                            }
                        // }


                    } else if (action == 'relationDelete') {

                        try {
                            // if (me.specVersion == '2.0') {
                            //     var obj = {
                            //         action: 'delete',
                            //         element: JSON.stringify(item)
                            //     }
                            //     me.$nextTick(function () {
                            //         me.$EventBus.$emit(`${item.relationView.id}`, obj)
                            //     })
                            // } else {
                                me.value.relations[item.relationView.id] = null;
                            // }
                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                            alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                            window.location.reload(true)
                        }


                    } else if (action == 'relationMove') {

                        try {
                            // var afterMove = child.childValue.after
                            var relatinId = child.childValue.relationId

                            var obj = {
                                action: 'relationMove',
                                element: afterMove
                            }

                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${relatinId}`, obj)
                            })

                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)
                            alert('Concurrent editing is unsynchronized. Page will be reloaded.')
                            window.location.reload(true)
                        }
                    }
                }

            },
            onMoveElementById(id, newValueStr) {
                var me = this

                if (me.value && me.value.elements && me.value.elements[id]) {
                    var newValueObj = JSON.parse(newValueStr)

                    me.value.elements[id].elementView.x = newValueObj.x
                    me.value.elements[id].elementView.y = newValueObj.y
                    me.value.elements[id].elementView.width = newValueObj.width
                    me.value.elements[id].elementView.height = newValueObj.height
                }
            },
        },
    }
</script>

<style>
    .border {
        border: 2px dashed orange;
    }
</style>