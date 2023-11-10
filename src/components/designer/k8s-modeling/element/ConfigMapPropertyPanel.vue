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
            <v-row>
                <v-col cols="3" class="py-0">
                    <span>Data</span>
                </v-col>
                <v-col class="py-0">
                    <v-checkbox
                            label="Use Textarea"
                            class="my-0" dense
                            v-model="useTextarea">
                    </v-checkbox>
                </v-col>
            </v-row>
            <v-text-field
                    label="Key" dense
                    v-model="dataKey"
                    :disabled="canvas.isReadOnlyModel"
            ></v-text-field>
            <v-text-field
                    v-if="!useTextarea"
                    label="Value" dense
                    v-model="dataValue"
                    :disabled="canvas.isReadOnlyModel"
                    hint="base64 encoding"
                    v-on:keyup.enter="addData(dataKey, dataValue)"
            ></v-text-field>
            <v-textarea
                    v-else
                    label="Value" dense
                    v-model="dataValue"
                    :disabled="canvas.isReadOnlyModel"
                    hint="base64 encoding"
                    v-on:keyup.enter="addData(dataKey, dataValue)"
            ></v-textarea>
            <v-row justify="end">
                <v-btn
                        class="mx-5"
                        color="primary"
                        rounded dark
                        :disabled="canvas.isReadOnlyModel"
                        @click="addData(dataKey, dataValue)"
                >Add Data</v-btn>
            </v-row>
            <br />
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'cm-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'ConfigMap'
            },
        },
        data: function () {
            return {
                dataObj: {},
                dataKey: "",
                dataValue: "",
                useTextarea: false,
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
            addData(key, value) {
                var me = this
                if (key != "" && value != "") {
                    me.dataObj = JSON.parse(JSON.stringify(me.value.object.data))
                    me.dataObj[key] = value
                    me.value.object.data = me.dataObj
                }
                me.dataKey = ""
                me.dataValue = ""
            },
            desDocOpen() {
                window.open('https://kubernetes.io/docs/concepts/configuration/configmap/')
            },
        }
    }
</script>


