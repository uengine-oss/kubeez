<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right v-bind:style="{width: 800}">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
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
                    <v-tooltip left>
                        <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="desDocOpen()">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ descriptionText }}</span>
                    </v-tooltip>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
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
                    <v-flex shrink style="width: 200px;">
                        <v-card flat>
                            <v-card-text>
                                <v-text-field
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                ></v-text-field>
                                <v-select
                                        label="Access Modes"
                                        v-model="value.object.spec.accessModes"
                                        :items="accessModeList">
                                    <template v-slot:append-outer>
                                        <v-icon small @click="desDocOpen('#access-modes')">mdi-help-circle-outline</v-icon>
                                    </template>
                                </v-select>
                                <v-label>Storage</v-label>
                                <v-row>
                                    <v-col cols="6" class="py-0">
                                        <v-text-field
                                                v-model="storageVolume"
                                                type="number">
                                        </v-text-field>
                                    </v-col>
                                    <v-col class="py-0">
                                        <v-select
                                                :items="units"
                                                v-model="storageUnit"
                                        ></v-select>
                                    </v-col>
                                </v-row>
                                <v-select
                                        label="Reclaim Policy"
                                        v-model="value.object.spec.persistentVolumeReclaimPolicy"
                                        :items="policyList">
                                    <template v-slot:append-outer>
                                        <v-icon small @click="desDocOpen('#reclaim-policy')">mdi-help-circle-outline</v-icon>
                                    </template>
                                </v-select>
                                <v-select
                                        label="Volume Mode"
                                        v-model="value.object.spec.volumeMode"
                                        :items="volumeModeList">
                                    <template v-slot:append-outer>
                                        <v-icon small @click="desDocOpen('#volume-mode')">mdi-help-circle-outline</v-icon>
                                    </template>
                                </v-select>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex>
                        <yaml-editor
                            v-model="value.object">
                        </yaml-editor>
                    </v-flex>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import yaml from "js-yaml";

    import YamlEditor from "../KubeYamlEditor";

    export default {
        name: 'ingress-property-panel',
        props: {
            value: Object,
            img: String,
        },
        components: {
            "yaml-editor": YamlEditor
        },
        computed: {
            descriptionText() {
                return 'PersistentVolume'
            },
            status() {
                return JSON.parse(JSON.stringify(this.value.status))
            },
            storageVolume: {
                get() {
                    var val = this.value.object.spec.capacity.storage
                    val = val.replace(/Mi|Gi/gi, '')
                    return val
                },
                set(val) {
                    this.value.object.spec.capacity.storage = val + this.storageUnit;
                }
            },
            storageUnit: {
                get() {
                    var val = this.value.object.spec.capacity.storage;
                    val = val.replace(/[0-9]/g, '');
                    return val;
                },
                set(val) {
                    var storage = this.value.object.spec.capacity.storage;
                    storage = storage.replace(/Mi|Gi/gi, val);
                    this.value.object.spec.capacity.storage = storage;
                }
            },
        },
        data: function () {
            return {
                accessModeList: [ ['ReadWriteOnce'], ['ReadOnlyMany'], ['ReadWriteMany'] ],
                policyList: [ "Retain", "Recycle", "Delete" ],
                volumeModeList: [ "Filesystem", "Block" ],
                activeTab: 0,
                tabItems: [ "status", "property" ],
                units: [ 'Mi', 'Gi' ],
            }
        },

        watch: {
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
