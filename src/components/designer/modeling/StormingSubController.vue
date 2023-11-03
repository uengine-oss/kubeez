<template>
    <div>
        <sub-controller
                v-if="clone.rotate && !isHexagonalModeling"
                :image="'rotate.png'"
                @click.prevent.stop="rotate()"
        >
        </sub-controller>


        <!-- <sub-controller
                v-if="clone.ide"
                :image="'terminal.png'"
                @click.prevent.stop="ide()"
        >
        </sub-controller> -->
        <!-- <sub-controller
                v-if="clone.clear"
                :image="'brush.png'"
                @click.prevent.stop="clear()"
        >
        </sub-controller> -->
        <!-- <sub-controller
                v-if="clone.code"
                :image="'code.png'"
                @click.prevent.stop="code()"
        >
        </sub-controller> -->
        <sub-controller
                v-if="!isHexagonalModeling && selectedList"
                :image="'content-cut.png'"
                @click.prevent="cutElement"
        ></sub-controller>
        <sub-controller
                v-if="!isHexagonalModeling && clipboard"
                :image="'content-paste.png'"
                @click.prevent="pasteElement"
        ></sub-controller>
        <sub-controller
                v-if="!isHexagonalModeling"
                :image="'copy.png'"
                @click.prevent.stop="copyPaste()"
        ></sub-controller>

        <div v-if="isHexagonalModeling && type.endsWith('BoundedContext')">
            <sub-controller
                    :image="'../event/aggregate.png'"
                    v-on:click="addAggregateElement"
            ></sub-controller>
        </div>
        <div v-if="isHexagonalModeling && type.endsWith('Aggregate')">
            <sub-controller
                    :image="'../event/event.png'"
                    v-on:click="addEventElement"
            ></sub-controller>
            <sub-controller
                    :image="'../event/command.png'"
                    v-on:click="addCommandElement"
            ></sub-controller>
            <sub-controller
                    :image="'../event/policy.png'"
                    v-on:click="addPolicyElement"
            ></sub-controller>
        </div>

        <div v-if="canvasType == 'cm'">
            <sub-controller
                    :image="'../event/link-box-variant-outline.png'"
                    v-on:click="moveToModel"
            ></sub-controller>
        </div>
<!--        <sub-controller-->
<!--                v-if="type.endsWith('BoundedContext') && canvas && canvas.viewId"-->
<!--                :image="'main.png'"-->
<!--                @click.prevent.stop="selectMain()"-->
<!--        ></sub-controller>-->
    </div>

</template>

