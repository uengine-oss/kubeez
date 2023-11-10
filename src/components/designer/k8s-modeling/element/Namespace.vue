<template>
    <div>
        <group-element
                :selectable="!canvas.isReadOnlyModel"
                :movable="!canvas.isReadOnlyModel"
                :resizable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :label.sync="name"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addToGroup="onAddToGroup"
                v-on:removeShape="onRemoveShape(value)"
                :image.sync="refreshedImg"
                :_style="{
                    'vertical-align': 'top',
                    'font-weight': 'bold',
                    'font-size': '16',
        }">
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#000000',
                        'fill-opacity': 0,
                        r: '1'
                    }"
            ></geometry-rect>

            <sub-elements>
                <!--title-->
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25"
                ></image-element>
            </sub-elements>
            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>
        </group-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :validationLists="filteredElementValidationResults"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></property-panel>

        <vue-context-menu
                :elementId="value.elementView.id"
                :options="contextMenuList"
                :ref="'vueSimpleContextMenu'"
                @option-clicked="optionClicked">
        </vue-context-menu>

    </div>
</template>

<script>
    import PropertyPanel from './NamespacePropertyPanel'
    import Element from "../KubernetesElement";
    import GroupElement from "../../../opengraph/shape/GroupElement";
    import ImageElement from "../../../opengraph/shape/ImageElement";

    var changeCase = require('change-case');
    var pluralize = require('pluralize');


    export default {
        components: {ImageElement, GroupElement,PropertyPanel},
        mixins: [Element],
        name: 'namespace',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Namespace'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ns.svg`
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                    },
                    object: object ? object : {
                        "apiVersion": "v1",
                        "kind": "Namespace",
                        "metadata": {
                            "name": "",
                        },
                        "spec": {
                            "finalizers": [
                                "kubernetes"
                            ]
                        }
                    },
                    advancedAttributePaths: {
                        "metadata.labels": {
                            "istio-injection": ""
                        },
                    },
                    innerElement: []
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch(e) {
                    return "Untitled";
                }
            },
            contextMenuList() {
                try {
                    var list = [ { name: "Terminal Open" } ]
                    this.value.innerElement.forEach(function(element)  {
                        // console.log(element)
                    })
                    return list
                } catch (e) {
                    return [ { name: "Terminal Open" } ]
                }
            }
        },
        data: function () {
            return {
            };
        },
        created: function () {
        },
        watch: {
            name: _.debounce(function(appName) {
                var me= this
                var obj = {
                    state: 'changeName',
                    element: appName
                }
                this.value.innerElement.forEach(function(element)  {
                    me.$EventBus.$emit(element, obj)
                })
            }, 300),
            "value": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                }, 200)
            },
        },
        mounted: function () {
            var me = this
            me.$EventBus.$on(`${me.value.elementView.id}`, function(message) {
                me.value.innerElement.splice(me.value.innerElement.indexOf(message.element), 1);
            })
        },
        methods: {
            deleteNameSpace() {
                var me = this
                return new Promise(function (resolve) {
                    me.value.aggregates.forEach(function (aggregate) {
                        console.log(aggregate.elementView.id)
                        var obj = {
                            state: "deleteBounded",
                            element: me.value
                        }
                        me.$EventBus.$emit(aggregate.elementView.id, obj)
                    })
                    me.deleteInNameSpace(me.value.name)
                    me.$EventBus.$off(`${me.value.elementView.id}`);
                    me.$emit('update:value', null);
                    // me.$EventBus.$emit('storage')
                    resolve()
                })
            },
            deleteInNameSpace(boundedName) {
                var me = this
                var designer = this.getComponent('kubernetes-model-canvas')

                designer.value.definition.forEach(function (item, idx) {
                    if (item != null) {
                        if (item.boundedContext && item.boundedContext.name == boundedName) {
                            // console.log("boundedItem Id : ", item.elementView.id)
                            me.$EventBus.$off(`${item.elementView.id}`);
                            designer.value.definition[idx] = null;
                        }
                    }
                })
                // me.$EventBus.$emit('storage')
            },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                this.$super(Element).validate()

                //Element
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }

                me.canvas.changedTemplateCode = true
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
