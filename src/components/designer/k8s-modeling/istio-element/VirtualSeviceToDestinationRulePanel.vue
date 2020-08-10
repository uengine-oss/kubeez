<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right v-bind:style="{width: 800}">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-tabs v-model="activeTab">
                        <v-tab
                            v-for="(tab, idx) in tabs"
                            :key="idx">
                            <v-list-item-title>{{ tab }}</v-list-item-title>
                        </v-tab>
                    </v-tabs>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap v-if="activeTab == 0">
                    <v-card-text>
                        <v-checkbox
                            label="Mirror Traffic"
                            v-model="isMirror"
                        ></v-checkbox>
                        <v-text-field
                            v-if="!isMirror"
                            label="weight"
                            v-model="weight"
                            type="number"
                            suffix="%"
                        ></v-text-field>
                    </v-card-text>
                </v-layout>
                <v-layout wrap v-else>
                    <v-flex shrink style="width: 180px;">
                        <v-card flat>
                            <v-card-text>
                                <number-field
                                    :label="'Attempts'"
                                    v-model="attempts"
                                ></number-field>
                                <v-text-field
                                    label="PerTryTimeout"
                                    v-model="perTryTimeout"
                                    type="number"
                                    suffix="s">
                                </v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex grow style="width: 320px;">
                        <v-card flat>
                            <v-card-text>
                                <yaml-editor
                                    v-model="value.sourceElement.object.spec.http[0]">
                                </yaml-editor>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import yaml from "js-yaml";

    import NumberField from "../element/NumberField";

    export default {
        name: 'relation-panel',
        props: {
            value: Object,
            titleName: String,
        },
        components: {
            "number-field": NumberField,
        },
        computed: {
            isMirror: {
                get() {
                    if(this.value.routeType == 'weight') {
                        return false
                    } else {
                        return true
                    }
                },
                set(val) {
                    var me = this
                    if(val) {
                        me.value.routeType = "mirror"
                    } else {
                        me.value.routeType = "weight"
                    }
                    var obj = {
                        "routeType": me.value.routeType
                    }
                    me.updateSourceElement('updateRouteType', obj)
                }
            },
            weight: {
                get() {
                    return this.value.weight
                },
                set(val) {
                    this.value.weight = val
                    var obj = {
                        "weight": val
                    }
                    this.updateSourceElement('updateWeight', obj)
                }
            },
            attempts: {
                get() {
                    return this.value.sourceElement.object.spec.http[0].retries.attempts
                },
                set(val) {
                    this.value.sourceElement.object.spec.http[0].retries.attempts = val
                }
            },
            perTryTimeout: {
                get() {
                    var val = this.value.sourceElement.object.spec.http[0].retries.perTryTimeout
                    val = val.split('s')[0]
                    return val
                },
                set(val) {
                    this.value.sourceElement.object.spec.http[0].retries.perTryTimeout = val + 's'
                }
            },
        },
        data() {
            return {
                activeTab: 0,
                tabs: [ "Weight", "Retry" ],
            }
        },
        watch: {
        },
        methods: {
            updateSourceElement(state, value) {
                var me = this
                var obj = {
                    state: state,
                    value: value
                }
                obj.value.targetElement = me.value.targetElement
                me.$EventBus.$emit(`${me.value.sourceElement.elementView.id}`, obj)
            }
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
