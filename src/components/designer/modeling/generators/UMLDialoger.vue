<template>
    <div style="margin-top: 10px;">
        <div class="auto-modeling-message-border">
            <v-col class="auto-modeling-message-box">
                <v-card class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js 
                            :strings="[`Sounds interesting! Let me come up with a few ideas...`]"
                            :typeSpeed="10"
                            :showCursor="false"
                            @onComplete="state.firstMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col class="auto-modeling-message-box">
                <v-card v-if="!state.firstMessageIsTyping" class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js 
                            :strings="[`Here's a user story for you.`]"
                            :typeSpeed="5"
                            :showCursor="false"
                            @onComplete="state.secondMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
        </div>
        <v-card v-if="!state.secondMessageIsTyping" class="auto-modeling-user-story-card">
            <v-card-subtitle>{{$t('autoModeling.explanation')}}</v-card-subtitle>
            <v-card-text class="auto-modling-textarea">
                <v-textarea class="auto-modling-text-box"
                    v-model="state.userStory"
                    dense
                    auto-grow
                    rows="2"
                    solo
                >
                </v-textarea>
            </v-card-text>
            <v-card-actions v-if="!state.startTemplateGenerate" class="auto-modeling-btn-box">
                <v-btn class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                <v-btn class="auto-modeling-btn" color="primary" @click="jump()">Create Model<v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon></v-btn>
            </v-card-actions>
            <v-card-actions v-else-if="state.startTemplateGenerate" class="auto-modeling-btn-box">
                <v-btn class="auto-modeling-btn" @click="stop()">Stop generating</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UserStoryGenerator.js'
    //import UserStoryGenerator from './UserStoryGenerator.js'

    export default {
        name: 'uml-dialoger',
        props: {
            value: String
        },
        components: {
            VueTypedJs
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
            input(){
                return {title: this.value};
            }
        },
        created(){
        },
        watch: {
        },
        mounted(){

            this.generator = new Generator(this);
            this.generate();

        },
        data() {
            return {
                state:{
                    generator: "UMLGenerator",
                    firstMessageIsTyping: true,
                    secondMessageIsTyping: true,
                    startTemplateGenerate: false,
                    userStory: '',
                },
                generator: null,
            }
        },
        methods: {

            onReceived(content){
                this.state.userStory = content;
            },

            generate(){
                this.state.userStory = '';
                this.generator.generate();
            },

            stop(){
                this.generator.stop();
            },

            jump(){
                let uuid = this.uuid();
                
                let stateJson = JSON.stringify(this.state);
                localStorage["gen-state"] = stateJson;

                this.$router.push({path: `uml/${uuid}`});
            },


            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },


        }
    }
</script>
<style>
</style>


