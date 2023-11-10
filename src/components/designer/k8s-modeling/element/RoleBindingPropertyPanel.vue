<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="canvas.isReadOnlyModel"
            :validation-lists="validationLists"
            @openDesDoc="desDocOpen"
            @close="closePanel"
    >
        <template slot="headline">
            <v-list-item-title class="headline">
                {{ value._type }}
            </v-list-item-title>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-property">
            <v-select
                    label="Subjects Kind"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.subjects[0].kind"
                    :items="kindList">
                <template v-slot:append-outer>
                    <v-icon small @click="desDocOpen('#referring-to-subjects')">mdi-help-circle-outline</v-icon>
                </template>
            </v-select>
            <v-text-field
                    label="Subjects Name"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.subjects[0].name"
            ></v-text-field>
            <v-select
                    label="Role Kind"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.roleRef.kind"
                    :items="roleList"
            ></v-select>
            <v-text-field
                    label="Role Name"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.roleRef.name"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'rb-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'RoleBinding'
            },
        },
        data: function () {
            return {
                kindList: [ "User", "Group", "ServiceAccount" ],
                roleList: [ "Role", "ClusterRole" ],
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                }
            },
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

