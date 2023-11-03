<template>
     <v-row style="position:absolute; right:30px; top:75px;">
        <v-card v-if="this.input.title" class="auto-modeling-user-story-card">
            <v-card-subtitle>json</v-card-subtitle>
            <v-card-text class="auto-modling-textarea">
                <v-textarea
                    v-model="result"
                    dense
                    auto-grow
                    rows="2"
                    solo
                >
                </v-textarea>
            </v-card-text>
        </v-card>
    </v-row>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UMLGenerator.js'
    //import UserStoryGenerator from './UserStoryGenerator.js'

    export default {
        name: 'uml-generator-ui',
        props: {
            value: String
        },

        created(){
            let prevStateJson = localStorage["uml-gen-state"];

            if(prevStateJson){
                let prevState = JSON.parse(prevStateJson);

                this.input.title = prevState.userStory;

                localStorage["uml-gen-state"] = null;


                this.generator = new Generator(this);
                this.generator.generate();
            }
        },
        watch: {
        },
        mounted(){

        },
        data() {
            return {
                input: {
                    title: null
                },
                result: '',
                generator: null,
            }
        },
        methods: {

            onReceived(content){
                this.result = content;
            },

            onModelCreated(model){
                this.$emit("createModel", model)
            },
            
            onGenerationFinished(){
                this.generationStopped = false;
                this.savedResult = this.result;
                this.$emit("onGenerationFinished")
            },

            generate(){
                this.result = '';
                this.generator.generate();
            },

            stop(){
                this.generator.stop();
            }


        }
    }
</script>