<script>
    var Minio = require('minio');
    import TenantAware from "../../labs/TenantAware";
    import isAttached from "../../../utils/isAttached";
    import getParent from '../../../utils/getParent'

    export default {
        name: 'storming-sub-controller',
        props: {
            type: String,
            className: String,
            calleeDefinitionId: String,
            elementId: String,
            value: Object,
            readOnly: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            isHexagonalModeling: Boolean,
            canvasType: String,
            isProjectConnecting: Boolean
        },
        mixins: [TenantAware],
        computed: {
            selectedList() {
                var me = this;
                var list = [];
                if( me.canvas && me.canvas.value ) {
                    Object.values(me.canvas.value.elements).forEach((element) => {
                        if (me.canvas.validateElementFormat(element)) {
                            let component = me.canvas.$refs[element.elementView.id];
                            if (component) {
                                component = component[0];
                                if (component.selected) {
                                    list.push(element);
                                }
                            }
                        }
                    });
                }
                if (list.length > 0) {
                    me.selectedElements = list;
                }
                return list;
            }
        },
        data: function () {
            return {
                clone: {
                    rotate: false,
                    gateway: false,
                    ide: false,
                    clear: false,
                    code: false
                },
                options: [
                    {
                        name: 'IDE',
                    }
                ],
                canvas: null,

                // hexagonal
                inputLen: 0,
                outputLen: 0,
                inputXDistance: 0,
                inputYDistance: 0,
                outputXDistance: 0,
                outputYDistance: 0,

                clipboard: null,
                selectedElements: [],
            }
        },
        watch: {
            'readOnly': function (newVal) {
                console.log(newVal)
            }
        },
        mounted: function () {
            var me = this
            if (!me.readOnly)
                this.clone.rotate = true;

            if (this.type == "org.uengine.modeling.model.BoundedContext") {
                this.clone.ide = true;
                this.clone.clear = true;
                this.clone.code = true;
            } else if (this.type.includes("org.uengine.modeling.model")) {
                this.clone.code = true;
            }
            me.canvas = me.getComponent('event-storming-model-canvas')
            
            me.clipboard = localStorage.getItem("clipboard") ? JSON.parse(localStorage.getItem("clipboard")) : null;
        },
        /**
         * clone : 컨트롤러에 의해 신규 bpmn 이 생성되었을 경우
         * showComponentChange : 컨트롤러중 렌치 모양을 클릭하여 도형 변경 창을 여는 경우
         */
        methods: {
            moveToModel(){
                if(this.value.definitionId && this.isProjectConnecting) {
                    window.open(`/#/storming/${this.value.definitionId}`, "_blank");
                } else {
                    this.$emit('createDefinition')
                }
            },
            selectMain(){
                // this.$emit('selectMain');
            },
            end() {

            },
            cutElement() {
                var me = this;
                if (me.selectedElements.length > 0) {
                    me.clipboard = {
                        elements: me.selectedElements
                    };
                    localStorage.setItem("clipboard", JSON.stringify(me.clipboard));
                }
            },
            pasteElement() {
                var me = this;
                var elementIds = [];
                me.clipboard = JSON.parse(localStorage.getItem("clipboard"));
                if (me.clipboard) {
                    if (me.clipboard.elements && me.clipboard.elements.length > 0) {
                        me.clipboard.elements.forEach(element => {
                            let tmp = element;
                            tmp.id = me.canvas.uuid();
                            tmp.elementView.id = tmp.id;

                            // me.canvas.addElements(me.canvas.value, tmp);
                            me.canvas.appendElement(tmp);

                            elementIds.push(tmp.id);
                        })
                    }
                }
                
                me.$nextTick(() => {
                    elementIds.forEach(id => {
                        let component = me.canvas.$refs[id];
                        if (component) {
                            component = component[0];
                            component.selected = true;
                        }
                    })
                })
            },
            copyPaste() {
                var me = this
                let id = me.value.id ? me.value.id : me.value.elementView.id
                me.$EventBus.$emit('copyPaste', id);
            },
            handleClick(event) {
                event.pageY = event.pageY - 62;
                this.$refs.vueSimpleContextMenu.showMenu(event)
            },
            optionClicked(event) {
                var me = this
                console.log(me.className);
                console.log(me)
                if (event.option.name == 'Get Pods') {
                    me.getPods();
                } else if (event.option.name == 'IDE') {
                    me.ide();
                } else if (event.option.name == 'Serivce') {
                    me.service();
                }
            },
            getPods() {
                $('iframe').get(0).contentWindow.wt.term.term.send("kubectl get po \r")
            },
            ide() {
                var me = this
                var userName = localStorage.getItem("author").split('@')[0].toLowerCase();
                var userGroup = localStorage.getItem("author").split('@')[1].split('.')[0].toLowerCase();
                var modelingDesigner = me.getComponent('event-storming-model-canvas')
                console.log(`${userName}-${userGroup}-${modelingDesigner.projectName}-${me.$parent.$parent.value.name}`)
                me.$http.get(`https://api.${me.getTenantId()}/api/v1/namespaces/default/services/ide-for-${userName}-${userGroup}-${modelingDesigner.projectName.toLowerCase()}-${me.$parent.$parent.value.name.toLowerCase()}`).then(function (result) {
                    window.open(`#/IdeLoadingPage?param=ide-for-${userName}-${userGroup}-${modelingDesigner.projectName.toLowerCase()}-${me.$parent.$parent.value.name.toLowerCase()}`, '_blank')
                }).catch(function (e) {
                    if (e.toString().includes(500)) {
                        // 없을 경우 접속 (500 에러로 판단)
                        let id = me.$parent.$parent.value.id ? me.$parent.$parent.value.id : me.$parent.$parent.value.elementView.id
                        me.$EventBus.$emit('deploy', id);
                    }
                })
            },
            service() {
                var me = this
                // console.log(me.$parent.$parent.value.elementView.id)
                me.$EventBus.$once('returnDeployData', function (data) {
                    var serviceFileKey, serviceFileCode;
                    data.fullPathList.forEach(function (itemKey) {
                        if (itemKey.fullPath.includes('kubernetes/service')) {
                            serviceFileKey = itemKey.key
                        }
                    })
                    data.getCodeList.forEach(function (itemCode) {
                        if (itemCode.key == serviceFileKey) {
                            serviceFileCode = itemCode.code
                        }
                    })
                    console.log(serviceFileCode);
                })
                let id = me.$parent.$parent.value.id ? me.$parent.$parent.value.id : me.$parent.$parent.value.elementView.id
                me.$EventBus.$emit('service', id);
            },
            clear() {
                var me = this
                var objectsList = []
                var minioClient = new Minio.Client({
                    endPoint: 'minio-std.msaez.io',
                    port: 443,
                    useSSL: true,
                    accessKey: 'minio',
                    secretKey: 'minio123'
                });
                var userName = localStorage.getItem("author").split('@')[0].toLowerCase();
                var userGroup = localStorage.getItem("author").split('@')[1].split('.')[0].toLowerCase();
                var modelingDesigner = me.getComponent('event-storming-model-canvas')
                console.log(`${userGroup}-${userName}-${modelingDesigner.projectName}-${me.$parent.$parent.value.name}`)
                var objectsStream = minioClient.listObjects('eventstorming', `${userGroup}/${userName}/${modelingDesigner.projectName.toLowerCase()}/${me.$parent.$parent.value.name}`, true);
                objectsStream.on('data', function (obj) {
                    console.log(obj)
                    objectsList.push(obj.name);
                })

                objectsStream.on('error', function (e) {
                    console.log(e);
                })

                objectsStream.on('end', function () {
                    minioClient.removeObjects('eventstorming', objectsList, function (e) {
                        if (e) {
                            return console.log('Unable to remove Objects ', e)
                        }
                        modelingDesigner.deleteBounded = me.$parent.$parent.value.name;
                        modelingDesigner.deleteSnackbar = true;
                    })
                })
            },
            rotate() {
                var me = this
                var positionX = this.value.elementView.x / 1000
                var positionY = this.value.elementView.y / 1000
                let id = this.value.id ? this.value.id : this.value.elementView.id
                $(`#${id}`).css('transform-origin', `${positionX}% ${positionY}%`);

                if (this.value.rotateStatus) {
                    $(`#${id}`).css('transform', `rotate(0deg)`);
                    this.value.rotateStatus = false
                    this.$emit('update:rotateStatus', this.value)
                } else {
                    $(`#${id}`).css('transform', `rotate(-30deg)`);
                    this.value.rotateStatus = true
                    this.$emit('update:rotateStatus', this.value)
                }
                me.canvas.changedByMe = true
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

            // hexagonal
            addEventElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {
                    var modelInfo = me.setOutputAdapterInfo(sourceElement);
                    me.createElement(sourceElement, 'domain-event-definition', modelInfo);
                }
            },
            addCommandElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {
                    var modelInfo = me.setInputAdapterInfo(sourceElement);
                    me.createElement(sourceElement, 'command-definition', modelInfo);
                }
            },
            addPolicyElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {
                    var modelInfo = me.setInputAdapterInfo(sourceElement);
                    me.createElement(sourceElement, 'policy-definition', modelInfo);
                }
            },
            addAggregateElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {
                    var modelInfo = {
                        'x': 0,
                        'y': 0,
                        'hexagonalX': sourceElement.x,
                        'hexagonalY': sourceElement.y,
                    };
                    
                    var bcX = JSON.parse(JSON.stringify(me.value.elementView.x))
                    var bcY = JSON.parse(JSON.stringify(me.value.elementView.y))
                    var bcW = JSON.parse(JSON.stringify(me.value.elementView.width))
                    var bcH = JSON.parse(JSON.stringify(me.value.elementView.height))

                    function randomCoordinate(min, max) {
                        return Math.floor(Math.random() * (max - min)) + min;
                    }
                    
                    modelInfo.x = randomCoordinate(bcX-bcW/2+50, bcX+bcW/2-50)
                    modelInfo.y = randomCoordinate(bcY-bcH/2+50, bcY+bcH/2-50)

                    me.createElement(sourceElement, 'aggregate-definition', modelInfo);
                }
            },
            setInputAdapterInfo: function(sourceElement) {
                var me = this;
                var standard = 30;
                var modelInfo = {
                    'x': 0,
                    'y': 0,
                    'hexagonalX': sourceElement.x - sourceElement.width*2,
                    'hexagonalY': sourceElement.y,
                };

                var aggX = JSON.parse(JSON.stringify(me.value.elementView.x))
                var aggY = JSON.parse(JSON.stringify(me.value.elementView.y))
                var aggW = JSON.parse(JSON.stringify(me.value.elementView.width))
                var aggH = JSON.parse(JSON.stringify(me.value.elementView.height))

                modelInfo.x = aggX - aggW / 2 - 20;
                modelInfo.y = aggY - aggH / 2;

                Object.values(me.canvas.value.elements).forEach(function(element, index) {
                    if(me.canvas.validateElementFormat(element)) {
                        if(!element._type.endsWith('BoundedContext')) {

                            if (isAttached(me.value, element)) {
                                if(element._type.endsWith('Command') || element._type.endsWith('Policy')) {
                                    if(modelInfo.y <= element.elementView.y) {
                                        modelInfo.y = element.elementView.y + (element.elementView.height / 2) + 60
                                        modelInfo.hexagonalX = element.hexagonalView.x
                                        modelInfo.hexagonalY = element.hexagonalView.y + 60
                                    }
                                }
                            }
                        }
                    }
                })
                
                return modelInfo;
            },
            setOutputAdapterInfo: function(sourceElement) {
                var me = this;
                var standard = 30;
                var modelInfo = {
                    'x': 0,
                    'y': 0,
                    'hexagonalX': sourceElement.x + sourceElement.width*2,
                    'hexagonalY': sourceElement.y,
                };

                var aggX = JSON.parse(JSON.stringify(me.value.elementView.x))
                var aggY = JSON.parse(JSON.stringify(me.value.elementView.y))
                var aggW = JSON.parse(JSON.stringify(me.value.elementView.width))
                var aggH = JSON.parse(JSON.stringify(me.value.elementView.height))

                modelInfo.x = aggX + aggW / 2 + 20;
                modelInfo.y = aggY - aggH / 2;

                Object.values(me.canvas.value.elements).forEach(function(element, index) {
                    if(me.canvas.validateElementFormat(element)) {
                        if(!element._type.endsWith('BoundedContext')) {

                            if (isAttached(me.value, element)) {
                                if(element._type.endsWith('Event')) {
                                    if(modelInfo.y <= element.elementView.y) {
                                        modelInfo.y = element.elementView.y + (element.elementView.height / 2) + 60
                                        modelInfo.hexagonalX = element.hexagonalView.x
                                        modelInfo.hexagonalY = element.hexagonalView.y + 60
                                    }
                                }
                            }
                        }
                    }
                })
                
                return modelInfo;
            },
            createElement: function (sourceElement, componentName, modelInfo) {
                var me = this;
                var targetElement;
                
                var targetInfo = {
                    x: modelInfo.x,
                    y: modelInfo.y,
                    hexagonalX: modelInfo.hexagonalX,
                    hexagonalY: modelInfo.hexagonalY,
                    width: 100,
                    height: 100,
                    component: componentName
                }
                if (me.canvas && me.isHexagonalModeling) {
                    targetElement = me.canvas.addElement(targetInfo);

                    if(!targetElement._type.includes("Aggregate")) {
                        targetElement.boundedContext = me.value.boundedContext

                        var bcEl = me.canvas.value.elements[me.value.boundedContext.id]
                        var targetTop = targetElement.elementView.y - targetElement.elementView.height / 2;
                        var targetBottom = targetElement.elementView.y + targetElement.elementView.height / 2;
                        var bcBottom = bcEl.elementView.y + bcEl.elementView.height / 2;
                        var aggBottom = me.value.elementView.y + me.value.elementView.height / 2;

                        if(targetTop > aggBottom) {
                            me.canvas.value.elements[sourceElement.elementView.id].elementView.height += 100;
                            me.canvas.value.elements[sourceElement.elementView.id].elementView.y += 50;
                        }
                        if(targetBottom > bcBottom) {
                            //bc
                            me.canvas.value.elements[me.value.boundedContext.id].elementView.height += 100;
                            me.canvas.value.elements[me.value.boundedContext.id].elementView.y += 50;
                        }
                    } else {
                        targetElement.boundedContext.name = me.value.name
                        targetElement.boundedContext.id = me.value.id ? me.value.id : me.value.elementView.id
                    }
                    
                    var values = JSON.parse(JSON.stringify(me.canvas.value))
                    me.canvas.settingHexagonal(values)
                }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>