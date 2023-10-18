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
                    v-model="value.object.spec.host"
                    :disabled="readOnly"
            ></v-text-field>
            <v-text-field
                    label="Port Name"
                    v-model="value.object.spec.port.name"
                    :disabled="readOnly"
            ></v-text-field>
            <kube-number-field                                
                    :label="'Port Number'"
                    v-model="value.object.spec.port.number"
                    :readOnly="readOnly"
            ></kube-number-field>
            <v-select
                    label="Protocol"
                    :items="protocolList"
                    v-model="value.object.spec.port.protocol"
                    :disabled="readOnly"
            ></v-select>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'service-entry-property-panel',
        computed: {
            descriptionText() {
                return 'ServiceEntry'
            },
        },
        data: function () {
            return {
                protocolList: [ "HTTP", "HTTPS", "HTTP2", "GRPC", "MONGO", "TCP", "TLS" ],
                resolutionList: [ "NONE", "STATIC", "DNS" ],
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

