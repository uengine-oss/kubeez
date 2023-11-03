<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="canvas.isReadOnlyModel"
            @openDesDoc="desDocOpen"
            @close="closePanel"
    >
        <template slot="headline">
            <v-tabs
                    v-model="activeTab"
                    v-if="value.status">
                <v-tab
                        v-for="(tab, idx) in tabItems"
                        :key="idx">
                    <v-list-item-title>{{ tab }}</v-list-item-title>
                </v-tab>
            </v-tabs>
            <v-list-item-title 
                    v-else
                    class="headline">
                {{ value._type }}
            </v-list-item-title>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-layout">
            <v-layout v-if="value.status && activeTab == 0" wrap>
                <v-flex>
                    <v-card flat>
                        <v-card-text>
                            <tree-view
                                    :data="status"
                                    :options="{
                                            rootObjectKey: 'status'
                                        }"
                            ></tree-view>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-layout v-else wrap>
                <v-flex shrink style="width: 180px;">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field                                
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                    autofocus
                                    :disabled="canvas.isReadOnlyModel"
                            ></v-text-field>
                            <v-label>Replicas</v-label>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <kube-number-field
                                            :label="'Min'"
                                            :readOnly="canvas.isReadOnlyModel"
                                            v-model="value.object.spec.minReplicas"
                                    ></kube-number-field>
                                </v-col>
                                <v-col class="py-0">
                                    <kube-number-field
                                            :label="'Max'"
                                            :readOnly="canvas.isReadOnlyModel"
                                            v-model="value.object.spec.maxReplicas"
                                    ></kube-number-field>
                                </v-col>
                            </v-row>
                            <v-select
                                    label="Resource Type"
                                    :disabled="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.metrics[0].resource.name"
                                    :items="resourceTypes">
                            </v-select>
                            <kube-number-field
                                    :label="'AverageUtilization'"
                                    :readOnly="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.metrics[0].resource.target.averageUtilization"
                            ></kube-number-field>
                            <kube-attr-field 
                                    v-model="value" 
                                    :readOnly="canvas.isReadOnlyModel"
                            ></kube-attr-field>
                        </v-card-text>
                    </v-card>
                </v-flex>
                <v-flex>
                    <kube-yaml-editor
                            v-model="value.object"
                            :readOnly="canvas.isReadOnlyModel"
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
        name: 'hpa-property-panel',
        computed: {
            descriptionText() {
                return 'Horizontal Pod Autoscaler'
            },
            status() {
                if(this.value && this.value.status) {
                    return JSON.parse(JSON.stringify(this.value.status))
                } else {
                    return null
                }
            },
        },
        data: function () {
            return {
                activeTab: 0,
                tabItems: [ "status", "property" ],
                resourceTypes: [ "cpu", "memory" ]
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                }
            },
            status: {
                deep: true,
                handler: function () {
                }
            },
        },
        methods: {
            desDocOpen(property) {
                var url = 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'
                if(property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>


