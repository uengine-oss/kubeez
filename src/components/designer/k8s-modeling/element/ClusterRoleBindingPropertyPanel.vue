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
                    <v-list-item-title class="headline">
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
                <v-layout wrap>
                    <v-flex shrink style="width: 180px;">
                        <v-card flat>
                            <v-card-text>
                                <v-text-field
                                    label="Name"
                                    v-model="value.object.metadata.name"
                                ></v-text-field>
                                <v-select
                                        label="Subjects Kind"
                                        v-model="value.object.subjects[0].kind"
                                        :items="kindList">
                                    <template v-slot:append-outer>
                                        <v-icon small @click="desDocOpen('#referring-to-subjects')">mdi-help-circle-outline</v-icon>
                                    </template>
                                </v-select>
                                <v-text-field
                                    label="Subjects Name"
                                    v-model="value.object.subjects[0].name"
                                ></v-text-field>
                                <v-text-field
                                    label="Role Name"
                                    v-model="value.object.roleRef.name"
                                ></v-text-field>
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
        name: 'property-panel',
        props: {
            value: Object,
            img: String,
        },
        components: {
            "yaml-editor": YamlEditor,
        },
        computed: {
            descriptionText() {
                return 'ClusterRoleBinding'
            },
        },
        data: function () {
            return {
                kindList: [ "User", "Group", "ServiceAccount" ],
            }
        },
        watch: {
        },
        methods: { 
            desDocOpen(property) {
                var url = 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding'
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
