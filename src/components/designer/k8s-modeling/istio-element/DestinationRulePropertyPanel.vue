<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="readOnly"
            @openDesDoc="desDocOpen"
            @close="closePanel"
    >
        <template slot="headline">
            <v-tabs v-model="tabIdx">
                <v-tab
                    v-for="(tab, idx) in tabs"
                    :key="idx">
                    <v-list-item-title>{{ tab }}</v-list-item-title>
                </v-tab>
            </v-tabs>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-layout">
             <v-layout wrap v-if="activeTab == 'Property'">
                <v-flex shrink style="width: 230px;">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                    autofocus
                                    :disabled="readOnly"
                            ></v-text-field>
                            <v-text-field
                                    label="Host"
                                    v-model="value.object.spec.host"
                                    :disabled="readOnly"
                            ></v-text-field>
                            <v-btn
                                    color="primary"
                                    text
                                    :disabled="readOnly"
                                    @click="addSubset"
                                    class="mb-4"
                            >
                                ADD SUBSET
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
                            v-model="propertyData"
                            :readOnly="readOnly"
                    ></kube-yaml-editor>
                </v-flex>
            </v-layout>
            <v-layout wrap v-else>
                <v-flex shrink style="width: 200px;">
                    <v-card flat>
                        <v-card-text>
                            <v-checkbox
                                    label="Edit TrafficPolicy"
                                    v-model="editTrafficPolicy">
                            </v-checkbox>
                            <kube-number-field
                                :label="'Http1 Max Pending Requests'"
                                v-model="value.trafficPolicy.connectionPool.http.http1MaxPendingRequests"
                                :readOnly="readOnly || !editTrafficPolicy"
                            ></kube-number-field>
                            <kube-number-field
                                    :label="'Max Requests Per Connection'"
                                    :readOnly="readOnly || !editTrafficPolicy"
                                    v-model="value.trafficPolicy.connectionPool.http.maxRequestsPerConnection"
                            ></kube-number-field>
                            <kube-number-field
                                    :label="'Max Connections'"
                                    :readOnly="readOnly || !editTrafficPolicy"
                                    v-model="value.trafficPolicy.connectionPool.tcp.maxConnections"
                            ></kube-number-field>
                            <v-text-field
                                    label="Base Ejection Time"
                                    v-model="baseEjectionTime"
                                    :disabled="readOnly || !editTrafficPolicy"
                                    type="number"
                                    suffix="s"
                            ></v-text-field>
                            <kube-number-field
                                    :label="'Consecutive Errors'"
                                    :readOnly="readOnly || !editTrafficPolicy"
                                    v-model="value.trafficPolicy.outlierDetection.consecutiveErrors"
                            ></kube-number-field>
                            <v-text-field
                                    label="Interval"
                                    :disabled="readOnly || !editTrafficPolicy"
                                    v-model="interval"
                                    type="number"
                                    suffix="s"
                            ></v-text-field>
                            <kube-number-field
                                    :label="'Max Ejection Percent'"
                                    :readOnly="readOnly || !editTrafficPolicy"
                                    v-model="value.trafficPolicy.outlierDetection.maxEjectionPercent"
                            ></kube-number-field>
                        </v-card-text>
                    </v-card>
                </v-flex>
                <v-flex>
                    <kube-yaml-editor
                            v-model="trafficPolicy"
                            :readOnly="readOnly || !editTrafficPolicy"
                    ></kube-yaml-editor>
                </v-flex>
            </v-layout>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        name: 'dr-property-panel',
        mixins: [KubernetesPanel],
        computed: {
            descriptionText() {
                return 'DestinationRule'
            },
            propertyData: {
                get() {
                    var data = JSON.parse(JSON.stringify(this.value.object));
                    delete data.spec.trafficPolicy;
                    return data;
                },
                set(val) {
                    _.merge(this.value.object, val);
                }
            },
            trafficPolicy: {
                get() {
                    return this.value.trafficPolicy
                },
                set(val) {
                    if(this.editTrafficPolicy) {
                        _.merge(this.value.object.spec, { 'trafficPolicy': val })
                        this.value.trafficPolicy = val
                    }
                }
            },
            baseEjectionTime: {
                get() {
                    var val = this.value.trafficPolicy.outlierDetection.baseEjectionTime
                    val = val.split('s')[0]
                    return val
                },
                set(val) {
                    var me = this
                    me.value.trafficPolicy.outlierDetection.baseEjectionTime = val + 's'
                }
            },
            interval: {
                get() {
                    var val = this.value.trafficPolicy.outlierDetection.interval
                    val = val.split('s')[0]
                    return val
                },
                set(val) {
                    var me = this
                    me.value.trafficPolicy.outlierDetection.interval = val + 's'
                }
            },
            tabIdx: {
                get() {
                    return 0
                },
                set(val) {
                    var me = this
                    if(val == 0) {
                        me.activeTab = 'Property'
                    } else {
                        me.activeTab = 'TrafficPolicy'
                    }
                    if(me.value.object.spec.trafficPolicy) {
                        me.editTrafficPolicy = true
                    } else {
                        me.editTrafficPolicy = false
                    }
                }
            }
        },
        data: function () {
            return {
                activeTab: 'Property',
                tabs: [ 'Property', 'TrafficPolicy' ],
                editTrafficPolicy: false,
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                }
            },
            editTrafficPolicy: {
                deep: true,
                handler(val) {
                    var me = this
                    if(val) {
                        _.merge(me.value.object.spec, {'trafficPolicy': me.value.trafficPolicy})
                    } else {
                        delete me.value.object.spec.trafficPolicy
                    }
                }
            },
        },
        methods: {
            addSubset() {
                var me = this;
                var newIdx = me.value.object.spec.subsets.length;
                me.attrKey = "spec.subsets[" + newIdx + "]";
                me.attrVal = {
                    "name": "v"+(newIdx+1),
                    "labels": {
                        "version": "v"+(newIdx+1),
                    }
                };
                
                me.value.object.metadata.name = me.value.object.metadata.name + ",";
                _.set(me.value.object, me.attrKey, me.attrVal);
                _.set(me.value.advancedAttributePaths, me.attrKey, me.attrVal);

                me.$nextTick(() => {
                    newIdx = me.value.object.spec.subsets.length;
                    me.$emit('setSubSet', newIdx);
                    me.value.object.metadata.name = me.value.object.metadata.name.replace(',', '');
                });
            }
        }
    }
</script>

