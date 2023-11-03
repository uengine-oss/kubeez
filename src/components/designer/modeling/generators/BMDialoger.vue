<template>
    <div style="margin-top: 10px;">
        <div>
            <v-btn v-if="value.modelList" class="auto-modeling-btn" color="primary" @click="jump()">Create Model<v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon></v-btn>
        </div>
        <div v-if="value.modelList && value.modelList.length > 0"
             class="auto-modeling-message-card"
             style="margin-top:25px; height: 100%; width: 20%;">
            <v-col v-if="value && value.modelList && value.modelList.length > 0"
                   style="height: 100%; align-items: center; margin: 2px; width: 100%;"
            >
                <div v-for="id in value.modelList" :key="id">
                    <jump-to-model-lists-card :id="id" path="business-model-canvas" @deleteModel="deleteModel" ></jump-to-model-lists-card>
                </div>
            </v-col>
        </div>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'

    export default {
        name: 'bm-dialoger',
        props: {
            value: Object,
            prompt: String,
            projectId: String,
        },
        components: {
            VueTypedJs
        },

        created(){
        },
        watch: {
        },
        mounted(){
            var me = this
            if(!me.value || !me.value.modelList){
                this.jump();
            }
        },
        data() {
            return {
                projectExisted: false,
                state:{
                    generator: "BMGenerator",
                    title: this.prompt,
                },
            }
        },
        methods: {
            deleteModel(id){
                var me = this
                var index = me.value.modelList.findIndex(x => x == id)
                me.value.modelList.splice(index, 1)
                
                me.$emit("input", me.value);
                me.$emit("change", 'businessModel');
            },
            createDefinition(){
                console.log('createDefinition BM')

            },
            onGenerationFinished(){},  
            jump(){
                var me = this 
                let uuid = this.uuid();

                this.$emit('state','BM')

                // this.state.title = this.value;
                if(!me.value){
                    me.value = {}
                    if(!me.value.modelList){
                        me.value.modelList = []
                    }
                }
                me.value.modelList.push(uuid)
                me.$emit("input", me.value);
                me.$emit("change", 'businessModel');

                let stateJson = JSON.stringify(this.state);
                localStorage["gen-state"] = stateJson;

                window.open(`/#/business-model-canvas/${uuid}`, "_blank")
                //this.$router.push(`business-model-canvas/${uuid}`);

            },


            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


        }
    }
</script>
<style>
</style>


