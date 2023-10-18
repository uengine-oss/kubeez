<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :readOnly="readOnly"
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
                    label="Project"
                    :disabled="readOnly"
                    v-model="value.object.spec.project"
            ></v-text-field>
            <v-text-field
                    label="Repository URL"
                    :disabled="readOnly"
                    v-model="value.object.spec.source.repoURL"
            ></v-text-field>
            <v-text-field
                    label="Target Revision"
                    :disabled="readOnly"
                    v-model="value.object.spec.source.targetRevision"
            ></v-text-field>
            <v-text-field
                    label="Path"
                    :disabled="readOnly"
                    v-model="value.object.spec.source.path"
            ></v-text-field>
            <v-text-field
                    label="Destination Server"
                    :disabled="readOnly"
                    v-model="value.object.spec.destination.server"
            ></v-text-field>
            <v-text-field
                    label="Destination Namespace"
                    :disabled="readOnly"
                    v-model="value.object.spec.destination.namespace"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'application-property-panel',
        computed: {
            descriptionText() {
                return 'Application'
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
        methods: {
        }
    }
</script>


