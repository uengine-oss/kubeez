<template></template>

<script>
    import firebase from 'firebase'
    import Element from "./Element";
    import StorageBase from "./ModelStorageBase";

    export default {
        mixins: [Element, StorageBase],
        name: 'model-element',
        props: {},
        data() {
            return {
                // canvas
                canvas: null,
                // 움직임 변화
                movingElement: false,
                // panel 열림 닫힘.
                propertyPanel: false,
                // 우측상단 프로필 변수
                newEditUserImg: [],
                // queue complete
                STATUS_COMPLETE: true,
                // validate
                elementValidationResults: [],
                //url 변수
                fullPath: null,
                params: null,
                paramKeys: null,
                // element sticker image
                image: null,
                // component refresh.
                refreshedImg: '',

                // ??
                messageRef: {},
                EndProgressing: false,
                // remove.
                modelCanvasComponent: null,
            }
        },
        created: function () {
            var me = this
            me.fullPath = this.$route.fullPath.split('/')
            me.params = this.$route.params
            me.paramKeys = Object.keys(me.params)

            me.setElementCanvas()

            // me.messageRef = firebase.database().ref(`/${me.$route.params.author}/${me.$route.params.projectName}`);
        },
        beforeDestroy() {
            // console.log("destory");
            this.removeAction();
        },
        watch: {
            "value.elementView": {
                deep: true,
                handler: function (newVal, oldVal) {
                    this.refreshImg()
                    var me = this
                    if (this.value.elementView) {
                        var positionX = me.value.elementView.x / 1000
                        var positionY = me.value.elementView.y / 1000
                        $(`#${me.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        if (me.value.rotateStatus) {
                        } else {
                            $(`#${me.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        }
                    }
                }
            },
            "movingElement": function () {
                this.refreshImg()
            },
            "alertImage": function () {
                this.refreshImg()
            },
            "newEditUserImg": function () {
                this.refreshImg()
            },
            "value.rotateStatus": function () {
                var me = this
                if (this.value.elementView) {
                    var positionX = this.value.elementView.x / 1000
                    var positionY = this.value.elementView.y / 1000
                    $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                    if (this.value.rotateStatus) {
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(-30deg)`);
                        this.value.rotateStatus = true
                    } else if (this.value.rotateStatus == false) {
                        $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(0deg)`);
                        this.value.rotateStatus = false
                    }
                }
            },

        },
        mounted: function () {
            var me = this
            var elementId = me.value.elementView ? me.value.elementView.id : me.value.relationView.id

            // me.$EventBus.$on('es-EndProgressing', function (newVal) {
            //     me.EndProgressing = true
            // })

            me.$EventBus.$on(`${elementId}`, function (obj) {


                if ( obj.action == 'elementPush' ) {
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                } else if ( obj.action == 'elementDelete' ) {
                    //STATUS_COMPLETE_elementDelete
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                } else if ( obj.action == 'elementMove' ) {
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    me.movingElement = obj.movingElement
                } else if ( obj.action == 'valueModify' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationPush' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationDelete' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationMove' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                        me.movingElement = obj.movingElement
                    })
                } else if (obj.action == 'userPanelOpen' || obj.action == 'userSelectedOn' || obj.action == 'userMovedOn') {
                    if(!me.newEditUserImg) {
                        me.newEditUserImg = []
                    }
                    if (me.newEditUserImg.findIndex(user => user.uid == obj.uid) == -1) {
                        me.newEditUserImg.push(obj)
                    }

                } else if (obj.action == 'userPanelClose' || obj.action == 'userSelectedOff' || obj.action == 'userMovedOff') {
                    if (me.newEditUserImg.length > 0) {
                        me.newEditUserImg.forEach(function (user, idx) {
                            if (user.uid == obj.uid) {
                                me.newEditUserImg.splice(idx, 1)
                            }
                        })
                    }
                }
            })


            // Rotate Element
            me.onRotateElement()

        },
        computed: {
            isCustomMoveExist() {
                // REMOVE
                if (this.canvas)
                    return this.canvas.isCustomMoveExist

                return false
            },
            selectable(){
                return !this.movingElement
            },
            movable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            resizable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            deletable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            filteredElementValidationResults(){
                var me = this
                var levelSort = ['error','warning','info']
                try{
                    return me.elementValidationResults.sort(function compare(a, b) {
                        var aIdx = levelSort.findIndex(x=>x == a.level)
                        var bIdx = levelSort.findIndex(x=>x == b.level)
                        return aIdx - bIdx;
                    });
                }catch (e) {
                    return me.elementValidationResults
                }finally {
                    me.refreshImg()
                }
            },
            getEditUid(){
                if( localStorage.getItem('uid') ){
                    return localStorage.getItem('uid')
                }
                return null
            },
            editUserImg() {
                return this.newEditUserImg
            },
            storage() {
                if (this.canvas) {
                    return this.canvas.storage
                } else {
                    return 'localstorage'
                }
            },
            isClazzModeling() {
                if (this.canvas)
                    return this.canvas.isClazzModeling
                return false
            },
        },
        methods: {
            setElementCanvas(){
                throw new Error('setElementCanvas() must be implement')
            },
            removeAction(){},
            exceptionError(message, options){
                var me = this
                var msg = message ? message : '[Element] Exception Error.'
                if(me.canvas){
                    me.canvas.exceptionError(msg,options)
                }
                console.error(`[Element] Exception: ${msg}`);
            },
            openPanel() {
                // var openPanelStatus = false
                // if(this.canvas.isServerModel && this.canvas.isQueueModel) {
                //     if(this.EndProgressing || this.value.name == "" || this.value.name.includes('BoundedContext')) {
                //         this.EndProgressing = true
                //         openPanelStatus = true
                //     }
                // } else {
                //     openPanelStatus = true
                // }
                // if(openPanelStatus) {
                    if(this.propertyPanel) this.propertyPanel = false
                    this.propertyPanel = true
                    this.staySelected = false
                // }
            },
            closePanel() {
                if(!this.propertyPanel) this.propertyPanel = true
                this.propertyPanel = false
            },
            deSelectedActivity: function () {
                var me = this

                if (me.value) {
                    me.selected = false
                    me.propertyPanel = false
                }
            },
            refreshImg() {
                var me = this
                me.refreshedImg = 'refresh'
                me.$nextTick(function () {
                    if (me.refreshedImg == 'refresh') {
                        me.refreshedImg = ''
                    } else {
                        me.refreshedImg = 'refresh'
                    }
                })
            },
            onRotateElement(){
                if (this.value.elementView) {
                    var positionX = this.value.elementView.x / 1000
                    var positionY = this.value.elementView.y / 1000
                    $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                    if (this.value.rotateStatus) {
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(-30deg)`);
                        this.value.rotateStatus = true
                    } else if (this.value.rotateStatus == false) {
                        $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(0deg)`);
                        this.value.rotateStatus = false
                    }
                }
            },
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                try{
                    var offsetX, offsetY, offsetW, offsetH

                    var originX = me.value.elementView.x
                    var originY = me.value.elementView.y
                    var originW = me.value.elementView.width
                    var originH = me.value.elementView.height

                    if (dx == null && dy == null) {
                        // resize

                        if (Math.abs(dl) <= Math.abs(dr)) {
                            // 오른쪽으로 움직임
                            if (dr >= 0) {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            }


                        } else if (Math.abs(dl) > Math.abs(dr)) {
                            // 왼쪽 으로 움직임
                            if (dl >= 0) {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            }

                        }

                        if (Math.abs(dlw) <= Math.abs(du)) {
                            //위로 움직임
                            if (du >= 0) {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            }

                        } else if (Math.abs(dlw) > Math.abs(du)) {
                            //아래로 움직임
                            if (dlw >= 0) {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            }

                        }

                        offsetW = dw
                        offsetH = dh

                    } else if (dw == null && dh == null) {
                        //move
                        offsetX = originX + dx
                        offsetY = originY + dy
                        offsetW = originW
                        offsetH = originH
                    } else {
                        console.log('error Move & Resize')
                    }

                    var afterViewObj = {x: offsetX, y: offsetY, width: offsetW, height: offsetH}
                    var beforeViewObj = {x: originX, y: originY, width: originW, height: originH}

                    // me.delayedMoveAction(beforeViewObj, afterViewObj)
                    me.canvas.moveElementAction(me.value, beforeViewObj, afterViewObj)

                }catch (e) {
                    alert(`[Error] ModelElement-delayedMove: ${e}`)
                }
            },
            delayedRelationMove(vertices) {
                var me = this
                try{
                    var originVertices = JSON.parse(JSON.stringify(me.value.relationView.value))
                    var newVertices = []
                    var offsetVertices

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    // me.delayedRelationMoveAction(beforeViewObj, afterViewObj)
                    me.canvas.moveElementAction(me.value, originVertices, offsetVertices)
                }catch (e) {
                    alert(`[Error] ModelElement - delayedRelationMove: ${e}`)
                }
            },
            onRemoveShape(model) {
                var me = this
                try {
                    // if ( me.isCustomMoveExist ) {
                    //     // 변화 인지
                    //     me.modelCanvasComponent.modelChanged = true
                    //     me.removeShapeQueue()
                    // } else {
                    //     me.removeShapeLocal()
                    // }
                    me.canvas.removeElementAction(me.value)
                    me.validate()
                } catch (e) {
                    alert(`[Error] ModelElement-onRemoveShape: ${e}`)
                }
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
            removeUndefinedValue(obj) {
                const newObj = {}; // 빈객체를 만들어놓고

                Object.keys(obj).forEach(key => {
                    // 키 값이 {오브젝트} 인 경우
                    if (obj[key] && Object.keys(obj[key]).length) {
                        newObj[key] = this.removeUndefinedValue(obj[key]); // newObj 안에서 또 재귀함수를 돌리자
                    }

                    // 키 값이 그외 값인 경우
                    else if (obj[key]) {
                        newObj[key] = obj[key]; // 조건을 통과하면 newObj에 똑같은 키와 값을 채워준다
                    }
                });

                return newObj;
            },
            delayedMoveAction(beforeViewObj, afterViewObj){
                /*
                    !!!  REMOVE !!!!
                    changedMethod: moveElementAction
                */
                var me = this
                // Action
                if ( me.canvas.isCustomMoveExist ) {
                    me.movingElement = true
                    // 변화 인지
                    me.canvas.modelChanged = true
                    // move Queue
                    me.delayedMoveQueue(beforeViewObj, afterViewObj)
                }
            },
            delayedMoveQueue(beforeViewObj , afterViewObj){
                /*
                   !!!  REMOVE !!!!
                   changedMethod: pushMovedQueue
               */
                var me = this
                try{
                    var types = me.value._type.split('.')
                    var pushObj =
                        {
                            action: 'elementMove',
                            elementType: types[types.length - 1],
                            elementName: me.value.name,
                            editUid: me.getEditUid,
                            elementId: me.value.elementView.id,
                            before: JSON.stringify(beforeViewObj),
                            after: JSON.stringify(afterViewObj),
                            timeStamp: Date.now(),
                        }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] ModelElement-DelayedMoveQueue PUSH: ${e}`)
                }
            },
            onMoveElement(newObj,STATUS_COMPLETE){
                /*
                    !!!  REMOVE !!!!
                    changedMethod: moveElement
                */
                var me = this

                try{
                    me.value.elementView.x = newObj.x
                    me.value.elementView.y = newObj.y
                    me.value.elementView.width = newObj.width
                    me.value.elementView.height = newObj.height

                    me.$nextTick(function () {
                        me.movingElement = false
                        me.STATUS_COMPLETE = STATUS_COMPLETE
                    })
                }catch (e) {
                    alert(`[Error] ModelElement-onMoveElement: ${e}`)
                }
            },
            onMoveRelation(newObj,STATUS_COMPLETE){
                /*
                    !!!  REMOVE !!!!
                    changedMethod: moveElement
                */
                var me = this

                try{
                    me.value.relationView.value = newObj

                    me.$nextTick(function () {
                        me.movingElement = false
                        me.STATUS_COMPLETE = STATUS_COMPLETE
                    })
                }catch (e) {
                    alert(`[Error] ModelElement-onMoveRelation: ${e}`)
                }
            },
            delayedRelationMoveAction(originVertices, offsetVertices){
                /*
                  !!!  REMOVE !!!!
                  changedMethod: canvas.moveElementAction
              */
                var me = this
                if ( me.canvas.isCustomMoveExist ) {
                    me.movingElement = true
                    // 변화 인지
                    me.canvas.modelChanged = true
                    // relation Queue
                    me.delayedRelationMoveQueue(originVertices, offsetVertices)
                }
            },
            delayedRelationMoveQueue(originVertices , offsetVertices){
                /*
                !!!  REMOVE !!!!
                changedMethod: canvas.pushMovedQueue
                */
                var me = this
                try {
                    var pushObj =
                        {
                            action: 'relationMove',
                            editUid: me.getEditUid,
                            relationId: me.value.relationView.id,
                            before: originVertices,
                            after: offsetVertices,
                            timeStamp: Date.now(),
                        }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] ModelElement-DelayedRelationMoveQueue: ${e}`)
                }
            },
            removeShapeLocal(){
                /*
                !!!  REMOVE !!!!
                changedMethod: canvas.removeElementAction
               */
                var me = this
                try{
                    var id = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    var location = me.value.elementView ? me.canvas.value.elements : me.canvas.value.relations

                    if (location && id)
                        // location[id] = null
                        delete location[id]

                    if(me.initLoad){
                        me.changedTemplateCode = true
                    }
                }catch (e) {
                    alert(`[Error] ModelElement-removeShapeLocal: ${e}`)
                }
            },
            removeShapeQueue(){
                /*
                    !!!  REMOVE !!!!
                    changedMethod: canvas.pushRemovedQueue
                */
                var me = this
                try{
                    var action = me.value.relationView ? 'relationDelete' :  'elementDelete'
                    var obj = {
                        action: action,
                        editUid: me.getEditUid,
                        timeStamp: Date.now(),
                        item: JSON.stringify(me.value)
                    }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj)
                }catch (e) {
                    alert(`[Error] ModelElement-removeShapeQueue: ${e}`)
                }
            },

        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
