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
                                    label="Image"
                                    :disabled="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.template.spec.containers[0].image"
                            ></v-text-field>
                            <v-select                                
                                    label="restart Policy"
                                    :disabled="canvas.isReadOnlyModel"
                                    v-model="value.object.spec.template.spec.restartPolicy"
                                    :items="restartPolicyList">
                            </v-select>
                            <kube-number-field
                                    :desDoc="'#pod-backoff-failure-policy'"
                                    :readOnly="canvas.isReadOnlyModel"
                                    @openDesDoc="desDocOpen"
                                    :label="'backoffLimit'"
                                    v-model="value.object.spec.backoffLimit"
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
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'job-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'Job'
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
                restartPolicyList: [ 'Always', 'OnFailure', 'Never' ],
                activeTab: 0,
                tabItems: [ "status", "property" ],
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.spec.template.spec.containers[0].name = val;
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
                var url = 'https://kubernetes.io/docs/concepts/workloads/controllers/job/'
                if(property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
