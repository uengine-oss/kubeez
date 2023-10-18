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
                    label="Image"
                    :disabled="readOnly"
                    v-model="value.object.spec.runLatest.configuration.revisionTemplate.spec.container.image"
            ></v-text-field>
            <v-label>Environment</v-label>
            <v-row>
                <v-col cols="5" class="py-0">
                    <v-text-field
                            label="Key"
                            v-model="dataKey"
                            :disabled="readOnly"
                    ></v-text-field>
                </v-col>
                <v-col class="py-0">
                    <v-text-field
                            label="Value"
                            v-model="dataValue"
                            :disabled="readOnly"
                            v-on:keyup.enter="addData(dataKey, dataValue)"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row justify="end">
                <v-btn 
                        class="mx-5"
                        color="primary"
                        rounded dark
                        :disabled="readOnly"
                        @click="addData(dataKey, dataValue)"
                >Add Env</v-btn>
            </v-row>
            <br />
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";
    
    export default {
        mixins: [KubernetesPanel],
        name: 'k-service-property-panel',
        computed: {
            descriptionText() {
                return 'Service'
            },
        },
        data: function () {
            return {
                env: null,
                dataKey: "",
                dataValue: ""
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.metadata.labels.app = val;
                }
            },
        },
        methods: {
            addData(key, value) {
                var me = this
                if(key != "" && value != "") {
                    me.env = JSON.parse(JSON.stringify(this.value.object.spec.runLatest.configuration.revisionTemplate.spec.container.env))
                    var obj = {
                        "name": key,
                        "value": value
                    }
                    me.env.push(obj)
                    me.value.object.spec.runLatest.configuration.revisionTemplate.spec.container.env = me.env
                }
                me.dataKey = ""
                me.dataValue = ""
            }
        }
    }
</script>


