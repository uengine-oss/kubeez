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
                    label="Resource"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="resource"
                    hint="ex) pods, services"
            ></v-text-field>
            <v-text-field
                    label="Verb"
                    :disabled="canvas.isReadOnlyModel"
                    v-model="verb"
                    hint="ex) get, list, watch"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'cr-property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'ClusterRole'
            },
            resource: {
                get() {
                    var resource = this.value.object.rules[0].resources.join(', ')
                    return resource
                },
                set(val) {
                    var me = this
                    var lists = val.split(', ')
                    me.value.object.rules[0].resources = lists
                }
            },
            verb: {
                get() {
                    var verb = this.value.object.rules[0].verbs.join(', ')
                    return verb
                },
                set(val) {
                    var me = this
                    var lists = val.split(', ')
                    me.value.object.rules[0].verbs = lists
                }
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
            desDocOpen() {
                window.open('https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole')
            },
        }
    }
</script>

