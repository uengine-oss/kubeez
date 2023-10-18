<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width: 300px;">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-title class="headline">Route Type</v-list-item-title>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap>
                    <v-card-text>
                        <v-checkbox 
                            label="Mirror Traffic" 
                            v-model="isMirror" 
                            :disabled="readOnly"
                        ></v-checkbox>
                        <v-text-field
                            v-if="!isMirror" 
                            label="weight"
                            v-model="weight" 
                            type="number" 
                            suffix="%"
                            :disabled="readOnly"
                        ></v-text-field>
                    </v-card-text>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        name: 'relation-panel',
        mixins: [KubernetesPanel],
        components: {
            
        },
        computed: {
            isMirror: {
                get() {
                    if(this.value.targetElement.routeType == 'mirror') {
                        return true
                    } else {
                        return false
                    }
                },
                set(val) {
                    var me = this
                    if(val) {
                        me.value.name = "mirror"
                        me.value.targetElement.routeType = "mirror"
                    } else {
                        me.delete();
                        me.value.name = "weight " + me.value.targetElement.weight + "%"
                        me.value.targetElement.routeType = "weight"
                    }
                    me.updateData();
                }
            },
            weight: {
                get() {
                    return this.value.targetElement.weight
                },
                set(val) {
                    var me = this;
                    me.value.targetElement.weight = val;
                    me.value.name = "weight " + me.value.targetElement.weight + "%";
                    me.updateData();
                }
            }
        },
        data() {
            return {
            }
        },
        mounted() {
            var me = this;
        },
        watch: {
            isMirror: {
                deep: true,
                handler(val) {
                    // console.log(val);
                }
            }
        },
        methods: {
            updateData() {
                var me = this;
                var obj = {
                    action: "addRelation",
                    element: me.value
                }
                me.$EventBus.$emit(`${me.value.from}`, obj);
            },
            delete() {
                var me = this
                var obj = {
                    action: "deleteRelation",
                    element: me.value
                }
                me.$EventBus.$emit(`${me.value.from}`, obj);
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
