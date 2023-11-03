<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right v-bind:style="{width: 800}">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-title class="headline">{{ titleName }}</v-list-item-title>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout v-if="value.sourceElement._type == 'VirtualService'">
                    <v-card-text>
                        <v-radio-group v-model="value.sourceElement.routeType" row  :disabled="canvas.isReadOnlyModel">
                            <v-radio label="weight" value="weight"></v-radio>
                            <v-radio label="mirror" value="mirror"></v-radio>
                        </v-radio-group>
                        <v-text-field
                            v-if="value.sourceElement.routeType == 'weight'"
                            :disabled="canvas.isReadOnlyModel"
                            label="weight" type="number"
                        ></v-text-field>
                    </v-card-text>
                </v-layout>
            </v-list>

        </v-navigation-drawer>
    </v-layout>

</template>


<script>
    import yaml from "js-yaml";

    import YamlEditor from "./YamlEditor";
    
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        name: 'property-panel',
        mixins: [KubernetesPanel],
        computed: {
        },
        data: function () {
            return {
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
