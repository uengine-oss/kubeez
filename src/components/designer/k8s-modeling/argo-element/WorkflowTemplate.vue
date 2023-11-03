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

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'WorkflowTemplate'">
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
    import PropertyPanel from './WorkflowTemplatePanel';

    export default {
        mixins: [Element],
        name: 'workflowTemplate',
        components: {
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'WorkflowTemplate'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            createNew(elementId, x, y, width, height) {
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
                    object: {
                        "apiVersion": "argoproj.io/v1alpha1",
                        "kind": "WorkflowTemplate",
                        "metadata": {
                            "name": "ci-workflow",
                            "namespace": "argo"
                        },
                        "spec": {
                            "templates": [
                                {
                                    "name": "git-checkout-private",
                                    "inputs": {
                                        "parameters": [
                                            {"name": "repo"},
                                            {"name": "revision"}
                                        ],
                                        "artifacts": [
                                            {
                                                "name": "source",
                                                "path": "/src",
                                                "git": {
                                                    "repo": "{{inputs.parameters.repo}}",
                                                    "revision": "{{inputs.parameters.revision}}",
                                                    "sshPrivateKeySecret": {
                                                        "name": "source-key",
                                                        "key": "ssh-privatekey"
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    "container": {
                                        "image": "alpine/git",
                                        "command": [
                                            "sh",
                                            "-c"
                                        ],
                                        "args": [
                                            "cd /src && git status && ls -l && git rev-parse --short HEAD > /tmp/git-commit"
                                        ]
                                    },
                                    "outputs": {
                                        "artifacts": [
                                            {
                                                "name": "source",
                                                "path": "/src"
                                            }
                                        ],
                                        "parameters": [
                                            {
                                                "name": "tag",
                                                "valueFrom": {
                                                    "path": "/tmp/git-commit"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "name": "run-test",
                                    "inputs": {
                                        "artifacts": [
                                            {
                                                "name": "source",
                                                "path": "/src"
                                            }
                                        ]
                                    },
                                    "container": {
                                        "image": "openjdk:8-jdk-alpine",
                                        "command": [
                                            "sh",
                                            "-c"
                                        ],
                                        "args": [
                                            "cd /src && ls -a && chmod 755 gradlew && ./gradlew test && ./gradlew clean build"
                                        ]
                                    },
                                    "outputs": {
                                        "artifacts": [
                                            {
                                                "name": "source",
                                                "path": "/src"
                                            }
                                        ]
                                    }
                                },
                                {
                                    "name": "build-and-push",
                                    "inputs": {
                                        "artifacts": [
                                            {
                                                "name": "source",
                                                "path": "/workspace"
                                            }
                                        ],
                                        "parameters": [
                                            { "name": "imageUrl" },
                                            { "name": "imageTag" },
                                            { "name": "pathToContext" }
                                        ]
                                    },
                                    "container": {
                                        "image": "gcr.io/kaniko-project/executor:latest",
                                        "args": [
                                            "--dockerfile",
                                            "Dockerfile",
                                            "--destination",
                                            "{{inputs.parameters.imageUrl}}:{{inputs.parameters.imageTag}}"
                                        ],
                                        "env": [
                                            {
                                                "name": "GOOGLE_APPLICATION_CREDENTIALS",
                                                "value": "/secret/google.json"
                                            }
                                        ],
                                        "volumeMounts": [
                                            {
                                                "name": "gcp-creds",
                                                "mountPath": "/secret"
                                            }
                                        ]
                                    },
                                    "activeDeadlineSeconds": 60
                                },
                            ]
                        }
                    },
                    advancedAttributePaths: {},
                    connectableType: [],
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
        },
        data: function () {
            return {};
        },
        created() {},
        mounted: function () {
            var me = this;
            
            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
            });
        },
        watch: {
        },
        methods: {},
    }
</script>

<style>

</style>