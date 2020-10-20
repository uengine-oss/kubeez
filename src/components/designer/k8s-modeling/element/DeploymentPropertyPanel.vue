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
                    <v-flex shrink style="width: 180px;">
                        <v-card flat>
                            <v-card-text>
                                <v-text-field                                
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                ></v-text-field>
                                <number-field
                                    :desDoc="'#replicas'"
                                    @openDesDoc="desDocOpen"
                                    :label="'Replicas'"
                                    v-model="value.object.spec.replicas">
                                </number-field>
                                <template-field
                                    v-model="value.object"
                                ></template-field>
                                <attr-field v-model="value"></attr-field>
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
    import json2yaml from 'json2yaml';

    import YamlEditor from "../KubeYamlEditor";
    import NumberField from "./NumberField";
    import TemplateField from "./TemplateField";
    import AdvancedAttr from "../AdvancedAttribute";

    export default {
        name: 'service-property-panel',
        props: {
            value: Object,
            img: String,
        },
        components: {
            "yaml-editor": YamlEditor,
            "number-field": NumberField,
            "template-field": TemplateField,
            "attr-field": AdvancedAttr,
        },
        computed: {
            descriptionText() {
                return 'Deployment'
            },
            status() {
                return JSON.parse(JSON.stringify(this.value.status))
            },            
        },
        data: function () {
            return {
                activeTab: 0,
                tabItems: [ "status", "property" ],
                isYamlEdit: false,
            }
        },
        watch: {
            status: {
                deep: true,
                handler: function () {
                    // console.log(this.status)
                }
            }
        },
        beforeDestroy() {
            var me = this
            var name = me.value.object.metadata.name
            if(name != '') {
                var obj = {}
                obj[name + '_replicaCount'] = me.value.object.spec.replicas
                obj[name + '_image'] = me.value.object.spec.template.spec.containers[0].image
                me.$EventBus.$emit('setValuesYaml', obj)
            }
        },
        methods: {
            desDocOpen(property) {
                var url = 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'
                if(property) {
                    url += property
                }
                window.open(url)
            },
            yamlEdit() {
                this.isYamlEdit = true
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
