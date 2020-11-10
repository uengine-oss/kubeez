<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right v-bind:style="{width: 800}">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-tabs v-model="activeTab">
                        <v-tab
                            v-for="(tab, idx) in tabs"
                            :key="idx">
                            <v-list-item-title>{{ tab }}</v-list-item-title>
                        </v-tab>
                    </v-tabs>
                    <v-tooltip left>
                        <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ descriptionText }}</span>
                    </v-tooltip>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap v-if="activeTab == 0">
                    <v-flex shrink style="width: 180px;">
                        <v-card flat>
                            <v-card-text>
                                <v-text-field
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                ></v-text-field>
                                <v-text-field
                                    label="Host"
                                    v-model="value.object.spec.host"
                                ></v-text-field>
                                <v-text-field
                                    label="Version Name"
                                    v-model="value.object.spec.subsets[0].name"
                                ></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex>
                        <yaml-editor
                            v-model="propertyData">
                        </yaml-editor>
                    </v-flex>
                </v-layout>
                <v-layout wrap v-else>
                    <v-flex shrink style="width: 200px;">
                        <v-card flat>
                            <v-card-text>
                                <number-field
                                    :label="'Http1 Max Pending Requests'"
                                    v-model="value.object.spec.trafficPolicy.connectionPool.http.http1MaxPendingRequests">
                                </number-field>
                                <number-field
                                    :label="'Max Requests Per Connection'"
                                    v-model="value.object.spec.trafficPolicy.connectionPool.http.maxRequestsPerConnection">
                                </number-field>
                                <number-field
                                    :label="'Max Connections'"
                                    v-model="value.object.spec.trafficPolicy.connectionPool.tcp.maxConnections">
                                </number-field>
                                <v-text-field
                                    label="Base Ejection Time"
                                    v-model="baseEjectionTime"
                                    type="number"
                                    suffix="s">
                                </v-text-field>
                                <number-field
                                    :label="'Consecutive Errors'"
                                    v-model="value.object.spec.trafficPolicy.outlierDetection.consecutiveErrors">
                                </number-field>
                                <v-text-field
                                    label="Interval"
                                    v-model="interval"
                                    type="number"
                                    suffix="s">
                                </v-text-field>
                                <number-field
                                    :label="'Max Ejection Percent'"
                                    v-model="value.object.spec.trafficPolicy.outlierDetection.maxEjectionPercent">
                                </number-field>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex>
                        <yaml-editor
                            v-model="trafficPolicy">
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
    import NumberField from "../element/NumberField";

    export default {
        name: 'property-panel',
        props: {
            value: Object,
            img: String,
        },
        components: {
            "yaml-editor": YamlEditor,
            "number-field": NumberField,
        },
        computed: {
            descriptionText() {
                return 'DestinationRule'
            },
            propertyData: {
                get() {
                    var data = JSON.parse(JSON.stringify(this.value.object))
                    delete data.spec.trafficPolicy
                    return data
                },
                set(val) {
                    _.merge(this.value.object, val);
                }
            },
            trafficPolicy: {
                get() {
                    var data = {}
                    data.trafficPolicy = this.value.object.spec.trafficPolicy
                    return data
                },
                set(val) {
                    // _.merge(this.value.object, val);
                }
            },
            maxRequestsPerConnection: {
                get() {
                    return String(this.value.object.spec.trafficPolicy.connectionPool.http.maxRequestsPerConnection)
                },
                set(val) {
                    this.value.object.spec.trafficPolicy.connectionPool.http.maxRequestsPerConnection = Number(val)
                }
            },
            baseEjectionTime: {
                get() {
                    var val = this.value.object.spec.trafficPolicy.outlierDetection.baseEjectionTime
                    val = val.split('s')[0]
                    return val
                },
                set(val) {
                    this.value.object.spec.trafficPolicy.outlierDetection.baseEjectionTime = val + 's'
                }
            },
            interval: {
                get() {
                    var val = this.value.object.spec.trafficPolicy.outlierDetection.interval
                    val = val.split('s')[0]
                    return val
                },
                set(val) {
                    this.value.object.spec.trafficPolicy.outlierDetection.interval = val + 's'
                }
            },
        },
        data: function () {
            return {
                activeTab: 0,
                tabs: [ "Property", "TrafficPolicy" ],
            }
        },
        watch: {
        },
        methods: {
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
