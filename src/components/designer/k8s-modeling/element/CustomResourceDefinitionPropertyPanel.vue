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
                    label="Grop"
                    v-model="value.object.spec.group"
                    hint="Ex) crd.example.com"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    label="Version"
                    v-model="value.object.spec.versions[0].name"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-checkbox
                    label="Served"
                    v-model="value.object.spec.versions[0].served"
            ></v-checkbox>
            <v-checkbox
                    label="Storage"
                    v-model="value.object.spec.versions[0].storage"
            ></v-checkbox>
            <v-text-field
                    label="Scope"
                    v-model="value.object.spec.scope"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    label="Plural"
                    v-model="value.object.spec.names.plural"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    label="Singular"
                    v-model="value.object.spec.names.singular"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    label="Kind"
                    v-model="value.object.spec.names.kind"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    label="ShortNames"
                    v-model="value.object.spec.names.shortNames[0]"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>
    
</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'custom-resource-definition-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'CustomResourceDefinition'
            },
        },
        data: function () {
            return {}
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                }
            },
        },
    }
</script>
