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
                            <v-select
                                    label="Access Modes"
                                    v-model="value.object.spec.accessModes"
                                    :disabled="canvas.isReadOnlyModel"
                                    :items="accessModeList">
                                <template v-slot:append-outer>
                                    <v-icon small @click="desDocOpen('#access-modes-1')">mdi-help-circle-outline</v-icon>
                                </template>
                            </v-select>
                            <v-label>Storage</v-label>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            v-model="storageVolume"
                                            :disabled="canvas.isReadOnlyModel"
                                            type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col class="py-0">
                                    <v-select
                                            :items="units"
                                            v-model="storageUnit"
                                            :disabled="canvas.isReadOnlyModel"
                                    ></v-select>
                                </v-col>
                            </v-row>
                            <v-select
                                    label="Volume Mode"
                                    v-model="value.object.spec.volumeMode"
                                    :disabled="canvas.isReadOnlyModel"
                                    :items="volumeModeList">
                                <template v-slot:append-outer>
                                    <v-icon small @click="desDocOpen('#volume-modes')">mdi-help-circle-outline</v-icon>
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
        name: 'pvc-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'PersistentVolumeClaim'
            },
            status() {
                if(this.value && this.value.status) {
                    return JSON.parse(JSON.stringify(this.value.status))
                } else {
                    return null
                }
            },
            storageVolume: {
                get() {
                    var val = this.value.object.spec.resources.requests.storage
                    val = val.replace(/Mi|Gi/gi, '')
                    return val
                },
                set(val) {
                    this.value.object.spec.resources.requests.storage = val + this.storageUnit;
                }
            },
            storageUnit: {
                get() {
                    var val = this.value.object.spec.resources.requests.storage;
                    val = val.replace(/[0-9]/g, '');
                    return val;
                },
                set(val) {
                    var storage = this.value.object.spec.resources.requests.storage;
                    storage = storage.replace(/Mi|Gi/gi, val);
                    this.value.object.spec.resources.requests.storage = storage;
                }
            },
        },
        data: function () {
            return {
                accessModeList: [ ['ReadWriteOnce'], ['ReadOnlyMany'], ['ReadWriteMany'] ],
                volumeModeList: [ "Filesystem", "Block" ],
                activeTab: 0,
                tabItems: [ "status", "property" ],
                units: [ 'Mi', 'Gi' ],
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
                var url = 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/'
                if(property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>

