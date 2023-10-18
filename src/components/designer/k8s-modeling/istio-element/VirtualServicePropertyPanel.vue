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
                    label="Host"
                    v-model="value.object.spec.hosts[0]"
                    :disabled="readOnly"
            ></v-text-field>
            <v-text-field
                    label="Http Name"
                    v-model="value.object.spec.http[0].name"
                    :disabled="readOnly"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'virtual-service-property-panel',
        computed: {
            descriptionText() {
                return 'VirtualService'
            },
        },
        data: function () {
            return {
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
        }
    }
</script>

