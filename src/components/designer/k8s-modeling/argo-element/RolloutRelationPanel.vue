<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width: 300px;">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-title class="headline">DestinationRule</v-list-item-title>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap>
                    <v-card-text>
                        <v-radio-group 
                                v-model="value.version"
                                :disabled="readOnly"
                                row dense>
                            <v-radio label="canary" value="canary" />
                            <v-radio label="stable" value="stable" />
                        </v-radio-group>
                    </v-card-text>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'rollout-relation-panel',
        computed: {
            version() {
                try {
                    return this.value.version;
                } catch (e) {
                    return "";
                }
            }
        },
        data() {
            return {
            }
        },
        mounted() {
        },
        watch: {
            version(val) {
                this.value.targetElement.version = val;
            }
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
