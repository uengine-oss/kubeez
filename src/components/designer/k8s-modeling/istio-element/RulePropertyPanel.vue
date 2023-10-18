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
                    label="Handler"
                    v-model="value.object.spec.actions[0].handler"
                    :disabled="readOnly"
            ></v-text-field>
            <v-text-field
                    label="Instance"
                    v-model="value.object.spec.actions[0].instances[0]"
                    :disabled="readOnly"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'rule-property-panel',
        computed: {
            descriptionText() {
                return 'Rule'
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


