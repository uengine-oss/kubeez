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
                    <v-list-item-title class="headline">{{ value._type }}
                    </v-list-item-title>
                    <v-tooltip top>
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
                <v-layout wrap>
                    <v-flex grow style="width: 500px;">
                        <v-card flat>
                            <v-card-text>
                                <yaml-editor
                                    v-model="value.object"
                                    
                                >
                                </yaml-editor>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex shrink style="width: 300px;">
                        <v-card flat>
                            <v-card-text>
                                <v-text-field                                
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                ></v-text-field>
                                <v-text-field                                
                                    label="Image"
                                    v-model="value.object.spec.template.spec.containers[0].image"
                                ></v-text-field>
                                <number-field
                                    :label="'Replicas'"
                                    v-model="value.object.spec.replicas"
                                ></number-field>
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

    import YamlEditor from "./YamlEditor";
    import NumberField from "./NumberField";

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
                return 'ReplicaSet'
            },

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
