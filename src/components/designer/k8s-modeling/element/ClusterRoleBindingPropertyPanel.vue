<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="isReadOnlyModeling"
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
            <v-text-field
                    label="Name"
                    v-model="value.object.metadata.name"
                    autofocus
                    :disabled="isReadOnlyModeling"
            ></v-text-field>
            <v-select
                    label="Subjects Kind"
                    v-model="value.object.subjects[0].kind"
                    :disabled="isReadOnlyModeling"
                    :items="kindList">
                <template v-slot:append-outer>
                    <v-icon small @click="desDocOpen('#referring-to-subjects')">mdi-help-circle-outline</v-icon>
                </template>
            </v-select>
            <v-text-field
                    label="Subjects Name"
                    v-model="value.object.subjects[0].name"
                    :disabled="isReadOnlyModeling"
            ></v-text-field>
            <v-text-field
                    label="Role Name"
                    v-model="value.object.roleRef.name"
                    :disabled="isReadOnlyModeling"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'crb-property-panel',
        components:{
            KubeCommonPanel
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
