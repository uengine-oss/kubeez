<template>
    <v-container>
        <v-row>
            <v-col
                    v-for="(item, index) in clustersList"
                    :key="index"
                    cols="6"
                    md="4"
            >
                <v-card
                        outlined
                        class="mx-auto"
                        max-width="400"
                        max-height="400"
                >
                    <v-list-item three-line>
                        <v-list-item-content>
                            <v-list-item-title class="headline mb-1">{{ item.NAME }}</v-list-item-title>
                            <v-list-item-subtitle>API Server : {{ item.APISERVER }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import firebase from 'firebase'
    
    export default {
        name: 'ViewManageClustersPage',
        props: {
            value: Array
        },
        data() {
            return {
                clustersList: this.value,
            }
        },
        mounted: function () {
            var me = this
        },
        watch: {
            value: {
                deep: true,
                handler: function() {
                    var me = this
                    me.clustersList = me.value
                }
            },
        },
        methods: {
        },
    }
</script>

<style>

</style>