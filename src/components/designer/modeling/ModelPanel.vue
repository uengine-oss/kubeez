<template></template>

<script>
    import StorageBase from "./ModelStorageBase";
    import getParent from '../../../utils/getParent'
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'model-panel',
        mixins: [StorageBase],
        model: {
            prop: '_value',
            event: '_value-change'
        },
        props: {
            // value: Object,
            _value:{
                type: Object,
                default: function () {
                    return null;
                }
            },
            readOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
            image: {
                type: String,
                default: ''
            },
            canvasComponentName: {
                type: String,
                default: function () {
                    return 'event-storming-model-canvas'
                },
            },
        },
        data: function () {
            return {
                elementId: null,
                user: {},
                value: null,
                copyValue: null,

                params: null,
                fullPath: null,
                paramKeys: null,
                modelCanvasComponent: null,
                canvas: null
            }
        },
        created() {
            var me = this
            try{
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Check Model.
                me.params = this.$route.params
                me.paramKeys = Object.keys(me.params)
                me.fullPath = this.$route.fullPath.split('/')


                me.user.uid = localStorage.getItem('uid')
                me.user.name = localStorage.getItem('userName')
                me.user.email = localStorage.getItem('email')
                me.user.picture = localStorage.getItem('picture')
                me.user.accessToken = localStorage.getItem('accessToken')

                me.setElementCanvas();
                me.value = JSON.parse(JSON.stringify(me._value))

                // console.log('ModelPanel - Created')
                // me.copyValue = JSON.parse(JSON.stringify(me.value))
                // me.elementId = me.value.elementView ? me.value.elementView.id : me.value.relationView.id



            }catch (e) {
                console.log(e)
            }

        },
        beforeDestroy() {
            this.executeBeforeDestroy()
        },
        watch:{
            // "isReadOnly": _.debounce(
            //     function (newVal, oldVal) {
            //         // edit Mode false -> true 일시 동기화.
            //         // 500ms 이유: 값 세팅이 300ms.
            //         if(!newVal && oldVal){
            //             var diff = jsondiffpatch.diff(this.value, this._value)
            //             if(diff){
            //                 jsondiffpatch.patch(this.value, diff)
            //             }
            //         }
            //     }, 500
            // ),
            // "isReadOnlyModeling": _.debounce(
            //     function (newVal, oldVal) {
            //         // edit Mode false -> true 일시 동기화.
            //         // 500ms 이유: 값 세팅이 300ms.
            //         if(!newVal && oldVal){
            //             var diff = jsondiffpatch.diff(this.value, this._value)
            //             if(diff){
            //                 jsondiffpatch.patch(this.value, diff)
            //             }
            //         }
            //     }, 500
            // ),
        },
        computed: {
            fixedDefalutStroage() {
                return 'db'
            },
            isCustomMoveExist() {
                if (this.canvas)
                    return this.canvas.isCustomMoveExist

                return false
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
            exceptionError(message, options){
                var me = this
                var msg = message ? message : '[Panel] Exception Error.'
                if(me.canvas){
                    me.canvas.exceptionError(msg,options)
                }
                console.error(`Panel Exception: ${msg}`);
            },
            closePanel(){
                this.$emit('close')
            },
            panelOpenAction(editUser){
                var me = this
                if ( me.canvas.isServerModel && me.canvas.isQueueModel && !me.canvas.isReadOnlyModel && !me.isClazzModeling ) {
                    me.panelOpenQueue(editUser);
                }
            },
            panelCloseAction(editUser){
                var me = this
                if ( me.canvas.isServerModel && me.canvas.isQueueModel && !me.canvas.isReadOnlyModel && !me.isClazzModeling ) {
                    me.panelCloseQueue(editUser);
                }
            },
            panelOpenQueue(editUser) {
                var me = this
                var obj = {
                    action: 'userPanelOpen',
                    editUid: editUser ? editUser.uid : me.user.uid,
                    name:editUser ? editUser.name :me.user.name,
                    picture: editUser ? editUser.picture : me.user.picture,
                    timeStamp: Date.now(),
                    editElement: me.value.elementView.id
                }
                me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj);
            },
            panelCloseQueue(editUser) {
                var me = this
                var obj = {
                    action: 'userPanelClose',
                    editUid: editUser ? editUser.uid : me.user.uid,
                    name: editUser ? editUser.name :me.user.name,
                    picture: editUser ? editUser.picture : me.user.picture,
                    timeStamp: Date.now(),
                    editElement: me.value.elementView.id
                }
                me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj)
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
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
            executeBeforeDestroy(){
                var me = this
                try{
                    /*
                        _value : 기존 값.
                        value  : Panel 사용되는 값,
                    */
                    var diff = jsondiffpatch.diff(me._value, me.value)
                    if (diff) {
                        if (!me.readOnly) {
                            me.canvas.changedByMe = true
                            Object.keys(me.value).forEach(function (itemKey) {
                                if( me.isCustomMoveExist ){
                                    if(!(itemKey == 'elementView' || itemKey == 'relationView')){
                                        // Exception: 위치정보
                                        me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                    }
                                } else {
                                    me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                }

                            })
                            me.$emit('_value-change', me.value)
                            // me.value.__ob__.dep.notify();
                        }
                    }

                    me.panelCloseQueue()
                }catch (e) {
                    alert('[Error] ModelPanel Sync: ', e)
                }
            }
        },

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
