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
                :image.sync="refreshedImg"
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
                        'stroke': '#fdd835',
                        fill: '#fdd835',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'ReplicaSet'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25"
                ></image-element>
            </sub-elements>

            <sub-elements>
                <rectangle-element
                        v-if="value.status"
                        :sub-bottom="-20"
                        :sub-width="'50%'"
                        :sub-height="25"
                        :sub-align="'center'"
                        :sub-style="{
                            'stroke': statusColor,
                            fill: statusColor,
                            'fill-opacity': 1,
                            'font-weight': 'bold',
                            'font-size': '15',
                            'font-color': '#ffffff'
                        }"
                        :label.sync="value.replicasStatus">
                </rectangle-element>
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
                :validationLists="filteredElementValidationResults"
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
    import PropertyPanel from './ReplicaSetPropertyPanel'

    export default {
        mixins: [Element],
        name: 'replicaSet',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'ReplicaSet'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs.svg`
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace:'',
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
                        "apiVersion": "apps/v1",
                        "kind": "ReplicaSet",
                        "metadata": {
                            "name": "",
                            "labels": {
                                "app": ""
                            }
                        },
                        "spec": {
                            "replicas": 1,
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
                                            "image": "",
                                            "ports": [
                                                {
                                                    "containerPort": 80
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    connectableType: [ "PersistentVolumeClaim", "ConfigMap", "Secret" ],
                    status: null,
                    replicasStatus: "",
                    inboundDestinationRule: null,
                    outboundVolumes: [],
                    outboundConfigMaps: [],
                    outboundSecrets: [],
                    advancedAttributePaths: {
                        "spec.template.spec.containers[0].resources[0]": {
                            "limits": { 
                                "cpu": "100m", 
                                "mem": "512Mi"
                            }
                        },
                    },
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal
                }
            },
            name(){
                try{
                    return this.value.object.metadata.name;
                }catch(e){
                    return "Untitled";
                }
            },
            inboundDRuleName() {
                try {
                    return this.value.inboundDestinationRule.metadata.name;
                } catch (e) {
                    return "";
                }
            },
            outboundVolumeNames() {
                var me = this
                try {
                    var names = "";
                    me.value.outboundVolumes.forEach(element => {
                        names += element.object.metadata.name + ","
                    });

                    return names;
                } catch (e) {
                    return "";
                }
            },
            outboundConfigMapNames() {
                try {
                    var names = "";
                    this.value.outboundConfigMaps.forEach(el => {
                        names += el.object.metadata.name + ",";
                    });
                    return names;
                } catch (e) {
                    return "";
                }
            },
            outboundSecretNames() {
                try {
                    var me = this;
                    var names = "";
                    me.value.outboundSecrets.forEach(el => {
                        names += el.object.metadata.name + ",";
                        me.setEnv(el);
                    });
                    return names;
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {};
        },
        created: function () {
            this.menuList.push({name: "kubectl get po -l app=" + this.value.object.metadata.name});
        },
        mounted: function () {
            var me = this;

            if(me.value.status) {
                me.setReplicasStatus()
                me.refreshImg()
            }

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if (obj.action == "addRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "DestinationRuleSubset") {
                    me.value.object.metadata.labels.version = obj.element.sourceElement.name;
                    me.value.object.spec.selector.matchLabels.version = obj.element.sourceElement.name;
                    me.value.object.spec.template.metadata.labels.version = obj.element.sourceElement.name;
                    me.value.inboundDestinationRule = obj.element.sourceElement.object;
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.sourceElement && obj.element.sourceElement._type == "DestinationRuleSubset") {
                    delete me.value.object.metadata.labels.version;
                    delete me.value.object.spec.selector.matchLabels.version;
                    delete me.value.object.spec.template.metadata.labels.version;
                    me.value.inboundDestinationRule = null;
                }

                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "PersistentVolumeClaim") {
                    var duplicate = me.value.outboundVolumes.find(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    var duplicateIndex = me.value.outboundVolumes.findIndex(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    if (duplicate) {
                        // 재연결 및 업데이트 기능
                        obj.element.sourceElement = me.value
                        me.value.outboundVolumes[duplicateIndex] = obj.element.targetElement
                        me.value.outboundVolumes.__ob__.dep.notify();
                        return true
                    } else {
                        me.value.outboundVolumes.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "PersistentVolumeClaim") {
                    me.value.outboundVolumes.splice(me.value.outboundVolumes.indexOf(obj.element.targetElement), 1);
                }

                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ConfigMap") {
                    var res = me.value.outboundConfigMaps.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    });
                    if(!res) {
                        me.value.outboundConfigMaps.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ConfigMap") {
                    me.value.outboundConfigMaps.splice(me.value.outboundConfigMaps.indexOf(obj.element.targetElement), 1);
                }
                
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Secret") {
                    me.value.object.spec.template.spec.containers[0].env = [];
                    var res = me.value.outboundSecrets.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    });
                    if(!res) {
                        me.value.outboundSecrets.push(obj.element.targetElement);
                        // me.setEnv(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Secret") {
                    me.value.outboundSecrets.splice(me.value.outboundSecrets.indexOf(obj.element.targetElement), 1);
                }
            })
        },
        watch: {
            name(appName){
                this.menuList.forEach((cmd) => {
                    if(cmd.name.includes('-l app=')) {
                        cmd.name = "kubectl get po -l app=" + appName;
                    }
                })
            },
            inboundDRuleName(val) {
                var me = this;
                me.value.object.metadata.labels.version = val;
                me.value.object.spec.selector.matchLabels.version = val;
                me.value.object.spec.template.metadata.labels.version = val;
            },
            outboundVolumeNames(val) {
                var me = this;
                me.value.object.spec.template.spec.volumes = [];
                me.value.object.spec.template.spec.containers[0].volumeMounts = [];
                me.value.outboundVolumes.forEach(element => {
                        me.value.object.spec.template.spec.volumes.push({
                            "name": element.object.metadata.name,
                            "persistentVolumeClaim": {
                                "claimName": element.object.metadata.name
                            }
                        });
                        me.value.object.spec.template.spec.containers[0].volumeMounts.push({
                            "mountPath": "/data",
                            "name": element.object.metadata.name
                        });
                    }
                );
            },
            outboundConfigMapNames() {
                var me = this;
                me.value.object.spec.template.spec.containers[0].envFrom = [];
                me.value.outboundConfigMaps.forEach(cm => {
                    me.value.object.spec.template.spec.containers[0].envFrom.push({
                        "configMapRef": {
                            "name": cm.object.metadata.name
                        }
                    });
                });
            },
            outboundSecretNames(val) {
                // console.log(val);
            },
            "value": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                }, 200)
            },
        },

        methods: {
            setReplicasStatus() {
                var me = this
                var replicas = 0
                var availableReplicas = 0

                availableReplicas = me.value.status.availableReplicas ? me.value.status.availableReplicas : 0
                replicas = me.value.status.replicas ? me.value.status.replicas : me.value.status.replicas
                
                me.value.replicasStatus = String(availableReplicas) + " / " + String(replicas)

                if(replicas > 0 && availableReplicas > 0 && availableReplicas == replicas) {
                    me.deploySuccess = true
                } else {
                    me.deploySuccess = false
                }
            },
            setEnv(el) {
                var me = this;
                var keyArr = Object.keys(el.object.data);
                me.value.object.spec.template.spec.containers[0].env = [];
                keyArr.forEach(key => {
                    var env = {
                        'name': key.toUpperCase(),
                        'valueFrom': {
                            'secretKeyRef': {
                                'name': el.object.metadata.name,
                                'key': key
                            }
                        }
                    }
                    me.value.object.spec.template.spec.containers[0].env.push(env);
                });
                if(me.value.object.spec.template.spec.containers[0].env.length == 0) {
                    delete me.value.object.spec.template.spec.containers[0].env
                }
            },
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(to._type == 'PersistentVolumeClaim' && from.object.spec.template.spec.volumes) { 
                        res = from.object.spec.template.spec.volumes.some((volume) => {
                            if(volume.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(to._type == 'ConfigMap' && from.object.spec.template.spec.containers[0].envFrom) {
                        res = from.object.spec.template.spec.containers[0].envFrom.some((cm) => {
                            if(cm.configMapRef.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(to._type == 'Secret' && from.object.spec.template.spec.containers[0].env) {
                        res = from.object.spec.template.spec.containers[0].env.some((secret) => {
                            if(secret.valueFrom.secretKeyRef.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    }
                }
                return res
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
        },
    }
</script>

<style>

</style>