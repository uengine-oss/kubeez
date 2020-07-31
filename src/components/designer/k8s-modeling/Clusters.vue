<script>
    import Clusters from './ClustersLocalStorage'
    
    export default {
        name: 'clusters',
        mixins: [Clusters]
    }
</script>

<template>
    <v-container>
        <v-row>
            <v-col v-for="(item, index) in clustersList" :key="index" cols="6" md="4">
                <v-card
                        class="mx-auto" max-width="400" max-height="400" outlined
                        :class="item.name == value.name ? 'selected' : ''"
                        @click="selectCluster(item)">
                    <v-card-title>
                        {{ item.name }}
                        <v-spacer></v-spacer>
                        <v-icon @click.stop="deleteCluster(item)">delete</v-icon>
                    </v-card-title>
                    <v-card-text>
                        API Server : {{ item.apiServer }}
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        
        <v-btn fab dark left bottom color="primary" class="my-10" @click="tokenDialog = true">
            <v-icon dark>mdi-plus</v-icon>
        </v-btn>

        <v-dialog v-model="tokenDialog" max-width="350">
            <v-card>
                <v-card-title class="headline">Cluster</v-card-title>
                <v-card-text>
                    <v-text-field
                            v-model="clusterName"
                            label="Name"
                            required
                    ></v-text-field>
                    <v-text-field
                            v-model="clusterAddress"
                            label="API Server"
                            required
                            hint="Ex) https://api.k8s.bzdvops.com"
                    ></v-text-field>
                    <v-text-field
                            label="TOKEN"
                            v-model="kuberToken"
                            required
                            outline
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="save()">Save</v-btn>
                    <v-btn color="red darken-1" text @click="closeToken()">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<style scoped>
.selected {
    background-color: #E0F7FA;
}
</style>