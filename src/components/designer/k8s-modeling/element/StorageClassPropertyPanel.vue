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
            <v-text-field
                    label="Provisioner"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.provisioner">
                <template v-slot:append-outer>
                    <v-icon small @click="desDocOpen('#provisioner')">
                        mdi-help-circle-outline
                    </v-icon>
                </template>
            </v-text-field>
            <v-text-field
                    label="Parameter Type"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.parameters.type"
            >
                <template v-slot:append-outer>
                    <v-icon small @click="desDocOpen('#parameters')">
                        mdi-help-circle-outline
                    </v-icon>
                </template>
            </v-text-field>
            <v-select
                    label="Reclaim Policy"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="value.object.reclaimPolicy"
                    :items="policyList"
            >
                <template v-slot:append-outer>
                    <v-icon small @click="desDocOpen('#reclaim-policy')">mdi-help-circle-outline</v-icon>
                </template>
            </v-select>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'sc-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'StorageClass'
            },
        },
        data: function () {
            return {
                policyList: [ "Delete", "Retain" ]
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
                var url = 'https://kubernetes.io/docs/concepts/storage/storage-classes/'
                if(property) {
                    url += property
                }
                window.open(url)
            },
        }
    }
</script>

