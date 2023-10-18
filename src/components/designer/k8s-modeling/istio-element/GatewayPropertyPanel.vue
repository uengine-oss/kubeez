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
            <kube-number-field
                    :label="'Server Port'"
                    v-model="value.object.spec.servers[0].port.number"
                    :readOnly="readOnly"
            ></kube-number-field>
            <v-text-field
                    label="Server Name"
                    v-model="value.object.spec.servers[0].port.name"
                    :disabled="readOnly"
            ></v-text-field>
            <v-select
                    label="Server Protocol"
                    :items="protocolList"
                    v-model="value.object.spec.servers[0].port.protocol"
                    :disabled="readOnly"
            ></v-select>
            <v-text-field
                    label="Server Hosts"
                    v-model="value.object.spec.servers[0].hosts[0]"
                    :disabled="readOnly"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'gw-property-panel',
        computed: {
            descriptionText() {
                return 'DestinationRule'
            },
        },
        data: function () {
            return {
                protocolList: ["HTTP", "HTTPS", "HTTP2", "GRPC", "MONGO", "TCP", "TLS"],
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
        methods: {}
    }
</script>


