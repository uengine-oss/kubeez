<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="canvas.isReadOnlyModel"
            :validation-lists="validationLists"
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
                                                rootObjectKey: 'status',
                                                readOnly: canvas.isReadOnlyModel
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
                                <kube-number-field
                                        :desDoc="'#replicas'"
                                        @openDesDoc="desDocOpen"
                                        :label="'Replicas'"
                                        v-model="value.object.spec.replicas"
                                        :readOnly="canvas.isReadOnlyModel"
                                ></kube-number-field>
                                <kube-template-field
                                        v-model="value.object"
                                        :readOnly="canvas.isReadOnlyModel"
                                ></kube-template-field>
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
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'ReplicaSet'
            },
            status() {
                if(this.value && this.value.status) {
                    return JSON.parse(JSON.stringify(this.value.status))
                } else {
                    return null
                }
            }
        },
        data: function () {
            return {
                activeTab: 0,
                tabItems: ["status", "property"],
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.metadata.labels.app = val;
                    this.value.object.spec.selector.matchLabels.app = val;
                    this.value.object.spec.template.metadata.labels.app = val;
                    this.value.object.spec.template.spec.containers[0].name = val;
                }
            },
            status: {
                deep: true,
                handler: function () {
                }
            }
        },
        methods: {
            desDocOpen(property) {
                var url = 'https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/'
                if (property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>

