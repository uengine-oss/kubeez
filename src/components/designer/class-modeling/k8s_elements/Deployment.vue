<template>
    <div>
        <image-element
                selectable
                movable
                :resizable="editMode"
                connectable
                :deletable=editMode
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="showProperty"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                v-on:removeShape="onRemoveShape(value)"
                :label.sync="name"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }"
                :image='imgSrc'
        >
        </image-element>


         <property-panel
            v-if="openPanel"
            v-model="value"
            :img="imgSrc">
        </property-panel>
    </div>
</template>

<script>
    import Element from '../../modeling/Element'
    import PropertyPanel from './DeploymentPropertyPanel'

    export default {
        mixins: [Element],
        name: 'deployment',
        props: {},

        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Deployment'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-128.png`
            },
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    outboundVolumes: [],
                    object: {
                       "apiVersion": "apps/v1",
                        "kind": "Deployment",
                        "metadata": {
                            "name": "",
                            "labels": {
                                "app": ""
                            }
                        },
                        "spec": {
                            "selector": {
                                "matchLabels": {
                                    "app": ""
                                }
                            },
                            "replicas": "1",
                            "template": {
                                "metadata": {
                                    "labels": {
                                        "app": ""
                                    }
                                },
                                "spec": {
                                    "containers": [
                                        {
                                            "name": "main",
                                            "image": "",
                                            "ports": [
                                                {
                                                    "containerPort": "80"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                    
                }
            },
            name(){
                try{
                    return this.value.object.metadata.name; 
                }catch(e){
                    return "";
                }
                
            },

            outboundVolumeNames(){
                try{

                    var names;

                    this.value.outboundVolumes.forEach(element => {
                        names = element.object.metadata.name +  ","
                    });

                    return names;

                }catch(e){
                    return "";
                }
            }


        },
        data: function () {
            return {
                
            };
        },
        created: function () {
        
        },

        mounted(){

            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.state=="addRelation" && obj.element && obj.element.targetElement 
                    && obj.element.targetElement._type == "PersistenceVolumeClaim"){

                    me.value.outboundVolumes.push(obj.element.targetElement);
                }

                if(obj.state=="deleteRelation" && obj.element && obj.element.targetElement 
                    && obj.element.targetElement._type == "PersistenceVolumeClaim"){

                    me.value.outboundVolumes.splice(me.value.outboundVolumes.indexOf(obj.element.targetElement), 1);
                    console.log(me.value.outboundVolumes)
                }
            })

        },

        watch: {
            name(appName){
                this.value.object.metadata.labels.app = appName;
                this.value.object.spec.selector.matchLabels.app = appName;
                this.value.object.spec.template.metadata.labels.app = appName;
            },

            outboundVolumeNames(names){

                console.log(names)
                this.value.object.spec.volumes = [];
                var me = this;
                var i=0; 
                this.value.outboundVolumes.forEach(element => {
                        me.value.object.spec.volumes.push(
                            {
                                "name": "volume" + (++i),
                                "persistenceVolumeClaim": {
                                    "claimName": element.object.metadata.name
                                }
                            }
                        );
                    }
                );
                
            }
        },

        methods: {

        }
    }
</script>
  
<style>

</style>