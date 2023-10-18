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

    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'memquota-property-panel',
        components: {
            
        },
        computed: {
            descriptionText() {
                return 'MemoryQuota'
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

