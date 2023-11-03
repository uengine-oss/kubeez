<template>
    <v-row style=" width: 100%; height: 100%; align-items: center; margin: 2px; margin-bottom: 4px;">
        <EventStormingListCard
                v-if="information"
                :information="information"
                @delete="deleteDefinition()"
        >
            <template slot="image">
                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <v-img
                                @click.native="selectedModel()"
                                style="cursor:pointer;"
                                :src="getImage"
                                :alt="id"
                                v-on="on"
                                max-width="420"
                                max-height="300"
                        ></v-img>
                    </template>
                    <span>{{id}}</span>
                </v-tooltip>
            </template>
            <template slot="action">
                <div style="position: absolute; bottom:5px; right:5px;">
                    <v-btn
                            text
                            color="red"
                            @click.native="deleteDefinition()"
                    >
                        Delete
                    </v-btn>

                    <v-btn
                            text
                            @click.native="selectedModel()"
                            style="color:#1E88E5; font-weight:700;"
                    >
                        Edit
                    </v-btn>
                </div>
            </template>
        </EventStormingListCard>

<!--        <v-card>-->
<!--            <v-btn style="position: absolute; top: 0px; right: 0px; z-index: 9;" icon @click="deleteDefinition()"><v-icon small>mdi-close</v-icon></v-btn>-->
<!--            <v-tooltip right>-->
<!--                <template v-slot:activator="{ on }">-->
<!--                    <v-img-->
<!--                            @click.native="selectedModel()"-->
<!--                            style="cursor:pointer;"-->
<!--                            :src="getImage"-->
<!--                            :alt="id"-->
<!--                            v-on="on"-->
<!--                            max-width="300"-->
<!--                            max-height="200"-->
<!--                    ></v-img>-->
<!--                </template>-->
<!--                <span>{{id}}</span>-->
<!--            </v-tooltip>-->
<!--        </v-card>-->
    </v-row>
</template>

<script>
    import EventStormingListCard from "../../../listPages/EventStormingListCard";
    import StorageBase from "../StorageBase";

    export default {
        name: 'jump-to-model-lists-card',
        components:{EventStormingListCard},
        mixins:[StorageBase],
        props: {
            id: String,
            path: String,
            type: String,
        },
        created(){
            this.init();
        },
        data() {
            return {
                modelCanvasChannel: null,
                image: null,
                information: null
            }
        },
        computed:{
            getImage(){
                if(this.image){
                    return this.image
                }
                return 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png';
            },
        },
        mounted(){
            var me = this

            me.modelCanvasChannel.onmessage = async function(e) {
                if(e.data && e.data.event === "ScreenShot"){
                    if( me.id == e.data.model ){
                        // 자신의 모델.
                        me.image = e.data.image
                    }
                }
            };
        },
        methods: {
            async init(){
                var me = this
                me.modelCanvasChannel = new BroadcastChannel('model-canvas')

                me.information = await me.list(`db://definitions/${me.id}/information`)
                if(!me.information) return;
                me.information.projectId = me.id;

                let result = await me.getString(`storage://definitions/${me.id}/information/image`);
                if(!result.Error) {
                    me.information.image = result
                    me.image = result
                } else {
                    me.information.image = 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'

                }
            },
            deleteDefinition(){
                this.$emit("deleteDefinition", this.id, this.information)
            },
            selectedModel(){
                window.open(`/#/${this.path}/${this.id}`, "_blank");
            }

        }
    }
</script>
<style>
    .preview-font h1 {
        margin-bottom:10px;
    }
    .preview-font h2 {
        margin-bottom:10px;
    }
    .preview-font h3 {
        margin-bottom:10px;
    }
    .preview-font div {
        margin-bottom:10px;
    }
</style>


