<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                v-on:removeShape="onRemoveShape(value)"
                :label.sync="name"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold','font-size': '16'
                }"
                v-on:contextmenu.prevent.stop="handleClick($event)"
        >

            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#98cbff',
                        fill: '#98cbff',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-controller
                    :image="'subprocess.png'"
                    @click.prevent.stop="drawFrame(yamlSrc)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Rollout'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="30"
                        :sub-height="25">
                </image-element>
            </sub-elements>

            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes" :key="idx"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component">
            </k8s-sub-controller>

        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        >
        </property-panel>

        <vue-context-menu
            :elementId="value.elementView.id"
            :options="menuList"
            :ref="'vueSimpleContextMenu'"
            @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import PropertyPanel from './RolloutPanel';

    export default {
        mixins: [Element],
        name: 'rollout',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Rollout'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: object ? object: {
                        "apiVersion": "argoproj.io/v1alpha1",
                        "kind": "Rollout",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "replicas": 1,
                            "revisionHistoryLimit": 10,
                            "selector": {
                                "matchLabels": {
                                    "app": ""
                                }
                            },
                            "template": {
                                "metadata": {
                                    "labels": {
                                        "app": ""
                                    }
                                },
                                "spec": {
                                    "containers": [
                                        {
                                            "name": "",
                                            "image": ""
                                        }
                                    ]
                                }
                            },
                            "strategy": {
                                "canary": {
                                    "trafficRouting": {},
                                    "steps": [
                                        {
                                            "setWeight": 5
                                        },
                                        {
                                            "pause": {
                                                "duration": "10s"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    connectableType: [ "VirtualService", "DestinationRuleSubset" ],
                    relationComponent: "RolloutRelation",
                    outboundVirtualService: null,
                    outboundDestinationRule: [],
                    advancedAttributePaths: {},
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;    
                } catch(e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace;
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal;
                }
            },
            appName() {
                try {
                    return this.value.object.spec.selector.matchLabels.app;    
                } catch(e) {
                    return "Untitled";
                }
            },
            outboundVirtualServiceName() {
                try {
                    return this.value.outboundVirtualService.object;
                } catch(e) {
                    return "";
                }
            },
            outboundDestinationRuleNames() {
                try {
                    var me = this;
                    var names = "";
                    if(!me.value.object.spec.strategy.canary.trafficRouting.istio) {
                        me.value.object.spec.strategy.canary.trafficRouting.istio = {}
                        me.value.object.spec.strategy.canary.trafficRouting.istio['destinationRule'] = {}
                    }
                    me.value.outboundDestinationRule.forEach(el => {
                        names += el.name + "," + el.version;
                        me.setDestination(el);
                    });
                    return names;
                } catch(e) {
                    return "";
                }
            },
        },
        data: function () {
            return {
                yamlSrc: `${window.location.protocol + "//" + window.location.host}/static/kubernetes/rollout-canary.yaml`
            };
        },
        created() {
            var me = this;
            me.menuList.push({name: "kubectl argo rollouts set image " + me.value.object.metadata.name + " "});
            me.menuList.push({name: "kubectl argo rollouts get rollout " + me.value.object.metadata.name});
            me.menuList.push({name: "kubectl argo rollouts undo " + me.value.object.metadata.name});
            me.menuList.push({name: "kubectl argo rollouts promote " + me.value.object.metadata.name + " --full"});
        },
        mounted: function () {
            var me = this;
            me.setWeightPause((me.value.object.spec.strategy.canary.steps).length);
            
            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "VirtualService") {
                    me.value.outboundVirtualService = obj.element.targetElement;
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "VirtualService") {
                    me.value.outboundVirtualService = null;
                    delete me.value.object.spec.strategy.canary.trafficRouting.istio.virtualService;
                }

                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRuleSubset") {
                    var res = me.value.outboundDestinationRule.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    });
                    if(!res) {
                        obj.element.targetElement.version = obj.element.version;
                        me.value.outboundDestinationRule.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "DestinationRuleSubset") {
                    me.value.outboundDestinationRule.splice(me.value.outboundDestinationRule.indexOf(obj.element.targetElement), 1);
                    if(obj.element.targetElement.version == "canary") {
                        delete me.value.object.spec.strategy.canary.trafficRouting.istio.destinationRule.canarySubsetName;
                    } else {
                        delete me.value.object.spec.strategy.canary.trafficRouting.istio.destinationRule.stableSubsetName;
                    }
                }
            });
        },
        watch: {
            name(appName){
                this.menuList.forEach((cmd) => {
                    if(cmd.name.includes('set image')) {
                        cmd.name = "kubectl argo rollouts set image " + appName;
                    }
                    if(cmd.name.includes('get rollout')) {
                        cmd.name = "kubectl argo rollouts get rollout " + appName;
                    }
                    if(cmd.name.includes('undo')) {
                        cmd.name = "kubectl argo rollouts undo " + appName;
                    }
                    if(cmd.name.includes('promote')) {
                        cmd.name = "kubectl argo rollouts promote " + appName + " --full";
                    }
                })
            },
            appName(val) {
                this.value.object.spec.template.metadata.labels.app = val;
            },
            'value.object': {
                deep: true,
                handler(val) {
                    var me = this;
                    // console.log(val);
                    me.setWeightPause((me.value.object.spec.strategy.canary.steps).length);
                    me.refreshImg();
                }
            },
            outboundVirtualServiceName(val) {
                var me = this;
                if(val) {
                    var vsvc = {
                        "name": val.metadata.name,
                        "routes": [
                            val.spec.http[0].name
                        ]
                    };
                    if(me.value.object.spec.strategy.canary.trafficRouting.istio) {
                        me.value.object.spec.strategy.canary.trafficRouting.istio.virtualService = vsvc;
                    } else {
                        me.value.object.spec.strategy.canary.trafficRouting.istio = {}
                        me.value.object.spec.strategy.canary.trafficRouting.istio['virtualService'] = vsvc
                    }
                }
            },
            outboundDestinationRuleNames() {
                var me = this;
            },
        },
        methods: {
            setDestination(val) {
                var me = this;
                // console.log(val)
                me.value.object.spec.strategy.canary.trafficRouting.istio.destinationRule['name'] = val.parentElName
                
                if(val.version == "canary") {
                    me.value.object.spec.strategy.canary.trafficRouting.istio.destinationRule['canarySubsetName'] = val.name
                } else {
                    me.value.object.spec.strategy.canary.trafficRouting.istio.destinationRule['stableSubsetName'] = val.name
                }
            },
            setWeightPause(val) {
                var me = this;
                let weight = "spec.strategy.canary.steps[" + val + "]";
                val++;
                let pause = "spec.strategy.canary.steps[" + val + "]";
                let obj = {
                    [weight]: {
                        "setWeight": 5,
                    },
                    [pause]: {
                        "pause": {
                            "duration": "10s"
                        }
                    }
                };
                me.value.advancedAttributePaths = obj;
            },
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(to._type == 'VirtualService' && from.object.spec.strategy.canary.trafficRouting.istio) {
                        if(from.object.spec.strategy.canary.trafficRouting.istio['virtualService']) {
                            if(from.object.spec.strategy.canary.trafficRouting.istio.virtualService.name == to.object.metadata.name) {
                                res = true
                            }
                        }
                    }
                    if(to._type == 'DestinationRuleSubset' && from.object.spec.strategy.canary.trafficRouting.istio) {
                        if(from.object.spec.strategy.canary.trafficRouting.istio['destinationRule']) {
                            if(from.object.spec.strategy.canary.trafficRouting.istio.destinationRule.name == to.parentElName) {
                                if(from.object.spec.strategy.canary.trafficRouting.istio.destinationRule.canarySubsetName == to.name) {
                                    res = true
                                } else if(from.object.spec.strategy.canary.trafficRouting.istio.destinationRule.stableSubsetName == to.name) {
                                    res = true
                                }
                            }
                        }
                    }
                }
                return res
            },
        },
    }
</script>

<style>

</style>