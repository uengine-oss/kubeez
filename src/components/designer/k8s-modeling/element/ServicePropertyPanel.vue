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
                            <v-text-field
                                    label="App Name"
                                    :disabled="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.selector.app"
                            ></v-text-field>
                            <kube-number-field
                                    :label="'Port'"
                                    :readOnly="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.ports[0].port"
                            ></kube-number-field>
                            <kube-number-field
                                    :label="'Target Port'"
                                    :readOnly="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.ports[0].targetPort"
                            ></kube-number-field>
                            <v-select
                                    label="Type"
                                    v-model="value.object.spec.type"
                                    :disabled="canvas.isReadOnlyModel"
                                    :items="typeList">
                                <template v-slot:append-outer>
                                    <v-icon small @click="desDocOpen('#publishing-services-service-types')">
                                        mdi-help-circle-outline
                                    </v-icon>
                                </template>
                            </v-select>
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
        name: 'svc-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'Service'
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
                typeList: ["ClusterIP", "NodePort", "LoadBalancer"],
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
                var url = 'https://kubernetes.io/docs/concepts/services-networking/service/'
                if (property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>


