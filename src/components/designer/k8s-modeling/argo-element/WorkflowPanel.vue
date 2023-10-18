<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="readOnly"
            @openDesDoc="desDocOpen"
            @close="closePanel"
    >
        <template slot="headline">
            <v-list-item-title class="headline">
                {{ value._type }}
            </v-list-item-title>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-layout">
            <v-layout wrap>
                <v-flex shrink style="width: 230px;">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field                                
                                    label="Name"
                                    v-model="value.object.metadata.generateName"
                                    autofocus
                                    :disabled="readOnly"
                            ></v-text-field>
                            <v-text-field
                                    label="Entrypoint"
                                    :disabled="readOnly"
                                    v-model="value.object.spec.entrypoint"
                            ></v-text-field>
                            <v-text-field
                                    label="Template Name"
                                    :disabled="readOnly"
                                    v-model="value.object.spec.templates[0].name"
                            ></v-text-field>
                            <v-btn
                                    v-if="value.workflowType == 'Steps' || value.workflowType == 'Dag'"
                                    color="primary"
                                    text
                                    :disabled="readOnly"
                                    @click="addProperty"
                                    class="mb-4"
                            >
                                <label v-if="value.workflowType == 'Steps'">ADD STEP</label>
                                <label v-else-if="value.workflowType == 'Dag'">ADD TASK</label>
                            </v-btn>
                            <kube-attr-field 
                                    v-model="value" 
                                    :readOnly="readOnly"
                            ></kube-attr-field>
                        </v-card-text>
                    </v-card>
                </v-flex>
                <v-flex>
                    <kube-yaml-editor
                            v-model="value.object"
                            :readOnly="readOnly"
                    ></kube-yaml-editor>
                </v-flex>
            </v-layout>
        </template>
    </kubernetes-common-panel>
</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'workflow-property-panel',
        computed: {
            descriptionText() {
                return 'Workflow'
            },
        },
        data: function () {
            return {}
        },
        watch: {
            'value.object.metadata.generateName': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                }
            },
        },
        methods: {
            addProperty() {
                var me = this;
                var newIdx

                if(me.value.workflowType == "Steps") {
                    newIdx = me.value.object.spec.templates[0].steps.length;
                    me.attrKey = "spec.templates[0].steps[" + newIdx + "][0]";
                    me.attrVal = {
                        "name": "Step"+(newIdx+1),
                        "template": "",
                        "arguments": {
                            "parameters": []
                        }
                    };
                } else if(me.value.workflowType == "Dag") {
                    newIdx = me.value.object.spec.templates[0].dag.tasks.length;
                    me.attrKey = "spec.templates[0].dag.tasks[" + newIdx + "]";
                    me.attrVal = {
                        "name": "Task"+(newIdx+1),
                        "template": "",
                        "arguments": {
                            "parameters": []
                        }
                    };
                }
                
                me.value.object.metadata.generateName = me.value.object.metadata.generateName + ",";
                _.set(me.value.object, me.attrKey, me.attrVal);
                _.set(me.value.advancedAttributePaths, me.attrKey, me.attrVal);

                me.$nextTick(() => {
                    if(me.value.workflowType == "Steps") {
                        newIdx = me.value.object.spec.templates[0].steps.length;
                        me.$emit('setSteps', newIdx);
                    } else if(me.value.workflowType == "Dag") {
                        newIdx = me.value.object.spec.templates[0].dag.tasks.length;
                        me.$emit('setTasks', newIdx);
                    }
                    me.value.object.metadata.generateName = me.value.object.metadata.generateName.replace(',', '');
                });
            }
        }
    }
</script>


